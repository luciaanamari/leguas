import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Prisma, type AnoEscolar, type DiscPerfil } from "@prisma/client";
import { ehAdminGlobal, escopoDeQuery, lerEscopoAdmin } from "@/lib/auth";

type SearchParams = Promise<{
  q?: string;
  escola?: string;
  escolaId?: string;
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

function montarQueryPagina(
  sp: {
    q?: string;
    escola?: string;
    escolaId?: string;
    ano?: string;
    disc?: string;
  },
  page: number,
) {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.escola) params.set("escola", sp.escola);
  if (sp.escolaId) params.set("escolaId", sp.escolaId);
  if (sp.ano) params.set("ano", sp.ano);
  if (sp.disc) params.set("disc", sp.disc);
  params.set("page", String(page));
  return params.toString();
}

export default async function AdminEstudantesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const filtros: Prisma.EstudanteWhereInput[] = [escopoDeQuery(escopo)];
  if (sp.q) filtros.push({ nome: { contains: sp.q, mode: "insensitive" } });
  if (sp.ano) filtros.push({ escolaAno: sp.ano as AnoEscolar });
  if (sp.disc) filtros.push({ discPerfil: sp.disc as DiscPerfil });

  const mostrarFiltroEscola = escopo.adminRole === "ORG_ADMIN";
  let escolasFiltro: { id: string; nome: string }[] = [];

  if (mostrarFiltroEscola && escopo.organizacaoId) {
    escolasFiltro = await prisma.escola.findMany({
      where: { organizacaoId: escopo.organizacaoId, ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    });

    if (sp.escolaId) {
      const escolaValida = escolasFiltro.some((e) => e.id === sp.escolaId);
      if (escolaValida) {
        filtros.push({ escolaId: sp.escolaId });
      }
    }
  } else if (ehAdminGlobal(escopo) && sp.escola) {
    filtros.push({ escolaNome: { contains: sp.escola, mode: "insensitive" } });
  }

  const where: Prisma.EstudanteWhereInput = { AND: filtros };

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
        escola: { select: { nome: true } },
      },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / PAGINA_TAM));

  const subtitulo =
    escopo.adminRole === "ORG_ADMIN"
      ? `${total} cadastrado(s) na sua organização.`
      : escopo.adminRole === "ESCOLA_ADMIN"
        ? `${total} cadastrado(s) na sua escola.`
        : `${total} cadastrado(s).`;

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Estudantes</h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        {subtitulo}
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

        {mostrarFiltroEscola ? (
          <select name="escolaId" className="select" defaultValue={sp.escolaId ?? ""}>
            <option value="">Todas as escolas</option>
            {escolasFiltro.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        ) : ehAdminGlobal(escopo) ? (
          <input
            name="escola"
            placeholder="Escola (texto)"
            className="input"
            defaultValue={sp.escola ?? ""}
          />
        ) : null}

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
                  <td style={{ padding: "1rem" }}>{e.escola?.nome ?? e.escolaNome}</td>
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
              href={`/admin/estudantes?${montarQueryPagina(sp, page - 1)}`}
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
              href={`/admin/estudantes?${montarQueryPagina(sp, page + 1)}`}
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
