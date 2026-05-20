import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { verifySessionToken, type SessionPayload } from "./edge";

const COOKIE_NAME = "legua_session";
const encoder = new TextEncoder();

function getConfig() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET ausente ou muito curto (mínimo 32 caracteres).");
  }
  const maxAge = Number(process.env.SESSION_MAX_AGE ?? 604800);
  return { secret, maxAge };
}

export async function criarSessaoEstudante(estudanteId: string): Promise<void> {
  const { secret, maxAge } = getConfig();
  const token = await new SignJWT({ role: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(estudanteId)
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

export async function lerSessaoEstudante(): Promise<SessionPayload | null> {
  const { secret } = getConfig();
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, secret);
}

export async function encerrarSessaoEstudante(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
