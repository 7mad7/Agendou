"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedMerchantProfile } from "@/actions/merchant";
import {
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validations/merchant";

export interface ServiceDTO {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  createdAt: string;
}

export interface ServiceActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
  unauthorized?: boolean;
}

export async function getMerchantServicesAction(): Promise<
  ServiceActionResult<ServiceDTO[]>
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
    const services = await prisma.service.findMany({
      where: {
        merchantId: merchantResult.data.id,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mapped: ServiceDTO[] = services.map((service) => ({
      id: service.id,
      merchantId: service.merchantId,
      title: service.title,
      description: service.description ?? "",
      price: Number(service.price),
      durationMinutes: service.durationMinutes,
      active: service.active,
      createdAt: service.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: mapped,
    };
  } catch {
    return {
      success: false,
      message: "Não foi possível carregar o catálogo de serviços.",
    };
  }
}

export async function createServiceAction(
  input: ServiceFormValues
): Promise<ServiceActionResult<ServiceDTO>> {
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

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do serviço.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, description, price, durationMinutes } = parsed.data;

  try {
    const created = await prisma.service.create({
      data: {
        merchantId: merchantResult.data.id,
        title,
        description: description.length > 0 ? description : null,
        price,
        durationMinutes,
        active: true,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/servicos");
    revalidatePath("/explorar");

    return {
      success: true,
      message: "Serviço adicionado ao catálogo com sucesso!",
      data: {
        id: created.id,
        merchantId: created.merchantId,
        title: created.title,
        description: created.description ?? "",
        price: Number(created.price),
        durationMinutes: created.durationMinutes,
        active: created.active,
        createdAt: created.createdAt.toISOString(),
      },
    };
  } catch {
    return {
      success: false,
      message: "Erro ao cadastrar o serviço. Tente novamente.",
    };
  }
}

export async function updateServiceAction(
  serviceId: string,
  input: ServiceFormValues
): Promise<ServiceActionResult<ServiceDTO>> {
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

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do serviço.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await prisma.service.findFirst({
      where: {
        id: serviceId,
        merchantId: merchantResult.data.id,
        active: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        message: "Serviço não encontrado ou não pertence ao seu comércio.",
      };
    }

    const updated = await prisma.service.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title,
        description:
          parsed.data.description.length > 0 ? parsed.data.description : null,
        price: parsed.data.price,
        durationMinutes: parsed.data.durationMinutes,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/servicos");
    revalidatePath("/explorar");

    return {
      success: true,
      message: "Serviço atualizado com sucesso!",
      data: {
        id: updated.id,
        merchantId: updated.merchantId,
        title: updated.title,
        description: updated.description ?? "",
        price: Number(updated.price),
        durationMinutes: updated.durationMinutes,
        active: updated.active,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch {
    return {
      success: false,
      message: "Erro ao atualizar o serviço. Tente novamente.",
    };
  }
}

export async function deleteServiceAction(
  serviceId: string
): Promise<ServiceActionResult> {
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

  try {
    const existing = await prisma.service.findFirst({
      where: {
        id: serviceId,
        merchantId: merchantResult.data.id,
        active: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        message: "Serviço não encontrado no seu catálogo.",
      };
    }

    // Soft-delete (active: false) para preservar integridade de agendamentos futuros/históricos
    await prisma.service.update({
      where: { id: existing.id },
      data: { active: false },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/servicos");
    revalidatePath("/explorar");

    return {
      success: true,
      message: "Serviço removido do catálogo ativo com sucesso.",
    };
  } catch {
    return {
      success: false,
      message: "Não foi possível remover o serviço no momento.",
    };
  }
}

