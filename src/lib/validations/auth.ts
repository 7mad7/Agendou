import { z } from "zod";

export function stripCnpjDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCnpj(value: string): string {
  const digits = stripCnpjDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function isValidCnpj(rawCnpj: string): boolean {
  const cnpj = stripCnpjDigits(rawCnpj);
  if (cnpj.length !== 14) {
    return false;
  }

  // Rejeita sequências de dígitos repetidos (ex: 00000000000000)
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calcVerifier = (sliceLength: number): number => {
    const weights =
      sliceLength === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < sliceLength; i++) {
      sum += Number(cnpj[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcVerifier(12);
  const secondDigit = calcVerifier(13);

  return (
    Number(cnpj[12]) === firstDigit && Number(cnpj[13]) === secondDigit
  );
}

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número");

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail")
    .email("Informe um formato de e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail cadastrado")
    .email("Informe um formato de e-mail válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const clientRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  age: z
    .number({
      required_error: "Informe sua idade",
      invalid_type_error: "Informe uma idade válida",
    })
    .int("A idade deve ser um número inteiro")
    .min(14, "Idade mínima para cadastro é 14 anos")
    .max(120, "Informe uma idade válida"),
  gender: z
    .string()
    .trim()
    .min(1, "Selecione seu gênero"),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail")
    .email("Informe um formato de e-mail válido"),
  password: passwordSchema,
});

export type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>;

export const merchantRegisterSchema = z.object({
  tradeName: z
    .string()
    .trim()
    .min(2, "Informe o nome do comércio (mín. 2 caracteres)")
    .max(120, "Nome do comércio muito longo"),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail comercial")
    .email("Informe um formato de e-mail válido"),
  cnpj: z
    .string()
    .trim()
    .min(1, "Informe o CNPJ do estabelecimento")
    .refine(
      (val) => isValidCnpj(val),
      "CNPJ inválido. Verifique os 14 dígitos informados"
    ),
  category: z
    .string()
    .trim()
    .min(1, "Selecione a categoria de serviço"),
  address: z
    .string()
    .trim()
    .min(5, "Informe o endereço completo do comércio")
    .max(200, "Endereço muito longo"),
  password: passwordSchema,
});

export type MerchantRegisterFormValues = z.infer<typeof merchantRegisterSchema>;
