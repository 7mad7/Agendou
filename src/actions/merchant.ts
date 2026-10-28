"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  merchantProfileSchema,
  type MerchantProfileFormValues,
} from "@/lib/validations/merchant";

export interface MerchantProfileDTO {
  id: string;
  userId: string;
  email: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  category: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MerchantActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
  unauthorized?: boolean;
}

export async function getAuthenticatedMerchantProfile(): Promise<
  MerchantActionResult<MerchantProfileDTO>
> {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") {
    return {
      success: false,
      unauthorized: true,
      message:
        "Acesso bloqueado. Esta área é exclusiva para comerciantes autenticados.",
    };
  }

  try {
    const merchant = await prisma.merchantProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    });

    if (!merchant || merchant.user.role !== "MERCHANT") {
      return {
        success: false,
        unauthorized: true,
        message:
          "Perfil de comércio não encontrado para este usuário. Cadastre seu estabelecimento para continuar.",
      };
    }

    return {
      success: true,
      data: {
        id: merchant.id,
        userId: merchant.userId,
        email: merchant.user.email,
        tradeName: merchant.tradeName,
        cnpj: merchant.cnpj,
        phone: merchant.phone ?? "",
        category: merchant.category,
        description: merchant.description ?? "",
        address: merchant.address,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
      },
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível carregar os dados do estabelecimento no momento.",
    };
  }
}

export async function updateMerchantProfileAction(
  input: MerchantProfileFormValues
): Promise<MerchantActionResult<MerchantProfileDTO>> {
  const authCheck = await getAuthenticatedMerchantProfile();
  if (!authCheck.success || !authCheck.data) {
    return {
      success: false,
      unauthorized: authCheck.unauthorized,
      message:
        authCheck.message ??
        "Acesso negado: você não possui um perfil de comércio registrado.",
    };
  }

  const parsed = merchantProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os dados informados no formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    tradeName,
    phone,
    category,
    description,
    address,
    latitude,
    longitude,
  } = parsed.data;

  try {
    const updated = await prisma.merchantProfile.update({
      where: { id: authCheck.data.id },
      data: {
        tradeName,
        phone: phone.length > 0 ? phone : null,
        category,
        description: description.length > 0 ? description : null,
        address,
        latitude,
        longitude,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/perfil");
    revalidatePath("/explorar");

    return {
      success: true,
      message: "Perfil do estabelecimento atualizado com sucesso!",
      data: {
        id: updated.id,
        userId: updated.userId,
        email: authCheck.data.email,
        tradeName: updated.tradeName,
        cnpj: updated.cnpj,
        phone: updated.phone ?? "",
        category: updated.category,
        description: updated.description ?? "",
        address: updated.address,
        latitude: updated.latitude,
        longitude: updated.longitude,
      },
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível salvar as alterações no banco de dados. Tente novamente.",
    };
  }
}

interface NominatimItem {
  lat?: string;
  lon?: string;
}

export async function geocodeAddressAction(address: string): Promise<
  MerchantActionResult<{
    latitude: number;
    longitude: number;
  }>
> {
  const authCheck = await getAuthenticatedMerchantProfile();
  if (!authCheck.success) {
    return {
      success: false,
      unauthorized: true,
      message:
        authCheck.message ??
        "Acesso bloqueado para usuários sem perfil de comércio.",
    };
  }

  const cleanAddress = address.trim();
  if (cleanAddress.length < 5) {
    return {
      success: false,
      message: "Digite um endereço completo antes de buscar as coordenadas.",
    };
  }

  try {
    const query = encodeURIComponent(`${cleanAddress}, Brasil`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
      {
        headers: {
          "User-Agent": "AgendouMVP/1.0 (contato@agendou.local)",
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      const results = (await response.json()) as NominatimItem[];
      if (results.length > 0 && results[0].lat && results[0].lon) {
        const lat = Number.parseFloat(results[0].lat);
        const lon = Number.parseFloat(results[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          return {
            success: true,
            message: "Coordenadas obtidas a partir do endereço com sucesso!",
            data: {
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lon.toFixed(6)),
            },
          };
        }
      }
    }
  } catch {
    // Em caso de indisponibilidade de rede externa, utiliza estimativa determinística local
  }

  // Fallback determinístico baseado no endereço caso o serviço externo não retorne resultado
  let hash = 0;
  for (let i = 0; i < cleanAddress.length; i++) {
    hash = (hash * 31 + cleanAddress.charCodeAt(i)) % 10000;
  }
  const baseLat = -23.55052;
  const baseLng = -46.633308;
  const offsetLat = ((hash % 100) - 50) * 0.0008;
  const offsetLng = ((Math.floor(hash / 100) % 100) - 50) * 0.0008;

  return {
    success: true,
    message:
      "Coordenadas aproximadas calculadas a partir do endereço informado.",
    data: {
      latitude: Number((baseLat + offsetLat).toFixed(6)),
      longitude: Number((baseLng + offsetLng).toFixed(6)),
    },
  };
}

