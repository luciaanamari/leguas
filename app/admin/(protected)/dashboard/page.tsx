import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [
    totalEstudantes,
    totalSimulacoesIniciadas,
    totalSimulacoesConcluidas,
    totalCompartilhados,
    trilhasMaisSimuladas,
  ] = await Promise.all([
    prisma.estudante.count(),
    prisma.simulacao.count(),
    prisma.simulacao.count({ where: { concluidaEm: { not: null } } }),
    prisma.resultadoMatch.count({ where: { compartilhado: true } }),
    prisma.simulacao.groupBy({
      by: ["trilhaId"],
      _count: { trilhaId: true },
      orderBy: { _count: { trilhaId: "desc" } },
      take: 5,
    }),
  ]);

  const ids = trilhasMaisSimuladas.map((t) => t.trilhaId);
  const trilhas = await prisma.trilha.findMany({
    where: { id: { in: ids } },
    select: { id: true, titulo: true, slug: true },
  });
  const titulos = new Map(trilhas.map((t) => [t.id, t]));

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Dashboard</h1>
      <p className="muted" style={{ marginBottom: "2rem" }}>
        Visão geral dos números do Légua.
      </p>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "2rem",
        }}
      >
        <CardNumero label="Estudantes cadastrados" valor={totalEstudantes} />
        <CardNumero label="Simulações iniciadas" valor={totalSimulacoesIniciadas} />
        <CardNumero label="Simulações concluídas" valor={totalSimulacoesConcluidas} />
        <CardNumero label="Resultados compartilhados" valor={totalCompartilhados} />
      </section>

      <section className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Trilhas mais simuladas</h2>
        {trilhasMaisSimuladas.length === 0 ? (
          <p className="muted">Ainda não há dados suficientes.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {trilhasMaisSimuladas.map((t) => {
              const trilha = titulos.get(t.trilhaId);
              return (
                <li
                  key={t.trilhaId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span>{trilha?.titulo ?? "(desativada)"}</span>
                  <strong>{t._count.trilhaId} simulações</strong>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function CardNumero({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="card">
      <p className="muted" style={{ fontSize: "0.85rem", margin: 0, marginBottom: "0.5rem" }}>
        {label}
      </p>
      <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--color-accent)" }}>
        {valor}
      </p>
    </div>
  );
}
