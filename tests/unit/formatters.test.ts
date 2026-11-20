import { describe, expect, it } from "vitest";
import {
  formatCurrencyBRL,
  formatDurationMinutes,
  formatPhoneBR,
} from "@/lib/formatters";

// O Intl usa espaço não separável entre "R$" e o valor
const normalizeSpaces = (value: string) => value.replace(/\s/g, " ");

describe("Formatação de exibição (RNF03)", () => {
  it("formata valores em Reais", () => {
    expect(normalizeSpaces(formatCurrencyBRL(40))).toBe("R$ 40,00");
    expect(normalizeSpaces(formatCurrencyBRL("65.5"))).toBe("R$ 65,50");
  });

  it("formata a duração em minutos e horas", () => {
    expect(formatDurationMinutes(30)).toBe("30 min");
    expect(formatDurationMinutes(60)).toBe("1h (60 min)");
    expect(formatDurationMinutes(90)).toBe("1h 30min (90 min)");
  });

  it("formata telefone com DDD", () => {
    expect(formatPhoneBR("11998765432")).toBe("(11) 99876-5432");
  });
});
