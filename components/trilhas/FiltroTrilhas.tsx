"use client";

import { useRouter } from "next/navigation";
import type { ModalidadeTrilha } from "@prisma/client";

type Props = {
  selecionada: ModalidadeTrilha | null;
};

const opcoes: { valor: ModalidadeTrilha; rotulo: string }[] = [
  { valor: "PRESENCIAL", rotulo: "Presencial" },
  { valor: "EAD", rotulo: "EAD" },
  { valor: "TECNICO", rotulo: "Técnico" },
  { valor: "CONCURSO", rotulo: "Concurso" },
  { valor: "MERCADO", rotulo: "Mercado" },
];

export default function FiltroTrilhas({ selecionada }: Props) {
  const router = useRouter();

  function selecionar(m: ModalidadeTrilha | null) {
    if (m) router.push(`/trilhas?modalidade=${m.toLowerCase()}`);
    else router.push(`/trilhas`);
  }

  return (
    <div
      role="group"
      aria-label="Filtrar trilhas por modalidade"
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
    >
      <button
        type="button"
        onClick={() => selecionar(null)}
        className={selecionada === null ? "btn btn-primary" : "btn btn-ghost"}
        style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
      >
        Todos
      </button>
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => selecionar(o.valor)}
          className={selecionada === o.valor ? "btn btn-primary" : "btn btn-ghost"}
          style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
          aria-pressed={selecionada === o.valor}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
