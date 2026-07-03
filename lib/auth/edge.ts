import type { AdminRole } from "@prisma/client";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();

export type SessionPayload = {
  sub: string;
  role?: "student" | "admin";
  adminRole?: AdminRole;
  organizacaoId?: string | null;
  escolaId?: string | null;
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
      adminRole: payload.adminRole as AdminRole | undefined,
      organizacaoId:
        payload.organizacaoId === null || payload.organizacaoId === undefined
          ? (payload.organizacaoId as null | undefined)
          : String(payload.organizacaoId),
      escolaId:
        payload.escolaId === null || payload.escolaId === undefined
          ? (payload.escolaId as null | undefined)
          : String(payload.escolaId),
    };
  } catch {
    return null;
  }
}
