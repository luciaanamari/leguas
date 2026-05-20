import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

export function hashCpf(cpf: string): string {
  const apenasDigitos = cpf.replace(/\D/g, "");
  return createHash("sha256").update(apenasDigitos).digest("hex");
}

/** Hash any phone number (digits only) with SHA-256. */
export function hashWhatsapp(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  return createHash("sha256").update(digits).digest("hex");
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export function gerarTokenAleatorio(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
