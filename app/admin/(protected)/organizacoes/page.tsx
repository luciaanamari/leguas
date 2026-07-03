import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal } from "@/lib/auth";
import TabelaOrganizacoes from "@/components/admin/TabelaOrganizacoes";

export default async function AdminOrganizacoesListPage() {
  if (!(await lerEscopoAdminGlobal())) {
    redirect("/admin/dashboard");
  }

  const organizacoes = await prisma.organizacao.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: {
      _count: { select: { escolas: true, admins: true } },
    },
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Organizações</h1>
          <p className="muted" style={{ margin: 0 }}>
            {organizacoes.length} organização(ões) cadastrada(s).
          </p>
        </div>
        <Link href="/admin/organizacoes/nova" className="btn btn-primary">
          + Nova organização
        </Link>
      </div>
      <TabelaOrganizacoes organizacoes={organizacoes} />
    </div>
  );
}
