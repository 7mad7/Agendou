import type { NextRequest } from "next/server";
import { registerMerchantAction } from "@/actions/auth";
import type { MerchantRegisterFormValues } from "@/lib/validations/auth";
import {
  fromActionResult,
  invalidBodyResponse,
  readJsonBody,
} from "@/lib/api/http";

/** RF01 — Cadastro de conta de comércio (CNPJ validado e único). */
export async function POST(request: NextRequest) {
  const body = await readJsonBody<MerchantRegisterFormValues>(request);
  if (!body) {
    return invalidBodyResponse();
  }
  const result = await registerMerchantAction(body);
  return fromActionResult(result, 201);
}
