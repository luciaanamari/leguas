"use client";

import { useState } from "react";
import { perguntasDisc } from "@/lib/data/quiz-disc";

export type OpcaoDiscId = "A" | "B" | "C" | "D";
export type RespostasDiscMap = Record<number, OpcaoDiscId | undefined>;

type Props = {
  respostas: RespostasDiscMap;
  onChange: (respostas: RespostasDiscMap) => void;
  erro?: string | null;
  titulo?: string;
  subtitulo?: string;
};

export function contarRespostasDisc(respostas: RespostasDiscMap): number {
  return perguntasDisc.filter((p) => respostas[p.id] != null).length;
}

export function quizDiscCompleto(respostas: RespostasDiscMap): boolean {
  return contarRespostasDisc(respostas) === perguntasDisc.length;
}

export function serializarRespostasDisc(respostas: RespostasDiscMap) {
  return perguntasDisc.map((p) => ({
    perguntaId: p.id,
    opcaoId: respostas[p.id]!,
  }));
}

export default function QuizDisc({
  respostas,
  onChange,
  erro,
  titulo = "Quiz vocacional",
  subtitulo = "Não existe resposta certa. Escolha o que mais combina com você.",
}: Props) {
  const [perguntaDiscIdx, setPerguntaDiscIdx] = useState(0);
  const perguntaDiscAtual = perguntasDisc[perguntaDiscIdx];
  const totalDisc = perguntasDisc.length;
  const respondidasDisc = contarRespostasDisc(respostas);

  function responderDisc(perguntaId: number, opcaoId: OpcaoDiscId) {
    onChange({ ...respostas, [perguntaId]: opcaoId });
    setTimeout(() => {
      setPerguntaDiscIdx((idx) => (idx < perguntasDisc.length - 1 ? idx + 1 : idx));
    }, 200);
  }

  if (!perguntaDiscAtual) return null;

  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        {titulo}
      </legend>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        {subtitulo}
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.82rem",
            marginBottom: "0.4rem",
          }}
        >
          <span className="muted">
            Pergunta {perguntaDiscIdx + 1} de {totalDisc}
          </span>
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
            {respondidasDisc}/{totalDisc} respondidas
          </span>
        </div>
        <div
          aria-hidden
          style={{
            height: 4,
            borderRadius: 999,
            background: "var(--color-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((perguntaDiscIdx + 1) / totalDisc) * 100}%`,
              background: "var(--color-accent)",
              transition: "width 250ms ease",
            }}
          />
        </div>
      </div>

      <h3 style={{ fontSize: "1.05rem", margin: "0 0 1rem" }}>{perguntaDiscAtual.texto}</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {perguntaDiscAtual.opcoes.map((opcao) => {
          const isSelected = respostas[perguntaDiscAtual.id] === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => responderDisc(perguntaDiscAtual.id, opcao.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.7rem",
                padding: "0.85rem 1rem",
                border: `2px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                borderRadius: "0.5rem",
                background: isSelected ? "rgba(226,172,64,0.12)" : "transparent",
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
                  border: `2px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                  background: isSelected ? "var(--color-accent)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                {isSelected && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--color-text)",
                      display: "block",
                    }}
                  />
                )}
              </span>
              <span style={{ lineHeight: 1.5, fontSize: "0.95rem" }}>{opcao.texto}</span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPerguntaDiscIdx((i) => Math.max(0, i - 1))}
          disabled={perguntaDiscIdx === 0}
        >
          ← Anterior
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setPerguntaDiscIdx((i) => Math.min(totalDisc - 1, i + 1))}
          disabled={perguntaDiscIdx >= totalDisc - 1}
        >
          Próxima →
        </button>
      </div>

      {erro && (
        <p className="error" style={{ marginTop: "1rem" }}>
          {erro}
        </p>
      )}
    </fieldset>
  );
}
