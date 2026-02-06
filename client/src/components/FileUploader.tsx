import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: Record<string, string[]>;
  label?: string;
  className?: string;
}

export function FileUploader({ 
  file, 
  onFileSelect, 
  accept = { "image/*": [".png", ".bmp", ".webp"] },
  label = "Drag & drop an image here, or click to select",
  className
}: FileUploaderProps) {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false
  });

  if (file) {
    return (
      <div className={cn(
        "relative group overflow-hidden rounded-xl border border-primary/30 bg-card/40 transition-all",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-10" />
        <img 
          src={URL.createObjectURL(file)} 
          alt="Preview" 
          className="w-full h-48 object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileImage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate max-w-[150px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer h-48 flex flex-col items-center justify-center p-6 text-center group",
        isDragActive 
          ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]" 
          : "border-white/10 hover:border-primary/50 hover:bg-white/5",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className={cn(
        "p-4 rounded-full bg-secondary mb-4 transition-transform duration-300 group-hover:scale-110",
        isDragActive ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-primary"
      )}>
        <Upload className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
        {isDragActive ? "Drop it like it's hot!" : "Upload Image"}
      </p>
      <p className="text-xs text-muted-foreground max-w-[240px]">
        {label}
      </p>
      <p className="text-[10px] text-white/20 mt-4 uppercase tracking-widest font-mono">
        Supported: PNG, BMP, WEBP
      </p>
    </div>
  );
}
