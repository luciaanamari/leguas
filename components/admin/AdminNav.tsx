"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/trilhas", label: "Trilhas" },
  { href: "/admin/profissoes", label: "Profissões" },
  { href: "/admin/estudantes", label: "Estudantes" },
  { href: "/admin/conteudo", label: "Conteúdo" },
];

export default function AdminNav() {
  const pathname = usePathname();
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
          </Link>
        );
      })}
    </nav>
  );
}
