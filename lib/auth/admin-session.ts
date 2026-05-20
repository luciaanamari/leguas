import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { verifySessionToken, type SessionPayload } from "./edge";

const COOKIE_NAME = "legua_admin_session";
const encoder = new TextEncoder();

function getConfig() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET ausente ou muito curto (mínimo 32 caracteres).");
  }
  const maxAge = Number(process.env.ADMIN_SESSION_MAX_AGE ?? 28800);
  return { secret, maxAge };
}

export async function criarSessaoAdmin(adminId: string): Promise<void> {
  const { secret, maxAge } = getConfig();
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(encoder.encode(secret));

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function lerSessaoAdmin(): Promise<SessionPayload | null> {
  const { secret } = getConfig();
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, secret);
}

export async function encerrarSessaoAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
