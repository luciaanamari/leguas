import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AcoesEstudante from "@/components/admin/AcoesEstudante";

type Params = Promise<{ id: string }>;

const labelRenda: Record<string, string> = {
  ATE_1K: "Até R$ 1.000",
  DE_1K_A_2_5K: "R$ 1.000 a R$ 2.500",
  DE_2_5K_A_5K: "R$ 2.500 a R$ 5.000",
  ACIMA_5K: "Acima de R$ 5.000",
  PREFIRO_NAO_INFORMAR: "Prefere não informar",
};

const labelPerfil: Record<string, string> = {
  ESTAVEL: "Estável",
  EQUILIBRIO: "Equilíbrio",
  EMPREENDEDOR: "Empreendedor",
  ALTO_RISCO: "Alto risco",
};

const labelPreocupacao: Record<string, string> = {
  SEM_DINHEIRO_FACULDADE: "Sem dinheiro para faculdade",
  PRECISO_TRABALHAR_LOGO: "Precisa trabalhar logo",
  NAO_PASSAR_NO_ENEM: "Medo de não passar no ENEM",
  MEDO_ESCOLHER_ERRADO: "Medo de escolher errado",
  NAO_CONHECO_OPCOES: "Não conhece bem as opções",
};

const labelDisc: Record<string, string> = {
  D: "Decisor (D)",
  I: "Influenciador (I)",
  S: "Estável (S)",
  C: "Analítico (C)",
};

export default async function DetalheEstudantePage({ params }: { params: Params }) {
  const { id } = await params;
  const estudante = await prisma.estudante.findUnique({
    where: { id },
    include: {
      simulacoes: {
        include: {
          trilha: { select: { titulo: true, slug: true } },
          resultado: { select: { pontuacao: true, compartilhado: true } },
        },
        orderBy: { iniciadaEm: "desc" },
      },
    },
  });
  if (!estudante) notFound();

  return (
    <div>
      <Link href="/admin/estudantes" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "0.25rem" }}>
        {estudante.nome}
      </h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        Cadastrado em {estudante.criadoEm.toLocaleDateString("pt-BR")} —{" "}
        {estudante.ativo ? "ativo" : "inativo"}
      </p>

      <section
        className="card"
        style={{
          marginBottom: "1.25rem",
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <Campo label="Escola" valor={estudante.escolaNome} />
        <Campo label="Ano" valor={estudante.escolaAno} />
        <Campo label="Curso técnico" valor={estudante.cursoTecnico ?? "—"} />
        <Campo label="WhatsApp" valor="(armazenado como hash)" />
        <Campo
          label="Renda familiar"
          valor={labelRenda[estudante.rendaFamiliar] ?? estudante.rendaFamiliar}
        />
        <Campo
          label="Perfil empreendedor"
          valor={labelPerfil[estudante.perfilEmpreendedor] ?? estudante.perfilEmpreendedor}
        />
        <Campo
          label="Perfil DISC"
          valor={labelDisc[estudante.discPerfil] ?? estudante.discPerfil}
        />
        <Campo
          label="Área dominante"
          valor={`H ${estudante.areaQuizH} · E ${estudante.areaQuizE} · B ${estudante.areaQuizB}`}
        />
        <Campo
          label="Preocupações"
          valor={
            estudante.preocupacoes.length > 0
              ? estudante.preocupacoes
                  .map((p) => labelPreocupacao[p] ?? p)
                  .join(" · ")
              : "—"
          }
        />
        <Campo
          label="Data de nascimento"
          valor={estudante.dataNascimento.toLocaleDateString("pt-BR")}
        />
        <Campo label="CPF" valor="(armazenado como hash — não recuperável)" />
      </section>

      <AcoesEstudante estudante={{ id: estudante.id, ativo: estudante.ativo }} />

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.2rem" }}>Histórico</h2>
      {estudante.simulacoes.length === 0 ? (
        <p className="muted">Nenhuma simulação registrada.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
          {estudante.simulacoes.map((s) => (
            <li key={s.id} className="card">
              <strong>{s.trilha.titulo}</strong>{" "}
              <span className="muted" style={{ fontSize: "0.85rem" }}>
                — curso: {s.cursoSlug}
              </span>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                Iniciada em {s.iniciadaEm.toLocaleDateString("pt-BR")} •{" "}
                {s.concluidaEm
                  ? `Concluída em ${s.concluidaEm.toLocaleDateString("pt-BR")}`
                  : "Não concluída"}{" "}
                • {s.resultado ? `Match: ${s.resultado.pontuacao}%` : "Sem match"}{" "}
                {s.resultado?.compartilhado && "• compartilhada"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
        {label}
      </p>
      <p style={{ margin: 0 }}>{valor}</p>
    </div>
  );
}
