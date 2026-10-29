import { prisma } from "@/lib/prisma";
import { minutesToTime, timeToMinutes } from "@/lib/validations/availability";

export interface AvailabilityRuleInput {
  isActive: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
}

export interface OccupiedInterval {
  startTime: Date | string;
  endTime: Date | string;
}

export interface ComputeSlotsParams {
  date: Date | string;
  availability: AvailabilityRuleInput | null;
  serviceDurationMinutes: number;
  occupiedIntervals?: OccupiedInterval[];
  now?: Date;
}

function parseTargetCalendarDate(input: Date | string): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
} {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    const localDate = new Date(y, m - 1, d);
    return {
      year: y,
      month: m - 1,
      day: d,
      dayOfWeek: localDate.getDay(),
    };
  }

  const parsed = input instanceof Date ? input : new Date(input);
  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth(),
    day: parsed.getDate(),
    dayOfWeek: parsed.getDay(),
  };
}

function parseIntervalToMinutes(
  interval: OccupiedInterval,
  targetYear: number,
  targetMonth: number,
  targetDay: number
): { startMin: number; endMin: number } | null {
  if (
    typeof interval.startTime === "string" &&
    typeof interval.endTime === "string" &&
    /^\d{2}:\d{2}$/.test(interval.startTime) &&
    /^\d{2}:\d{2}$/.test(interval.endTime)
  ) {
    const startMin = timeToMinutes(interval.startTime);
    const endMin = timeToMinutes(interval.endTime);
    if (startMin >= 0 && endMin > startMin) {
      return { startMin, endMin };
    }
    return null;
  }

  const start =
    interval.startTime instanceof Date
      ? interval.startTime
      : new Date(interval.startTime);
  const end =
    interval.endTime instanceof Date
      ? interval.endTime
      : new Date(interval.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const dayStart = new Date(targetYear, targetMonth, targetDay, 0, 0, 0, 0);
  const dayEnd = new Date(targetYear, targetMonth, targetDay, 23, 59, 59, 999);

  if (end <= dayStart || start >= dayEnd) {
    return null;
  }

  const clampedStart = start < dayStart ? dayStart : start;
  const clampedEnd = end > dayEnd ? dayEnd : end;

  const startMin = clampedStart.getHours() * 60 + clampedStart.getMinutes();
  const endMin =
    clampedEnd.getHours() * 60 +
    clampedEnd.getMinutes() +
    (clampedEnd.getSeconds() > 0 ? 1 : 0);

  if (endMin <= startMin) {
    return null;
  }

  return { startMin, endMin };
}

/**
 * Função utilitária pura que computa matematicamente os slots disponíveis ("HH:mm")
 * descontando intervalos de pausa, agendamentos ocupados e horários já passados.
 */
export function computeAvailableSlots({
  date,
  availability,
  serviceDurationMinutes,
  occupiedIntervals = [],
  now = new Date(),
}: ComputeSlotsParams): string[] {
  if (
    !availability ||
    !availability.isActive ||
    !Number.isFinite(serviceDurationMinutes) ||
    serviceDurationMinutes <= 0
  ) {
    return [];
  }

  const { year, month, day } = parseTargetCalendarDate(date);
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const nowDay = now.getDate();

  const targetDayStamp = new Date(year, month, day).getTime();
  const todayStamp = new Date(nowYear, nowMonth, nowDay).getTime();

  // Não permite gerar horários para datas anteriores ao dia atual
  if (targetDayStamp < todayStamp) {
    return [];
  }

  const isToday = targetDayStamp === todayStamp;
  const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();

  const openMin = timeToMinutes(availability.openTime);
  const closeMin = timeToMinutes(availability.closeTime);

  if (openMin < 0 || closeMin < 0 || closeMin <= openMin) {
    return [];
  }

  // Coleta intervalos bloqueados (pausa/almoço + agendamentos confirmados)
  const blockedRanges: Array<{ startMin: number; endMin: number }> = [];

  if (availability.breakStart && availability.breakEnd) {
    const bStart = timeToMinutes(availability.breakStart);
    const bEnd = timeToMinutes(availability.breakEnd);
    if (bStart >= 0 && bEnd > bStart) {
      blockedRanges.push({ startMin: bStart, endMin: bEnd });
    }
  }

  for (const occupied of occupiedIntervals) {
    const parsedRange = parseIntervalToMinutes(occupied, year, month, day);
    if (parsedRange) {
      blockedRanges.push(parsedRange);
    }
  }

  blockedRanges.sort((a, b) => a.startMin - b.startMin);

  const slots: string[] = [];
  let cursor = openMin;

  while (cursor + serviceDurationMinutes <= closeMin) {
    const slotStart = cursor;
    const slotEnd = cursor + serviceDurationMinutes;

    // Verifica colisão com algum intervalo bloqueado (pausa ou booking confirmado)
    const collidingBlock = blockedRanges.find(
      (block) => slotStart < block.endMin && slotEnd > block.startMin
    );

    if (collidingBlock) {
      cursor = Math.max(cursor + 1, collidingBlock.endMin);
      continue;
    }

    // Não permite horários que já passaram no dia de hoje em relação a now()
    if (!isToday || slotStart > currentMinutesOfDay) {
      slots.push(minutesToTime(slotStart));
    }

    cursor += serviceDurationMinutes;
  }

  return slots;
}

/**
 * Motor principal de disponibilidade: recebe (data, merchantId, duracaoDoServico),
 * consulta a grade de atendimento do dia da semana e os Bookings com status CONFIRMED,
 * e retorna a lista de slots livres (ex: ["09:00", "09:45", "10:30"]).
 */
export async function getAvailableSlots(
  date: Date | string,
  merchantId: string,
  serviceDurationMinutes: number,
  now: Date = new Date()
): Promise<string[]> {
  if (!merchantId || serviceDurationMinutes <= 0) {
    return [];
  }

  const { year, month, day, dayOfWeek } = parseTargetCalendarDate(date);
  const dayStart = new Date(year, month, day, 0, 0, 0, 0);
  const dayEnd = new Date(year, month, day, 23, 59, 59, 999);

  const [availabilityRule, confirmedBookings] = await Promise.all([
    prisma.merchantAvailability.findUnique({
      where: {
        merchantId_dayOfWeek: {
          merchantId,
          dayOfWeek,
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        merchantId,
        status: "CONFIRMED",
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      select: {
        startTime: true,
        endTime: true,
      },
      orderBy: {
        startTime: "asc",
      },
    }),
  ]);

  if (!availabilityRule || !availabilityRule.isActive) {
    return [];
  }

  return computeAvailableSlots({
    date,
    availability: {
      isActive: availabilityRule.isActive,
      openTime: availabilityRule.openTime,
      closeTime: availabilityRule.closeTime,
      breakStart: availabilityRule.breakStart,
      breakEnd: availabilityRule.breakEnd,
    },
    serviceDurationMinutes,
    occupiedIntervals: confirmedBookings,
    now,
  });
}

