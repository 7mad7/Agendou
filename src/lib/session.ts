import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "agendou_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

export type SessionRole = "CLIENT" | "MERCHANT";

export interface SessionPayload {
  userId: string;
  email: string;
  role: SessionRole;
  name: string;
  exp: number;
}

function getSecretKeyBytes(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "agendou-super-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signData(data: string): Promise<string> {
  const keyBytes = getSecretKeyBytes();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data)
  );
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "exp">
): Promise<string> {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const encodedPayload = toBase64Url(
    new TextEncoder().encode(JSON.stringify(fullPayload))
  );
  const signature = await signData(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  try {
    const expectedSignature = await signData(encodedPayload);
    if (signature !== expectedSignature) {
      return null;
    }

    const decodedJson = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const parsed = JSON.parse(decodedJson) as SessionPayload;

    if (
      !parsed ||
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string" ||
      (parsed.role !== "CLIENT" && parsed.role !== "MERCHANT") ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (Date.now() > parsed.exp) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  payload: Omit<SessionPayload, "exp">
): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

