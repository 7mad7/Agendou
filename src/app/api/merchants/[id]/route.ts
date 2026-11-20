import { connection, type NextRequest } from "next/server";
import { getMerchantPublicDetailsAction } from "@/actions/booking";
import { errorResponse, json } from "@/lib/api/http";

type RouteContext = { params: Promise<{ id: string }> };

/** RF05 — Dados públicos do comércio e catálogo de serviços ativos. */
export async function GET(_request: NextRequest, context: RouteContext) {
  await connection();
  const { id } = await context.params;

  const merchant = await getMerchantPublicDetailsAction(id);
  if (!merchant) {
    return errorResponse(404, "Comércio não encontrado.");
  }
  return json({ success: true, data: merchant });
}
