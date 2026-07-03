"use client";

import { useState } from "react";

export default function BotaoCopiar({
  valor,
  titulo = "Copiar",
}: {
  valor: string;
  titulo?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // silencioso
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title={copiado ? "Copiado!" : titulo}
      aria-label={copiado ? "Copiado" : titulo}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 2,
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "middle",
        color: copiado ? "var(--color-success)" : "var(--color-text-muted)",
      }}
    >
      {copiado ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
