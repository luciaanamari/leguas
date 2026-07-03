import type { AdminRole, Prisma } from "@prisma/client";

export type AdminSessionScope = {
  sub: string;
  adminRole: AdminRole;
  organizacaoId: string | null;
  escolaId: string | null;
};

type EstudanteEscopo = {
  escolaId: string | null;
  escola?: { organizacaoId: string } | null;
};

function isGlobalAdmin(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "EDITOR";
}

export function podeGerenciarOrganizacao(
  session: AdminSessionScope,
  organizacaoId: string,
): boolean {
  if (isGlobalAdmin(session.adminRole)) return true;
  if (session.adminRole === "ORG_ADMIN") {
    return session.organizacaoId === organizacaoId;
  }
  return false;
}

export function podeGerenciarEscola(
  session: AdminSessionScope,
  escola: { id: string; organizacaoId: string },
): boolean {
  if (isGlobalAdmin(session.adminRole)) return true;
  if (session.adminRole === "ORG_ADMIN") {
    return session.organizacaoId === escola.organizacaoId;
  }
  if (session.adminRole === "ESCOLA_ADMIN") {
    return session.escolaId === escola.id;
  }
  return false;
}

export function podeGerenciarEstudante(
  session: AdminSessionScope,
  estudante: EstudanteEscopo,
): boolean {
  if (isGlobalAdmin(session.adminRole)) return true;
  if (!estudante.escolaId) return false;

  if (session.adminRole === "ESCOLA_ADMIN") {
    return session.escolaId === estudante.escolaId;
  }

  if (session.adminRole === "ORG_ADMIN") {
    return (
      session.organizacaoId != null &&
      estudante.escola?.organizacaoId === session.organizacaoId
    );
  }

  return false;
}

/** Filtro Prisma para listagens de estudantes conforme o papel do admin. */
export function escopoDeQuery(
  session: AdminSessionScope,
): Prisma.EstudanteWhereInput {
  if (isGlobalAdmin(session.adminRole)) return {};

  if (session.adminRole === "ORG_ADMIN" && session.organizacaoId) {
    return { escola: { organizacaoId: session.organizacaoId } };
  }

  if (session.adminRole === "ESCOLA_ADMIN" && session.escolaId) {
    return { escolaId: session.escolaId };
  }

  return { id: { in: [] } };
}

/** Filtro Prisma para solicitações de redefinição de senha pendentes. */
export function escopoSolicitacoesSenha(
  session: AdminSessionScope,
): Prisma.SolicitacaoRedefinicaoSenhaWhereInput {
  const base: Prisma.SolicitacaoRedefinicaoSenhaWhereInput = {
    status: "PENDENTE",
  };

  if (isGlobalAdmin(session.adminRole)) return base;

  if (session.adminRole === "ORG_ADMIN" && session.organizacaoId) {
    return {
      ...base,
      estudante: { escola: { organizacaoId: session.organizacaoId } },
    };
  }

  if (session.adminRole === "ESCOLA_ADMIN" && session.escolaId) {
    return {
      ...base,
      estudante: { escolaId: session.escolaId },
    };
  }

  return { id: { in: [] } };
}

export function adminSessionFromJwt(payload: {
  sub: string;
  adminRole?: AdminRole;
  organizacaoId?: string | null;
  escolaId?: string | null;
}): AdminSessionScope | null {
  if (!payload.adminRole) return null;
  return {
    sub: payload.sub,
    adminRole: payload.adminRole,
    organizacaoId: payload.organizacaoId ?? null,
    escolaId: payload.escolaId ?? null,
  };
}
