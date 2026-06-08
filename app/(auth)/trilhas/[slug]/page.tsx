import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";

type Params = Promise<{ slug: string }>;

const rotuloModalidade: Record<string, string> = {
  PRESENCIAL: "Presencial",
  EAD: "EAD",
  TECNICO: "Técnico",
  CONCURSO: "Concurso",
  MERCADO: "Mercado",
};

export default async function TrilhaPage({ params }: { params: Params }) {
  const { slug } = await params;
  const trilha = await prisma.trilha.findUnique({
    where: { slug },
    include: { profissoes: { where: { ativo: true }, orderBy: { nome: "asc" } } },
  });
  if (!trilha || !trilha.ativo) notFound();

  const sessao = await lerSessaoEstudante();
  if (sessao) {
    await prisma.eventoEngajamento.create({
      data: {
        estudanteId: sessao.sub,
        tipoEvento: "TRILHA_VISUALIZADA",
        payload: { slug },
      },
    });
  }

  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <Link href="/trilhas" className="muted" style={{ textDecoration: "none" }}>
        ← voltar para o mapa
      </Link>

      <header style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <span
          style={{
            display: "inline-block",
            background: "var(--color-accent-soft)",
            color: "var(--color-text)",
            padding: "0.25rem 0.6rem",
            borderRadius: 999,
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
          }}
        >
          {rotuloModalidade[trilha.modalidade] ?? trilha.modalidade}
        </span>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>{trilha.titulo}</h1>
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          {trilha.descricaoCurta}
        </p>
      </header>

      <section className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>O que é</h2>
        {trilha.descricaoCompleta.split(/\n+/).map((par, i) => (
          <p key={i}>{par}</p>
        ))}
      </section>

      <div
        style={{
          display: "grid",
          gap: "1.25rem",
          gridTemplateColumns: "1fr",
        }}
      >
        <section className="card">
          <h3 style={{ marginTop: 0, fontSize: "1rem" }}>Como entrar</h3>
          <p style={{ margin: 0 }}>{trilha.comoEntrar}</p>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0, fontSize: "1rem" }}>Tempo de duração</h3>
          <p style={{ margin: 0 }}>{trilha.duracao}</p>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0, fontSize: "1rem" }}>Primeiros passos</h3>
          <p style={{ margin: 0 }}>{trilha.primeirosPassos}</p>
        </section>
      </div>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Profissões nesse caminho</h2>
        <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
          {trilha.profissoes.map((p) => (
            <li key={p.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{p.nome}</strong>{" "}
              <span className="muted">- {p.descricao}</span>
            </li>
          ))}
        </ul>
      </section>

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href={`/trilhas/${trilha.slug}/areas`}
          className="btn btn-primary"
          style={{ minWidth: 240, textAlign: "center" }}
        >
          Explorar cursos e simular
        </Link>
      </div>
    </div>
  );
}
