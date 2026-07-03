import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import EditarPerfilForm from "@/components/perfil/EditarPerfilForm";
import ApagarSimulacao from "@/components/perfil/ApagarSimulacao";
import FotoPerfil from "@/components/perfil/FotoPerfil";
import { urlAssinada } from "@/lib/storage";
import { tituloDiscArea, type DiscLetra } from "@/lib/data/quiz-disc";
import type { AreaDISC } from "@prisma/client";

const labelAnoEscolar: Record<string, string> = {
  PRIMEIRO: "1º ano",
  SEGUNDO: "2º ano",
  TERCEIRO: "3º ano",
};

const labelRenda: Record<string, string> = {
  ATE_1K: "Até R$ 1.000",
  DE_1K_A_2_5K: "R$ 1.000 a R$ 2.500",
  DE_2_5K_A_5K: "R$ 2.500 a R$ 5.000",
  ACIMA_5K: "Acima de R$ 5.000",
  PREFIRO_NAO_INFORMAR: "Prefere não informar",
};

const labelPerfil: Record<string, string> = {
  ESTAVEL: "Quero estabilidade",
  EQUILIBRIO: "Quero equilíbrio",
  EMPREENDEDOR: "Quero empreender",
  ALTO_RISCO: "Quero arriscar",
};

const labelPreocupacao: Record<string, string> = {
  SEM_DINHEIRO_FACULDADE: "Sem dinheiro para faculdade",
  PRECISO_TRABALHAR_LOGO: "Preciso trabalhar logo",
  NAO_PASSAR_NO_ENEM: "Medo de não passar no ENEM",
  MEDO_ESCOLHER_ERRADO: "Medo de escolher errado",
  NAO_CONHECO_OPCOES: "Não conheço bem as opções",
};

const labelArea: Record<string, string> = {
  HUMANAS: "Humanas",
  EXATAS: "Exatas",
  BIOLOGICAS: "Biológicas",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.15rem",
        padding: "0.65rem 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "0.95rem", color: "var(--color-text)" }}>{value}</span>
    </div>
  );
}

