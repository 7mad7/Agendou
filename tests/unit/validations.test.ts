import { describe, expect, it } from "vitest";
import {
  clientRegisterSchema,
  formatCnpj,
  isValidCnpj,
  loginSchema,
  merchantRegisterSchema,
} from "@/lib/validations/auth";
import {
  dayAvailabilitySchema,
  minutesToTime,
  timeToMinutes,
} from "@/lib/validations/availability";
import { serviceSchema } from "@/lib/validations/merchant";

const validClient = {
  name: "Maria Teste",
  age: 25,
  gender: "FEMININO",
  email: "maria@teste.com",
  password: "Senha1234",
};

const validMerchant = {
  tradeName: "Barbearia Teste",
  email: "contato@barbearia.com",
  cnpj: "11.222.333/0001-81",
  category: "barbearia",
  address: "Rua das Flores, 100",
  password: "Senha1234",
};

const validDay = {
  dayOfWeek: 1,
  isActive: true,
  openTime: "09:00",
  closeTime: "18:00",
  hasBreak: true,
  breakStart: "12:00",
  breakEnd: "13:00",
};

describe("CNPJ (RN01)", () => {
  it("aceita CNPJ com dígitos verificadores corretos, com ou sem máscara", () => {
    expect(isValidCnpj("11222333000181")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("rejeita dígito verificador errado, tamanho errado e dígitos repetidos", () => {
    expect(isValidCnpj("11222333000182")).toBe(false);
    expect(isValidCnpj("1122233300018")).toBe(false);
    expect(isValidCnpj("00000000000000")).toBe(false);
  });

  it("formata o CNPJ com a máscara padrão", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });
});

describe("Cadastro e login (RF01, RF02)", () => {
  it("aceita um cadastro de cliente válido", () => {
    expect(clientRegisterSchema.safeParse(validClient).success).toBe(true);
  });

  it("exige idade mínima de 14 anos", () => {
    expect(
      clientRegisterSchema.safeParse({ ...validClient, age: 13 }).success
    ).toBe(false);
  });

  it("exige senha com 8 caracteres, letra e número (RN08)", () => {
    for (const password of ["Ab1", "somenteletras", "12345678"]) {
      expect(
        clientRegisterSchema.safeParse({ ...validClient, password }).success
      ).toBe(false);
    }
  });

  it("rejeita comércio com CNPJ inválido", () => {
    expect(merchantRegisterSchema.safeParse(validMerchant).success).toBe(true);
    expect(
      merchantRegisterSchema.safeParse({
        ...validMerchant,
        cnpj: "11.222.333/0001-00",
      }).success
    ).toBe(false);
  });

  it("rejeita login com e-mail mal formatado", () => {
    expect(
      loginSchema.safeParse({ email: "nao-e-email", password: "x" }).success
    ).toBe(false);
  });
});

describe("Grade de disponibilidade (RN05)", () => {
  it("aceita um dia válido com pausa", () => {
    expect(dayAvailabilitySchema.safeParse(validDay).success).toBe(true);
  });

  it("exige fechamento depois da abertura", () => {
    expect(
      dayAvailabilitySchema.safeParse({ ...validDay, closeTime: "08:00" })
        .success
    ).toBe(false);
  });

  it("exige pausa dentro do expediente", () => {
    expect(
      dayAvailabilitySchema.safeParse({
        ...validDay,
        breakStart: "17:30",
        breakEnd: "19:00",
      }).success
    ).toBe(false);
  });

  it("ignora horários de dias inativos", () => {
    expect(
      dayAvailabilitySchema.safeParse({
        ...validDay,
        isActive: false,
        closeTime: "08:00",
      }).success
    ).toBe(true);
  });

  it("converte horários entre texto e minutos", () => {
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("25:00")).toBe(-1);
    expect(minutesToTime(570)).toBe("09:30");
  });
});

describe("Serviços (RN07)", () => {
  const validService = {
    title: "Corte",
    description: "",
    price: 40,
    durationMinutes: 30,
  };

  it("aceita um serviço válido", () => {
    expect(serviceSchema.safeParse(validService).success).toBe(true);
  });

  it("exige preço positivo e duração entre 5 e 480 minutos", () => {
    expect(serviceSchema.safeParse({ ...validService, price: 0 }).success).toBe(
      false
    );
    expect(
      serviceSchema.safeParse({ ...validService, durationMinutes: 4 }).success
    ).toBe(false);
    expect(
      serviceSchema.safeParse({ ...validService, durationMinutes: 481 }).success
    ).toBe(false);
  });
});
