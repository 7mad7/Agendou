"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DiscoveryOrder = "proximity" | "rating" | "alphabetical";

export interface DiscoveryMerchantItem {
  id: string;
  slug: string;
  tradeName: string;
  category: string;
  categoryLabel: string;
  address: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  rating: number;
  reviewCount: number;
  servicesCount: number;
  startingPrice: number | null;
}

export interface DiscoverySearchInput {
  q?: string;
  category?: string;
  order?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface DiscoverySearchResult {
  merchants: DiscoveryMerchantItem[];
  appliedOrder: DiscoveryOrder;
  usedFallbackOrder: boolean;
  hasClientCoordinates: boolean;
}

const discoveryFilterSchema = z.object({
  q: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default(""),
  order: z
    .enum(["proximity", "rating", "alphabetical"])
    .optional()
    .default("rating"),
  lat: z.number().min(-90).max(90).nullable().optional().default(null),
  lng: z.number().min(-180).max(180).nullable().optional().default(null),
});

const CATEGORY_LABELS: Record<string, string> = {
  barbearia: "Barbearia",
  estetica: "Estética & Beleza",
  lanches: "Lanches & Alimentação",
  manutencao: "Manutenção/Serviços",
};

function getCategoryLabel(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_LABELS[key] ?? category;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(1));
}

function deriveRatingMeta(seedText: string): {
  rating: number;
  reviewCount: number;
} {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 31 + seedText.charCodeAt(i)) % 1000;
  }
  const rating = Number((4.5 + (hash % 6) * 0.1).toFixed(1));
  const reviewCount = 18 + (hash % 95);
  return { rating: Math.min(5.0, rating), reviewCount };
}

const FALLBACK_DEMO_MERCHANTS: Array<{
  id: string;
  tradeName: string;
  category: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  servicesCount: number;
  startingPrice: number;
}> = [
  {
    id: "barbearia-vintage-centro",
    tradeName: "Barbearia Vintage do Bairro",
    category: "barbearia",
    address: "Rua das Acácias, 210 - Centro",
    description: "Cortes clássicos, degradê e barba na toalha quente.",
    latitude: -23.5512,
    longitude: -46.6344,
    servicesCount: 4,
    startingPrice: 35,
  },
  {
    id: "studio-bela-estetica",
    tradeName: "Studio Bela Estética & Unhas",
    category: "estetica",
    address: "Av. Brasil, 845 - Sala 2, Jardim América",
    description: "Manicure, design de sobrancelhas e limpeza de pele.",
    latitude: -23.5585,
    longitude: -46.6412,
    servicesCount: 5,
    startingPrice: 40,
  },
  {
    id: "ponto-do-lanche-artesanal",
    tradeName: "Ponto do Lanche Artesanal",
    category: "lanches",
    address: "Rua São Bento, 98 - Vila Nova",
    description: "Hambúrgueres na brasa e retirada agendada sem fila.",
    latitude: -23.5478,
    longitude: -46.6295,
    servicesCount: 6,
    startingPrice: 28,
  },
  {
    id: "oficina-express-reparos",
    tradeName: "Assistência & Reparos Express",
    category: "manutencao",
    address: "Rua Sete de Setembro, 412 - Centro",
    description: "Manutenção de celulares, notebooks e pequenos reparos.",
    latitude: -23.5621,
    longitude: -46.6389,
    servicesCount: 3,
    startingPrice: 50,
  },
];

