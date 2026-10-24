"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  LogIn,
} from "lucide-react";
import { loginAction } from "@/actions/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const result = await loginAction(values, callbackUrl);

    if (!result.success) {
      if (result.fieldErrors) {
        const keys = Object.keys(
          result.fieldErrors
        ) as (keyof LoginFormValues)[];
        for (const field of keys) {
          const message = result.fieldErrors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message });
          }
        }
      }
      setServerError(result.message ?? "E-mail ou senha inválidos.");
      return;
    }

    setServerSuccess(result.message ?? "Login realizado com sucesso!");
    if (result.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="space-y-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl font-bold">Entrar no Agendou</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          Acesse sua conta de cliente para reservar horários ou gerencie a
          agenda do seu comércio.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{serverError}</span>
            </div>
          )}

          {serverSuccess && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-accent p-3 text-xs font-medium text-accent-foreground"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{serverSuccess}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-foreground"
            >
              E-mail
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-foreground"
              >
                Senha
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="mt-1 w-full font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>Entrar na minha conta</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Ainda não tem uma conta no Agendou?</span>
        <Link
          href="/register"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <span>Criar conta gratuita (Cliente ou Comércio)</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <React.Suspense
        fallback={
          <div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />
        }
      >
        <LoginFormContent />
      </React.Suspense>
    </div>
  );
}

