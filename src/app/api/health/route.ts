import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api/http";

/** Verificação de saúde usada pela CI antes dos testes de API e E2E. */
export async function GET() {
  await connection();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: "ok", database: "up" });
  } catch {
    return json({ status: "degraded", database: "down" }, 503);
  }
}
