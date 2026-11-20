import { connection, type NextRequest } from "next/server";
import {
  getAvailableSlotsForBookingAction,
  getMerchantPublicDetailsAction,
} from "@/actions/booking";
import { json } from "@/lib/api/http";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * RF04/RF05 — Horários livres de um comércio em uma data.
 * Query: date=AAAA-MM-DD e durationMinutes (ou serviceId, de onde a duração é lida).
 */
export async function GET(request: NextRequest, context: RouteContext) {
  await connection();
  const { id } = await context.params;
  const params = request.nextUrl.searchParams;

  const date = params.get("date") ?? "";
  let durationMinutes = Number(params.get("durationMinutes"));
  const serviceId = params.get("serviceId");

  if ((!Number.isFinite(durationMinutes) || durationMinutes <= 0) && serviceId) {
    const merchant = await getMerchantPublicDetailsAction(id);
    const service = merchant?.services.find((item) => item.id === serviceId);
    durationMinutes = service?.durationMinutes ?? Number.NaN;
  }

  const result = await getAvailableSlotsForBookingAction({
    merchantId: id,
    date,
    durationMinutes,
  });

  if (!result.success) {
    return json(result, 422);
  }
  return json(result);
}
