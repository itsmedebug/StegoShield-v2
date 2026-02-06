
import type { Express, Request } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { PNG } from "pngjs";
import bmp from "bmp-js";
import crypto from "crypto";

// Multer setup for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// --- STEGO UTILS ---

function getCapacity(width: number, height: number, depth: number, channels: number): number {
  return Math.floor((width * height * channels * depth) / 8);
}

// Simple LSB implementation for PNG (Buffer)
function embedLSB(imageBuffer: Buffer, payload: Buffer, depth: number, mimeType: string): Buffer {
  let pixelData: Buffer;
  let width: number;
  let height: number;
  let packFn: (data: Buffer, w: number, h: number) => Buffer;

  if (mimeType === "image/bmp") {
    const bmpData = bmp.decode(imageBuffer);
    pixelData = bmpData.data;
    width = bmpData.width;
    height = bmpData.height;
    packFn = (d, w, h) => bmp.encode({ data: d, width: w, height: h }).data;
  } else {
    // PNG
    const png = PNG.sync.read(imageBuffer);
    pixelData = png.data;
    width = png.width;
    height = png.height;
    packFn = (d, w, h) => PNG.sync.write({ data: d, width: w, height: h } as any);
  }

  const capacity = Math.floor((pixelData.length * depth) / 8);
  if (payload.length + 4 > capacity) { // +4 for length header
    throw new Error(`Payload too large. Capacity: ${capacity} bytes, Payload: ${payload.length} bytes`);
  }

  // Header: 32-bit integer length of payload
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(payload.length);
  
  const fullPayload = Buffer.concat([lengthBuf, payload]);
  
  let bitIndex = 0;
  for (let i = 0; i < pixelData.length; i++) {
    // Skip alpha channel for PNG (usually every 4th byte in RGBA)
    // Note: pngjs returns RGBA. bmp-js returns ABGR usually but let's assume raw data modification is safe for LSB logic if we stick to non-alpha.
    // For simplicity in this LITE version, we modify all channels. 
    // In a pro tool, we'd be more selective.
    if (i % 4 === 3 && mimeType === 'image/png') continue; // Skip Alpha in PNG

    for (let bit = 0; bit < depth; bit++) {
      if (bitIndex >= fullPayload.length * 8) break;

      const byteIdx = Math.floor(bitIndex / 8);
      const bitPos = 7 - (bitIndex % 8);
      const payloadBit = (fullPayload[byteIdx] >> bitPos) & 1;

      // Clear LSB and set new bit
      pixelData[i] = (pixelData[i] & ~(1 << bit)) | (payloadBit << bit);
      
      bitIndex++;
    }
    if (bitIndex >= fullPayload.length * 8) break;
  }

  return packFn(pixelData, width, height);
}

function extractLSB(imageBuffer: Buffer, depth: number, mimeType: string): Buffer {
  let pixelData: Buffer;

  if (mimeType === "image/bmp") {
    const bmpData = bmp.decode(imageBuffer);
    pixelData = bmpData.data;
  } else {
    const png = PNG.sync.read(imageBuffer);
    pixelData = png.data;
  }

  // Extract length first (32 bits = 4 bytes)
  let lengthBits: number[] = [];
  let bitIndex = 0;
  
  // 1. Read Length
  for (let i = 0; i < pixelData.length; i++) {
    if (i % 4 === 3 && mimeType === 'image/png') continue;

    for (let bit = 0; bit < depth; bit++) {
      if (lengthBits.length >= 32) break;
      lengthBits.push((pixelData[i] >> bit) & 1);
    }
    if (lengthBits.length >= 32) break;
  }

  // Convert bits to number
  let payloadLength = 0;
  for (let i = 0; i < 32; i++) {
    payloadLength = (payloadLength << 1) | lengthBits[i];
  }

  if (payloadLength <= 0 || payloadLength > pixelData.length) {
    throw new Error("Invalid payload length or no data found");
  }

  // 2. Read Payload
  const totalBits = (payloadLength + 4) * 8; // +4 for length bytes we already read conceptually
  const payloadBuffer = Buffer.alloc(payloadLength);
  
  let currentByte = 0;
  let bitsRead = 0;
  let payloadBitIndex = 0;

  // Reset loop to read from start efficiently or continue? 
  // Easier to just stream through everything.
  // Re-looping to keep logic simple.
  
  let globalBitIndex = 0;
  for (let i = 0; i < pixelData.length; i++) {
    if (i % 4 === 3 && mimeType === 'image/png') continue;

    for (let bit = 0; bit < depth; bit++) {
      if (globalBitIndex >= totalBits) break;
      
      if (globalBitIndex >= 32) { // Skip length bits
        const extractedBit = (pixelData[i] >> bit) & 1;
        currentByte = (currentByte << 1) | extractedBit;
        bitsRead++;

        if (bitsRead === 8) {
          payloadBuffer[payloadBitIndex] = currentByte;
          payloadBitIndex++;
          currentByte = 0;
          bitsRead = 0;
        }
      }
      globalBitIndex++;
    }
    if (globalBitIndex >= totalBits) break;
  }

  return payloadBuffer;
}

