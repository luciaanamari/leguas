import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, podeGerenciarEscola } from "@/lib/auth";
import { CriarEscolaAdmin } from "@/components/admin/FormularioEscola";
import GestaoLinks from "@/components/admin/GestaoLinks";
import FormularioLogoEscola from "@/components/admin/FormularioLogoEscola";
import { garantirLinkPermanente } from "@/lib/links";

type Params = Promise<{ id: string }>;

export default async function DetalheEscolaPage({ params }: { params: Params }) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  const { id } = await params;
  const escola = await prisma.escola.findUnique({
    where: { id },
    include: {
      organizacao: { select: { id: true, nome: true, slug: true } },
      admins: {
        where: { role: "ESCOLA_ADMIN", ativo: true },
        select: { id: true, nome: true, email: true, criadoEm: true },
        orderBy: { nome: "asc" },
      },
      _count: { select: { estudantes: true } },
    },
  });
  if (!escola) notFound();

  if (!podeGerenciarEscola(escopo, escola)) {
    redirect("/admin/dashboard");
  }

  const linkPermanente = await garantirLinkPermanente(escola.id, escola.nome);

  const podeGerenciarAdmins =
    escopo.adminRole === "SUPER_ADMIN" ||
    escopo.adminRole === "EDITOR" ||
    escopo.adminRole === "ORG_ADMIN";
  const podeEditar = escopo.adminRole !== "ESCOLA_ADMIN";
  const voltarHref =
    escopo.adminRole === "ESCOLA_ADMIN" ? "/admin/dashboard" : "/admin/escolas";

  return (
    <div>
      <Link href={voltarHref} className="muted" style={{ textDecoration: "none" }}>
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
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>{escola.nome}</h1>
          <p className="muted" style={{ margin: "0.25rem 0 0" }}>
            {escola.organizacao.nome} · {escola.ativo ? "ativa" : "desativada"} · criada em{" "}
            {escola.criadoEm.toLocaleDateString("pt-BR")}
          </p>
        </div>
        {podeEditar && (
          <Link href={`/admin/escolas/${escola.id}/editar`} className="btn btn-secondary">
            Editar
          </Link>
        )}
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
        <Campo label="Organização" valor={escola.organizacao.nome} />
        <Campo label="Município" valor={escola.municipio ?? "—"} />
        <Campo label="INEP" valor={escola.inep ?? "—"} />
        <Campo label="Alunos" valor={String(escola._count.estudantes)} />
        <Campo label="Admins da escola" valor={String(escola.admins.length)} />
      </section>

      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Admins da escola</h2>
      {escola.admins.length === 0 ? (
        <p className="muted">Nenhum ESCOLA_ADMIN cadastrado.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
          {escola.admins.map((a) => (
            <li key={a.id} className="card">
              <strong>{a.nome}</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
                {a.email} · desde {a.criadoEm.toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}

      {podeGerenciarAdmins && <CriarEscolaAdmin escolaId={escola.id} />}

      <h2 style={{ fontSize: "1.2rem", margin: "1.75rem 0 0.75rem" }}>Logo da escola</h2>
      <FormularioLogoEscola escolaId={escola.id} logoUrl={escola.logoUrl} />

      <h2 style={{ fontSize: "1.2rem", margin: "1.75rem 0 0.75rem" }}>Link de cadastro</h2>
      <p className="muted" style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        Compartilhe este link (ou o QR code) para que os alunos se cadastrem já vinculados a esta
        escola, sem precisar escolher nada. Você pode abrir ou fechar os novos cadastros quando
        quiser — quem já tem cadastro continua conseguindo entrar.
      </p>
      <GestaoLinks
        escolaId={escola.id}
        baseUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
        link={linkPermanente}
      />
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
