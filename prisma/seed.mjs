import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function main() {
  const defaultPasswordHash = hashPassword("Teste1234");

  // 1. Usuário e Perfil de Cliente para testes
  const clientUser = await prisma.user.upsert({
    where: { email: "cliente@teste.com" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "cliente@teste.com",
      passwordHash: defaultPasswordHash,
      role: "CLIENT",
      clientProfile: {
        create: {
          name: "Lucas Ferreira (Cliente Teste)",
          age: 28,
          gender: "MASCULINO",
        },
      },
    },
    include: { clientProfile: true },
  });

  // 2. Comércio 1: Barbearia Vintage do Bairro
  const barberUser = await prisma.user.upsert({
    where: { email: "barbearia@teste.com" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "barbearia@teste.com",
      passwordHash: defaultPasswordHash,
      role: "MERCHANT",
    },
  });

  const barberMerchant = await prisma.merchantProfile.upsert({
    where: { userId: barberUser.id },
    update: {
      tradeName: "Barbearia Vintage do Bairro",
      phone: "(11) 99876-5432",
      category: "barbearia",
      description:
        "Cortes clássicos, degradê na navalha e barba na toalha quente.",
      address: "Rua das Acácias, 210 - Centro",
      latitude: -23.5512,
      longitude: -46.6344,
    },
    create: {
      userId: barberUser.id,
      tradeName: "Barbearia Vintage do Bairro",
      cnpj: "11222333000181",
      phone: "(11) 99876-5432",
      category: "barbearia",
      description:
        "Cortes clássicos, degradê na navalha e barba na toalha quente.",
      address: "Rua das Acácias, 210 - Centro",
      latitude: -23.5512,
      longitude: -46.6344,
    },
  });

  // 3. Comércio 2: Studio Bela Estética & Unhas
  const beautyUser = await prisma.user.upsert({
    where: { email: "estetica@teste.com" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "estetica@teste.com",
      passwordHash: defaultPasswordHash,
      role: "MERCHANT",
    },
  });

  const beautyMerchant = await prisma.merchantProfile.upsert({
    where: { userId: beautyUser.id },
    update: {
      tradeName: "Studio Bela Estética & Unhas",
      phone: "(11) 99765-4321",
      category: "estetica",
      description:
        "Especialistas em esmaltação em gel, manicure e design de sobrancelhas.",
      address: "Av. Brasil, 845 - Sala 2, Jardim América",
      latitude: -23.5585,
      longitude: -46.6412,
    },
    create: {
      userId: beautyUser.id,
      tradeName: "Studio Bela Estética & Unhas",
      cnpj: "19131243000197",
      phone: "(11) 99765-4321",
      category: "estetica",
      description:
        "Especialistas em esmaltação em gel, manicure e design de sobrancelhas.",
      address: "Av. Brasil, 845 - Sala 2, Jardim América",
      latitude: -23.5585,
      longitude: -46.6412,
    },
  });

  // 4. Serviços de teste para os comércios
  await prisma.service.deleteMany({
    where: { merchantId: { in: [barberMerchant.id, beautyMerchant.id] } },
  });

  await prisma.service.createMany({
    data: [
      {
        merchantId: barberMerchant.id,
        title: "Corte Degradê / Social",
        description: "Corte personalizado com lavagem e finalização.",
        price: 40.0,
        durationMinutes: 30,
        active: true,
      },
      {
        merchantId: barberMerchant.id,
        title: "Barba na Toalha Quente",
        description: "Alinhamento na navalha e hidratação com óleo essencial.",
        price: 35.0,
        durationMinutes: 30,
        active: true,
      },
      {
        merchantId: barberMerchant.id,
        title: "Combo Corte + Barba",
        description: "Atendimento completo com bebida cortesia.",
        price: 65.0,
        durationMinutes: 60,
        active: true,
      },
      {
        merchantId: beautyMerchant.id,
        title: "Pé e Mão Tradicional",
        description: "Cutilagem, hidratação e esmaltação completa.",
        price: 55.0,
        durationMinutes: 60,
        active: true,
      },
      {
        merchantId: beautyMerchant.id,
        title: "Design de Sobrancelhas",
        description: "Modelagem com linha e aplicação opcional de henna.",
        price: 40.0,
        durationMinutes: 30,
        active: true,
      },
    ],
  });

  // 5. Grade semanal de disponibilidade (Segunda a Domingo)
  for (const merchant of [barberMerchant, beautyMerchant]) {
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      const isActive = dayOfWeek !== 0;
      const closeTime = dayOfWeek === 6 ? "14:00" : "18:00";
      const hasBreak = dayOfWeek !== 0 && dayOfWeek !== 6;

      await prisma.merchantAvailability.upsert({
        where: {
          merchantId_dayOfWeek: {
            merchantId: merchant.id,
            dayOfWeek,
          },
        },
        update: {
          isActive,
          openTime: "09:00",
          closeTime,
          breakStart: hasBreak ? "12:00" : null,
          breakEnd: hasBreak ? "13:00" : null,
        },
        create: {
          merchantId: merchant.id,
          dayOfWeek,
          isActive,
          openTime: "09:00",
          closeTime,
          breakStart: hasBreak ? "12:00" : null,
          breakEnd: hasBreak ? "13:00" : null,
        },
      });
    }
  }

  console.log("Seed de testes concluído com sucesso:", {
    clientEmail: clientUser.email,
    merchants: [barberMerchant.tradeName, beautyMerchant.tradeName],
  });
}

main()
  .catch((err) => {
    console.error("Erro ao executar seed de testes:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

