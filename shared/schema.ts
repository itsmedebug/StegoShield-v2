
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(), // 'encode' | 'decode'
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  success: boolean("success").default(true),
  message: text("message"), // Optional status message or error
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// Request types
// Note: File uploads use FormData, so we don't define the full request body structure here for Zod validation 
// in the same way as JSON, but we define the non-file fields.
export const encodeMetaSchema = z.object({
  message: z.string().optional(),
  password: z.string().optional(),
  lsbDepth: z.coerce.number().min(1).max(4).default(1),
  channel: z.enum(["rgb", "r", "g", "b"]).default("rgb"),
  useCompression: z.boolean().default(false),
  useRandomization: z.boolean().default(false),
  verifyIntegrity: z.boolean().default(false),
});

export const decodeMetaSchema = z.object({
  password: z.string().optional(),
});

// Response types
export interface ProcessResponse {
  success: boolean;
  message?: string;
  data?: string; // Decoded text
  downloadUrl?: string; // URL to download processed image
  meta?: {
    capacityUsed?: string;
    originalSize?: string;
  };
}

export type LogResponse = Log;
export type LogsListResponse = Log[];

export interface CapacityResponse {
  totalBytes: number;
  safeBytes: number; // Recommended limit
  width: number;
  height: number;
}
