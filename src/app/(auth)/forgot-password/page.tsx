"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";
import { forgotPasswordAction } from "@/actions/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
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

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const result = await forgotPasswordAction(values);

    if (!result.success) {
      if (result.fieldErrors?.email?.[0]) {
        setError("email", {
          type: "server",
          message: result.fieldErrors.email[0],
        });
      }
      setServerError(
        result.message ?? "Não foi possível enviar o link de recuperação."
      );
      return;
    }

    setServerSuccess(
      result.message ??
        "Link de recuperação enviado! Verifique sua caixa de entrada."
    );
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      <Card className="border-border shadow-xs">
        <CardHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-bold">
            Recuperar acesso à conta
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            Informe o e-mail cadastrado na sua conta. Enviaremos um link seguro
            para você redefinir sua senha.
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
                htmlFor="forgot-email"
                className="block text-xs font-semibold text-foreground"
              >
                E-mail cadastrado
              </label>
              <Input
                id="forgot-email"
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

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Enviando link...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Enviar link de recuperação</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-center border-t border-border pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Voltar para o Login</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

