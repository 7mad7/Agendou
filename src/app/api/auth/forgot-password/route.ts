import type { NextRequest } from "next/server";
import { forgotPasswordAction } from "@/actions/auth";
import type { ForgotPasswordFormValues } from "@/lib/validations/auth";
import {
  fromActionResult,
  invalidBodyResponse,
  readJsonBody,
} from "@/lib/api/http";

/**
 * RF02 — Solicitação de recuperação de senha.
 * A resposta é sempre genérica para não revelar se o e-mail existe.
 * O envio real do e-mail está fora do escopo do MVP.
 */
export async function POST(request: NextRequest) {
  const body = await readJsonBody<ForgotPasswordFormValues>(request);
  if (!body) {
    return invalidBodyResponse();
  }
  const result = await forgotPasswordAction(body);
  return fromActionResult(result);
}
