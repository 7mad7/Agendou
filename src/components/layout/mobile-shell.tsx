import * as React from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export function MobileShell({
  children,
  className,
  showHeader = true,
  showBottomNav = true,
}: MobileShellProps) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-muted/40">
      <div className="relative flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground shadow-sm sm:border-x sm:border-border">
        {showHeader && <Header />}
        <main
          className={cn(
            "flex-1 px-4 py-5",
            showBottomNav && "pb-24",
            className
          )}
        >
          {children}
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

