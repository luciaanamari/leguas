"use client";

import { useState } from "react";

interface TabsCursoProps {
  narrativaEstudante: string;
  narrativaProfissional: string;
}

export default function TabsCurso({
  narrativaEstudante,
  narrativaProfissional,
}: TabsCursoProps) {
  const [aba, setAba] = useState<"estudante" | "profissional">("estudante");

  const baseTab: React.CSSProperties = {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "0.5rem 0.5rem 0 0",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.9rem",
    transition: "background 0.15s, color 0.15s",
  };

  const activeTab: React.CSSProperties = {
    ...baseTab,
    background: "var(--color-accent)",
    color: "var(--color-text-dark)",
  };

  const inactiveTab: React.CSSProperties = {
    ...baseTab,
    background: "var(--color-surface)",
    color: "var(--color-text-muted)",
  };

  const narrativa =
    aba === "estudante" ? narrativaEstudante : narrativaProfissional;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "-1px" }}>
        <button
          onClick={() => setAba("estudante")}
          style={aba === "estudante" ? activeTab : inactiveTab}
        >
          🎒 Dia como estudante
        </button>
        <button
          onClick={() => setAba("profissional")}
          style={aba === "profissional" ? activeTab : inactiveTab}
        >
          💼 Dia como profissional
        </button>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0 0.5rem 0.5rem 0.5rem",
          padding: "1.5rem",
          minHeight: 240,
        }}
      >
        {narrativa.split(/\n+/).map((par, i) => (
          <p
            key={i}
            style={{
              margin: i === 0 ? 0 : "1rem 0 0",
              lineHeight: 1.75,
              color: "var(--color-text)",
            }}
          >
            {par}
          </p>
        ))}
      </div>
    </div>
  );
}
