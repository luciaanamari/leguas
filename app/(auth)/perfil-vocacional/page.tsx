import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import {
  tituloDiscArea,
  nomesArea,
  descricaoPerfil,
  descricaoArea,
  type AreaDiscSlug,
  type DiscLetra,
} from "@/lib/data/quiz-disc";
import { buscarCursoTecnico } from "@/lib/data/cursos-tecnicos";

const totalDiscPerguntas = 8;

export default async function PerfilVocacionalPage() {
  const sessao = await lerSessaoEstudante();
  if (!sessao) redirect("/entrar");

  const estudante = await prisma.estudante.findUnique({
    where: { id: sessao.sub },
    select: {
      nome: true,
      discPerfil: true,
      areaQuizH: true,
      areaQuizE: true,
      areaQuizB: true,
      cursoTecnico: true,
    },
  });
  if (!estudante) redirect("/entrar");

  const areas: Record<AreaDiscSlug, number> = {
    HUMANAS: estudante.areaQuizH,
    EXATAS: estudante.areaQuizE,
    BIOLOGICAS: estudante.areaQuizB,
  };
  const ordem: AreaDiscSlug[] = ["HUMANAS", "EXATAS", "BIOLOGICAS"];
  const areaDominante = ordem.reduce(
    (acc, a) => (areas[a] > areas[acc] ? a : acc),
    "HUMANAS" as AreaDiscSlug,
  );

  const discLetra = estudante.discPerfil as DiscLetra;
  const titulo = tituloDiscArea[discLetra][areaDominante];
  const descPerfil = descricaoPerfil[discLetra];
  const descArea = descricaoArea[areaDominante];
  const tec = estudante.cursoTecnico
    ? buscarCursoTecnico(estudante.cursoTecnico)
    : null;

  const primeiroNome = estudante.nome.split(" ")[0];

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p
          style={{
            color: "var(--color-accent-hover)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontSize: "0.78rem",
            margin: 0,
          }}
        >
          ✦ Seu perfil vocacional
        </p>
        <h1 style={{ fontSize: "1.8rem", margin: "0.4rem 0 0.25rem" }}>
          {primeiroNome}, {titulo}.
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          Esse é o retrato que o quiz vocacional desenhou de você.
        </p>
      </header>

      {/* ── Card principal: perfil DISC ──────────────────────────────── */}
      <section
        className="card"
        style={{
          borderColor: "var(--color-accent)",
          borderWidth: 2,
          background:
            "linear-gradient(135deg, rgba(226,172,64,0.18), rgba(226,172,64,0.04))",
          marginBottom: "1.25rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>
          {descPerfil.rotulo}
        </h2>
        <p style={{ margin: "0 0 1rem", lineHeight: 1.7 }}>{descPerfil.resumo}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {descPerfil.pontosFortes.map((p) => (
            <span
              key={p}
              style={{
                padding: "0.3rem 0.7rem",
                background: "var(--color-background)",
                border: "1px solid var(--color-border)",
                borderRadius: 999,
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {p}
            </span>
          ))}
        </div>
        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: "0.88rem",
            lineHeight: 1.6,
            borderTop: "1px solid var(--color-border)",
            paddingTop: "0.75rem",
          }}
        >
          <strong style={{ color: "var(--color-text)" }}>Atenção:</strong>{" "}
          {descPerfil.cuidados}
        </p>
      </section>

      {/* ── Card area dominante ──────────────────────────────────────── */}
      <section className="card" style={{ marginBottom: "1.25rem" }}>
        <p
          className="muted"
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          Sua área dominante
        </p>
        <h3 style={{ fontSize: "1.2rem", margin: "0.25rem 0 0.5rem" }}>
          {nomesArea[areaDominante]}
        </h3>
        <p style={{ margin: "0 0 1rem", lineHeight: 1.6 }}>{descArea}</p>

        {/* Barras H/E/B */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {ordem.map((a) => {
            const pct = Math.round((areas[a] / totalDiscPerguntas) * 100);
            const isDominante = a === areaDominante;
            return (
              <div key={a}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                    marginBottom: "0.2rem",
                  }}
                >
                  <span style={{ fontWeight: isDominante ? 700 : 500 }}>
                    {nomesArea[a]}
                  </span>
                  <span className="muted">
                    {areas[a]} de {totalDiscPerguntas} respostas ({pct}%)
                  </span>
                </div>
                <div
                  aria-hidden
                  style={{
                    height: 8,
                    background: "var(--color-border)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: isDominante
                        ? "var(--color-accent)"
                        : "var(--color-text-muted)",
                      transition: "width 600ms ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Curso tecnico (se houver) ────────────────────────────────── */}
      {tec && (
        <section
          className="card"
          style={{
            marginBottom: "1.25rem",
            background: "rgba(76, 175, 120, 0.10)",
            borderColor: "#4caf78",
            borderLeftWidth: 4,
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#4caf78",
              margin: 0,
            }}
          >
            ✅ Você já tem um curso técnico
          </p>
          <p style={{ margin: "0.35rem 0 0.5rem", fontWeight: 700 }}>{tec.nome}</p>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>
            Quando você simular carreiras relacionadas, esse curso conta como
            reforço de compatibilidade. Tente simular cursos como{" "}
            {tec.cursosRelacionados.slice(0, 3).join(", ") || "as carreiras da sua área"}.
          </p>
        </section>
      )}

      {/* ── Aviso metodologico ───────────────────────────────────────── */}
      <section
        style={{
          padding: "0.85rem 1rem",
          border: "1px dashed var(--color-border)",
          borderRadius: "0.4rem",
          marginBottom: "1.5rem",
          fontSize: "0.83rem",
          lineHeight: 1.5,
        }}
        className="muted"
      >
        Esse perfil é um <strong>ponto de partida</strong>, não um diagnóstico
        definitivo. Ele te ajuda a olhar com mais clareza para carreiras que
        combinam com seu jeito - mas você pode crescer em qualquer caminho que
        escolher de verdade.
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/trilhas"
          className="btn btn-primary"
          style={{ minWidth: 220, textAlign: "center" }}
        >
          Explorar trilhas →
        </Link>
        <Link
          href="/perfil"
          className="btn btn-ghost"
          style={{ minWidth: 180, textAlign: "center" }}
        >
          Ver meu cadastro
        </Link>
      </div>
    </div>
  );
}
