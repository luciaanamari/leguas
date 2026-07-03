"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@prisma/client";

type NavItem = { href: string; label: string; badge?: number };

type Props = {
  role: AdminRole;
  escolaId: string | null;
  solicitacoesPendentes?: number;
};

function isGlobal(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "EDITOR";
}

function itensParaPapel(
  role: AdminRole,
  escolaId: string | null,
  solicitacoesPendentes: number,
): NavItem[] {
  const itens: NavItem[] = [{ href: "/admin/dashboard", label: "Dashboard" }];
  const solicitacoes: NavItem = {
    href: "/admin/solicitacoes",
    label: "Solicitações de senha",
    badge: solicitacoesPendentes > 0 ? solicitacoesPendentes : undefined,
  };

  if (isGlobal(role)) {
    itens.push(
      { href: "/admin/organizacoes", label: "Organizações" },
      { href: "/admin/escolas", label: "Escolas" },
      { href: "/admin/trilhas", label: "Trilhas" },
      { href: "/admin/profissoes", label: "Profissões" },
      { href: "/admin/estudantes", label: "Estudantes" },
    );
    if (role === "SUPER_ADMIN") {
      itens.push(solicitacoes);
    }
    itens.push({ href: "/admin/conteudo", label: "Conteúdo" });
    return itens;
  }

  if (role === "ORG_ADMIN") {
    itens.push(
      { href: "/admin/escolas", label: "Escolas" },
      { href: "/admin/estudantes", label: "Estudantes" },
      solicitacoes,
      { href: "/admin/personalizacao", label: "Personalização" },
    );
    return itens;
  }

  if (role === "ESCOLA_ADMIN" && escolaId) {
    itens.push(
      { href: `/admin/escolas/${escolaId}`, label: "Minha escola" },
      { href: "/admin/estudantes", label: "Estudantes" },
      solicitacoes,
    );
  }

  return itens;
}

export default function AdminNav({ role, escolaId, solicitacoesPendentes = 0 }: Props) {
  const pathname = usePathname();
  const itens = itensParaPapel(role, escolaId, solicitacoesPendentes);

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {itens.map((i) => {
        const ativo = pathname === i.href || pathname.startsWith(`${i.href}/`);
        return (
          <Link
            key={i.href}
            href={i.href}
            style={{
              color: "var(--color-text)",
              background: ativo ? "var(--color-accent-soft)" : "transparent",
              borderLeft: ativo
                ? "3px solid var(--color-accent)"
                : "3px solid transparent",
              textDecoration: "none",
              padding: "0.6rem 0.8rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.95rem",
              fontWeight: ativo ? 700 : 500,
            }}
          >
            {i.label}
            {i.badge != null && i.badge > 0 && (
              <span
                style={{
                  marginLeft: "0.45rem",
                  background: "var(--color-accent)",
                  color: "var(--color-text)",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "0.1rem 0.45rem",
                  borderRadius: "999px",
                  verticalAlign: "middle",
                }}
              >
                {i.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
