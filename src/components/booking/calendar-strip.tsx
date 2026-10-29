"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarDayOption {
  isoDate: string;
  dayNumber: string;
  weekdayShort: string;
  monthShort: string;
  isToday: boolean;
}

const WEEKDAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function generateNext14Days(baseIsoDate: string): CalendarDayOption[] {
  const days: CalendarDayOption[] = [];
  const [baseYear, baseMonth, baseDay] = baseIsoDate.split("-").map(Number);
  const base = new Date(baseYear, baseMonth - 1, baseDay, 0, 0, 0, 0);

  for (let offset = 0; offset < 14; offset++) {
    const d = new Date(base);
    d.setDate(base.getDate() + offset);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    days.push({
      isoDate: `${year}-${month}-${day}`,
      dayNumber: day,
      weekdayShort: WEEKDAY_NAMES_SHORT[d.getDay()],
      monthShort: MONTH_NAMES_SHORT[d.getMonth()],
      isToday: offset === 0,
    });
  }

  return days;
}

interface CalendarStripProps {
  days: CalendarDayOption[];
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
}

export function CalendarStrip({
  days,
  selectedDate,
  onSelectDate,
}: CalendarStripProps) {
  return (
    <section aria-labelledby="calendar-strip-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="calendar-strip-heading"
          className="flex items-center gap-1.5 text-base font-bold text-foreground"
        >
          <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>2. Selecione a Data</span>
        </h2>
        <span className="text-xs text-muted-foreground">Próximos 14 dias</span>
      </div>

      <div
        role="listbox"
        aria-label="Datas disponíveis para agendamento"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {days.map((day) => {
          const isSelected = day.isoDate === selectedDate;

          return (
            <button
              key={day.isoDate}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelectDate(day.isoDate)}
              className={cn(
                "flex min-w-[64px] shrink-0 flex-col items-center justify-center rounded-2xl border px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/40"
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-medium uppercase",
                  isSelected
                    ? "text-primary-foreground/90"
                    : "text-muted-foreground"
                )}
              >
                {day.isToday ? "Hoje" : day.weekdayShort}
              </span>
              <span className="mt-0.5 text-lg font-bold leading-none">
                {day.dayNumber}
              </span>
              <span
                className={cn(
                  "mt-1 text-[10px] font-medium",
                  isSelected
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {day.monthShort}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
