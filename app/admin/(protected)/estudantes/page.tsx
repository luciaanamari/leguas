import Link from "next/link";
import { prisma } from "@/lib/db";
import { Prisma, type AnoEscolar, type DiscPerfil } from "@prisma/client";

type SearchParams = Promise<{
  q?: string;
  escola?: string;
  ano?: string;
  disc?: string;
  page?: string;
}>;

const PAGINA_TAM = 20;

const labelDisc: Record<string, string> = {
  D: "Decisor",
  I: "Influenciador",
  S: "Estável",
  C: "Analítico",
};

export default async function AdminEstudantesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const filtros: Prisma.EstudanteWhereInput[] = [];
  if (sp.q) filtros.push({ nome: { contains: sp.q, mode: "insensitive" } });
  if (sp.escola) filtros.push({ escolaNome: { contains: sp.escola, mode: "insensitive" } });
  if (sp.ano) filtros.push({ escolaAno: sp.ano as AnoEscolar });
  if (sp.disc) filtros.push({ discPerfil: sp.disc as DiscPerfil });
  const where: Prisma.EstudanteWhereInput = filtros.length > 0 ? { AND: filtros } : {};

  const [total, estudantes] = await Promise.all([
    prisma.estudante.count({ where }),
    prisma.estudante.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * PAGINA_TAM,
      take: PAGINA_TAM,
      select: {
        id: true,
        nome: true,
        escolaNome: true,
        escolaAno: true,
        discPerfil: true,
        ativo: true,
        criadoEm: true,
      },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / PAGINA_TAM));

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Estudantes</h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        {total} cadastrado(s).
      </p>

      <form
        method="get"
        className="card"
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "1.5rem",
        }}
      >
        <input
          name="q"
          placeholder="Buscar por nome"
          className="input"
          defaultValue={sp.q ?? ""}
        />
        <input
          name="escola"
          placeholder="Escola"
          className="input"
          defaultValue={sp.escola ?? ""}
        />
        <select name="ano" className="select" defaultValue={sp.ano ?? ""}>
          <option value="">Qualquer ano</option>
          <option value="PRIMEIRO">1º ano</option>
          <option value="SEGUNDO">2º ano</option>
          <option value="TERCEIRO">3º ano</option>
        </select>
        <select name="disc" className="select" defaultValue={sp.disc ?? ""}>
          <option value="">Qualquer perfil</option>
          <option value="D">Decisor (D)</option>
          <option value="I">Influenciador (I)</option>
          <option value="S">Estável (S)</option>
          <option value="C">Analítico (C)</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Filtrar
        </button>
      </form>

      {estudantes.length === 0 ? (
        <p className="muted">Nenhum estudante encontrado.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                <th style={{ padding: "1rem" }}>Nome</th>
                <th style={{ padding: "1rem" }}>Escola</th>
                <th style={{ padding: "1rem" }}>Ano</th>
                <th style={{ padding: "1rem" }}>Perfil</th>
                <th style={{ padding: "1rem" }}>Status</th>
                <th style={{ padding: "1rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {estudantes.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "1rem" }}>{e.nome}</td>
                  <td style={{ padding: "1rem" }}>{e.escolaNome}</td>
                  <td style={{ padding: "1rem" }}>{e.escolaAno}</td>
                  <td style={{ padding: "1rem" }}>
                    {labelDisc[e.discPerfil] ?? e.discPerfil}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {e.ativo ? "Ativo" : <span className="muted">Inativo</span>}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <Link href={`/admin/estudantes/${e.id}`} style={{ color: "var(--color-accent)" }}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {page > 1 && (
            <Link
              href={`/admin/estudantes?${new URLSearchParams({ ...sp, page: String(page - 1) }).toString()}`}
              className="btn btn-ghost"
              style={{ minHeight: 38, fontSize: "0.9rem" }}
            >
              Anterior
            </Link>
          )}
          <span className="muted">
            Página {page} de {totalPaginas}
          </span>
          {page < totalPaginas && (
            <Link
              href={`/admin/estudantes?${new URLSearchParams({ ...sp, page: String(page + 1) }).toString()}`}
              className="btn btn-ghost"
              style={{ minHeight: 38, fontSize: "0.9rem" }}
            >
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
