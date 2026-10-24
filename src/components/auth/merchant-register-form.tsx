"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Store } from "lucide-react";
import { registerMerchantAction } from "@/actions/auth";
import {
  formatCnpj,
  merchantRegisterSchema,
  type MerchantRegisterFormValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const serviceCategories = [
  { value: "barbearia", label: "Barbearia" },
  { value: "estetica", label: "Estética & Beleza" },
  { value: "lanches", label: "Lanches & Alimentação" },
  { value: "manutencao", label: "Manutenção/Serviços" },
];

export function MerchantRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MerchantRegisterFormValues>({
    resolver: zodResolver(merchantRegisterSchema),
    mode: "onTouched",
    defaultValues: {
      tradeName: "",
      email: "",
      cnpj: "",
      category: "",
      address: "",
      password: "",
    },
  });

  const cnpjRegistration = register("cnpj");

  async function onSubmit(values: MerchantRegisterFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const result = await registerMerchantAction(values);

    if (!result.success) {
      if (result.fieldErrors) {
        const keys = Object.keys(
          result.fieldErrors
        ) as (keyof MerchantRegisterFormValues)[];
        for (const field of keys) {
          const message = result.fieldErrors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message });
          }
        }
      }
      setServerError(
        result.message ?? "Não foi possível cadastrar o comércio."
      );
      return;
    }

    setServerSuccess(result.message ?? "Comércio cadastrado com sucesso!");
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
          htmlFor="merchant-tradeName"
          className="block text-xs font-semibold text-foreground"
        >
          Nome do Comércio
        </label>
        <Input
          id="merchant-tradeName"
          type="text"
          placeholder="Ex: Barbearia do Bairro"
          autoComplete="organization"
          aria-invalid={Boolean(errors.tradeName)}
          {...register("tradeName")}
        />
        {errors.tradeName && (
          <p className="text-xs font-medium text-destructive">
            {errors.tradeName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="merchant-email"
          className="block text-xs font-semibold text-foreground"
        >
          E-mail Comercial
        </label>
        <Input
          id="merchant-email"
          type="email"
          placeholder="contato@seucomercio.com.br"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="merchant-cnpj"
            className="block text-xs font-semibold text-foreground"
          >
            CNPJ
          </label>
          <Input
            id="merchant-cnpj"
            type="text"
            inputMode="numeric"
            placeholder="00.000.000/0001-00"
            aria-invalid={Boolean(errors.cnpj)}
            {...cnpjRegistration}
            onChange={(event) => {
              const formatted = formatCnpj(event.target.value);
              setValue("cnpj", formatted, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.cnpj && (
            <p className="text-xs font-medium text-destructive">
              {errors.cnpj.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="merchant-category"
            className="block text-xs font-semibold text-foreground"
          >
            Categoria de Serviço
          </label>
          <select
            id="merchant-category"
            aria-invalid={Boolean(errors.category)}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("category")}
          >
            <option value="">Selecione...</option>
            {serviceCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs font-medium text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="merchant-address"
          className="block text-xs font-semibold text-foreground"
        >
          Endereço Completo
        </label>
        <Input
          id="merchant-address"
          type="text"
          placeholder="Rua das Flores, 123 - Centro"
          autoComplete="street-address"
          aria-invalid={Boolean(errors.address)}
          {...register("address")}
        />
        {errors.address && (
          <p className="text-xs font-medium text-destructive">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="merchant-password"
          className="block text-xs font-semibold text-foreground"
        >
          Senha de Acesso
        </label>
        <Input
          id="merchant-password"
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
            <span>Cadastrando comércio...</span>
          </>
        ) : (
          <>
            <Store className="h-4 w-4" aria-hidden="true" />
            <span>Cadastrar meu Comércio</span>
          </>
        )}
      </Button>
    </form>
  );
}

