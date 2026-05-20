import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { buscarArea, buscarCurso } from "@/lib/data/cursos";
import CompartilharResultado from "@/components/simulador/CompartilharResultado";
import ComoFoiCalculado from "@/components/simulador/ComoFoiCalculado";
import type { BlocoContexto, ExplicacaoMatch } from "@/lib/match/engine";

type Params = Promise<{ slug: string; areaSlug: string; cursoSlug: string }>;
type SearchParams = Promise<{ simulacao?: string }>;

const corBlocoFundo: Record<BlocoContexto["tipo"], string> = {
  verde: "rgba(76, 175, 120, 0.12)",
  azul: "rgba(96, 165, 250, 0.12)",
  cinza: "rgba(139, 154, 176, 0.12)",
};
const corBlocoBorda: Record<BlocoContexto["tipo"], string> = {
  verde: "#4caf78",
  azul: "#60a5fa",
  cinza: "#8b9ab0",
};
const iconeBloco: Record<BlocoContexto["tipo"], string> = {
  verde: "✅",
  azul: "🗺️",
  cinza: "💡",
};
const rotuloBloco: Record<BlocoContexto["tipo"], string> = {
  verde: "Oportunidade",
  azul: "Orientação",
  cinza: "Ponto neutro",
};

export default async function ResultadoCursoPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug, areaSlug, cursoSlug } = await params;
  const { simulacao: simulacaoId } = await searchParams;
  if (!simulacaoId) notFound();

  const sessao = await lerSessaoEstudante();
  if (!sessao) redirect("/entrar");

  const simulacao = await prisma.simulacao.findUnique({
    where: { id: simulacaoId },
    include: {
      trilha: true,
      resultado: true,
      estudante: {
        select: {
          rendaFamiliar: true,
          perfilEmpreendedor: true,
          preocupacoes: true,
          escolaAno: true,
        },
      },
    },
  });
  if (
    !simulacao ||
    simulacao.estudanteId !== sessao.sub ||
    simulacao.trilha.slug !== slug ||
    simulacao.areaSlug !== areaSlug ||
    simulacao.cursoSlug !== cursoSlug
  ) {
    notFound();
  }
  if (!simulacao.resultado) {
    redirect(`/trilhas/${slug}/areas/${areaSlug}/${cursoSlug}/simulador`);
  }

  await prisma.eventoEngajamento.create({
    data: {
      estudanteId: sessao.sub,
      tipoEvento: "RESULTADO_VISUALIZADO",
      payload: { resultadoId: simulacao.resultado.id, slug, cursoSlug },
    },
  });

  const {
    pontuacao,
    pontuacaoArea,
    pontuacaoCurso,
    faixa,
    tituloDisc,
    justificativa,
    proximoPasso,
    contextoBlocos,
  } = simulacao.resultado;

  const area = buscarArea(areaSlug);
  const curso = buscarCurso(areaSlug, cursoSlug);

  const corBarra =
    faixa === "ALTA"
      ? "#4caf78"
      : faixa === "MEDIA"
        ? "var(--color-accent)"
        : "#e57f7f";
  const rotuloFaixa =
    faixa === "ALTA"
      ? "Alta compatibilidade"
      : faixa === "MEDIA"
        ? "Compatibilidade parcial"
        : "Baixa compatibilidade";

  const blocos = (contextoBlocos as unknown as BlocoContexto[]) ?? [];
  const explicacao = simulacao.resultado.explicacao as unknown as ExplicacaoMatch;

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <Link
        href={`/trilhas/${slug}/areas/${areaSlug}`}
        className="muted"
        style={{ textDecoration: "none" }}
      >
        ← voltar para {area?.nome ?? "área"}
      </Link>

      {/* Score */}
      <section
        style={{ textAlign: "center", marginTop: "1.5rem", marginBottom: "2rem" }}
      >
        <p
          style={{
            color: "var(--color-accent-hover)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontSize: "0.8rem",
          }}
        >
          Seu índice de compatibilidade com {curso?.nome ?? cursoSlug}
        </p>
        <div
          style={{
            fontSize: "4.5rem",
            fontWeight: 800,
            lineHeight: 1,
            marginTop: "0.5rem",
            color: corBarra,
          }}
        >
          {pontuacao}
          <span style={{ fontSize: "1.5rem", color: "var(--color-text-muted)" }}>
            %
          </span>
        </div>
        <p
          style={{
            margin: "0.25rem 0 1rem",
            fontWeight: 700,
            color: corBarra,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontSize: "0.85rem",
          }}
        >
          {rotuloFaixa}
        </p>
        <div
          aria-hidden
          style={{
            height: 10,
            borderRadius: 999,
            background: "var(--color-border)",
            overflow: "hidden",
            maxWidth: 360,
            marginInline: "auto",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pontuacao}%`,
              background: corBarra,
              transition: "width 600ms ease",
            }}
          />
        </div>

        {/* Breakdown 60/40 */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            fontSize: "0.82rem",
            color: "var(--color-text-muted)",
          }}
        >
          <span>
            Afinidade de área:{" "}
            <strong style={{ color: "var(--color-text)" }}>{pontuacaoArea}/60</strong>
          </span>
          <span>
            Identificação com a simulação:{" "}
            <strong style={{ color: "var(--color-text)" }}>{pontuacaoCurso}/40</strong>
          </span>
        </div>
      </section>

      {/* Titulo DISC × Area + justificativa */}
      <section
        className="card"
        style={{
          marginBottom: "1.25rem",
          borderColor: "var(--color-accent)",
          borderWidth: 2,
          background:
            "linear-gradient(135deg, rgba(226,172,64,0.10), rgba(226,172,64,0.02))",
        }}
      >
        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
            color: "var(--color-accent)",
          }}
        >
          ✦ O que seu perfil mostra
        </p>
        <p style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0.4rem 0" }}>
          {tituloDisc.charAt(0).toUpperCase() + tituloDisc.slice(1)}
        </p>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{justificativa}</p>
      </section>

      {/* Proximo passo */}
      <section className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", marginTop: 0, marginBottom: "0.6rem" }}>
          Seu próximo passo concreto
        </h2>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{proximoPasso}</p>
      </section>

      {/* Orientacao tecnico × curso simulado */}
      {explicacao?.tecnico?.tituloOrientacao &&
        explicacao?.tecnico?.mensagemOrientacao && (
          <section
            style={{
              marginBottom: "1.5rem",
              padding: "1rem 1.25rem",
              border: "1px solid var(--color-accent)",
              borderLeftWidth: 4,
              background:
                "linear-gradient(135deg, rgba(226,172,64,0.10), rgba(226,172,64,0.02))",
              borderRadius: "0.5rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              🔗 Seu curso técnico e essa carreira
            </p>
            <p style={{ margin: "0.4rem 0 0.5rem", fontWeight: 700, lineHeight: 1.45 }}>
              {explicacao.tecnico.tituloOrientacao}
            </p>
            <p style={{ margin: 0, lineHeight: 1.65, fontSize: "0.95rem" }}>
              {explicacao.tecnico.mensagemOrientacao}
            </p>
          </section>
        )}

      {/* Blocos de contexto */}
      {blocos.length > 0 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", margin: "0 0 0.75rem" }}>
            O que mais considerar
          </h2>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {blocos.map((b, i) => (
              <div
                key={i}
                style={{
                  padding: "0.85rem 1rem",
                  border: `1px solid ${corBlocoBorda[b.tipo]}`,
                  borderLeftWidth: 4,
                  background: corBlocoFundo[b.tipo],
                  borderRadius: "0.4rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: corBlocoBorda[b.tipo],
                  }}
                >
                  {iconeBloco[b.tipo]} {rotuloBloco[b.tipo]}
                </p>
                <p style={{ margin: "0.25rem 0 0.35rem", fontWeight: 700 }}>
                  {b.titulo}
                </p>
                <p
                  style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}
                  className="muted"
                >
                  {b.mensagem}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Como foi calculado */}
      {explicacao && (
        <ComoFoiCalculado
          explicacao={explicacao}
          pontuacao={pontuacao}
          pontuacaoArea={pontuacaoArea}
          pontuacaoCurso={pontuacaoCurso}
          cursoNome={curso?.nome ?? cursoSlug}
          perfilEmpreendedor={simulacao.estudante.perfilEmpreendedor}
          rendaFamiliar={simulacao.estudante.rendaFamiliar}
          preocupacoes={simulacao.estudante.preocupacoes}
          anoEscolar={simulacao.estudante.escolaAno}
          trilhaTitulo={simulacao.trilha.titulo}
        />
      )}

      {/* Acoes */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href={`/trilhas/${slug}/areas/${areaSlug}`}
          className="btn btn-ghost"
        >
          Ver outros cursos de {area?.nome ?? "área"}
        </Link>
        <Link href="/trilhas" className="btn btn-ghost">
          Simular outra trilha
        </Link>
        <CompartilharResultado
          resultadoId={simulacao.resultado.id}
          titulo={curso?.nome ?? cursoSlug}
          pontuacao={pontuacao}
          proximoPasso={proximoPasso}
        />
      </div>
    </div>
  );
}
