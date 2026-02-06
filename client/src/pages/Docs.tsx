import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { FileText, Shield, AlertTriangle, Cpu } from "lucide-react";

export default function Docs() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 lg:p-12 overflow-y-auto">
        <PageHeader 
          title="Documentation" 
          description="Technical details and usage guidelines for StegoShield."
          icon={<FileText className="h-8 w-8" />}
        />

        <div className="max-w-4xl mx-auto space-y-12 text-slate-300">
          
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Cpu className="text-primary" /> How It Works
            </h3>
            <div className="prose prose-invert max-w-none">
              <p>
                StegoShield uses <strong>Least Significant Bit (LSB) Steganography</strong> to hide data within image files. 
                Digital images are made up of pixels, and each pixel contains color information (Red, Green, Blue values). 
                Each color value is stored as an 8-bit number (0-255).
              </p>
              <p>
                The "least significant bit" is the last bit of this number. Changing it alters the color value by only 1, 
                which is imperceptible to the human eye. We replace these bits with the binary data of your secret message.
              </p>
              <div className="bg-card p-6 rounded-xl border border-white/10 my-6 font-mono text-sm">
                <div className="grid grid-cols-2 gap-8">
                   <div>
                     <p className="text-muted-foreground mb-2">Original Pixel (Red)</p>
                     <p>1011010<span className="text-red-500 font-bold">1</span> (Decimal: 181)</p>
                   </div>
                   <div>
                     <p className="text-muted-foreground mb-2">Modified Pixel (Red)</p>
                     <p>1011010<span className="text-primary font-bold">0</span> (Decimal: 180)</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="text-primary" /> Security & Encryption
            </h3>
            <div className="prose prose-invert max-w-none">
              <p>
                Before embedding, your message can be encrypted using <strong>AES-256 (Advanced Encryption Standard)</strong>. 
                This ensures that even if someone suspects steganography and extracts the bits, they will only see random noise without the correct password.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Passwords are never stored on our servers.</li>
                <li>Encryption happens before embedding.</li>
                <li>We recommend strong, unique passwords for maximum security.</li>
              </ul>
            </div>
          </section>

          <section className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-8">
            <h3 className="text-xl font-bold text-yellow-500 flex items-center gap-3 mb-4">
              <AlertTriangle /> Important Limitations
            </h3>
            <div className="space-y-4 text-yellow-200/80">
              <p>
                <strong>File Formats:</strong> We support <strong>PNG, BMP, and WEBP</strong>. These are "lossless" formats. 
                <br/>
                <span className="text-red-400">DO NOT USE JPEG/JPG.</span> JPEG compression destroys the delicate pixel data where your message is hidden.
              </p>
              <p>
                <strong>Resizing & Editing:</strong> Once an image has a hidden message, <strong>do not resize, crop, or filter it</strong>. 
                Any modification to the pixels will corrupt the hidden message.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
