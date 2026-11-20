import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability-engine";

/**
 * Testes de integração: motor de agenda + PostgreSQL real.
 * Rodam quando DATABASE_URL está definida (na CI e no banco de testes local).
 */
const hasDatabase = Boolean(process.env.DATABASE_URL);

const RUN = `it${Date.now()}`;
const CNPJ = `9${Date.now()}`.slice(0, 14);
const TARGET_DATE = "2030-01-15";
const [year, month, day] = TARGET_DATE.split("-").map(Number);
const TARGET_DOW = new Date(year, month - 1, day).getDay();
const NOW = new Date(2030, 0, 10, 8, 0, 0);
const at = (hour: number) => new Date(year, month - 1, day, hour, 0, 0);

describe.skipIf(!hasDatabase)("Integração: agenda e regras no banco", () => {
  let merchantUserId = "";
  let clientUserId = "";
  let merchantId = "";
  let clientId = "";
  let serviceId = "";

  beforeAll(async () => {
    const merchantUser = await prisma.user.create({
      data: {
        email: `${RUN}-comercio@teste.com`,
        passwordHash: "salt:hash",
        role: "MERCHANT",
        merchantProfile: {
          create: {
            tradeName: `Comércio ${RUN}`,
            cnpj: CNPJ,
            category: "barbearia",
            address: "Rua de Teste, 100",
          },
        },
      },
      include: { merchantProfile: true },
    });
    merchantUserId = merchantUser.id;
    merchantId = merchantUser.merchantProfile!.id;

    const clientUser = await prisma.user.create({
      data: {
        email: `${RUN}-cliente@teste.com`,
        passwordHash: "salt:hash",
        role: "CLIENT",
        clientProfile: {
          create: { name: "Cliente Teste", age: 30, gender: "OUTRO" },
        },
      },
      include: { clientProfile: true },
    });
    clientUserId = clientUser.id;
    clientId = clientUser.clientProfile!.id;

    const service = await prisma.service.create({
      data: {
        merchantId,
        title: "Corte",
        price: 40,
        durationMinutes: 60,
      },
    });
    serviceId = service.id;

    await prisma.merchantAvailability.create({
      data: {
        merchantId,
        dayOfWeek: TARGET_DOW,
        isActive: true,
        openTime: "09:00",
        closeTime: "12:00",
      },
    });

    await prisma.booking.create({
      data: {
        clientId,
        merchantId,
        serviceId,
        startTime: at(10),
        endTime: at(11),
        status: "CONFIRMED",
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { merchantId } });
    await prisma.user.deleteMany({
      where: { id: { in: [merchantUserId, clientUserId] } },
    });
    await prisma.$disconnect();
  });

  it("desconta do dia os horários já reservados (RF04, RN03)", async () => {
    const slots = await getAvailableSlots(TARGET_DATE, merchantId, 60, NOW);
    expect(slots).toEqual(["09:00", "11:00"]);
  });

  it("um agendamento cancelado não bloqueia o horário na agenda", async () => {
    await prisma.booking.create({
      data: {
        clientId,
        merchantId,
        serviceId,
        startTime: at(11),
        endTime: at(12),
        status: "CANCELED",
      },
    });
    const slots = await getAvailableSlots(TARGET_DATE, merchantId, 60, NOW);
    expect(slots).toEqual(["09:00", "11:00"]);
  });

  it("o banco recusa dois agendamentos no mesmo horário de início (RN03)", async () => {
    await expect(
      prisma.booking.create({
        data: {
          clientId,
          merchantId,
          serviceId,
          startTime: at(10),
          endTime: at(11),
        },
      })
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("o banco recusa CNPJ já cadastrado (RN01)", async () => {
    await expect(
      prisma.user.create({
        data: {
          email: `${RUN}-outro@teste.com`,
          passwordHash: "salt:hash",
          role: "MERCHANT",
          merchantProfile: {
            create: {
              tradeName: "Outro comércio",
              cnpj: CNPJ,
              category: "barbearia",
              address: "Rua de Teste, 200",
            },
          },
        },
      })
    ).rejects.toMatchObject({ code: "P2002" });

    const orphan = await prisma.user.findUnique({
      where: { email: `${RUN}-outro@teste.com` },
    });
    expect(orphan).toBeNull();
  });

  it("serviço com agendamentos não pode ser apagado fisicamente (RN06)", async () => {
    await expect(
      prisma.service.delete({ where: { id: serviceId } })
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });
});
