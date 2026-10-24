"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { registerClientAction } from "@/actions/auth";
import {
  clientRegisterSchema,
  type ClientRegisterFormValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const genderOptions = [
  { value: "FEMININO", label: "Feminino" },
  { value: "MASCULINO", label: "Masculino" },
  { value: "NAO_BINARIO", label: "Não-binário" },
  { value: "PREFIRO_NAO_INFORMAR", label: "Prefiro não informar" },
];

export function ClientRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegisterFormValues>({
    resolver: zodResolver(clientRegisterSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      age: 18,
      gender: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: ClientRegisterFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const result = await registerClientAction(values);

    if (!result.success) {
      if (result.fieldErrors) {
        const keys = Object.keys(
          result.fieldErrors
        ) as (keyof ClientRegisterFormValues)[];
        for (const field of keys) {
          const message = result.fieldErrors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message });
          }
        }
      }
      setServerError(
        result.message ?? "Não foi possível concluir o cadastro."
      );
      return;
    }

    setServerSuccess(result.message ?? "Conta criada com sucesso!");
    if (result.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  return (
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
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
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
          htmlFor="client-name"
          className="block text-xs font-semibold text-foreground"
        >
          Nome completo
        </label>
        <Input
          id="client-name"
          type="text"
          placeholder="Ex: Maria Oliveira"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="client-age"
            className="block text-xs font-semibold text-foreground"
          >
            Idade
          </label>
          <Input
            id="client-age"
            type="number"
            min={14}
            max={120}
            placeholder="25"
            aria-invalid={Boolean(errors.age)}
            {...register("age", { valueAsNumber: true })}
          />
          {errors.age && (
            <p className="text-xs font-medium text-destructive">
              {errors.age.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="client-gender"
            className="block text-xs font-semibold text-foreground"
          >
            Gênero
          </label>
          <select
            id="client-gender"
            aria-invalid={Boolean(errors.gender)}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("gender")}
          >
            <option value="">Selecione...</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender && (
            <p className="text-xs font-medium text-destructive">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="client-email"
          className="block text-xs font-semibold text-foreground"
        >
          E-mail
        </label>
        <Input
          id="client-email"
          type="email"
          placeholder="voce@email.com"
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
        <label
          htmlFor="client-password"
          className="block text-xs font-semibold text-foreground"
        >
          Senha
        </label>
        <Input
          id="client-password"
          type="password"
          placeholder="Mínimo 8 caracteres (letras e números)"
          autoComplete="new-password"
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
            <span>Criando sua conta...</span>
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            <span>Criar conta de Cliente</span>
          </>
        )}
      </Button>
    </form>
  );
}

