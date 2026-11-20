import { connection, type NextRequest } from "next/server";
import {
  getMerchantAvailabilityAction,
  saveMerchantAvailabilityAction,
} from "@/actions/availability";
import type { WeeklyAvailabilityFormValues } from "@/lib/validations/availability";
import {
  fromActionResult,
  invalidBodyResponse,
  json,
  readJsonBody,
  requireSession,
} from "@/lib/api/http";

/** RF04 — Consulta a grade semanal de atendimento do comércio autenticado. */
export async function GET() {
  await connection();
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }
  const result = await getMerchantAvailabilityAction();
  return fromActionResult(result);
}

/** RF04 — Salva a grade semanal (7 dias: abertura, fechamento e pausa). */
export async function PUT(request: NextRequest) {
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }

  const body = await readJsonBody<WeeklyAvailabilityFormValues>(request);
  if (!body) {
    return invalidBodyResponse();
  }

  const result = await saveMerchantAvailabilityAction(body);
  // Erros de validação da grade (RN05) retornam 422
  if (!result.success && !result.unauthorized) {
    return json(result, 422);
  }
  return fromActionResult(result);
}
