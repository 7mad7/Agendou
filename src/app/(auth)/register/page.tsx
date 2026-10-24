"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Store, User } from "lucide-react";
import { ClientRegisterForm } from "@/components/auth/client-register-form";
import { MerchantRegisterForm } from "@/components/auth/merchant-register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProfileRoleTab = "CLIENT" | "MERCHANT";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role");

  const [selectedRole, setSelectedRole] = React.useState<ProfileRoleTab>(
    initialRoleParam === "MERCHANT" ? "MERCHANT" : "CLIENT"
  );

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="space-y-3 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">
            Criar conta no Agendou
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            Escolha seu tipo de perfil para começar a usar a plataforma no seu
            bairro.
          </CardDescription>
        </div>

        {/* Seletor Bifurcado de Perfil: Sou Cliente vs Sou Comércio */}
        <div
          role="tablist"
          aria-label="Selecione o tipo de perfil"
          className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedRole === "CLIENT"}
            onClick={() => setSelectedRole("CLIENT")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedRole === "CLIENT"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span>Sou Cliente</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedRole === "MERCHANT"}
            onClick={() => setSelectedRole("MERCHANT")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedRole === "MERCHANT"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Store className="h-4 w-4" aria-hidden="true" />
            <span>Sou Comércio</span>
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {selectedRole === "CLIENT" ? (
          <ClientRegisterForm />
        ) : (
          <MerchantRegisterForm />
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-center border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Já possui cadastro?&nbsp;</span>
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Entrar na minha conta
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <React.Suspense
        fallback={
          <div className="h-[460px] w-full animate-pulse rounded-2xl bg-muted" />
        }
      >
        <RegisterPageContent />
      </React.Suspense>
    </div>
  );
}
