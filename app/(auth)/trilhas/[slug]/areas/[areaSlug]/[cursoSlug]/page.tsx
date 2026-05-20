import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buscarCurso, buscarArea } from "@/lib/data/cursos";
import TabsCurso from "@/components/simulador/TabsCurso";

type Params = Promise<{ slug: string; areaSlug: string; cursoSlug: string }>;

export default async function CursoPage({ params }: { params: Params }) {
  const { slug, areaSlug, cursoSlug } = await params;

  const [trilha, curso, area] = await Promise.all([
    prisma.trilha.findUnique({ where: { slug } }),
    Promise.resolve(buscarCurso(areaSlug, cursoSlug)),
    Promise.resolve(buscarArea(areaSlug)),
  ]);

  if (!trilha || !trilha.ativo || !curso || !area) notFound();

  return (
    <div className="container" style={{ maxWidth: 780 }}>
      <Link
        href={`/trilhas/${slug}/areas/${areaSlug}`}
        className="muted"
        style={{ textDecoration: "none" }}
      >
        ← voltar para {area.nome}
      </Link>

      <header style={{ marginTop: "1.25rem", marginBottom: "1.75rem" }}>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
          }}
        >
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
              letterSpacing: "0.04em",
            }}
          >
            {area.icon} {area.nome}
          </span>
          <span
            style={{
              display: "inline-block",
              background: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              padding: "0.25rem 0.6rem",
              borderRadius: 999,
              fontSize: "0.75rem",
            }}
          >
            {trilha.titulo}
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", margin: "0 0 0.75rem" }}>
          {curso.nome}
        </h1>

        <p
          className="muted"
          style={{ margin: "0 0 1.25rem", lineHeight: 1.6 }}
        >
          {curso.descricaoCurta}
        </p>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-text-muted)",
              }}
            >
              Duração
            </p>
            <p
              style={{
                margin: "0.2rem 0 0",
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {curso.duracao}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-text-muted)",
              }}
            >
              Salário médio
            </p>
            <p
              style={{
                margin: "0.2rem 0 0",
                fontWeight: 700,
                color: "var(--color-accent)",
              }}
            >
              {curso.salarioMedio}
            </p>
          </div>
        </div>
      </header>

      <TabsCurso
        narrativaEstudante={curso.narrativaEstudante}
        narrativaProfissional={curso.narrativaProfissional}
      />

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={`/trilhas/${slug}/areas/${areaSlug}/${cursoSlug}/simulador`}
          className="btn btn-primary"
          style={{ flex: 1, textAlign: "center", minWidth: 200 }}
        >
          Simular um dia neste curso
        </Link>
        <Link
          href={`/trilhas/${slug}/areas/${areaSlug}`}
          className="btn btn-secondary"
          style={{ flex: 1, textAlign: "center", minWidth: 200 }}
        >
          Ver outros cursos
        </Link>
      </div>
    </div>
  );
}
