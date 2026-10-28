import { z } from "zod";

export const merchantProfileSchema = z.object({
  tradeName: z
    .string()
    .trim()
    .min(2, "O nome fantasia deve ter pelo menos 2 caracteres")
    .max(120, "Nome fantasia muito longo"),
  phone: z
    .string()
    .trim()
    .max(20, "Telefone muito longo")
    .refine(
      (val) => val.length === 0 || val.replace(/\D/g, "").length >= 10,
      "Informe um telefone comercial válido com DDD"
    ),
  category: z
    .string()
    .trim()
    .min(1, "Selecione a categoria do estabelecimento"),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
  address: z
    .string()
    .trim()
    .min(5, "Informe o endereço completo do espaço")
    .max(200, "Endereço muito longo"),
  latitude: z
    .number({ invalid_type_error: "Latitude inválida" })
    .min(-90, "Latitude deve estar entre -90 e 90")
    .max(90, "Latitude deve estar entre -90 e 90")
    .nullable(),
  longitude: z
    .number({ invalid_type_error: "Longitude inválida" })
    .min(-180, "Longitude deve estar entre -180 e 180")
    .max(180, "Longitude deve estar entre -180 e 180")
    .nullable(),
});

export type MerchantProfileFormValues = z.infer<typeof merchantProfileSchema>;

export const serviceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "O título do serviço deve ter pelo menos 2 caracteres")
    .max(100, "Título muito longo"),
  description: z
    .string()
    .trim()
    .max(300, "A descrição deve ter no máximo 300 caracteres"),
  price: z
    .number({
      required_error: "Informe o preço em Reais (R$)",
      invalid_type_error: "Informe um valor numérico válido",
    })
    .positive("O preço deve ser maior que R$ 0,00")
    .max(99999.99, "Valor máximo excedido"),
  durationMinutes: z
    .number({
      required_error: "Informe a duração em minutos",
      invalid_type_error: "Informe a duração em minutos",
    })
    .int("A duração deve ser um número inteiro de minutos")
    .min(5, "A duração mínima é de 5 minutos")
    .max(480, "A duração máxima é de 480 minutos (8h)"),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

