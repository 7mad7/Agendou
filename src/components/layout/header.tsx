import Link from "next/link";
import { CalendarCheck, LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Link
        href="/"
        className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none tracking-tight text-foreground">
            Agendou
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            Serviços no seu bairro
          </span>
        </div>
      </Link>

      <nav aria-label="Ações rápidas">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5 rounded-xl font-semibold"
          )}
        >
          <LogIn className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Entrar</span>
        </Link>
      </nav>
    </header>
  );
}

