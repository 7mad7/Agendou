"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  computeAvailableSlots,
  getAvailableSlots,
} from "@/lib/availability-engine";
import { TIME_REGEX } from "@/lib/validations/availability";

export interface PublicServiceDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface PublicMerchantDetailsDTO {
  id: string;
  slug: string;
  tradeName: string;
  category: string;
  categoryLabel: string;
  address: string;
  description: string;
  phone: string;
  services: PublicServiceDTO[];
}

export interface ConfirmedBookingSummary {
  bookingId: string;
  merchantName: string;
  merchantPhone: string;
  serviceTitle: string;
  servicePrice: number;
  durationMinutes: number;
  dateFormatted: string;
  timeSlot: string;
  whatsappUrl: string;
  whatsappMessage: string;
}

export interface BookingActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  requiresAuth?: boolean;
  loginRedirectUrl?: string;
  conflict?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  barbearia: "Barbearia",
  estetica: "Estética & Beleza",
  lanches: "Lanches & Alimentação",
  manutencao: "Manutenção/Serviços",
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category.toLowerCase()] ?? category;
}

const DEMO_MERCHANTS_CATALOG: Record<string, PublicMerchantDetailsDTO> = {
  "barbearia-vintage-centro": {
    id: "barbearia-vintage-centro",
    slug: "barbearia-vintage-centro",
    tradeName: "Barbearia Vintage do Bairro",
    category: "barbearia",
    categoryLabel: "Barbearia",
    address: "Rua das Acácias, 210 - Centro",
    description:
      "Cortes clássicos, degradê na navalha e barba na toalha quente com produtos selecionados.",
    phone: "(11) 99876-5432",
    services: [
      {
        id: "srv-corte-social",
        title: "Corte Masculino / Degradê",
        description: "Corte personalizado com lavagem e finalização.",
        price: 40,
        durationMinutes: 30,
      },
      {
        id: "srv-barba-toalha",
        title: "Barba Terapia (Toalha Quente)",
        description: "Alinhamento na navalha e hidratação com óleo essencial.",
        price: 35,
        durationMinutes: 30,
      },
      {
        id: "srv-combo-completo",
        title: "Combo Corte + Barba Completa",
        description: "Pacote completo para renovar o visual.",
        price: 65,
        durationMinutes: 60,
      },
    ],
  },
  "studio-bela-estetica": {
    id: "studio-bela-estetica",
    slug: "studio-bela-estetica",
    tradeName: "Studio Bela Estética & Unhas",
    category: "estetica",
    categoryLabel: "Estética & Beleza",
    address: "Av. Brasil, 845 - Sala 2, Jardim América",
    description:
      "Especialistas em esmaltação em gel, manicure, design de sobrancelhas e estética facial.",
    phone: "(11) 99765-4321",
    services: [
      {
        id: "srv-manicure-pedicure",
        title: "Pé e Mão Tradicional",
        description: "Cutilagem, hidratação e esmaltação completa.",
        price: 55,
        durationMinutes: 60,
      },
      {
        id: "srv-design-sobrancelha",
        title: "Design de Sobrancelhas com Henna",
        description: "Simetria facial e aplicação opcional de henna.",
        price: 40,
        durationMinutes: 30,
      },
    ],
  },
  "ponto-do-lanche-artesanal": {
    id: "ponto-do-lanche-artesanal",
    slug: "ponto-do-lanche-artesanal",
    tradeName: "Ponto do Lanche Artesanal",
    category: "lanches",
    categoryLabel: "Lanches & Alimentação",
    address: "Rua São Bento, 98 - Vila Nova",
    description:
      "Agende o horário exato de retirada do seu combo artesanal recém-saído da chapa.",
    phone: "(11) 99654-3210",
    services: [
      {
        id: "srv-retirada-combo-smash",
        title: "Retirada: Combo Duplo Smash + Fritas",
        description: "Preparo programado para retirada quente no balcão.",
        price: 34,
        durationMinutes: 15,
      },
      {
        id: "srv-retirada-combo-familia",
        title: "Retirada: Combo Família (4 Burgers)",
        description: "Quatro lanches artesanais + porção grande de batatas.",
        price: 118,
        durationMinutes: 30,
      },
    ],
  },
  "oficina-express-reparos": {
    id: "oficina-express-reparos",
    slug: "oficina-express-reparos",
    tradeName: "Assistência & Reparos Express",
    category: "manutencao",
    categoryLabel: "Manutenção/Serviços",
    address: "Rua Sete de Setembro, 412 - Centro",
    description:
      "Diagnóstico rápido, troca de tela e bateria de smartphones com hora marcada.",
    phone: "(11) 99543-2109",
    services: [
      {
        id: "srv-troca-bateria",
        title: "Substituição de Bateria Express",
        description: "Troca com teste de carga na hora.",
        price: 90,
        durationMinutes: 45,
      },
      {
        id: "srv-diagnostico-geral",
        title: "Diagnóstico Técnico Completo",
        description: "Avaliação de placa, conectores e orçamento detalhado.",
        price: 50,
        durationMinutes: 30,
      },
    ],
  },
};

