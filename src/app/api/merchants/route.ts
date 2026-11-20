import { connection, type NextRequest } from "next/server";
import { searchMerchantsAction } from "@/actions/discovery";
import { json } from "@/lib/api/http";

function toNumberOrNull(value: string | null): number | null {
  if (value === null || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * RF06 — Busca pública de comércios por nome (q), categoria e ordenação
 * (proximity | rating | alphabetical). Sem lat/lng, "proximity" cai para "rating".
 */
export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;

  const result = await searchMerchantsAction({
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    order: params.get("order") ?? undefined,
    lat: toNumberOrNull(params.get("lat")),
    lng: toNumberOrNull(params.get("lng")),
  });

  return json({ success: true, data: result });
}
