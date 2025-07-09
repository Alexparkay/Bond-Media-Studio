"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountSettingsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccountSettings = pathname?.includes("account-settings");

  return (
    <div className="min-h-screen bg-black">
      {/* Premium gradient backgrounds */}
      <div className="absolute inset-0 gradient-premium-dark"></div>
      <div className="absolute inset-0 gradient-radial"></div>
      <div className="absolute inset-0 gradient-subtle"></div>
      
      <div className="relative z-10">
        {isAccountSettings && (
          <div className="p-6 border-b border-white/10">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm" 
                className="gradient-card border-white/10 hover:border-white/20 text-white hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bond Media Studio
              </Button>
            </Link>
          </div>
        )}
        
        <div className={isAccountSettings ? "p-6" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
} 