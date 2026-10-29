import { z } from "zod";

export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface WeekdayMeta {
  dayOfWeek: number;
  label: string;
  shortLabel: string;
}

// Ordem comercial: Segunda-feira (1) a Domingo (0)
export const WEEKDAYS_ORDER: WeekdayMeta[] = [
  { dayOfWeek: 1, label: "Segunda-feira", shortLabel: "Seg" },
  { dayOfWeek: 2, label: "Terça-feira", shortLabel: "Ter" },
  { dayOfWeek: 3, label: "Quarta-feira", shortLabel: "Qua" },
  { dayOfWeek: 4, label: "Quinta-feira", shortLabel: "Qui" },
  { dayOfWeek: 5, label: "Sexta-feira", shortLabel: "Sex" },
  { dayOfWeek: 6, label: "Sábado", shortLabel: "Sáb" },
  { dayOfWeek: 0, label: "Domingo", shortLabel: "Dom" },
];

export function timeToMinutes(time: string): number {
  if (!TIME_REGEX.test(time)) {
    return -1;
  }
  const [hoursStr, minutesStr] = time.split(":");
  return Number(hoursStr) * 60 + Number(minutesStr);
}

export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.floor(totalMinutes)));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export const dayAvailabilitySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isActive: z.boolean(),
    openTime: z
      .string()
      .regex(TIME_REGEX, "Informe o horário no formato HH:mm"),
    closeTime: z
      .string()
      .regex(TIME_REGEX, "Informe o horário no formato HH:mm"),
    hasBreak: z.boolean(),
    breakStart: z.string(),
    breakEnd: z.string(),
  })
  .superRefine((day, ctx) => {
    if (!day.isActive) {
      return;
    }

    const openMin = timeToMinutes(day.openTime);
    const closeMin = timeToMinutes(day.closeTime);

    if (openMin < 0 || closeMin < 0) {
      return;
    }

    if (closeMin <= openMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closeTime"],
        message: "O horário de término deve ser posterior ao horário de início",
      });
      return;
    }

    if (day.hasBreak) {
      if (!TIME_REGEX.test(day.breakStart)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["breakStart"],
          message: "Informe o início da pausa (HH:mm)",
        });
        return;
      }

      if (!TIME_REGEX.test(day.breakEnd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["breakEnd"],
          message: "Informe o término da pausa (HH:mm)",
        });
        return;
      }

      const breakStartMin = timeToMinutes(day.breakStart);
      const breakEndMin = timeToMinutes(day.breakEnd);

      if (breakEndMin <= breakStartMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["breakEnd"],
          message: "O fim da pausa deve ser posterior ao início da pausa",
        });
      } else if (breakStartMin < openMin || breakEndMin > closeMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["breakStart"],
          message:
            "O intervalo de pausa deve estar dentro do horário de funcionamento",
        });
      }
    }
  });

export type DayAvailabilityFormValues = z.infer<typeof dayAvailabilitySchema>;

export const weeklyAvailabilitySchema = z.object({
  days: z.array(dayAvailabilitySchema).length(7),
});

export type WeeklyAvailabilityFormValues = z.infer<
  typeof weeklyAvailabilitySchema
>;

export function getDefaultWeeklyAvailability(): DayAvailabilityFormValues[] {
  return WEEKDAYS_ORDER.map((meta) => ({
    dayOfWeek: meta.dayOfWeek,
    isActive: meta.dayOfWeek !== 0, // Segunda a Sábado ativos por padrão
    openTime: "09:00",
    closeTime: meta.dayOfWeek === 6 ? "14:00" : "18:00",
    hasBreak: meta.dayOfWeek !== 0 && meta.dayOfWeek !== 6,
    breakStart: "12:00",
    breakEnd: "13:00",
  }));
}

