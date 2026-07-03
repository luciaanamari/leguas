import { prisma } from "@/lib/db";
import { lerSessaoAdmin } from "./admin-session";
import type { AdminSessionScope } from "./rbac";

export function ehAdminGlobal(session: AdminSessionScope): boolean {
  return session.adminRole === "SUPER_ADMIN" || session.adminRole === "EDITOR";
}

/** Retorna o escopo do admin autenticado (DB como fonte de verdade) ou null. */
export async function lerEscopoAdmin(): Promise<AdminSessionScope | null> {
  const sessao = await lerSessaoAdmin();
  if (!sessao) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: sessao.sub },
    select: {
      id: true,
      role: true,
      ativo: true,
      organizacaoId: true,
      escolaId: true,
    },
  });
  if (!admin?.ativo) return null;

  return {
    sub: admin.id,
    adminRole: admin.role,
    organizacaoId: admin.organizacaoId,
    escolaId: admin.escolaId,
  };
}

/** Escopo válido apenas para SUPER_ADMIN / EDITOR. */
export async function lerEscopoAdminGlobal(): Promise<AdminSessionScope | null> {
  const escopo = await lerEscopoAdmin();
  if (!escopo || !ehAdminGlobal(escopo)) return null;
  return escopo;
}
