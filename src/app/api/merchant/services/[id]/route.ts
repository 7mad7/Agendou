import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteServiceAction, updateServiceAction } from "@/actions/services";
import type { ServiceFormValues } from "@/lib/validations/merchant";
import {
  errorResponse,
  fromActionResult,
  invalidBodyResponse,
  readJsonBody,
  requireSession,
} from "@/lib/api/http";

type RouteContext = { params: Promise<{ id: string }> };

/** Garante que o serviço existe, está ativo e pertence ao comerciante da sessão. */
async function ownsActiveService(serviceId: string, userId: string) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, merchant: { userId } },
    select: { id: true },
  });
  return service !== null;
}

/** RF03 — Edita um serviço do catálogo. */
export async function PUT(request: NextRequest, context: RouteContext) {
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }

  const { id } = await context.params;
  if (!(await ownsActiveService(id, check.session.userId))) {
    return errorResponse(404, "Serviço não encontrado no seu catálogo.");
  }

  const body = await readJsonBody<Partial<ServiceFormValues>>(request);
  if (!body) {
    return invalidBodyResponse();
  }

  const result = await updateServiceAction(id, {
    description: "",
    ...body,
  } as ServiceFormValues);
  return fromActionResult(result);
}

/** RF03 / RN06 — Remove o serviço do catálogo ativo (exclusão lógica). */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const check = await requireSession("MERCHANT");
  if (!check.ok) {
    return check.response;
  }

  const { id } = await context.params;
  if (!(await ownsActiveService(id, check.session.userId))) {
    return errorResponse(404, "Serviço não encontrado no seu catálogo.");
  }

  const result = await deleteServiceAction(id);
  return fromActionResult(result);
}
