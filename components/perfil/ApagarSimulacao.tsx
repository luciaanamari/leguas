"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApagarSimulacao({ simulacaoId }: { simulacaoId: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [apagando, setApagando] = useState(false);

  async function apagar() {
    setApagando(true);
    try {
      await fetch(`/api/simulacoes/${simulacaoId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setApagando(false);
    }
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          fontSize: "0.82rem",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.3rem",
          transition: "color 0.15s",
        }}
        title="Apagar simulação"
      >
        🗑 Apagar
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>Confirmar?</span>
      <button
        type="button"
        onClick={apagar}
        disabled={apagando}
        style={{
          background: "#c0392b",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "0.82rem",
          padding: "0.3rem 0.7rem",
          borderRadius: "0.3rem",
          fontWeight: 700,
        }}
      >
        {apagando ? "Apagando…" : "Sim, apagar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        disabled={apagando}
        style={{
          background: "none",
          border: "1px solid var(--color-border)",
          cursor: "pointer",
          fontSize: "0.82rem",
          padding: "0.3rem 0.7rem",
          borderRadius: "0.3rem",
          color: "var(--color-text-muted)",
        }}
      >
        Não
      </button>
    </div>
  );
}
