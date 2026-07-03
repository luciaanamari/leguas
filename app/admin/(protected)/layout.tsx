import Link from "next/link";
import { redirect } from "next/navigation";
import { lerEscopoAdmin, escopoSolicitacoesSenha } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/ui/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  const admin = await prisma.admin.findUnique({
    where: { id: escopo.sub },
    select: { nome: true, role: true, escolaId: true },
  });
  if (!admin) redirect("/admin/login");

  let solicitacoesPendentes = 0;
  if (admin.role !== "EDITOR") {
    solicitacoesPendentes = await prisma.solicitacaoRedefinicaoSenha.count({
      where: escopoSolicitacoesSenha(escopo),
    });
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "240px 1fr" }}>
      <aside
        style={{
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          padding: "1.25rem 1rem",
          minHeight: "100vh",
        }}
      >
        <Link
          href="/admin/dashboard"
          style={{
            display: "block",
            color: "var(--color-text)",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "1.1rem",
            marginBottom: "2rem",
          }}
        >
          Léguas <span style={{ color: "var(--color-accent-hover)" }}>Admin</span>
        </Link>
        <AdminNav
          role={admin.role}
          escolaId={admin.escolaId}
          solicitacoesPendentes={solicitacoesPendentes}
        />
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            {admin.nome}
          </p>
          <LogoutButton endpoint="/api/admin/auth/logout" destino="/admin/login" />
        </div>
      </aside>
      <main style={{ padding: "1.5rem 2rem" }}>{children}</main>
    </div>
  );
}
