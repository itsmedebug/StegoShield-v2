import { useState } from "react";
import { useEncode, useCapacity } from "@/hooks/use-stego";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Eye, EyeOff, Wand2, Download, HardDrive, FileImage, ShieldCheck, Zap, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

export default function Encode() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lsbDepth, setLsbDepth] = useState([1]);
  const [channels, setChannels] = useState<string[]>(["r", "g", "b"]);
  const [useCompression, setUseCompression] = useState(true);
  const [useRandomization, setUseRandomization] = useState(false);
  const [verifyIntegrity, setVerifyIntegrity] = useState(true);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length > 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const strengthColor = strength <= 25 ? "bg-red-500" : strength <= 50 ? "bg-yellow-500" : strength <= 75 ? "bg-blue-500" : "bg-green-500";
  
  const { mutate: encode, isPending, data: result } = useEncode();
  const { mutate: checkCapacity, data: capacity } = useCapacity();

  const handleFileSelect = (selected: File | null) => {
    setFile(selected);
    if (selected) {
      checkCapacity(selected);
    }
  };

  const handleSubmit = () => {
    if (!file || !message) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("message", message);
    if (password) formData.append("password", password);
    formData.append("lsbDepth", String(lsbDepth[0]));
    formData.append("channel", channels.length === 3 ? "rgb" : channels[0]);
    formData.append("useCompression", String(useCompression));
    formData.append("useRandomization", String(useRandomization));
    formData.append("verifyIntegrity", String(verifyIntegrity));

    encode(formData);
  };

  const handleChannelToggle = (ch: string) => {
    // Basic logic: allow multiple for future, currently API supports 'rgb' or single
    // For this UI, we'll simplify to align with the schema default of 'rgb' or single channel selection logic if needed
    // But since schema says channel enum is ["rgb", "r", "g", "b"], let's act accordingly.
    
    // If 'rgb' is selected, others shouldn't be. If individual is selected, rgb shouldn't be.
    // For simplicity with the current Zod schema, let's just use a radio-like behavior or specific combinations
    // The schema allows "rgb", "r", "g", "b".
    
    if (ch === 'rgb') {
      setChannels(['r', 'g', 'b']);
    } else {
      // Logic for single channel selection if we wanted to support it fully based on UI
      // For now, let's just stick to the visual representation and map it back.
      // This is a UI simplification.
      setChannels(['r', 'g', 'b']); 
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 lg:p-12 overflow-y-auto">
        <PageHeader 
          title="Encode Message" 
          description="Embed secret text into image files using LSB steganography."
          icon={<Lock className="h-8 w-8" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Inputs */}
          <div className="space-y-8">
            <section className="space-y-4">
              <Label className="text-base font-semibold text-white">Cover Image</Label>
              <FileUploader file={file} onFileSelect={handleFileSelect} />
              
              <AnimatePresence>
                {capacity && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <HardDrive className="h-4 w-4" />
                      <span className="text-sm font-medium">Capacity Analysis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Dimensions</p>
                        <p className="font-mono text-white">{capacity.width} x {capacity.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Safe Capacity</p>
                        <p className="font-mono text-primary">{(capacity.safeBytes / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    {/* Visual meter */}
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((message.length / capacity.safeBytes) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                      <span>Used: {message.length} bytes</span>
                      <span>{Math.round((message.length / capacity.safeBytes) * 100)}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between">
                <Label className="text-base font-semibold text-white">Secret Message</Label>
                <span className="text-xs text-muted-foreground self-end">
                  {message.length} characters
                </span>
              </div>
              <Textarea
                placeholder="Type your secret message here..."
                className="min-h-[160px] bg-card/40 border-white/10 focus:border-primary/50 resize-none font-mono text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </section>

            <section className="space-y-4">
              <Label className="text-base font-semibold text-white">Encryption (Optional)</Label>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a password to encrypt your message"
                    className="bg-card/40 border-white/10 focus:border-primary/50 pr-10"
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
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                      <span className="text-muted-foreground">Strength</span>
                      <span className={cn(
                        strength <= 25 ? "text-red-500" : strength <= 50 ? "text-yellow-500" : strength <= 75 ? "text-blue-500" : "text-green-500"
                      )}>
                        {strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Strong" : "Excellent"}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        className={cn("h-full transition-all duration-500", strengthColor)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border-white/10">
                <AccordionTrigger className="text-muted-foreground hover:text-white hover:no-underline">
                  Advanced Settings
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>LSB Depth (Bits)</Label>
                      <span className="font-mono text-xs text-primary">{lsbDepth[0]} bit(s)</span>
                    </div>
                    <Slider
                      value={lsbDepth}
                      onValueChange={setLsbDepth}
                      max={4}
                      step={1}
                      min={1}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher depth increases capacity but may cause visible artifacts.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Color Channels</Label>
                    <div className="flex gap-4">
                      {['R', 'G', 'B'].map((ch) => (
                        <div key={ch} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`ch-${ch}`} 
                            checked={channels.includes(ch.toLowerCase())}
                            disabled
                          />
                          <label
                            htmlFor={`ch-${ch}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {ch}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Currently defaulting to full RGB spectrum distribution.</p>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Security Enhancements</Label>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <Label className="text-sm">Payload Compression</Label>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Reduces size to increase stealth.</p>
                      </div>
                      <Switch checked={useCompression} onCheckedChange={setUseCompression} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Shuffle className="h-3 w-3 text-blue-500" />
                          <Label className="text-sm">LSB Randomization</Label>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Distributes data non-linearly.</p>
                      </div>
                      <Switch checked={useRandomization} onCheckedChange={setUseRandomization} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3 w-3 text-green-500" />
                          <Label className="text-sm">Embed Verification</Label>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Ensures payload integrity after writing.</p>
                      </div>
                      <Switch checked={verifyIntegrity} onCheckedChange={setVerifyIntegrity} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button 
              onClick={handleSubmit} 
              disabled={!file || !message || isPending}
              className="w-full h-12 text-lg font-semibold bg-primary text-primary-foreground hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300"
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" /> Embed Message
                </>
              )}
            </Button>
          </div>

          {/* Right Column: Result */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-card rounded-xl border border-primary/20 p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 bg-green-500/10 rounded-bl-xl border-b border-l border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider">
                      Success
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4">Stego Image Ready</h3>
                    
                    <div className="aspect-video rounded-lg bg-black/40 mb-6 flex items-center justify-center border border-white/5 overflow-hidden">
                       <img 
                         src={result.downloadUrl} 
                         alt="Processed stego image" 
                         className="max-w-full max-h-full object-contain"
                         onError={(e) => {
                           e.currentTarget.style.display = 'none';
                           e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                         }}
                       />
                       <div className="placeholder hidden text-center p-6">
                         <FileImage className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                         <p className="text-sm text-muted-foreground">Image processed successfully</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-background/50 p-3 rounded border border-white/5">
                        <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Stealth Score</p>
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-mono text-sm font-bold",
                            (result.meta?.stealthScore || 0) > 80 ? "text-green-500" : (result.meta?.stealthScore || 0) > 50 ? "text-yellow-500" : "text-red-500"
                          )}>
                            {result.meta?.stealthScore || 0}%
                          </p>
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[40px]">
                            <div 
                              className={cn(
                                "h-full",
                                (result.meta?.stealthScore || 0) > 80 ? "bg-green-500" : (result.meta?.stealthScore || 0) > 50 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${result.meta?.stealthScore || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-background/50 p-3 rounded border border-white/5">
                        <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Capacity Used</p>
                        <p className="font-mono text-sm text-primary">{result.meta?.capacityUsed || "N/A"}</p>
                      </div>
                    </div>

                    <a 
                      href={result.downloadUrl} 
                      download="stego_image.png"
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-white">
                        <Download className="mr-2 h-4 w-4" /> Download Result
                      </Button>
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Lock className="h-8 w-8 text-white/20" />
                  </div>
                  <h3 className="text-xl font-semibold text-white/40 mb-2">Ready to Process</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Upload an image and enter your secret message to generate a steganographic image.
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
