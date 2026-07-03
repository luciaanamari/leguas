import Link from "next/link";

type Escola = {
  id: string;
  nome: string;
  inep: string | null;
  municipio: string | null;
  ativo: boolean;
  organizacao?: { id: string; nome: string; slug: string };
  _count?: { estudantes: number; admins: number };
};

type Props = {
  escolas: Escola[];
  mostrarOrganizacao?: boolean;
};

export default function TabelaEscolas({ escolas, mostrarOrganizacao = true }: Props) {
  if (escolas.length === 0) {
    return <p className="muted">Nenhuma escola cadastrada.</p>;
  }

  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "1rem" }}>Nome</th>
            {mostrarOrganizacao && <th style={{ padding: "1rem" }}>Organização</th>}
            <th style={{ padding: "1rem" }}>Município</th>
            <th style={{ padding: "1rem" }}>Alunos</th>
            <th style={{ padding: "1rem" }}>Status</th>
            <th style={{ padding: "1rem" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {escolas.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "1rem" }}>
                <Link
                  href={`/admin/escolas/${e.id}`}
                  style={{ color: "var(--color-text)", textDecoration: "none", fontWeight: 600 }}
                >
                  {e.nome}
                </Link>
                {e.inep && (
                  <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>
                    INEP {e.inep}
                  </p>
                )}
              </td>
              {mostrarOrganizacao && (
                <td style={{ padding: "1rem" }}>{e.organizacao?.nome ?? "—"}</td>
              )}
              <td style={{ padding: "1rem" }}>{e.municipio ?? "—"}</td>
              <td style={{ padding: "1rem" }}>{e._count?.estudantes ?? 0}</td>
              <td style={{ padding: "1rem" }}>
                {e.ativo ? (
                  <span style={{ color: "var(--color-success)" }}>Ativa</span>
                ) : (
                  <span className="muted">Desativada</span>
                )}
              </td>
              <td style={{ padding: "1rem" }}>
                <Link href={`/admin/escolas/${e.id}/editar`} style={{ color: "var(--color-accent)" }}>
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
