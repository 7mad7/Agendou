import { connection, type NextRequest } from "next/server";
import {
  getAuthenticatedMerchantProfile,
  updateMerchantProfileAction,
} from "@/actions/merchant";
import type { MerchantProfileFormValues } from "@/lib/validations/merchant";
import {
  fromActionResult,
  invalidBodyResponse,
  readJsonBody,
  requireSession,
} from "@/lib/api/http";

/** RF03 — Consulta o perfil do comércio autenticado. */
export async function GET() {
  await connection();
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }
  const result = await getAuthenticatedMerchantProfile();
  return fromActionResult(result);
}

/** RF03 — Atualiza nome, telefone, categoria, descrição, endereço e coordenadas. */
export async function PUT(request: NextRequest) {
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }

  const body = await readJsonBody<Partial<MerchantProfileFormValues>>(request);
  if (!body) {
    return invalidBodyResponse();
  }

  const input = {
    phone: "",
    description: "",
    latitude: null,
    longitude: null,
    ...body,
  } as MerchantProfileFormValues;

  const result = await updateMerchantProfileAction(input);
  return fromActionResult(result);
}
