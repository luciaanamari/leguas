"use client";

import { useRouter } from "next/navigation";

export type GrupoTrilha = "superior" | "tecnico" | "concurso" | "mercado";

type Props = {
  selecionado: GrupoTrilha | null;
};

const opcoes: { valor: GrupoTrilha; rotulo: string }[] = [
  { valor: "superior", rotulo: "Ensino Superior" },
  { valor: "tecnico", rotulo: "Técnico" },
  { valor: "concurso", rotulo: "Concurso Público" },
  { valor: "mercado", rotulo: "Mercado Direto" },
];

export default function FiltroTrilhas({ selecionado }: Props) {
  const router = useRouter();

  function selecionar(g: GrupoTrilha | null) {
    if (g) router.push(`/trilhas?grupo=${g}`);
    else router.push(`/trilhas`);
  }

  return (
    <div
      role="group"
      aria-label="Filtrar trilhas por grupo"
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
    >
      <button
        type="button"
        onClick={() => selecionar(null)}
        className={selecionado === null ? "btn btn-primary" : "btn btn-ghost"}
        style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
      >
        Todos
      </button>
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => selecionar(o.valor)}
          className={selecionado === o.valor ? "btn btn-primary" : "btn btn-ghost"}
          style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
          aria-pressed={selecionado === o.valor}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
