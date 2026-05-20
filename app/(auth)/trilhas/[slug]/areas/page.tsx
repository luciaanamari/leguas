import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { areasPorTrilha, cursosPorTrilha } from "@/lib/data/cursos";

type Params = Promise<{ slug: string }>;

export default async function AreasPage({ params }: { params: Params }) {
  const { slug } = await params;

  const trilha = await prisma.trilha.findUnique({ where: { slug } });
  if (!trilha || !trilha.ativo) notFound();

  const areas = areasPorTrilha(slug);

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <Link
        href={`/trilhas/${slug}`}
        className="muted"
        style={{ textDecoration: "none" }}
      >
        ← voltar para {trilha.titulo}
      </Link>

      <header style={{ marginTop: "1.25rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Escolha uma área</h1>
        <p className="muted" style={{ marginTop: "0.5rem", maxWidth: 600 }}>
          Dentro de <strong>{trilha.titulo}</strong>, existem muitas áreas de
          conhecimento. Clique na que mais desperta sua curiosidade.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {areas.map((area) => (
          <Link
            key={area.slug}
            href={`/trilhas/${slug}/areas/${area.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div
              className="card"
              style={{
                cursor: "pointer",
                transition: "background 0.15s, transform 0.1s",
                height: "100%",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                {area.icon}
              </div>
              <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem" }}>
                {area.nome}
              </h3>
              <p
                className="muted"
                style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}
              >
                {area.descricao}
              </p>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "0.78rem",
                  color: "var(--color-accent)",
                  fontWeight: 600,
                }}
              >
                {cursosPorTrilha(area, slug).length} cursos →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
