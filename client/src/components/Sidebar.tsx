import { Link, useLocation } from "wouter";
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Database, 
  History, 
  FileText,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
  { icon: Lock, label: "Encode", href: "/" },
  { icon: Unlock, label: "Decode", href: "/decode" },
  { icon: Database, label: "Capacity", href: "/capacity" },
  { icon: History, label: "History", href: "/history" },
  { icon: FileText, label: "Docs", href: "/docs" },
];

export function Sidebar() {
  const [location] = useLocation();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 text-primary mb-8">
          <ShieldCheck className="h-8 w-8" />
          <h1 className="text-2xl font-display font-bold tracking-tighter text-white">
            Stego<span className="text-primary">Shield</span>
          </h1>
        </div>
        
        <nav className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-white/5">
        <div className="bg-card/50 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Secure
          </div>
          <p className="text-xs text-white/40 font-mono">
            v2.4.0-stable<br/>
            AES-256 Enabled
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen border-r border-white/5 bg-background/50 backdrop-blur-xl fixed left-0 top-0 z-40">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-md border-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-background w-80 border-r-white/10">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
