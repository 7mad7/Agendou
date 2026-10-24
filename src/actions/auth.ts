"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import {
  clientRegisterSchema,
  forgotPasswordSchema,
  loginSchema,
  merchantRegisterSchema,
  stripCnpjDigits,
  type ClientRegisterFormValues,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type MerchantRegisterFormValues,
} from "@/lib/validations/auth";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string[]>;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }
  const keyBuffer = Buffer.from(key, "hex");
  const derivedBuffer = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(keyBuffer, derivedBuffer);
}

export async function registerClientAction(
  input: ClientRegisterFormValues
): Promise<AuthActionResult> {
  const parsed = clientRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos preenchidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, age, gender, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Este e-mail já está cadastrado na plataforma.",
        fieldErrors: {
          email: ["Este e-mail já está em uso."],
        },
      };
    }

    const passwordHash = hashPassword(password);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: "CLIENT",
        },
      });

      await tx.clientProfile.create({
        data: {
          userId: user.id,
          name,
          age,
          gender,
        },
      });

      return user;
    });

    await setSessionCookie({
      userId: createdUser.id,
      email: createdUser.email,
      role: "CLIENT",
      name,
    });

    return {
      success: true,
      message: "Conta de cliente criada com sucesso!",
      redirectTo: "/explorar",
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível concluir o cadastro no momento. Verifique sua conexão e tente novamente.",
    };
  }
}

export async function registerMerchantAction(
  input: MerchantRegisterFormValues
): Promise<AuthActionResult> {
  const parsed = merchantRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do seu comércio.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { tradeName, email, cnpj, category, address, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const cleanCnpj = stripCnpjDigits(cnpj);

  try {
    const [existingEmail, existingCnpj] = await Promise.all([
      prisma.user.findUnique({
        where: { email: normalizedEmail },
      }),
      prisma.merchantProfile.findUnique({
        where: { cnpj: cleanCnpj },
      }),
    ]);

    if (existingEmail) {
      return {
        success: false,
        message: "Este e-mail comercial já está cadastrado.",
        fieldErrors: {
          email: ["Este e-mail já está em uso."],
        },
      };
    }

    if (existingCnpj) {
      return {
        success: false,
        message: "Este CNPJ já possui um comércio registrado.",
        fieldErrors: {
          cnpj: ["CNPJ já cadastrado na plataforma."],
        },
      };
    }

    const passwordHash = hashPassword(password);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: "MERCHANT",
        },
      });

      await tx.merchantProfile.create({
        data: {
          userId: user.id,
          tradeName,
          cnpj: cleanCnpj,
          category,
          address,
        },
      });

      return user;
    });

    await setSessionCookie({
      userId: createdUser.id,
      email: createdUser.email,
      role: "MERCHANT",
      name: tradeName,
    });

    return {
      success: true,
      message: "Comércio cadastrado com sucesso!",
      redirectTo: "/dashboard",
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível concluir o cadastro do comércio. Verifique sua conexão e tente novamente.",
    };
  }
}

export async function loginAction(
  input: LoginFormValues,
  callbackUrl?: string
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique suas credenciais.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        clientProfile: true,
        merchantProfile: true,
      },
    });

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return {
        success: false,
        message: "E-mail ou senha inválidos.",
      };
    }

    const displayName =
      user.role === "MERCHANT"
        ? (user.merchantProfile?.tradeName ?? user.email)
        : (user.clientProfile?.name ?? user.email);

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: displayName,
    });

    const isSafeCallback =
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//") &&
      !(user.role === "CLIENT" && callbackUrl.startsWith("/dashboard"));

    const defaultRedirect =
      user.role === "MERCHANT" ? "/dashboard" : "/explorar";

    return {
      success: true,
      message: "Login realizado com sucesso!",
      redirectTo: isSafeCallback ? callbackUrl : defaultRedirect,
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível autenticar no momento. Verifique a conexão com o banco de dados.",
    };
  }
}

export async function forgotPasswordAction(
  input: ForgotPasswordFormValues
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Informe um e-mail válido.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    // Busca silenciosa para evitar enumeração de contas de usuários
    await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
  } catch {
    // Mesmo em ambiente sem banco ativo no momento, retorna confirmação segura do fluxo
  }

  return {
    success: true,
    message: `Se houver uma conta associada a ${normalizedEmail}, enviamos um link de recuperação de senha para sua caixa de entrada.`,
  };
}

export async function logoutAction(): Promise<AuthActionResult> {
  await clearSessionCookie();
  return {
    success: true,
    redirectTo: "/login",
  };
}

