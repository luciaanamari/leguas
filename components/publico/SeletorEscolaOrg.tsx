"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type EscolaOpcao = {
  nome: string;
  municipio: string | null;
  slug: string;
  cadastroAberto: boolean;
};

export default function SeletorEscolaOrg({ escolas }: { escolas: EscolaOpcao[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return escolas;
    return escolas.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) ||
        (e.municipio ?? "").toLowerCase().includes(q),
    );
  }, [busca, escolas]);

  if (escolas.length === 0) {
    return <p className="muted">Nenhuma escola disponível no momento.</p>;
  }

  return (
    <div>
      <label className="label" htmlFor="busca-escola">
        Encontre a sua escola
      </label>
      <input
        id="busca-escola"
        className="input"
        placeholder="Buscar por nome ou município"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "1rem 0 0",
          display: "grid",
          gap: "0.6rem",
        }}
      >
        {filtradas.map((e) => (
          <li key={e.slug}>
            <button
              type="button"
              onClick={() => router.push(`/e/${e.slug}`)}
              className="card"
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
                background: "var(--color-surface)",
              }}
            >
              <span>
                <strong style={{ display: "block" }}>{e.nome}</strong>
                {e.municipio && (
                  <span className="muted" style={{ fontSize: "0.85rem" }}>
                    {e.municipio}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                style={{ color: "var(--color-accent)", fontWeight: 700 }}
              >
                →
              </span>
            </button>
          </li>
        ))}
        {filtradas.length === 0 && (
          <li className="muted">Nenhuma escola encontrada para “{busca}”.</li>
        )}
      </ul>
    </div>
  );
}
