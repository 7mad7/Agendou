import type { NextRequest } from "next/server";
import { loginAction } from "@/actions/auth";
import type { LoginFormValues } from "@/lib/validations/auth";
import {
  fromActionResult,
  invalidBodyResponse,
  json,
  readJsonBody,
} from "@/lib/api/http";

type LoginBody = LoginFormValues & { callbackUrl?: string };

/** RF02 — Login por e-mail e senha; grava o cookie de sessão HTTP-only. */
export async function POST(request: NextRequest) {
  const body = await readJsonBody<LoginBody>(request);
  if (!body) {
    return invalidBodyResponse();
  }

  const { callbackUrl, ...credentials } = body;
  const result = await loginAction(credentials, callbackUrl);

  // Credenciais incorretas: 401 (dados mal formatados continuam 422)
  if (!result.success && !result.fieldErrors) {
    return json(result, 401);
  }
  return fromActionResult(result);
}
