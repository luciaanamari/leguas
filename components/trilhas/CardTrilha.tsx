import Link from "next/link";
import type { ModalidadeTrilha } from "@prisma/client";

type Props = {
  slug: string;
  titulo: string;
  modalidade: ModalidadeTrilha;
  descricaoCurta: string;
};

const rotuloModalidade: Record<ModalidadeTrilha, string> = {
  PRESENCIAL: "Presencial",
  EAD: "EAD",
  TECNICO: "Técnico",
  CONCURSO: "Concurso",
  MERCADO: "Mercado",
};

export default function CardTrilha({ slug, titulo, modalidade, descricaoCurta }: Props) {
  return (
    <Link
      href={`/trilhas/${slug}`}
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 120ms ease, border-color 120ms ease",
      }}
    >
      <span
        style={{
          alignSelf: "flex-start",
          background: "var(--color-accent-soft)",
          color: "var(--color-text)",
          padding: "0.25rem 0.6rem",
          borderRadius: 999,
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {rotuloModalidade[modalidade]}
      </span>
      <h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--color-text)" }}>{titulo}</h2>
      <p className="muted" style={{ margin: 0 }}>
        {descricaoCurta}
      </p>
      <span style={{ color: "var(--color-accent-hover)", fontWeight: 700, marginTop: "auto" }}>
        Explorar →
      </span>
    </Link>
  );
}
