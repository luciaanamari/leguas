import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal } from "@/lib/auth";
import { CriarOrgAdminOrganizacao } from "@/components/admin/FormularioOrganizacao";

type Params = Promise<{ id: string }>;

export default async function DetalheOrganizacaoPage({ params }: { params: Params }) {
  if (!(await lerEscopoAdminGlobal())) {
    redirect("/admin/dashboard");
  }

  const { id } = await params;
  const organizacao = await prisma.organizacao.findUnique({
    where: { id },
    include: {
      escolas: { orderBy: [{ ativo: "desc" }, { nome: "asc" }] },
      admins: {
        where: { role: "ORG_ADMIN", ativo: true },
        select: { id: true, nome: true, email: true, criadoEm: true },
        orderBy: { nome: "asc" },
      },
    },
  });
  if (!organizacao) notFound();

  return (
    <div>
      <Link href="/admin/organizacoes" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>{organizacao.nome}</h1>
          <p className="muted" style={{ margin: "0.25rem 0 0" }}>
            /{organizacao.slug} · {organizacao.ativo ? "ativa" : "desativada"} · criada em{" "}
            {organizacao.criadoEm.toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Link href={`/admin/organizacoes/${organizacao.id}/editar`} className="btn btn-secondary">
          Editar
        </Link>
        <Link
          href={`/admin/organizacoes/${organizacao.id}/personalizacao`}
          className="btn btn-primary"
        >
          Personalização
        </Link>
      </div>

      <section
        className="card"
        style={{
          marginBottom: "1.25rem",
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <Campo label="CNPJ" valor={organizacao.cnpj ?? "—"} />
        <Campo label="Contato" valor={organizacao.contato ?? "—"} />
        <Campo label="Escolas" valor={String(organizacao.escolas.length)} />
        <Campo label="Admins ORG" valor={String(organizacao.admins.length)} />
      </section>

      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Escolas</h2>
      {organizacao.escolas.length === 0 ? (
        <p className="muted">Nenhuma escola cadastrada nesta organização.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "grid", gap: "0.5rem" }}>
          {organizacao.escolas.map((e) => (
            <li key={e.id} className="card">
              <strong>{e.nome}</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
                {e.municipio ?? "Município não informado"} ·{" "}
                {e.ativo ? "ativa" : "desativada"}
                {e.inep ? ` · INEP ${e.inep}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Admins da organização</h2>
      {organizacao.admins.length === 0 ? (
        <p className="muted">Nenhum ORG_ADMIN cadastrado.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
          {organizacao.admins.map((a) => (
            <li key={a.id} className="card">
              <strong>{a.nome}</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
                {a.email} · desde {a.criadoEm.toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}

      <CriarOrgAdminOrganizacao organizacaoId={organizacao.id} />
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
        {label}
      </p>
      <p style={{ margin: 0 }}>{valor}</p>
    </div>
  );
}
