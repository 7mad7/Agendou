"use client";

import { Check, Clock, Scissors } from "lucide-react";
import type { PublicServiceDTO } from "@/actions/booking";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrencyBRL,
  formatDurationMinutes,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ServicePickerProps {
  services: PublicServiceDTO[];
  selectedServiceId: string | null;
  onSelectService: (service: PublicServiceDTO) => void;
}

export function ServicePicker({
  services,
  selectedServiceId,
  onSelectService,
}: ServicePickerProps) {
  return (
    <section aria-labelledby="service-picker-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="service-picker-heading"
          className="text-base font-bold text-foreground"
        >
          1. Escolha o Serviço
        </h2>
        <span className="text-xs text-muted-foreground">
          {services.length}{" "}
          {services.length === 1 ? "opção disponível" : "opções disponíveis"}
        </span>
      </div>

      {services.length === 0 ? (
        <Card className="border-dashed border-border bg-card/60 p-5 text-center">
          <Scissors
            className="mx-auto h-7 w-7 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Este estabelecimento ainda não publicou serviços no catálogo.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService(service)}
                aria-pressed={isSelected}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
              >
                <Card
                  className={cn(
                    "transition-all",
                    isSelected
                      ? "border-primary bg-accent/40 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            {service.title}
                          </h3>
                          {isSelected && (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3 w-3" aria-hidden="true" />
                            </span>
                          )}
                        </div>

                        {service.description && (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {service.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                          <Clock
                            className="h-3.5 w-3.5 text-primary"
                            aria-hidden="true"
                          />
                          <span>
                            {formatDurationMinutes(service.durationMinutes)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          variant={isSelected ? "default" : "accent"}
                          className="text-xs font-bold"
                        >
                          {formatCurrencyBRL(service.price)}
                        </Badge>
                        <span className="text-[11px] font-semibold text-primary">
                          {isSelected ? "Selecionado" : "Agendar"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

