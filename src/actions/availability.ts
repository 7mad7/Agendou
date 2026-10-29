"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedMerchantProfile } from "@/actions/merchant";
import { getAvailableSlots } from "@/lib/availability-engine";
import {
  getDefaultWeeklyAvailability,
  WEEKDAYS_ORDER,
  weeklyAvailabilitySchema,
  type DayAvailabilityFormValues,
  type WeeklyAvailabilityFormValues,
} from "@/lib/validations/availability";

export interface AvailabilityActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  unauthorized?: boolean;
}

export async function getMerchantAvailabilityAction(): Promise<
  AvailabilityActionResult<DayAvailabilityFormValues[]>
> {
  const merchantResult = await getAuthenticatedMerchantProfile();
  if (!merchantResult.success || !merchantResult.data) {
    return {
      success: false,
      unauthorized: merchantResult.unauthorized,
      message:
        merchantResult.message ??
        "Acesso bloqueado: perfil de comércio não encontrado.",
    };
  }

  try {
    const savedRules = await prisma.merchantAvailability.findMany({
      where: {
        merchantId: merchantResult.data.id,
      },
    });

    const rulesByDay = new Map(savedRules.map((rule) => [rule.dayOfWeek, rule]));
    const defaults = getDefaultWeeklyAvailability();

    const orderedDays: DayAvailabilityFormValues[] = WEEKDAYS_ORDER.map(
      (meta, index) => {
        const existing = rulesByDay.get(meta.dayOfWeek);
        if (!existing) {
          return defaults[index];
        }

        const hasBreak = Boolean(existing.breakStart && existing.breakEnd);
        return {
          dayOfWeek: existing.dayOfWeek,
          isActive: existing.isActive,
          openTime: existing.openTime,
          closeTime: existing.closeTime,
          hasBreak,
          breakStart: existing.breakStart ?? "12:00",
          breakEnd: existing.breakEnd ?? "13:00",
        };
      }
    );

    return {
      success: true,
      data: orderedDays,
    };
  } catch {
    return {
      success: false,
      message: "Não foi possível carregar a grade de horários no momento.",
      data: getDefaultWeeklyAvailability(),
    };
  }
}

export async function saveMerchantAvailabilityAction(
  input: WeeklyAvailabilityFormValues
): Promise<AvailabilityActionResult<DayAvailabilityFormValues[]>> {
  const merchantResult = await getAuthenticatedMerchantProfile();
  if (!merchantResult.success || !merchantResult.data) {
    return {
      success: false,
      unauthorized: merchantResult.unauthorized,
      message:
        merchantResult.message ??
        "Acesso negado: perfil de comércio não registrado.",
    };
  }

  const parsed = weeklyAvailabilitySchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      message:
        firstIssue?.message ??
        "Verifique os horários de abertura, fechamento e pausa informados.",
    };
  }

  const merchantId = merchantResult.data.id;

  try {
    await prisma.$transaction(
      parsed.data.days.map((day) =>
        prisma.merchantAvailability.upsert({
          where: {
            merchantId_dayOfWeek: {
              merchantId,
              dayOfWeek: day.dayOfWeek,
            },
          },
          create: {
            merchantId,
            dayOfWeek: day.dayOfWeek,
            isActive: day.isActive,
            openTime: day.openTime,
            closeTime: day.closeTime,
            breakStart: day.isActive && day.hasBreak ? day.breakStart : null,
            breakEnd: day.isActive && day.hasBreak ? day.breakEnd : null,
          },
          update: {
            isActive: day.isActive,
            openTime: day.openTime,
            closeTime: day.closeTime,
            breakStart: day.isActive && day.hasBreak ? day.breakStart : null,
            breakEnd: day.isActive && day.hasBreak ? day.breakEnd : null,
          },
        })
      )
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda/configuracao");
    revalidatePath("/explorar");

    return {
      success: true,
      message: "Grade semanal de disponibilidade salva com sucesso!",
      data: parsed.data.days,
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível salvar a grade de disponibilidade no banco de dados.",
    };
  }
}

export async function getAvailableSlotsAction(
  date: string,
  merchantId: string,
  serviceDurationMinutes: number
): Promise<AvailabilityActionResult<string[]>> {
  try {
    const slots = await getAvailableSlots(
      date,
      merchantId,
      serviceDurationMinutes
    );
    return {
      success: true,
      data: slots,
    };
  } catch {
    return {
      success: false,
      message: "Não foi possível consultar os horários disponíveis.",
      data: [],
    };
  }
}

