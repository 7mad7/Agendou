import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  Scissors,
  ShieldAlert,
  Store,
} from "lucide-react";
import { getAuthenticatedMerchantProfile } from "@/actions/merchant";
import { getSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const dashboardLinks = [
  {
    href: "/dashboard",
    label: "Painel",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/servicos",
    label: "Serviços",
    icon: Scissors,
  },
  {
    href: "/dashboard/agenda/configuracao",
    label: "Agenda",
    icon: CalendarClock,
  },
  {
    href: "/dashboard/perfil",
    label: "Perfil",
    icon: Store,
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (session.role !== "MERCHANT") {
    redirect("/explorar");
  }

  const merchantResult = await getAuthenticatedMerchantProfile();

  // Bloqueio explícito para usuários que não possuem perfil de comércio registrado
  if (merchantResult.unauthorized || !merchantResult.data) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <Card className="border-destructive/30 bg-card">
          <CardHeader className="items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <CardTitle className="mt-2 text-base">
              Acesso Restrito a Comerciantes
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {merchantResult.message ??
                "Sua conta não possui um perfil de estabelecimento comercial registrado para acessar este painel."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              href="/register?role=MERCHANT"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full font-semibold"
              )}
            >
              Cadastrar Perfil de Comércio
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full font-medium"
              )}
            >
              Voltar para a Página Inicial
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const merchant = merchantResult.data;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="text-[10px]">
                Painel do Comércio
              </Badge>
              <span className="truncate text-xs font-medium text-muted-foreground">
                {merchant.category}
              </span>
            </div>
            <h1 className="mt-1 truncate text-lg font-bold text-foreground">
              {merchant.tradeName}
            </h1>
          </div>
        </div>

        <nav
          aria-label="Navegação do Painel do Comércio"
          className="mt-3.5 grid grid-cols-4 gap-1.5 rounded-xl bg-secondary p-1"
        >
          {dashboardLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-background/80 px-2.5 py-2 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-background hover:text-primary"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}

