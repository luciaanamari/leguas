import Link from "next/link";

type Trilha = {
  id: string;
  ordem: number;
  titulo: string;
  slug: string;
  modalidade: string;
  ativo: boolean;
};

type Props = {
  trilhas: Trilha[];
};

const rotuloModalidade: Record<string, string> = {
  PRESENCIAL: "Presencial",
  EAD: "EAD",
  TECNICO: "Técnico",
  CONCURSO: "Concurso",
  MERCADO: "Mercado",
};

export default function TabelaTrilhas({ trilhas }: Props) {
  if (trilhas.length === 0) {
    return <p className="muted">Nenhuma trilha cadastrada.</p>;
  }
  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "1rem" }}>Ordem</th>
            <th style={{ padding: "1rem" }}>Título</th>
            <th style={{ padding: "1rem" }}>Modalidade</th>
            <th style={{ padding: "1rem" }}>Status</th>
            <th style={{ padding: "1rem" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {trilhas.map((t) => (
            <tr key={t.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "1rem" }}>{t.ordem}</td>
              <td style={{ padding: "1rem" }}>
                <strong>{t.titulo}</strong>
                <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>
                  /{t.slug}
                </p>
              </td>
              <td style={{ padding: "1rem" }}>
                {rotuloModalidade[t.modalidade] ?? t.modalidade}
              </td>
              <td style={{ padding: "1rem" }}>
                {t.ativo ? (
                  <span style={{ color: "var(--color-success, #4caf78)" }}>Ativa</span>
                ) : (
                  <span className="muted">Desativada</span>
                )}
              </td>
              <td style={{ padding: "1rem" }}>
                <Link
                  href={`/admin/trilhas/${t.id}/editar`}
                  style={{ color: "var(--color-accent)" }}
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
