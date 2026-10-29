"use client";

import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  MessageCircle,
  Store,
  X,
} from "lucide-react";
import type {
  ConfirmedBookingSummary,
  PublicServiceDTO,
} from "@/actions/booking";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  formatCurrencyBRL,
  formatDurationMinutes,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface BookingConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  merchantSlug: string;
  merchantName: string;
  service: PublicServiceDTO | null;
  selectedDate: string;
  selectedSlot: string | null;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  confirmedBooking: ConfirmedBookingSummary | null;
  onConfirmBooking: () => void;
}

function formatIsoDateBR(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function BookingConfirmationModal({
  open,
  onClose,
  merchantSlug,
  merchantName,
  service,
  selectedDate,
  selectedSlot,
  isAuthenticated,
  isSubmitting,
  errorMessage,
  confirmedBooking,
  onConfirmBooking,
}: BookingConfirmationModalProps) {
  if (!open || !service || !selectedSlot) {
    return null;
  }

  const loginCallbackUrl = `/login?callbackUrl=${encodeURIComponent(`/c/${merchantSlug}`)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 text-card-foreground shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              {confirmedBooking ? (
                <CheckCircle2
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <CalendarCheck2
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              )}
            </div>
            <div>
              <h2
                id="booking-modal-title"
                className="text-base font-bold text-foreground"
              >
                {confirmedBooking
                  ? "Reserva Confirmada!"
                  : "Confirmar Agendamento"}
              </h2>
              <p className="text-xs text-muted-foreground">{merchantName}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar modal"
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {confirmedBooking ? (
          /* Tela Pós-Agendamento com botão direto para WhatsApp */
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-primary/25 bg-accent/60 p-4 text-xs text-accent-foreground">
              <p className="font-semibold text-foreground">
                Seu horário foi reservado com sucesso!
              </p>
              <p className="mt-1 text-muted-foreground">
                Envie a confirmação diretamente para o WhatsApp do
                estabelecimento com um toque abaixo.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-border bg-background p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Comércio:</span>
                <strong className="text-foreground">
                  {confirmedBooking.merchantName}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Serviço:</span>
                <strong className="text-foreground">
                  {confirmedBooking.serviceTitle}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data e Hora:</span>
                <strong className="text-primary">
                  {confirmedBooking.dateFormatted} às{" "}
                  {confirmedBooking.timeSlot}
                </strong>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Valor:</span>
                <strong className="text-sm text-foreground">
                  {formatCurrencyBRL(confirmedBooking.servicePrice)}
                </strong>
              </div>
            </div>

            <a
              href={confirmedBooking.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full gap-2 font-semibold"
              )}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Enviar Confirmação no WhatsApp</span>
            </a>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Fechar e voltar ao comércio
            </Button>
          </div>
        ) : (
          /* Revisão da Reserva / Bloqueio para clientes não autenticados */
          <div className="flex flex-col gap-4">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2.5 rounded-2xl border border-border bg-background p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  <span>Estabelecimento</span>
                </span>
                <strong className="text-foreground">{merchantName}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Procedimento</span>
                <strong className="text-foreground">{service.title}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Duração</span>
                </span>
                <span className="font-medium text-foreground">
                  {formatDurationMinutes(service.durationMinutes)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data e Horário</span>
                <strong className="font-mono text-primary">
                  {formatIsoDateBR(selectedDate)} às {selectedSlot}
                </strong>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <span className="font-medium text-muted-foreground">
                  Total a pagar no local
                </span>
                <strong className="text-base text-foreground">
                  {formatCurrencyBRL(service.price)}
                </strong>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-3 rounded-2xl border border-primary/30 bg-accent/50 p-4 text-xs">
                <p className="font-semibold text-foreground">
                  Identificação necessária para reservar
                </p>
                <p className="text-muted-foreground">
                  Para bloquear este horário na agenda do estabelecimento,
                  entre na sua conta ou cadastre-se rapidamente.
                </p>
                <Link
                  href={loginCallbackUrl}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full gap-2 font-semibold"
                  )}
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Entrar para Confirmar Reserva</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={onConfirmBooking}
                  className="w-full font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Reservando horário...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
                      <span>Confirmar Agendamento Agora</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="w-full text-xs"
                >
                  Escolher outro horário
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

