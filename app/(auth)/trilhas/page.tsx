import Link from "next/link";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import CardTrilha from "@/components/trilhas/CardTrilha";
import FiltroTrilhas, { type GrupoTrilha } from "@/components/trilhas/FiltroTrilhas";
import type { ModalidadeTrilha } from "@prisma/client";

type SearchParams = Promise<{ grupo?: string }>;

// Cada filtro da UI vira uma lista de modalidades que vamos buscar no banco.
const gruposParaModalidades: Record<GrupoTrilha, ModalidadeTrilha[]> = {
  superior: ["PRESENCIAL", "EAD"],
  tecnico: ["TECNICO"],
  concurso: ["CONCURSO"],
  mercado: ["MERCADO"],
};

function ehGrupoValido(v: string): v is GrupoTrilha {
  return v === "superior" || v === "tecnico" || v === "concurso" || v === "mercado";
}

export default async function TrilhasPage({ searchParams }: { searchParams: SearchParams }) {
  const sessao = await lerSessaoEstudante();
  const sp = await searchParams;
  const filtroParam = sp.grupo ?? null;
  const filtro = filtroParam && ehGrupoValido(filtroParam) ? filtroParam : null;

  const modalidadesAlvo = filtro ? gruposParaModalidades[filtro] : null;

  const [estudante, trilhas] = await Promise.all([
    sessao
      ? prisma.estudante.findUnique({ where: { id: sessao.sub }, select: { nome: true } })
      : null,
    prisma.trilha.findMany({
      where: {
        ativo: true,
        ...(modalidadesAlvo ? { modalidade: { in: modalidadesAlvo } } : {}),
      },
      orderBy: { ordem: "asc" },
    }),
  ]);

  const primeiroNome = estudante?.nome.split(" ")[0] ?? "estudante";

  return (
    <div className="container">
      <section style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "var(--color-accent-hover)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.8rem",
              }}
            >
              Bem-vindo(a), {primeiroNome}
            </p>
            <h1 style={{ fontSize: "1.75rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
              Esses são os caminhos depois do ensino médio
            </h1>
            <p className="muted">
              Cada card é uma porta. Clique para entender o caminho e, depois, simule como seria sua
              vida ali.
            </p>
          </div>

          <Link
            href="/perfil"
            className="btn btn-secondary"
            style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: "1.75rem" }}
          >
            Meu perfil
          </Link>
        </div>
      </section>

      <FiltroTrilhas selecionado={filtro} />

      {trilhas.length === 0 ? (
        <p className="muted">Nenhuma trilha encontrada para o filtro selecionado.</p>
      ) : (
        <div className="grid-cards" style={{ marginTop: "1.5rem" }}>
          {trilhas.map((t) => (
            <CardTrilha
              key={t.id}
              slug={t.slug}
              titulo={t.titulo}
              modalidade={t.modalidade}
              descricaoCurta={t.descricaoCurta}
            />
          ))}
        </div>
      )}
    </div>
  );
}
