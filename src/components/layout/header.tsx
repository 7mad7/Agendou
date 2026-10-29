import * as React from "react";
import Link from "next/link";
import { CalendarCheck, LayoutDashboard, LogIn, UserCheck } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

function HeaderGuestFallback() {
  return (
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
  );
}

async function HeaderSessionActions() {
  const session = await getSession();

  if (!session) {
    return <HeaderGuestFallback />;
  }

  return (
    <div className="flex items-center gap-1.5">
      {session.role === "MERCHANT" ? (
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "h-8 gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
          )}
        >
          <LayoutDashboard
            className="h-3.5 w-3.5 text-primary"
            aria-hidden="true"
          />
          <span className="max-w-[90px] truncate">Painel</span>
        </Link>
      ) : (
        <Link
          href="/explorar"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "h-8 gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
          )}
        >
          <UserCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="max-w-[90px] truncate">
            {session.name.split(" ")[0]}
          </span>
        </Link>
      )}
      <LogoutButton />
    </div>
  );
}

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
        <React.Suspense fallback={<HeaderGuestFallback />}>
          <HeaderSessionActions />
        </React.Suspense>
      </nav>
    </header>
  );
}
