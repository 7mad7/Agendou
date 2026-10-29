"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Coffee,
  Loader2,
  Save,
} from "lucide-react";
import { saveMerchantAvailabilityAction } from "@/actions/availability";
import { computeAvailableSlots } from "@/lib/availability-engine";
import {
  WEEKDAYS_ORDER,
  weeklyAvailabilitySchema,
  type DayAvailabilityFormValues,
  type WeeklyAvailabilityFormValues,
} from "@/lib/validations/availability";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AvailabilityFormProps {
  initialDays: DayAvailabilityFormValues[];
}

export function AvailabilityForm({ initialDays }: AvailabilityFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);
  const [previewDuration, setPreviewDuration] = React.useState<number>(45);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WeeklyAvailabilityFormValues>({
    resolver: zodResolver(weeklyAvailabilitySchema),
    mode: "onChange",
    defaultValues: {
      days: initialDays,
    },
  });

  const watchedDays = useWatch({
    control,
    name: "days",
  });

  const daysList = watchedDays ?? initialDays;

  // Seleciona o primeiro dia ativo (ex: Segunda-feira) para demonstrar os slots gerados
  const sampleActiveDay =
    daysList.find((d) => d.isActive) ?? daysList[0];

  const previewSlots = React.useMemo(() => {
    if (!sampleActiveDay || !sampleActiveDay.isActive) {
      return [];
    }
    return computeAvailableSlots({
      date: "2099-01-05",
      availability: {
        isActive: sampleActiveDay.isActive,
        openTime: sampleActiveDay.openTime,
        closeTime: sampleActiveDay.closeTime,
        breakStart: sampleActiveDay.hasBreak
          ? sampleActiveDay.breakStart
          : null,
        breakEnd: sampleActiveDay.hasBreak ? sampleActiveDay.breakEnd : null,
      },
      serviceDurationMinutes: previewDuration,
      occupiedIntervals: [],
      now: new Date(2099, 0, 1, 0, 0, 0),
    });
  }, [sampleActiveDay, previewDuration]);

  async function onSubmit(values: WeeklyAvailabilityFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const result = await saveMerchantAvailabilityAction(values);

    if (!result.success) {
      setServerError(
        result.message ??
          "Não foi possível salvar a grade de horários. Verifique os campos."
      );
      return;
    }

    setServerSuccess(
      result.message ?? "Grade semanal de funcionamento atualizada!"
    );
    router.refresh();
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

      <div className="flex flex-col gap-3">
        {WEEKDAYS_ORDER.map((weekdayMeta, index) => {
          const dayState = daysList[index];
          const isActive = Boolean(dayState?.isActive);
          const hasBreak = Boolean(dayState?.hasBreak);
          const dayErrors = errors.days?.[index];

          return (
            <Card
              key={weekdayMeta.dayOfWeek}
              className={cn(
                "border-border transition-colors",
                isActive ? "bg-card" : "bg-muted/40 opacity-80"
              )}
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-8 w-10 items-center justify-center rounded-lg text-xs font-bold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {weekdayMeta.shortLabel}
                    </span>
                    <div>
                      <CardTitle className="text-sm font-bold">
                        {weekdayMeta.label}
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        {isActive
                          ? `${dayState?.openTime ?? "09:00"} às ${dayState?.closeTime ?? "18:00"}`
                          : "Fechado para agendamentos"}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Switch Liga/Desliga para o dia da semana */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`Ativar atendimento na ${weekdayMeta.label}`}
                    onClick={() =>
                      setValue(`days.${index}.isActive`, !isActive, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive ? "bg-primary" : "bg-input"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform",
                        isActive ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              </CardHeader>

              {isActive && (
                <CardContent className="space-y-3 border-t border-border/60 p-4 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor={`open-${weekdayMeta.dayOfWeek}`}
                        className="flex items-center gap-1 text-xs font-semibold text-foreground"
                      >
                        <Clock
                          className="h-3 w-3 text-primary"
                          aria-hidden="true"
                        />
                        <span>Abertura</span>
                      </label>
                      <Input
                        id={`open-${weekdayMeta.dayOfWeek}`}
                        type="time"
                        aria-invalid={Boolean(dayErrors?.openTime)}
                        className="h-10 text-sm"
                        {...register(`days.${index}.openTime`)}
                      />
                      {dayErrors?.openTime && (
                        <p className="text-[11px] font-medium text-destructive">
                          {dayErrors.openTime.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor={`close-${weekdayMeta.dayOfWeek}`}
                        className="flex items-center gap-1 text-xs font-semibold text-foreground"
                      >
                        <Clock
                          className="h-3 w-3 text-primary"
                          aria-hidden="true"
                        />
                        <span>Fechamento</span>
                      </label>
                      <Input
                        id={`close-${weekdayMeta.dayOfWeek}`}
                        type="time"
                        aria-invalid={Boolean(dayErrors?.closeTime)}
                        className="h-10 text-sm"
                        {...register(`days.${index}.closeTime`)}
                      />
                      {dayErrors?.closeTime && (
                        <p className="text-[11px] font-medium text-destructive">
                          {dayErrors.closeTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Configuração do Intervalo de Pausa (Ex: Almoço 12:00 - 13:00) */}
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Coffee
                          className="h-3.5 w-3.5 text-primary"
                          aria-hidden="true"
                        />
                        <span>Intervalo de Pausa / Almoço</span>
                      </span>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={hasBreak}
                        aria-label={`Intervalo de pausa na ${weekdayMeta.label}`}
                        onClick={() =>
                          setValue(`days.${index}.hasBreak`, !hasBreak, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          hasBreak ? "bg-primary" : "bg-input"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform",
                            hasBreak ? "translate-x-4" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>

                    {hasBreak && (
                      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label
                            htmlFor={`break-start-${weekdayMeta.dayOfWeek}`}
                            className="block text-[11px] font-medium text-muted-foreground"
                          >
                            Início da pausa
                          </label>
                          <Input
                            id={`break-start-${weekdayMeta.dayOfWeek}`}
                            type="time"
                            aria-invalid={Boolean(dayErrors?.breakStart)}
                            className="h-9 bg-background text-xs"
                            {...register(`days.${index}.breakStart`)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor={`break-end-${weekdayMeta.dayOfWeek}`}
                            className="block text-[11px] font-medium text-muted-foreground"
                          >
                            Fim da pausa
                          </label>
                          <Input
                            id={`break-end-${weekdayMeta.dayOfWeek}`}
                            type="time"
                            aria-invalid={Boolean(dayErrors?.breakEnd)}
                            className="h-9 bg-background text-xs"
                            {...register(`days.${index}.breakEnd`)}
                          />
                        </div>

                        {(dayErrors?.breakStart || dayErrors?.breakEnd) && (
                          <p className="col-span-2 text-[11px] font-medium text-destructive">
                            {dayErrors.breakStart?.message ??
                              dayErrors.breakEnd?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Prévia matemática em tempo real do Motor de Geração de Horários */}
      <Card className="border-primary/25 bg-card">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              <CardTitle className="text-sm font-bold">
                Prévia de Slots Gerados
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {[30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPreviewDuration(mins)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-colors",
                    previewDuration === mins
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
          <CardDescription className="text-xs">
            Simulação automática para serviço de {previewDuration} min
            descontando o intervalo de pausa configurado:
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {previewSlots.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Ative pelo menos um dia válido para visualizar os horários livres.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {previewSlots.map((slot) => (
                <Badge key={slot} variant="outline" className="font-mono">
                  {slot}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Salvando grade semanal...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>Salvar Horários de Funcionamento</span>
          </>
        )}
      </Button>
    </form>
  );
}