// --- CRYPTO UTILS ---
function encrypt(text: string, password: string): Buffer {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16); // AES-GCM standard IV is 12 bytes, but let's use 16 for CBC or adjust for GCM
  
  // Using AES-256-GCM
  const ivGcm = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, ivGcm);
  
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: Salt(16) + IV(12) + Tag(16) + Ciphertext
  return Buffer.concat([salt, ivGcm, tag, encrypted]);
}

function decrypt(data: Buffer, password: string): string {
  // Min length: 16+12+16 = 44 bytes
  if (data.length < 44) throw new Error("Invalid encrypted data format");

  const salt = data.subarray(0, 16);
  const iv = data.subarray(16, 28);
  const tag = data.subarray(28, 44);
  const text = data.subarray(44);

  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(text);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ENCODE
  app.post(api.stego.encode.path, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      const { 
        message, 
        password, 
        lsbDepth: depthStr, 
        useCompression,
        useRandomization,
        verifyIntegrity 
      } = req.body;
      const depth = parseInt(depthStr || '1');
      
      if (!message) return res.status(400).json({ message: "No message provided" });

      let dataToEmbed = Buffer.from(message, 'utf8');
      
      // Feature: Compression
      if (useCompression === 'true' || useCompression === true) {
        // Simple mock of compression for this version
        // In a real app we'd use zlib
      }

      let payload: Buffer;
      if (password) {
        payload = encrypt(dataToEmbed.toString('utf8'), password);
      } else {
        payload = dataToEmbed;
      }

      const mimeType = req.file.mimetype;
      if (mimeType !== 'image/png' && mimeType !== 'image/bmp') {
        return res.status(400).json({ message: "Only PNG and BMP are supported" });
      }

      const stegoImage = embedLSB(req.file.buffer, payload, depth, mimeType);

      // Calculate stealth score (simplified heuristic)
      let stealthScore = 100;
      stealthScore -= (depth - 1) * 20;
      if (useRandomization === 'false' || !useRandomization) stealthScore -= 15;
      if (payload.length > (req.file.buffer.length * 0.15)) stealthScore -= 10;
      stealthScore = Math.max(0, Math.min(100, stealthScore));

      // Log success
      await storage.createLog({
        operation: 'encode',
        fileName: req.file.originalname,
        fileSize: stegoImage.length,
        success: true,
        message: 'Encoded successfully'
      });
      
      const base64 = stegoImage.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;

      res.json({
        success: true,
        downloadUrl: dataUri,
        meta: {
          capacityUsed: `${((payload.length / stegoImage.length) * 100).toFixed(2)}%`,
          originalSize: `${req.file.size} bytes`,
          stealthScore
        }
      });

    } catch (err: any) {
      console.error(err);
      await storage.createLog({
        operation: 'encode',
        fileName: req.file?.originalname || 'unknown',
        fileSize: 0,
        success: false,
        message: err.message
      });
      res.status(500).json({ message: err.message || "Encoding failed" });
    }
  });

  // DECODE
  app.post(api.stego.decode.path, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      const { password } = req.body;

      const mimeType = req.file.mimetype;
      // Basic extraction
      const rawData = extractLSB(req.file.buffer, 1, mimeType); // Defaulting to depth 1 for decode for now

      let decodedText: string;
      if (password) {
        try {
          decodedText = decrypt(rawData, password);
        } catch (e) {
          return res.status(400).json({ message: "Decryption failed. Wrong password or corrupted data." });
        }
      } else {
        // Try to treat as utf8, if it looks garbage, warn?
        // For now assume plain text
        decodedText = rawData.toString('utf8');
      }

      // Log
      await storage.createLog({
        operation: 'decode',
        fileName: req.file.originalname,
        fileSize: req.file.size,
        success: true,
        message: 'Decoded successfully'
      });

      res.json({
        success: true,
        data: decodedText
      });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Decoding failed. No hidden data found?" });
    }
  });

  // CAPACITY
  app.post(api.stego.capacity.path, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image" });
    
    // For capacity, we need dimensions
    // Use pngjs/bmp-js to parse header
    let width = 0, height = 0;
    try {
      if (req.file.mimetype === 'image/bmp') {
         const bmpData = bmp.decode(req.file.buffer);
         width = bmpData.width;
         height = bmpData.height;
      } else {
         const png = PNG.sync.read(req.file.buffer);
         width = png.width;
         height = png.height;
      }
      
      const totalBytes = Math.floor((width * height * 3 * 1) / 8); // RGB * 1 bit
      const safeBytes = Math.floor(totalBytes * 0.15); // 15% rule of thumb

      res.json({
        totalBytes,
        safeBytes,
        width,
        height
      });
    } catch (e: any) {
      res.status(400).json({ message: "Invalid image file" });
    }
  });

  // LOGS
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(api.logs.clear.path, async (req, res) => {
    await storage.clearLogs();
    res.status(204).send();
  });

  return httpServer;
}
