import { jwtVerify } from "jose";

const encoder = new TextEncoder();

export type SessionPayload = {
  sub: string;
  role?: "student" | "admin";
};

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}
