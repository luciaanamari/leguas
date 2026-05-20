"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  obterQuizCurso,
  type PerguntaAfinidade,
  type RespostaAfinidade,
} from "@/lib/data/quiz-afinidade";

interface Props {
  simulacaoId: string;
  trilhaSlug: string;
  areaSlug: string;
  cursoSlug: string;
  cursoNome: string;
  narrativaEstudante: string;
  narrativaProfissional: string;
}

type Fase =
  | "NARRATIVA_ALUNO"
  | "QUIZ_ALUNO"
  | "NARRATIVA_PROFISSIONAL"
  | "QUIZ_PROFISSIONAL"
  | "ENVIANDO";

const opcoesResposta: { value: RespostaAfinidade; label: string; cor: string }[] = [
  { value: "SIM", label: "Sim", cor: "#4caf78" },
  { value: "MAIS_OU_MENOS", label: "Mais ou menos", cor: "var(--color-accent)" },
  { value: "NAO", label: "Não", cor: "#e57f7f" },
];

export default function SimuladorCurso({
  simulacaoId,
  trilhaSlug,
  areaSlug,
  cursoSlug,
  cursoNome,
  narrativaEstudante,
  narrativaProfissional,
}: Props) {
  const router = useRouter();
  const todasPerguntas = useMemo(() => obterQuizCurso(cursoSlug), [cursoSlug]);
  const perguntasAluno = todasPerguntas.filter((p) => p.fase === "ALUNO");
  const perguntasProf = todasPerguntas.filter((p) => p.fase === "PROFISSIONAL");

  const [fase, setFase] = useState<Fase>("NARRATIVA_ALUNO");
  const [respostas, setRespostas] = useState<
    Record<number, RespostaAfinidade>
  >({});
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const perguntasAtuais =
    fase === "QUIZ_ALUNO" ? perguntasAluno : perguntasProf;
  const perguntaAtual: PerguntaAfinidade | undefined =
    fase === "QUIZ_ALUNO" || fase === "QUIZ_PROFISSIONAL"
      ? perguntasAtuais[perguntaIdx]
      : undefined;

  // Progresso geral
  const totalEtapas = 4;
  const etapaAtual =
    fase === "NARRATIVA_ALUNO"
      ? 1
      : fase === "QUIZ_ALUNO"
        ? 2
        : fase === "NARRATIVA_PROFISSIONAL"
          ? 3
          : 4;

  function responder(perguntaId: number, valor: RespostaAfinidade) {
    setRespostas((r) => ({ ...r, [perguntaId]: valor }));
  }

  function avancarDentroDoQuiz() {
    if (!perguntaAtual) return;
    if (!respostas[perguntaAtual.id]) {
      setErro("Escolha uma das opções para continuar.");
      return;
    }
    setErro(null);
    const ultimaDaFase = perguntaIdx === perguntasAtuais.length - 1;
    if (!ultimaDaFase) {
      setPerguntaIdx((i) => i + 1);
      return;
    }
    // Encerra a fase do quiz
    if (fase === "QUIZ_ALUNO") {
      setFase("NARRATIVA_PROFISSIONAL");
      setPerguntaIdx(0);
    } else {
      enviar();
    }
  }

  function voltarDentroDoQuiz() {
    if (perguntaIdx > 0) {
      setPerguntaIdx((i) => i - 1);
      return;
    }
    if (fase === "QUIZ_PROFISSIONAL") {
      setFase("NARRATIVA_PROFISSIONAL");
    } else if (fase === "QUIZ_ALUNO") {
      setFase("NARRATIVA_ALUNO");
    }
  }

  async function enviar() {
    setFase("ENVIANDO");
    setErro(null);
    const payload = {
      simulacaoId,
      respostas: todasPerguntas.map((p) => ({
        perguntaId: p.id,
        resposta: respostas[p.id]!,
      })),
    };
    try {
      const resp = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível calcular o resultado.");
        setFase("QUIZ_PROFISSIONAL");
        return;
      }
      router.push(
        `/trilhas/${trilhaSlug}/areas/${areaSlug}/${cursoSlug}/simulador/resultado?simulacao=${simulacaoId}`,
      );
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setFase("QUIZ_PROFISSIONAL");
    }
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {/* Progresso geral */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.82rem",
            marginBottom: "0.4rem",
          }}
        >
          <span className="muted">
            Etapa {etapaAtual} de {totalEtapas}
          </span>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
            {Math.round((etapaAtual / totalEtapas) * 100)}%
          </span>
        </div>
        <div
          aria-hidden
          style={{
            height: 6,
            borderRadius: 999,
            background: "var(--color-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(etapaAtual / totalEtapas) * 100}%`,
              background: "var(--color-accent)",
              transition: "width 300ms ease",
            }}
          />
        </div>
      </div>

      {/* ── Narrativa: um dia como aluno ─────────────────────────────── */}
      {fase === "NARRATIVA_ALUNO" && (
        <article className="card">
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              margin: 0,
            }}
          >
            ✦ Um dia como aluno
          </p>
          <h2 style={{ fontSize: "1.3rem", margin: "0.4rem 0 1rem" }}>
            Imagine que você está estudando {cursoNome}
          </h2>
          {narrativaEstudante.split(/\n+/).map((p, i) => (
            <p key={i} style={{ lineHeight: 1.7 }}>
              {p}
            </p>
          ))}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFase("QUIZ_ALUNO");
                setPerguntaIdx(0);
              }}
              style={{ minWidth: 220 }}
            >
              Responder pergunta sobre essa fase →
            </button>
          </div>
        </article>
      )}

      {/* ── Narrativa: um dia como profissional ──────────────────────── */}
      {fase === "NARRATIVA_PROFISSIONAL" && (
        <article className="card">
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              margin: 0,
            }}
          >
            ✦ Um dia como profissional
          </p>
          <h2 style={{ fontSize: "1.3rem", margin: "0.4rem 0 1rem" }}>
            Agora você está formado e trabalhando como {cursoNome}
          </h2>
          {narrativaProfissional.split(/\n+/).map((p, i) => (
            <p key={i} style={{ lineHeight: 1.7 }}>
              {p}
            </p>
          ))}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFase("QUIZ_PROFISSIONAL");
                setPerguntaIdx(0);
              }}
              style={{ minWidth: 220 }}
            >
              Responder perguntas finais →
            </button>
          </div>
        </article>
      )}

      {/* ── Quiz (aluno ou profissional) ─────────────────────────────── */}
      {(fase === "QUIZ_ALUNO" || fase === "QUIZ_PROFISSIONAL") &&
        perguntaAtual && (
          <article className="card">
            <p className="muted" style={{ fontSize: "0.82rem", margin: 0 }}>
              {fase === "QUIZ_ALUNO" ? "Sobre a fase de aluno" : "Sobre a fase profissional"}{" "}
              · Pergunta {perguntaIdx + 1} de {perguntasAtuais.length}
            </p>
            <h3 style={{ fontSize: "1.1rem", margin: "0.5rem 0 1.25rem", lineHeight: 1.5 }}>
              {perguntaAtual.texto}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {opcoesResposta.map((op) => {
                const isSelected = respostas[perguntaAtual.id] === op.value;
                return (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => responder(perguntaAtual.id, op.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.85rem 1rem",
                      border: `2px solid ${isSelected ? op.cor : "var(--color-border)"}`,
                      borderRadius: "0.5rem",
                      background: isSelected
                        ? "rgba(255,255,255,0.04)"
                        : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? op.cor : "var(--color-border)"}`,
                        background: isSelected ? op.cor : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#000",
                          }}
                        />
                      )}
                    </span>
                    <span
                      style={{
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? op.cor : "var(--color-text)",
                      }}
                    >
                      {op.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {erro && (
              <p className="error" style={{ marginTop: "1rem" }}>
                {erro}
              </p>
            )}

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={voltarDentroDoQuiz}
              >
                ← Voltar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={avancarDentroDoQuiz}
                style={{ minWidth: 180 }}
              >
                {fase === "QUIZ_PROFISSIONAL" &&
                perguntaIdx === perguntasAtuais.length - 1
                  ? "Ver meu resultado"
                  : "Próxima →"}
              </button>
            </div>
          </article>
        )}

      {/* ── Enviando ─────────────────────────────────────────────────── */}
      {fase === "ENVIANDO" && (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>
          <h2 style={{ margin: "0 0 0.5rem" }}>Calculando seu resultado…</h2>
          <p className="muted">Analisando suas respostas e cruzando com seu perfil.</p>
        </div>
      )}
    </div>
  );
}
