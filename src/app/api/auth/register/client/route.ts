import type { NextRequest } from "next/server";
import { registerClientAction } from "@/actions/auth";
import type { ClientRegisterFormValues } from "@/lib/validations/auth";
import {
  fromActionResult,
  invalidBodyResponse,
  readJsonBody,
} from "@/lib/api/http";

/** RF01 — Cadastro de conta de cliente. Já inicia a sessão do novo usuário. */
export async function POST(request: NextRequest) {
  const body = await readJsonBody<ClientRegisterFormValues>(request);
  if (!body) {
    return invalidBodyResponse();
  }
  const result = await registerClientAction(body);
  return fromActionResult(result, 201);
}
