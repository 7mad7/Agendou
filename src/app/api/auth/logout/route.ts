import { logoutAction } from "@/actions/auth";
import { fromActionResult } from "@/lib/api/http";

/** RF02 — Encerra a sessão removendo o cookie. */
export async function POST() {
  const result = await logoutAction();
  return fromActionResult(result);
}
