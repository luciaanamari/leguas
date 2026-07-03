import { describe, expect, it } from "vitest";
import type { DiscPerfil, Preocupacao } from "@prisma/client";
import { todasAsAreas } from "@/lib/data/cursos";
import { tituloDiscArea, descricaoPerfil, type DiscLetra, type AreaDiscSlug } from "@/lib/data/quiz-disc";
import { auditarTextoNeutro, assertTextoNeutro } from "@/lib/editorial/gender-neutral";
import { calcularMatch, type CalcularInput } from "@/lib/match/engine";
import { obterQuizCurso } from "@/lib/data/quiz-afinidade";

const TRILHAS = [
  { slug: "bacharelado-presencial", titulo: "Bacharelado Presencial", modalidade: "PRESENCIAL" },
  { slug: "bacharelado-ead", titulo: "Bacharelado EAD", modalidade: "EAD" },
  { slug: "tecnologo", titulo: "Tecnólogo", modalidade: "PRESENCIAL" },
  { slug: "curso-tecnico", titulo: "Curso Técnico", modalidade: "TECNICO" },
  { slug: "concurso-publico", titulo: "Concurso Público", modalidade: "CONCURSO" },
  { slug: "mercado-direto", titulo: "Mercado Direto", modalidade: "MERCADO" },
] as const;

const PERFIS_DISC: DiscPerfil[] = ["D", "I", "S", "C"];
const AREAS_QUIZ = [
  { h: 5, e: 2, b: 1 },
  { h: 2, e: 5, b: 1 },
  { h: 1, e: 2, b: 5 },
] as const;

const PREOCUPACOES: Preocupacao[][] = [
  [],
  ["SEM_DINHEIRO_FACULDADE"],
  ["PRECISO_TRABALHAR_LOGO"],
  ["NAO_PASSAR_NO_ENEM"],
  ["NAO_CONHECO_OPCOES"],
  ["MEDO_ESCOLHER_ERRADO"],
];

const CURSO_AMOSTRA = [
  "medicina",
  "engenharia-civil",
  "administracao",
  "analise-desenvolvimento",
  "tecnico-enfermagem",
  "direito",
  "danca",
  "agronomia",
] as const;

function cursoPorSlug(slug: string) {
  for (const area of todasAsAreas) {
    const curso = area.cursos.find((c) => c.slug === slug);
    if (curso) return { areaSlug: area.slug, slug: curso.slug, nome: curso.nome };
  }
  return null;
}

function respostasSim(cursoSlug: string) {
  return obterQuizCurso(cursoSlug).map((p) => ({
    perguntaId: p.id,
    resposta: "SIM" as const,
  }));
}

function textosResultado(r: ReturnType<typeof calcularMatch>): string[] {
  const tec = r.explicacao.tecnico;
  return [
    r.justificativa,
    r.proximoPasso,
    r.tituloDisc,
    ...r.contextoBlocos.map((b) => `${b.titulo} ${b.mensagem}`),
    tec.tituloOrientacao ?? "",
    tec.mensagemOrientacao ?? "",
  ].filter(Boolean);
}

describe("motor de match — sexo fora da entrada", () => {
  it("CalcularInput não inclui sexo", () => {
    const chaves = new Set(
      Object.keys({
        areaQuizH: 0,
        areaQuizE: 0,
        areaQuizB: 0,
        discPerfil: "D",
        rendaFamiliar: "ATE_1K",
        perfilEmpreendedor: "EQUILIBRIO",
        preocupacoes: [],
        anoCursando: "TERCEIRO",
        cursoTecnicoFeito: null,
        trilhaSlug: "",
        trilhaTitulo: "",
        trilhaModalidade: "",
        areaCursoSlug: "",
        cursoSlug: "",
        cursoNome: "",
        respostasAfinidade: [],
      } satisfies CalcularInput),
    );
    expect(chaves.has("sexo")).toBe(false);
  });
});

