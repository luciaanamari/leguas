import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminProfissoesPage() {
  const profissoes = await prisma.profissao.findMany({
    include: { trilha: { select: { titulo: true, slug: true } } },
    orderBy: [{ trilhaId: "asc" }, { nome: "asc" }],
  });

  const agrupado = new Map<string, typeof profissoes>();
  for (const p of profissoes) {
    const k = p.trilha.titulo;
    if (!agrupado.has(k)) agrupado.set(k, []);
    agrupado.get(k)!.push(p);
  }

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
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Profissões</h1>
          <p className="muted" style={{ margin: "0.25rem 0 0", maxWidth: 620 }}>
            Lista descritiva de carreiras associadas a cada trilha — aparece para o
            aluno na página da trilha, na seção &ldquo;Profissões nesse caminho&rdquo;.
            Não confundir com os cursos do mapa (Medicina, Engenharia, etc.), que
            têm narrativa e quiz próprios e são gerenciados via repositório.
          </p>
        </div>
        <Link href="/admin/profissoes/nova" className="btn btn-primary">
          + Nova profissão
        </Link>
      </div>

      {agrupado.size === 0 ? (
        <p className="muted">Nenhuma profissão cadastrada.</p>
      ) : (
        Array.from(agrupado.entries()).map(([titulo, lista]) => (
          <section key={titulo} style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>{titulo}</h2>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {lista.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 1rem",
                    borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <strong>{p.nome}</strong>
                    <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                      {p.descricao}
                    </p>
                  </div>
                  <Link
                    href={`/admin/profissoes/${p.id}/editar`}
                    style={{ color: "var(--color-accent)" }}
                  >
                    Editar
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
