"use client";

import { CalendarX2, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SlotGridProps {
  slots: string[];
  selectedSlot: string | null;
  loading: boolean;
  onSelectSlot: (slot: string) => void;
}

export function SlotGrid({
  slots,
  selectedSlot,
  loading,
  onSelectSlot,
}: SlotGridProps) {
  return (
    <section aria-labelledby="slot-grid-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="slot-grid-heading"
          className="flex items-center gap-1.5 text-base font-bold text-foreground"
        >
          <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>3. Horários Disponíveis</span>
        </h2>
        {!loading && (
          <span className="text-xs text-muted-foreground">
            {slots.length}{" "}
            {slots.length === 1 ? "horário livre" : "horários livres"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card/60">
          <Loader2
            className="h-5 w-5 animate-spin text-primary"
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">
            Consultando agenda em tempo real...
          </span>
        </div>
      ) : slots.length === 0 ? (
        <Card className="border-dashed border-border bg-card/60 p-5 text-center">
          <CalendarX2
            className="mx-auto h-6 w-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-2 text-xs font-medium text-foreground">
            Nenhum horário livre nesta data
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Os horários deste dia já foram preenchidos ou o comércio está
            fechado. Selecione outra data acima.
          </p>
        </Card>
      ) : (
        <div
          role="listbox"
          aria-label="Horários livres para reserva"
          className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {slots.map((slot) => {
            const isSelected = slot === selectedSlot;

            return (
              <button
                key={slot}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  "flex h-11 items-center justify-center rounded-xl border font-mono text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50"
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