describe("motor de match — linguagem neutra", () => {
  it("tituloDiscArea e descricaoPerfil sem flexão de gênero", () => {
    const letras: DiscLetra[] = ["D", "I", "S", "C"];
    const areas: AreaDiscSlug[] = ["HUMANAS", "EXATAS", "BIOLOGICAS"];
    for (const l of letras) {
      for (const a of areas) {
        assertTextoNeutro(tituloDiscArea[l][a], `tituloDisc ${l}/${a}`);
      }
      const d = descricaoPerfil[l];
      assertTextoNeutro(d.rotulo, `rotulo ${l}`);
      assertTextoNeutro(d.resumo, `resumo ${l}`);
      assertTextoNeutro(d.cuidados, `cuidados ${l}`);
      for (const p of d.pontosFortes) assertTextoNeutro(p, `ponto forte ${l}`);
    }
  });

  it("varre trilhas × perfis × preocupações × amostra de cursos", () => {
    const amostra = CURSO_AMOSTRA.map((slug) => cursoPorSlug(slug)).filter(Boolean) as Array<{
      areaSlug: string;
      slug: string;
      nome: string;
    }>;
    expect(amostra.length).toBe(CURSO_AMOSTRA.length);

    const tecnicos = ["tec-enfermagem", "tec-informatica", null];
    let combinacoes = 0;

    for (const trilha of TRILHAS) {
      for (const areaQuiz of AREAS_QUIZ) {
        for (const disc of PERFIS_DISC) {
          for (const preoc of PREOCUPACOES) {
            for (const tecnico of tecnicos) {
              for (const curso of amostra) {
                const resultado = calcularMatch({
                  areaQuizH: areaQuiz.h,
                  areaQuizE: areaQuiz.e,
                  areaQuizB: areaQuiz.b,
                  discPerfil: disc,
                  rendaFamiliar: "ATE_1K",
                  perfilEmpreendedor: "EQUILIBRIO",
                  preocupacoes: preoc,
                  anoCursando: "TERCEIRO",
                  cursoTecnicoFeito: tecnico,
                  trilhaSlug: trilha.slug,
                  trilhaTitulo: trilha.titulo,
                  trilhaModalidade: trilha.modalidade,
                  areaCursoSlug: curso.areaSlug,
                  cursoSlug: curso.slug,
                  cursoNome: curso.nome,
                  respostasAfinidade: respostasSim(curso.slug),
                });

                for (const texto of textosResultado(resultado)) {
                  const violacoes = auditarTextoNeutro(texto);
                  expect(
                    violacoes,
                    `${trilha.slug}/${curso.slug}: ${violacoes[0]?.trecho}`,
                  ).toHaveLength(0);
                }
                combinacoes++;
              }
            }
          }
        }
      }
    }

    expect(combinacoes).toBeGreaterThan(500);
  });

  it("curso dança: feedback neutro com perfil variado", () => {
    const curso = cursoPorSlug("danca");
    expect(curso).toBeDefined();
    for (const disc of PERFIS_DISC) {
      const r = calcularMatch({
        areaQuizH: 4,
        areaQuizE: 1,
        areaQuizB: 3,
        discPerfil: disc,
        rendaFamiliar: "ATE_1K",
        perfilEmpreendedor: "EQUILIBRIO",
        preocupacoes: ["NAO_CONHECO_OPCOES"],
        anoCursando: "TERCEIRO",
        cursoTecnicoFeito: null,
        trilhaSlug: "bacharelado-presencial",
        trilhaTitulo: "Bacharelado Presencial",
        trilhaModalidade: "PRESENCIAL",
        areaCursoSlug: curso!.areaSlug,
        cursoSlug: "danca",
        cursoNome: curso!.nome,
        respostasAfinidade: respostasSim("danca"),
      });
      for (const texto of textosResultado(r)) {
        expect(auditarTextoNeutro(texto)).toHaveLength(0);
      }
    }
  });
});

describe("catálogo estático — narrativas", () => {
  it("narrativas de cursos sem tokens de gênero proibidos", () => {
    for (const area of todasAsAreas) {
      for (const curso of area.cursos) {
        for (const [rotulo, texto] of [
          ["estudante", curso.narrativaEstudante],
          ["profissional", curso.narrativaProfissional],
        ] as const) {
          const violacoes = auditarTextoNeutro(texto);
          expect(
            violacoes,
            `${area.slug}/${curso.slug} ${rotulo}: ${violacoes[0]?.trecho}`,
          ).toHaveLength(0);
        }
      }
    }
  });
});