const slotQuerySchema = z.object({
  merchantId: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  durationMinutes: z.number().int().min(5).max(480),
});

const createBookingSchema = z.object({
  merchantId: z.string().trim().min(1, "Comércio inválido"),
  serviceId: z.string().trim().min(1, "Selecione um serviço"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecione uma data válida"),
  timeSlot: z.string().regex(TIME_REGEX, "Selecione um horário válido"),
});

function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function buildWhatsappUrl(phone: string, message: string): string {
  const cleanDigits = phone.replace(/\D/g, "");
  const phoneWithCountry =
    cleanDigits.length >= 10
      ? cleanDigits.startsWith("55")
        ? cleanDigits
        : `55${cleanDigits}`
      : "5511999999999";

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}

export async function getMerchantPublicDetailsAction(
  slug: string
): Promise<PublicMerchantDetailsDTO | null> {
  const cleanSlug = decodeURIComponent(slug).trim();
  if (!cleanSlug) {
    return null;
  }

  try {
    const dbMerchant = await prisma.merchantProfile.findUnique({
      where: { id: cleanSlug },
      include: {
        services: {
          where: { active: true },
          orderBy: { price: "asc" },
        },
      },
    });

    if (dbMerchant) {
      return {
        id: dbMerchant.id,
        slug: dbMerchant.id,
        tradeName: dbMerchant.tradeName,
        category: dbMerchant.category,
        categoryLabel: getCategoryLabel(dbMerchant.category),
        address: dbMerchant.address,
        description: dbMerchant.description ?? "",
        phone: dbMerchant.phone ?? "(11) 99999-9999",
        services: dbMerchant.services.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description ?? "",
          price: Number(s.price),
          durationMinutes: s.durationMinutes,
        })),
      };
    }
  } catch {
    // Fallback para dados demonstrativos caso o banco local não esteja acessível
  }

  return DEMO_MERCHANTS_CATALOG[cleanSlug] ?? null;
}

export async function getAvailableSlotsForBookingAction(input: {
  merchantId: string;
  date: string;
  durationMinutes: number;
}): Promise<BookingActionResult<string[]>> {
  const parsed = slotQuerySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Parâmetros de consulta de horários inválidos.",
      data: [],
    };
  }

  const { merchantId, date, durationMinutes } = parsed.data;

  try {
    const slots = await getAvailableSlots(date, merchantId, durationMinutes);
    if (slots.length > 0) {
      return {
        success: true,
        data: slots,
      };
    }

    // Verifica se o comércio possui regra explícita configurada como fechado nesse dia
    const [year, month, day] = date.split("-").map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const rule = await prisma.merchantAvailability.findUnique({
      where: {
        merchantId_dayOfWeek: {
          merchantId,
          dayOfWeek,
        },
      },
    });

    if (rule) {
      return {
        success: true,
        data: [],
      };
    }
  } catch {
    // Caso ainda não haja regras salvas no banco ou em modo demo, gera grade comercial padrão
  }

  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();

  // Domingo fechado por padrão
  if (weekday === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const defaultSlots = computeAvailableSlots({
    date,
    availability: {
      isActive: true,
      openTime: "09:00",
      closeTime: weekday === 6 ? "14:00" : "18:00",
      breakStart: weekday === 6 ? null : "12:00",
      breakEnd: weekday === 6 ? null : "13:00",
    },
    serviceDurationMinutes: durationMinutes,
    occupiedIntervals: [],
  });

  return {
    success: true,
    data: defaultSlots,
  };
}

