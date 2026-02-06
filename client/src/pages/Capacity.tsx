import { useState } from "react";
import { useCapacity } from "@/hooks/use-stego";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { FileUploader } from "@/components/FileUploader";
import { Database, Zap, AlertTriangle, Check, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Capacity() {
  const [file, setFile] = useState<File | null>(null);
  const { mutate: checkCapacity, data, isPending } = useCapacity();

  const handleFileSelect = (selected: File | null) => {
    setFile(selected);
    if (selected) {
      checkCapacity(selected);
    }
  };

  // Chart Data
  const chartData = data ? [
    { name: "Safe Capacity", value: data.safeBytes, color: "#06b6d4" }, // Primary color
    { name: "Unused / Unsafe", value: data.totalBytes - data.safeBytes, color: "#1e293b" } // Dark slate
  ] : [];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 lg:p-12 overflow-y-auto">
        <PageHeader 
          title="Capacity Analysis" 
          description="Analyze images to determine their safe data carrying capacity."
          icon={<Database className="h-8 w-8" />}
        />

        <div className="max-w-4xl mx-auto space-y-8">
          <section className="bg-card/40 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Select Image for Analysis</h3>
            <FileUploader 
              file={file} 
              onFileSelect={handleFileSelect} 
              className="h-64"
              label="Upload a high-resolution image for best results"
            />
          </section>

          {isPending && (
             <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Analyzing pixel density...</p>
             </div>
          )}

          {data && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Stats Cards */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-card border border-white/5 p-6 rounded-xl hover:border-primary/30 transition-colors group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Safe Capacity</span>
                  </div>
                  <p className="text-3xl font-bold text-white font-mono">
                    {(data.safeBytes / 1024).toFixed(2)} <span className="text-sm text-muted-foreground">KB</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ~{Math.floor(data.safeBytes / 1000)} chars
                  </p>
                </div>

                <div className="bg-card border border-white/5 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/5 rounded-lg text-white">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Image Size</span>
                  </div>
                  <p className="text-xl font-bold text-white font-mono">
                    {data.width} × {data.height}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total Pixels: {(data.width * data.height).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="md:col-span-2 bg-card border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center relative">
                 <h4 className="absolute top-6 left-6 text-sm font-medium text-muted-foreground">Capacity Distribution</h4>
                 <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={chartData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                         stroke="none"
                       >
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                         itemStyle={{ color: '#fff' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-primary" />
                       <span className="text-sm text-white">Safe to Use</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-800" />
                       <span className="text-sm text-muted-foreground">Total Raw</span>
                    </div>
                 </div>
              </div>

              {/* Warnings / Info */}
              <div className="md:col-span-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 flex items-start gap-4">
                 <AlertTriangle className="h-6 w-6 text-blue-400 shrink-0 mt-1" />
                 <div>
                   <h4 className="text-base font-semibold text-blue-400 mb-1">Recommendation</h4>
                   <p className="text-sm text-blue-200/70 leading-relaxed">
                     This image is suitable for short to medium length text messages. 
                     For large files or documents, consider using a higher resolution source image (4K+).
                     Using only the recommended capacity ensures the steganography remains undetectable to the human eye.
                   </p>
                 </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
