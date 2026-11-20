import type { NextRequest } from "next/server";
import { createAtomicBookingAction } from "@/actions/booking";
import {
  fromActionResult,
  invalidBodyResponse,
  readJsonBody,
} from "@/lib/api/http";

interface CreateBookingBody {
  merchantId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
}

/**
 * RF05 — Reserva atômica de horário.
 * 201 confirmado · 401 sem sessão · 409 horário já reservado (RN03) · 400 dados inválidos.
 */
export async function POST(request: NextRequest) {
  const body = await readJsonBody<CreateBookingBody>(request);
  if (!body) {
    return invalidBodyResponse();
  }
  const result = await createAtomicBookingAction(body);
  return fromActionResult(result, 201);
}
