import { connection } from "next/server";
import { getSession } from "@/lib/session";
import { errorResponse, json } from "@/lib/api/http";

/** RF02 — Retorna o usuário da sessão atual (ou 401). */
export async function GET() {
  await connection();
  const session = await getSession();
  if (!session) {
    return errorResponse(401, "Nenhuma sessão ativa.");
  }

  const { userId, email, role, name, exp } = session;
  return json({
    success: true,
    data: {
      userId,
      email,
      role,
      name,
      expiresAt: new Date(exp).toISOString(),
    },
  });
}
