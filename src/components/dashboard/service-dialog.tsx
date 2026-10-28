"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock, Loader2, Save, X } from "lucide-react";
import {
  createServiceAction,
  updateServiceAction,
  type ServiceDTO,
} from "@/actions/services";
import {
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validations/merchant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceToEdit?: ServiceDTO | null;
  onSuccess: (savedService: ServiceDTO, isEdit: boolean) => void;
}

const presetDurations = [15, 30, 45, 60, 90, 120];

export function ServiceDialog({
  open,
  onOpenChange,
  serviceToEdit,
  onSuccess,
}: ServiceDialogProps) {
  const isEditing = Boolean(serviceToEdit);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: "onTouched",
    defaultValues: {
      title: serviceToEdit?.title ?? "",
      description: serviceToEdit?.description ?? "",
      price: serviceToEdit?.price ?? 35,
      durationMinutes: serviceToEdit?.durationMinutes ?? 30,
    },
  });

  const currentDuration = useWatch({
    control,
    name: "durationMinutes",
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: serviceToEdit?.title ?? "",
        description: serviceToEdit?.description ?? "",
        price: serviceToEdit?.price ?? 35,
        durationMinutes: serviceToEdit?.durationMinutes ?? 30,
      });
    }
  }, [open, serviceToEdit, reset]);

  function handleClose() {
    setServerError(null);
    onOpenChange(false);
  }

  if (!open) {
    return null;
  }

  async function onSubmit(values: ServiceFormValues) {
    setServerError(null);

    const result =
      isEditing && serviceToEdit
        ? await updateServiceAction(serviceToEdit.id, values)
        : await createServiceAction(values);

    if (!result.success || !result.data) {
      if (result.fieldErrors) {
        const keys = Object.keys(
          result.fieldErrors
        ) as (keyof ServiceFormValues)[];
        for (const field of keys) {
          const message = result.fieldErrors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message });
          }
        }
      }
      setServerError(
        result.message ?? "Não foi possível salvar o serviço."
      );
      return;
    }

    onSuccess(result.data, isEditing);
    onOpenChange(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-dialog-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 text-card-foreground shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2
              id="service-dialog-title"
              className="text-base font-bold text-foreground"
            >
              {isEditing ? "Editar Serviço" : "Novo Serviço no Catálogo"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Defina título, descrição, valor em R$ e tempo de atendimento.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Fechar modal"
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="service-title"
              className="block text-xs font-semibold text-foreground"
            >
              Título do serviço
            </label>
            <Input
              id="service-title"
              type="text"
              placeholder="Ex: Corte Degradê + Barba"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="service-description"
              className="block text-xs font-semibold text-foreground"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="service-description"
              rows={2}
              placeholder="Ex: Inclui lavagem, finalização com pomada e toalha quente."
              aria-invalid={Boolean(errors.description)}
              className="flex w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="service-price"
                className="block text-xs font-semibold text-foreground"
              >
                Preço (R$)
              </label>
              <Input
                id="service-price"
                type="number"
                step="0.50"
                min="1"
                placeholder="45.00"
                aria-invalid={Boolean(errors.price)}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs font-medium text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="service-duration"
                className="block text-xs font-semibold text-foreground"
              >
                Duração (minutos)
              </label>
              <Input
                id="service-duration"
                type="number"
                step="5"
                min="5"
                max="480"
                placeholder="30"
                aria-invalid={Boolean(errors.durationMinutes)}
                {...register("durationMinutes", { valueAsNumber: true })}
              />
              {errors.durationMinutes && (
                <p className="text-xs font-medium text-destructive">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Atalhos de duração:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetDurations.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() =>
                    setValue("durationMinutes", mins, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    currentDuration === mins
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary/60 text-secondary-foreground hover:bg-secondary"
                  )}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>{isEditing ? "Salvar Alterações" : "Criar Serviço"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