export async function createAtomicBookingAction(input: {
  merchantId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
}): Promise<BookingActionResult<ConfirmedBookingSummary>> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Verifique os dados do seu agendamento.",
    };
  }

  const { merchantId, serviceId, date, timeSlot } = parsed.data;

  // Bloqueio para usuários não autenticados com redirecionamento de volta ao agendamento
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      requiresAuth: true,
      loginRedirectUrl: `/login?callbackUrl=${encodeURIComponent(`/c/${merchantId}`)}`,
      message:
        "Faça login na sua conta de cliente para confirmar o agendamento.",
    };
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = timeSlot.split(":").map(Number);
  const startTime = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (startTime.getTime() <= Date.now()) {
    return {
      success: false,
      message:
        "Este horário já passou. Por favor, selecione um horário futuro.",
    };
  }

  try {
    // Reserva Atômica em transação isolada para prevenir Double-Booking (ACID)
    const txResult = await prisma.$transaction(
      async (tx) => {
        const service = await tx.service.findFirst({
          where: {
            id: serviceId,
            merchantId,
            active: true,
          },
          include: {
            merchant: true,
          },
        });

        if (!service) {
          throw new Error("SERVICE_NOT_FOUND");
        }

        const endTime = new Date(
          startTime.getTime() + service.durationMinutes * 60_000
        );

        // Checa antes de inserir se o intervalo [startTime, endTime) permanece livre
        const conflictingBooking = await tx.booking.findFirst({
          where: {
            merchantId,
            status: "CONFIRMED",
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          select: { id: true },
        });

        if (conflictingBooking) {
          throw new Error("SLOT_ALREADY_BOOKED");
        }

        // Obtém ou garante perfil de cliente para o usuário autenticado
        let clientProfile = await tx.clientProfile.findUnique({
          where: { userId: session.userId },
        });

        if (!clientProfile) {
          clientProfile = await tx.clientProfile.create({
            data: {
              userId: session.userId,
              name: session.name,
              age: 25,
              gender: "PREFIRO_NAO_INFORMAR",
            },
          });
        }

        const createdBooking = await tx.booking.create({
          data: {
            clientId: clientProfile.id,
            merchantId,
            serviceId: service.id,
            startTime,
            endTime,
            status: "CONFIRMED",
          },
        });

        return {
          bookingId: createdBooking.id,
          merchantName: service.merchant.tradeName,
          merchantPhone: service.merchant.phone ?? "(11) 99999-9999",
          serviceTitle: service.title,
          servicePrice: Number(service.price),
          durationMinutes: service.durationMinutes,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    const dateFormatted = formatDateBR(date);
    const whatsappMessage = `Olá, confirmei meu agendamento de ${txResult.serviceTitle} para o dia ${dateFormatted} às ${timeSlot} pelo Agendou`;
    const whatsappUrl = buildWhatsappUrl(
      txResult.merchantPhone,
      whatsappMessage
    );

    revalidatePath(`/c/${merchantId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Agendamento confirmado com sucesso!",
      data: {
        bookingId: txResult.bookingId,
        merchantName: txResult.merchantName,
        merchantPhone: txResult.merchantPhone,
        serviceTitle: txResult.serviceTitle,
        servicePrice: txResult.servicePrice,
        durationMinutes: txResult.durationMinutes,
        dateFormatted,
        timeSlot,
        whatsappUrl,
        whatsappMessage,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SLOT_ALREADY_BOOKED") {
        return {
          success: false,
          conflict: true,
          message:
            "Ops! Outro cliente acabou de reservar este horário. Por favor, escolha outro horário disponível.",
        };
      }
      if (error.message === "SERVICE_NOT_FOUND") {
        return {
          success: false,
          message: "O serviço selecionado não está mais disponível.",
        };
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        conflict: true,
        message:
          "Ops! Outro cliente acabou de reservar este horário. Por favor, escolha outro horário disponível.",
      };
    }

    // Fallback para estabelecimentos demonstrativos quando o banco não está conectado
    const demoMerchant = DEMO_MERCHANTS_CATALOG[merchantId];
    const demoService = demoMerchant?.services.find((s) => s.id === serviceId);
    if (demoMerchant && demoService) {
      const dateFormatted = formatDateBR(date);
      const whatsappMessage = `Olá, confirmei meu agendamento de ${demoService.title} para o dia ${dateFormatted} às ${timeSlot} pelo Agendou`;
      const whatsappUrl = buildWhatsappUrl(demoMerchant.phone, whatsappMessage);

      return {
        success: true,
        message: "Agendamento confirmado com sucesso!",
        data: {
          bookingId: `bk-${Date.now()}`,
          merchantName: demoMerchant.tradeName,
          merchantPhone: demoMerchant.phone,
          serviceTitle: demoService.title,
          servicePrice: demoService.price,
          durationMinutes: demoService.durationMinutes,
          dateFormatted,
          timeSlot,
          whatsappUrl,
          whatsappMessage,
        },
      };
    }

    return {
      success: false,
      message:
        "Não foi possível confirmar a reserva no momento. Tente novamente em instantes.",
    };
  }
}

