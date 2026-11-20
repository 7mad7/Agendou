import { connection, type NextRequest } from "next/server";
import {
  createServiceAction,
  getMerchantServicesAction,
} from "@/actions/services";
import type { ServiceFormValues } from "@/lib/validations/merchant";
import {
  fromActionResult,
  invalidBodyResponse,
  readJsonBody,
  requireSession,
} from "@/lib/api/http";

/** RF03 — Lista os serviços ativos do comércio autenticado. */
export async function GET() {
  await connection();
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }
  const result = await getMerchantServicesAction();
  return fromActionResult(result);
}

/** RF03 — Cadastra um serviço (título, descrição, preço em R$ e duração em minutos). */
export async function POST(request: NextRequest) {
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }

  const body = await readJsonBody<Partial<ServiceFormValues>>(request);
  if (!body) {
    return invalidBodyResponse();
  }

  const result = await createServiceAction({
    description: "",
    ...body,
  } as ServiceFormValues);
  return fromActionResult(result, 201);
}
