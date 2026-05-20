import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import { buscarArea, buscarCurso } from "@/lib/data/cursos";
import SimuladorCurso from "@/components/simulador/SimuladorCurso";

type Params = Promise<{ slug: string; areaSlug: string; cursoSlug: string }>;

export default async function SimuladorCursoPage({
  params,
}: {
  params: Params;
}) {
  const { slug, areaSlug, cursoSlug } = await params;
  const sessao = await lerSessaoEstudante();
  if (!sessao) redirect("/entrar");

  const [trilha, curso, area] = await Promise.all([
    prisma.trilha.findUnique({ where: { slug } }),
    Promise.resolve(buscarCurso(areaSlug, cursoSlug)),
    Promise.resolve(buscarArea(areaSlug)),
  ]);
  if (!trilha || !trilha.ativo || !curso || !area) notFound();

  const simulacao = await prisma.simulacao.create({
    data: {
      estudanteId: sessao.sub,
      trilhaId: trilha.id,
      areaSlug,
      cursoSlug,
      narrativaAluno: curso.narrativaEstudante,
      narrativaProfissional: curso.narrativaProfissional,
    },
  });

  await prisma.eventoEngajamento.create({
    data: {
      estudanteId: sessao.sub,
      tipoEvento: "SIMULACAO_INICIADA",
      payload: { simulacaoId: simulacao.id, slug, areaSlug, cursoSlug },
    },
  });

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <Link
        href={`/trilhas/${slug}/areas/${areaSlug}/${cursoSlug}`}
        className="muted"
        style={{ textDecoration: "none" }}
      >
        ← voltar para {curso.nome}
      </Link>

      <header style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
        <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
          {trilha.titulo} · {area.nome}
        </p>
        <h1 style={{ fontSize: "1.6rem", margin: "0.25rem 0 0.5rem" }}>
          Simulando {curso.nome}
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          Você vai viver dois cenários (aluno e profissional) e responder algumas
          perguntas. Não existe resposta certa.
        </p>
      </header>

      <SimuladorCurso
        simulacaoId={simulacao.id}
        trilhaSlug={slug}
        areaSlug={areaSlug}
        cursoSlug={cursoSlug}
        cursoNome={curso.nome}
        narrativaEstudante={curso.narrativaEstudante}
        narrativaProfissional={curso.narrativaProfissional}
      />
    </div>
  );
}
