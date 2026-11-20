import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";

/**
 * Utilitários da camada REST (RFC-001).
 * As rotas em src/app/api reaproveitam as Server Actions existentes e
 * apenas traduzem o resultado delas para códigos HTTP.
 */

export interface ActionLikeResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  unauthorized?: boolean;
  requiresAuth?: boolean;
  conflict?: boolean;
}

export function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

export function errorResponse(
  status: number,
  message: string,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

/**
 * Converte o resultado de uma Server Action em resposta HTTP:
 * 200/201 sucesso · 401 sem sessão · 403 sem permissão ·
 * 409 conflito de horário · 422 dados inválidos · 400 demais falhas.
 */
export function fromActionResult(
  result: ActionLikeResult,
  successStatus = 200
): NextResponse {
  if (result.success) {
    return json(result, successStatus);
  }
  if (result.requiresAuth) {
    return json(result, 401);
  }
  if (result.conflict) {
    return json(result, 409);
  }
  if (result.unauthorized) {
    return json(result, 403);
  }
  if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
    return json(result, 422);
  }
  return json(result, 400);
}

/** Lê o corpo JSON da requisição; devolve null se o corpo for inválido. */
export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const body = (await request.json()) as unknown;
    if (body === null || typeof body !== "object") {
      return null;
    }
    return body as T;
  } catch {
    return null;
  }
}

export function invalidBodyResponse(): NextResponse {
  return errorResponse(400, "Corpo da requisição ausente ou em JSON inválido.");
}

type SessionCheck =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

/** Exige sessão válida (RF02). Opcionalmente exige um papel específico. */
export async function requireSession(
  role?: SessionPayload["role"]
): Promise<SessionCheck> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: errorResponse(401, "Autenticação necessária."),
    };
  }
  if (role && session.role !== role) {
    return {
      ok: false,
      response: errorResponse(
        403,
        "Acesso negado: recurso exclusivo para outro perfil de usuário."
      ),
    };
  }
  return { ok: true, session };
}
