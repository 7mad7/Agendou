import { describe, expect, it, vi } from "vitest";

// O motor importa o cliente do banco; nos testes unitários ele não é usado.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { computeAvailableSlots } from "@/lib/availability-engine";

// Datas fixas no futuro para o teste não depender do dia em que roda
const NOW = new Date(2030, 0, 10, 8, 0, 0); // 10/01/2030 08:00
const FUTURE_DATE = "2030-01-11";

const weekday = (openTime: string, closeTime: string) => ({
  isActive: true,
  openTime,
  closeTime,
  breakStart: null,
  breakEnd: null,
});

describe("computeAvailableSlots (RF04)", () => {
  it("não gera horários quando o dia está inativo ou sem regra", () => {
    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: null,
        serviceDurationMinutes: 30,
        now: NOW,
      })
    ).toEqual([]);

    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: { ...weekday("09:00", "18:00"), isActive: false },
        serviceDurationMinutes: 30,
        now: NOW,
      })
    ).toEqual([]);
  });

  it("gera horários da abertura ao fechamento no passo da duração", () => {
    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: weekday("09:00", "12:00"),
        serviceDurationMinutes: 60,
        now: NOW,
      })
    ).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("não oferece horário que ultrapassa o fechamento", () => {
    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: weekday("09:00", "10:00"),
        serviceDurationMinutes: 45,
        now: NOW,
      })
    ).toEqual(["09:00"]);
  });

  it("pula o intervalo de pausa (RN05)", () => {
    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: {
          ...weekday("09:00", "14:00"),
          breakStart: "12:00",
          breakEnd: "13:00",
        },
        serviceDurationMinutes: 60,
        now: NOW,
      })
    ).toEqual(["09:00", "10:00", "11:00", "13:00"]);
  });

  it("desconta horários já reservados (RN03)", () => {
    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: weekday("09:00", "12:00"),
        serviceDurationMinutes: 60,
        occupiedIntervals: [{ startTime: "10:00", endTime: "11:00" }],
        now: NOW,
      })
    ).toEqual(["09:00", "11:00"]);
  });

  it("aceita reservas informadas como datas completas", () => {
    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: weekday("09:00", "11:00"),
        serviceDurationMinutes: 30,
        occupiedIntervals: [
          {
            startTime: new Date(2030, 0, 11, 9, 30),
            endTime: new Date(2030, 0, 11, 10, 0),
          },
        ],
        now: NOW,
      })
    ).toEqual(["09:00", "10:00", "10:30"]);
  });

  it("não gera horários para datas passadas (RN04)", () => {
    expect(
      computeAvailableSlots({
        date: "2030-01-09",
        availability: weekday("09:00", "18:00"),
        serviceDurationMinutes: 30,
        now: NOW,
      })
    ).toEqual([]);
  });

  it("no dia de hoje, só oferece horários depois do momento atual (RN04)", () => {
    expect(
      computeAvailableSlots({
        date: "2030-01-10",
        availability: weekday("09:00", "13:00"),
        serviceDurationMinutes: 60,
        now: new Date(2030, 0, 10, 10, 30),
      })
    ).toEqual(["11:00", "12:00"]);
  });

  it("rejeita duração inválida", () => {
    expect(
      computeAvailableSlots({
        date: FUTURE_DATE,
        availability: weekday("09:00", "18:00"),
        serviceDurationMinutes: 0,
        now: NOW,
      })
    ).toEqual([]);
  });
});
