import Link from "next/link";

type Organizacao = {
  id: string;
  nome: string;
  slug: string;
  cnpj: string | null;
  contato: string | null;
  ativo: boolean;
  _count?: { escolas: number; admins: number };
};

type Props = {
  organizacoes: Organizacao[];
};

export default function TabelaOrganizacoes({ organizacoes }: Props) {
  if (organizacoes.length === 0) {
    return <p className="muted">Nenhuma organização cadastrada.</p>;
  }

  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "1rem" }}>Nome</th>
            <th style={{ padding: "1rem" }}>CNPJ</th>
            <th style={{ padding: "1rem" }}>Escolas</th>
            <th style={{ padding: "1rem" }}>Status</th>
            <th style={{ padding: "1rem" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {organizacoes.map((o) => (
            <tr key={o.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "1rem" }}>
                <Link
                  href={`/admin/organizacoes/${o.id}`}
                  style={{ color: "var(--color-text)", textDecoration: "none", fontWeight: 600 }}
                >
                  {o.nome}
                </Link>
                <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>
                  /{o.slug}
                </p>
              </td>
              <td style={{ padding: "1rem" }}>{o.cnpj ?? "—"}</td>
              <td style={{ padding: "1rem" }}>{o._count?.escolas ?? 0}</td>
              <td style={{ padding: "1rem" }}>
                {o.ativo ? (
                  <span style={{ color: "var(--color-success)" }}>Ativa</span>
                ) : (
                  <span className="muted">Desativada</span>
                )}
              </td>
              <td style={{ padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link
                  href={`/admin/organizacoes/${o.id}/personalizacao`}
                  style={{ color: "var(--color-accent)" }}
                >
                  Personalizar
                </Link>
                <Link
                  href={`/admin/organizacoes/${o.id}/editar`}
                  style={{ color: "var(--color-text-soft)" }}
                >
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
