import { useState } from "react";
import { useDecode } from "@/hooks/use-stego";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Unlock, Eye, EyeOff, KeyRound, CheckCircle2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Decode() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { mutate: decode, isPending, data: result } = useDecode();
  const { toast } = useToast();

  const handleDecode = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    if (password) formData.append("password", password);

    decode(formData);
  };

  const copyToClipboard = () => {
    if (result?.data) {
      navigator.clipboard.writeText(result.data);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 lg:p-12 overflow-y-auto">
        <PageHeader 
          title="Decode Message" 
          description="Extract hidden secrets from steganographic images."
          icon={<Unlock className="h-8 w-8" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Input */}
          <div className="space-y-8">
            <Card className="p-6 bg-card/40 border-white/10 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Stego Image Source</Label>
                  <FileUploader 
                    file={file} 
                    onFileSelect={setFile} 
                    label="Upload the image containing the secret message"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Decryption Key (If Encrypted)</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password..."
                      className="bg-background/50 border-white/10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={handleDecode} 
                  disabled={!file || isPending}
                  className="w-full h-12 text-lg font-semibold bg-primary text-primary-foreground hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300"
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span> Decrypting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-5 w-5" /> Extract Message
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full"
                >
                  <div className="h-full min-h-[400px] flex flex-col bg-black/40 rounded-xl border border-primary/30 relative overflow-hidden">
                    <div className="bg-primary/10 border-b border-primary/20 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Decoded Successfully</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={copyToClipboard} className="hover:bg-primary/20 hover:text-primary">
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </div>
                    
                    <div className="flex-1 p-6 relative">
                       {/* Matrix rain effect background hint */}
                       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                            style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
                       </div>
                       
                       <div className="relative z-10 font-mono text-sm leading-relaxed text-green-400 break-all whitespace-pre-wrap">
                         {result.data}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Unlock className="h-8 w-8 text-white/20" />
                  </div>
                  <h3 className="text-xl font-semibold text-white/40 mb-2">Awaiting Input</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    The extracted message will appear here after successful decryption.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
