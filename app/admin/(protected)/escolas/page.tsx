import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ehAdminGlobal, lerEscopoAdmin, type AdminSessionScope } from "@/lib/auth";
import TabelaEscolas from "@/components/admin/TabelaEscolas";

function escopoDeQueryEscolas(session: AdminSessionScope): Prisma.EscolaWhereInput {
  if (ehAdminGlobal(session)) return {};

  if (session.adminRole === "ORG_ADMIN" && session.organizacaoId) {
    return { organizacaoId: session.organizacaoId };
  }

  return { id: { in: [] } };
}

export default async function AdminEscolasListPage() {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  if (escopo.adminRole === "ESCOLA_ADMIN") {
    redirect("/admin/dashboard");
  }

  const escolas = await prisma.escola.findMany({
    where: escopoDeQueryEscolas(escopo),
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: {
      organizacao: { select: { id: true, nome: true, slug: true } },
      _count: { select: { estudantes: true, admins: true } },
    },
  });

  const mostrarOrganizacao = ehAdminGlobal(escopo);

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
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Escolas</h1>
          <p className="muted" style={{ margin: 0 }}>
            {escolas.length} escola(s) no seu escopo.
          </p>
        </div>
        <Link href="/admin/escolas/nova" className="btn btn-primary">
          + Nova escola
        </Link>
      </div>
      <TabelaEscolas escolas={escolas} mostrarOrganizacao={mostrarOrganizacao} />
    </div>
  );
}