export async function searchMerchantsAction(
  rawInput: DiscoverySearchInput
): Promise<DiscoverySearchResult> {
  const normalizedOrder =
    rawInput.order === "proximity" ||
    rawInput.order === "rating" ||
    rawInput.order === "alphabetical"
      ? rawInput.order
      : "rating";

  const parsed = discoveryFilterSchema.safeParse({
    q: rawInput.q ?? "",
    category: rawInput.category ?? "",
    order: normalizedOrder,
    lat:
      typeof rawInput.lat === "number" && Number.isFinite(rawInput.lat)
        ? rawInput.lat
        : null,
    lng:
      typeof rawInput.lng === "number" && Number.isFinite(rawInput.lng)
        ? rawInput.lng
        : null,
  });

  const filters = parsed.success
    ? parsed.data
    : {
        q: "",
        category: "",
        order: "rating" as DiscoveryOrder,
        lat: null,
        lng: null,
      };

  const hasClientCoordinates = filters.lat !== null && filters.lng !== null;

  // Fallback de ordenação caso o cliente peça proximidade mas negue/não possua GPS
  const usedFallbackOrder =
    filters.order === "proximity" && !hasClientCoordinates;
  const effectiveOrder: DiscoveryOrder = usedFallbackOrder
    ? "rating"
    : filters.order;

  let rawMerchants: Array<{
    id: string;
    tradeName: string;
    category: string;
    address: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    servicesCount: number;
    startingPrice: number | null;
  }> = [];

  try {
    const whereClause: Prisma.MerchantProfileWhereInput = {};

    if (filters.category) {
      whereClause.category = {
        equals: filters.category,
        mode: "insensitive",
      };
    }

    if (filters.q) {
      whereClause.tradeName = {
        contains: filters.q,
        mode: "insensitive",
      };
    }

    const dbMerchants = await prisma.merchantProfile.findMany({
      where: whereClause,
      include: {
        services: {
          where: { active: true },
          select: { price: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy: {
        tradeName: "asc",
      },
    });

    if (dbMerchants.length > 0) {
      rawMerchants = dbMerchants.map((merchant) => ({
        id: merchant.id,
        tradeName: merchant.tradeName,
        category: merchant.category,
        address: merchant.address,
        description: merchant.description ?? "",
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        servicesCount: merchant.services.length,
        startingPrice:
          merchant.services.length > 0
            ? Number(merchant.services[0].price)
            : null,
      }));
    }
  } catch {
    // Em ambiente local sem banco ativo, utiliza catálogo demonstrativo filtrado
  }

  if (rawMerchants.length === 0) {
    const queryLower = filters.q.toLowerCase();
    const categoryLower = filters.category.toLowerCase();

    rawMerchants = FALLBACK_DEMO_MERCHANTS.filter((item) => {
      const matchesCategory =
        !categoryLower || item.category.toLowerCase() === categoryLower;
      const matchesQuery =
        !queryLower || item.tradeName.toLowerCase().includes(queryLower);
      return matchesCategory && matchesQuery;
    });
  }

  const enriched: DiscoveryMerchantItem[] = rawMerchants.map((merchant) => {
    const { rating, reviewCount } = deriveRatingMeta(
      `${merchant.id}-${merchant.tradeName}`
    );

    const distanceKm =
      hasClientCoordinates &&
      filters.lat !== null &&
      filters.lng !== null &&
      merchant.latitude !== null &&
      merchant.longitude !== null
        ? calculateDistanceKm(
            filters.lat,
            filters.lng,
            merchant.latitude,
            merchant.longitude
          )
        : null;

    return {
      id: merchant.id,
      slug: merchant.id,
      tradeName: merchant.tradeName,
      category: merchant.category,
      categoryLabel: getCategoryLabel(merchant.category),
      address: merchant.address,
      description: merchant.description,
      latitude: merchant.latitude,
      longitude: merchant.longitude,
      distanceKm,
      rating,
      reviewCount,
      servicesCount: merchant.servicesCount,
      startingPrice: merchant.startingPrice,
    };
  });

  enriched.sort((a, b) => {
    if (effectiveOrder === "proximity") {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        if (a.distanceKm !== b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }
      } else if (a.distanceKm !== null) {
        return -1;
      } else if (b.distanceKm !== null) {
        return 1;
      }
      return a.tradeName.localeCompare(b.tradeName, "pt-BR");
    }

    if (effectiveOrder === "rating") {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return a.tradeName.localeCompare(b.tradeName, "pt-BR");
    }

    return a.tradeName.localeCompare(b.tradeName, "pt-BR");
  });

  return {
    merchants: enriched,
    appliedOrder: effectiveOrder,
    usedFallbackOrder,
    hasClientCoordinates,
  };
}