export default async function PerfilPage() {
  const sessao = await lerSessaoEstudante();
  if (!sessao) redirect("/entrar");

  const estudante = await prisma.estudante.findUnique({
    where: { id: sessao.sub },
    select: {
      nome: true,
      email: true,
      escolaNome: true,
      escolaAno: true,
      cursoTecnico: true,
      rendaFamiliar: true,
      perfilEmpreendedor: true,
      preocupacoes: true,
      discPerfil: true,
      areaQuizH: true,
      areaQuizE: true,
      areaQuizB: true,
      fotoPerfilKey: true,
      criadoEm: true,
    },
  });
  if (!estudante) redirect("/entrar");

  const fotoUrl = estudante.fotoPerfilKey
    ? await urlAssinada(estudante.fotoPerfilKey)
    : null;

  const areas = {
    HUMANAS: estudante.areaQuizH,
    EXATAS: estudante.areaQuizE,
    BIOLOGICAS: estudante.areaQuizB,
  } as const;
  const areaDominante = (Object.entries(areas) as ["HUMANAS" | "EXATAS" | "BIOLOGICAS", number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "HUMANAS";

  const tituloPerfil = tituloDiscArea[estudante.discPerfil as DiscLetra][areaDominante];

  const simulacoes = await prisma.simulacao.findMany({
    where: { estudanteId: sessao.sub },
    include: {
      trilha: { select: { slug: true, titulo: true } },
      resultado: { select: { pontuacao: true, proximoPasso: true } },
    },
    orderBy: { iniciadaEm: "desc" },
  });

  const perfis = await prisma.perfilEstudante.findMany({
    where: { estudanteId: sessao.sub },
    select: {
      id: true,
      discPerfil: true,
      areaQuizH: true,
      areaQuizE: true,
      areaQuizB: true,
      vigente: true,
      criadoEm: true,
    },
    orderBy: { criadoEm: "desc" },
  });

  function areaDominantePerfil(p: (typeof perfis)[number]): AreaDISC {
    const areas = {
      HUMANAS: p.areaQuizH,
      EXATAS: p.areaQuizE,
      BIOLOGICAS: p.areaQuizB,
    } as const;
    return (Object.entries(areas) as [AreaDISC, number][])
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "HUMANAS";
  }

  const concluidas = simulacoes.filter((s) => s.concluidaEm !== null);
  const emAndamento = simulacoes.filter((s) => s.concluidaEm === null);

  const corPontuacao = (n: number) =>
    n >= 80 ? "#4caf78" : n >= 60 ? "var(--color-accent)" : "#e2a45f";

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <Link href="/trilhas" className="muted" style={{ textDecoration: "none" }}>
        ← voltar para as trilhas
      </Link>

      {/* ── Profile info ─────────────────────────────────────────────── */}
      <section style={{ marginTop: "1.5rem", marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Meu perfil</h1>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Cadastrado em{" "}
            {new Date(estudante.criadoEm).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <FotoPerfil fotoUrl={fotoUrl} />
        </div>

        <div
          className="card"
          style={{
            background:
              "linear-gradient(135deg, rgba(226,172,64,0.18), rgba(226,172,64,0.05))",
            borderColor: "var(--color-accent)",
            marginBottom: "1rem",
          }}
        >
          <p
            className="muted"
            style={{
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            Seu perfil vocacional
          </p>
          <p style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0.25rem 0" }}>
            {tituloPerfil}
          </p>
          <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
            Área dominante: {labelArea[areaDominante]}
          </p>
          <Link
            href="/perfil/quiz"
            className="btn btn-secondary"
            style={{ marginTop: "1rem", fontSize: "0.88rem" }}
          >
            Refazer meu quiz
          </Link>
        </div>

        {perfis.length > 1 && (
          <div className="card" style={{ marginBottom: "1rem", padding: "1rem 1.25rem" }}>
            <h2 style={{ fontSize: "1rem", margin: "0 0 0.75rem" }}>Histórico do quiz</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
              {perfis.map((p) => {
                const area = areaDominantePerfil(p);
                const titulo = tituloDiscArea[p.discPerfil as DiscLetra][area];
                return (
                  <li
                    key={p.id}
                    style={{
                      fontSize: "0.88rem",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <strong>{titulo}</strong>
                    <span className="muted" style={{ marginLeft: "0.5rem" }}>
                      {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                      {p.vigente ? " · vigente" : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="card" style={{ padding: "0 1.25rem" }}>
          <InfoRow label="Nome" value={estudante.nome} />
          <InfoRow label="E-mail" value={estudante.email ?? "-"} />
          <InfoRow label="Escola" value={estudante.escolaNome} />
          <InfoRow
            label="Ano"
            value={labelAnoEscolar[estudante.escolaAno] ?? estudante.escolaAno}
          />
          <InfoRow
            label="Curso técnico"
            value={estudante.cursoTecnico ?? "Não informado"}
          />
          <InfoRow
            label="Renda familiar"
            value={labelRenda[estudante.rendaFamiliar] ?? estudante.rendaFamiliar}
          />
          <InfoRow
            label="O que quer para o futuro"
            value={labelPerfil[estudante.perfilEmpreendedor] ?? estudante.perfilEmpreendedor}
          />
          <InfoRow
            label="Preocupações"
            value={
              estudante.preocupacoes.length > 0
                ? estudante.preocupacoes
                    .map((p) => labelPreocupacao[p] ?? p)
                    .join(" · ")
                : "Nenhuma"
            }
          />
        </div>

        <EditarPerfilForm
          estudante={{
            nome: estudante.nome,
            escolaNome: estudante.escolaNome,
            escolaAno: estudante.escolaAno,
            cursoTecnico: estudante.cursoTecnico,
          }}
        />
      </section>

      {/* ── Simulations ──────────────────────────────────────────────── */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
            Simulações concluídas
            {concluidas.length > 0 && (
              <span
                style={{
                  marginLeft: "0.5rem",
                  fontSize: "0.82rem",
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                {concluidas.length}
              </span>
            )}
          </h2>
          <Link href="/trilhas" className="btn btn-primary" style={{ fontSize: "0.88rem" }}>
            + Nova simulação
          </Link>
        </div>

        {concluidas.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ margin: "0 0 1rem", color: "var(--color-text-muted)" }}>
              Você ainda não concluiu nenhuma simulação.
            </p>
            <Link href="/trilhas" className="btn btn-primary">
              Ver trilhas
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
            {concluidas.map((s) => (
              <li key={s.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "1rem", margin: "0 0 0.25rem" }}>
                      {s.trilha.titulo}
                    </h3>
                    {s.resultado ? (
                      <>
                        <p style={{ margin: "0 0 0.35rem" }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              color: corPontuacao(s.resultado.pontuacao),
                            }}
                          >
                            {s.resultado.pontuacao}%
                          </span>{" "}
                          <span className="muted" style={{ fontSize: "0.85rem" }}>
                            de compatibilidade
                          </span>
                        </p>
                        <p
                          className="muted"
                          style={{
                            margin: 0,
                            fontSize: "0.83rem",
                            lineHeight: 1.5,
                            maxWidth: 480,
                          }}
                        >
                          {s.resultado.proximoPasso.slice(0, 120)}
                          {s.resultado.proximoPasso.length > 120 ? "…" : ""}
                        </p>
                      </>
                    ) : (
                      <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                        Resultado não gerado
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.5rem",
                    }}
                  >
                    <Link
                      href={`/trilhas/${s.trilha.slug}`}
                      className="btn btn-ghost"
                      style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
                    >
                      Ver trilha
                    </Link>
                    <ApagarSimulacao simulacaoId={s.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Incomplete simulations */}
        {emAndamento.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                margin: "0 0 0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              Simulações não concluídas ({emAndamento.length})
            </h3>
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}
            >
              {emAndamento.map((s) => (
                <li
                  key={s.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.65rem 1rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                    {s.trilha.titulo}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Link
                      href={`/trilhas/${s.trilha.slug}`}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.82rem" }}
                    >
                      Continuar
                    </Link>
                    <ApagarSimulacao simulacaoId={s.id} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
