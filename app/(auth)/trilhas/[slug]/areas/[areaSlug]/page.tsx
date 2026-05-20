import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buscarArea, cursosPorTrilha } from "@/lib/data/cursos";

type Params = Promise<{ slug: string; areaSlug: string }>;

export default async function CursosPage({ params }: { params: Params }) {
  const { slug, areaSlug } = await params;

  const [trilha, area] = await Promise.all([
    prisma.trilha.findUnique({ where: { slug } }),
    Promise.resolve(buscarArea(areaSlug)),
  ]);

  if (!trilha || !trilha.ativo || !area) notFound();

  const cursos = cursosPorTrilha(area, slug);

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      <Link
        href={`/trilhas/${slug}/areas`}
        className="muted"
        style={{ textDecoration: "none" }}
      >
        ← voltar para áreas
      </Link>

      <header style={{ marginTop: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          {area.icon}
        </div>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>{area.nome}</h1>
        <p className="muted" style={{ marginTop: "0.5rem", maxWidth: 620 }}>
          {area.descricao}
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {cursos.length === 0 && (
          <p className="muted" style={{ gridColumn: "1 / -1" }}>
            Nenhum curso desta área se encaixa nesta trilha.
          </p>
        )}
        {cursos.map((curso) => (
          <Link
            key={curso.slug}
            href={`/trilhas/${slug}/areas/${areaSlug}/${curso.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div
              className="card"
              style={{
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.4rem",
                  fontSize: "1rem",
                  color: "var(--color-text)",
                }}
              >
                {curso.nome}
              </h3>
              <p
                className="muted"
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {curso.descricaoCurta}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "0.6rem",
                  marginTop: "auto",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  ⏱ {curso.duracao}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-accent)",
                    fontWeight: 600,
                  }}
                >
                  {curso.salarioMedio}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
