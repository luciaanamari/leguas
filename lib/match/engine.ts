// Motor de match - Secao 4 do documento "Piaui para o Mundo"
//
// Resultado final dividido em dois blocos:
// Bloco 1 (Compatibilidade real, 0-100%):
//   - 60% afinidade de area (quiz DISC do cadastro: areaH/E/B + curso)
//   - 40% identificacao com a simulacao (3 perguntas do quiz por curso)
//   + bonus pelo curso tecnico do aluno quando ha correlacao com o curso simulado
//     (DIRETA = +10, AREA = +4, NENHUMA = 0) - bonus entra na parte de area.
// Bloco 2 (Analise de contexto, sem impacto na nota):
//   - Cruza renda, perfil empreendedor, preocupacoes, ano escolar, curso tecnico
//     com a trilha simulada e gera blocos verde/azul/cinza.

import type {
  AreaDISC,
  DiscPerfil,
  RendaFamiliar,
  PerfilEmpreendedor,
  Preocupacao,
  AnoEscolar,
  FaixaResultado,
} from "@prisma/client";
import {
  tituloDiscArea,
  nomesArea,
  type AreaDiscSlug,
  type DiscLetra,
} from "@/lib/data/quiz-disc";
import { calcularAfinidadeCurso, obterQuizCurso } from "@/lib/data/quiz-afinidade";
import type { RespostaAfinidadePergunta } from "@/lib/data/quiz-afinidade";
import {
  classificarCorrelacao,
  bonusCorrelacao,
  buscarCursoTecnico,
  type CorrelacaoTecnico,
} from "@/lib/data/cursos-tecnicos";
import {
  escolherMensagemTransversal,
  nomesTag,
  type TagAplicacao,
  type FamiliaHabilitador,
} from "@/lib/data/correlacao-tecnico";

// Mapa do slug da area do JSON de cursos (cursos-N.json) para a area DISC.
const areaCursoParaDisc: Record<string, AreaDiscSlug> = {
  saude: "BIOLOGICAS",
  exatas: "EXATAS",
  humanas: "HUMANAS",
  linguistica: "HUMANAS",
  tecnologia: "EXATAS",
  negocios: "HUMANAS",
  artes: "HUMANAS",
  agropecuaria: "BIOLOGICAS",
};

export function areaCursoParaAreaDisc(areaSlug: string): AreaDiscSlug {
  return areaCursoParaDisc[areaSlug] ?? "HUMANAS";
}

export type BlocoContexto = {
  tipo: "verde" | "azul" | "cinza";
  titulo: string;
  mensagem: string;
};

// Memoria explicita do calculo - exibida na tela de "como foi calculado".
export type ExplicacaoMatch = {
  area: {
    contagemH: number;
    contagemE: number;
    contagemB: number;
    totalRespostas: number;
    areaDoCurso: AreaDISC;
    fracaoAreaDoCurso: number; // 0-1
    pontuacaoBase: number; // antes do bonus, 0-60
  };
  curso: {
    pontosObtidos: number; // soma ponderada das 3 respostas
    pontosMaximos: number; // soma dos pesos das perguntas
    percentual: number; // 0-100
    pontuacaoFinal: number; // 0-40
    respostas: Array<{
      perguntaId: number;
      peso: number;
      resposta: "SIM" | "MAIS_OU_MENOS" | "NAO";
      pontosGanhos: number;
    }>;
  };
  tecnico: {
    slug: string | null;
    nome: string | null;
    correlacao: CorrelacaoTecnico;
    bonus: number; // 0, 3, 5 ou 10
    tagsCompartilhadas: TagAplicacao[]; // tags em comum quando TRANSVERSAL
    nomesTagsCompartilhadas: string[]; // labels prontas para exibir
    familiaHabilitador: FamiliaHabilitador | null;
    // Orientacao destacada na tela de resultado (card proprio entre
    // "proximo passo" e "o que mais considerar"). null quando a correlacao
    // for NENHUMA ou nao houver tecnico cadastrado.
    tituloOrientacao: string | null;
    mensagemOrientacao: string | null;
  };
  disc: {
    perfil: DiscPerfil;
    contagemD: number;
    contagemI: number;
    contagemS: number;
    contagemC: number;
  };
};

export type ResultadoMatchEngine = {
  pontuacao: number; // 0-100
  pontuacaoArea: number; // 0-60 (ja inclui bonus tecnico)
  pontuacaoCurso: number; // 0-40
  faixa: FaixaResultado;
  tituloDisc: string;
  areaDominante: AreaDISC;
  justificativa: string;
  proximoPasso: string;
  contextoBlocos: BlocoContexto[];
  explicacao: ExplicacaoMatch;
};

export interface CalcularInput {
  // Perfil do estudante (cadastro)
  areaQuizH: number;
  areaQuizE: number;
  areaQuizB: number;
  discPerfil: DiscPerfil;
  rendaFamiliar: RendaFamiliar;
  perfilEmpreendedor: PerfilEmpreendedor;
  preocupacoes: Preocupacao[];
  anoCursando: AnoEscolar;
  cursoTecnicoFeito: string | null;
  // Contagem bruta DISC (para exibicao na transparencia). Opcional.
  contagemDisc?: { D: number; I: number; S: number; C: number };
  // Contexto da simulacao
  trilhaSlug: string;
  trilhaTitulo: string;
  trilhaModalidade: string;
  areaCursoSlug: string;
  cursoSlug: string;
  cursoNome: string;
  // Respostas das 3 perguntas de afinidade
  respostasAfinidade: RespostaAfinidadePergunta[];
}

const valorResposta = { SIM: 1, MAIS_OU_MENOS: 0.5, NAO: 0 } as const;

export function calcularMatch(input: CalcularInput): ResultadoMatchEngine {
  // ── 1) Afinidade de area (60%) ────────────────────────────────────────
  const areas = {
    HUMANAS: input.areaQuizH,
    EXATAS: input.areaQuizE,
    BIOLOGICAS: input.areaQuizB,
  };
  const totalRespostas =
    areas.HUMANAS + areas.EXATAS + areas.BIOLOGICAS || 1;
  const areaCurso = areaCursoParaAreaDisc(input.areaCursoSlug);
  const fracaoArea = areas[areaCurso] / totalRespostas;
  const pontuacaoAreaBase = Math.round(18 + fracaoArea * 42);

  // ── 2) Bonus pelo curso tecnico (entra na parte de area, cap em 60) ──
  const resultadoCorrelacao = classificarCorrelacao(
    input.cursoTecnicoFeito,
    input.cursoSlug,
    areaCurso,
  );
  const correlacao = resultadoCorrelacao.correlacao;
  const bonus = bonusCorrelacao[correlacao];
  const pontuacaoArea = Math.min(60, pontuacaoAreaBase + bonus);

  // ── 3) Identificacao com a simulacao (40%) ───────────────────────────
  const afinidade = calcularAfinidadeCurso(input.cursoSlug, input.respostasAfinidade);
  const pontuacaoCurso = Math.round((afinidade.percentual / 100) * 40);

  // ── 4) Pontuacao final + faixa ───────────────────────────────────────
  const pontuacao = Math.max(0, Math.min(100, pontuacaoArea + pontuacaoCurso));
  const faixa: FaixaResultado =
    pontuacao >= 65 ? "ALTA" : pontuacao >= 35 ? "MEDIA" : "BAIXA";

  // Area dominante real do estudante (independente do curso)
  const ordemArea: AreaDiscSlug[] = ["HUMANAS", "EXATAS", "BIOLOGICAS"];
  let areaDominante: AreaDiscSlug = "HUMANAS";
  let maxArea = -1;
  for (const a of ordemArea) {
    if (areas[a] > maxArea) {
      maxArea = areas[a];
      areaDominante = a;
    }
  }

  const tituloDisc = tituloDiscArea[input.discPerfil as DiscLetra][areaDominante];

  // ── 5) Justificativa ──────────────────────────────────────────────────
  const nomeAreaPerfil = nomesArea[areaDominante];
  const mensagemFaixa =
    faixa === "ALTA"
      ? `Ótima notícia: o quiz mostrou que ${input.cursoNome} está alinhado com seu perfil.`
      : faixa === "MEDIA"
        ? `Você tem afinidade parcial com a área de ${input.cursoNome}.`
        : `Seu perfil principal aponta para outra área - mas isso é informação, não limite.`;
  const mensagemDisc = ` Seu jeito de agir mostra que ${tituloDisc} - característico de quem se destaca em ${nomeAreaPerfil}.`;

  // Justificativa principal - apenas faixa + DISC. A correlacao com o tecnico
  // vira card proprio na tela de resultado (ver tituloOrientacao/mensagemOrientacao).
  const justificativa = mensagemFaixa + mensagemDisc;

  // ── Orientacao destacada (card proprio entre proximo passo e contexto) ──
  const tec = input.cursoTecnicoFeito
    ? buscarCursoTecnico(input.cursoTecnicoFeito)
    : null;

  let tituloOrientacao: string | null = null;
  let mensagemOrientacao: string | null = null;
  if (tec) {
    if (correlacao === "DIRETA") {
      tituloOrientacao = `${tec.nome} é trilha direta para ${input.cursoNome}`;
      mensagemOrientacao = `Como você já cursa ${tec.nome}, sua experiência prática conta como reforço direto para a carreira de ${input.cursoNome}. Você entra na faculdade ou no mercado com vantagem sobre quem nunca viveu essa rotina - aproveite isso no currículo, em entrevista e no estágio.`;
    } else if (
      correlacao === "TRANSVERSAL" &&
      resultadoCorrelacao.familiaHabilitador
    ) {
      tituloOrientacao = `${tec.nome} + ${input.cursoNome}: combinação rara no mercado`;
      mensagemOrientacao = escolherMensagemTransversal(
        resultadoCorrelacao.tagsCompartilhadas,
        resultadoCorrelacao.familiaHabilitador,
        input.cursoNome,
        tec.nome,
      );
    } else if (correlacao === "AREA") {
      tituloOrientacao = `${tec.nome} compartilha terreno com ${input.cursoNome}`;
      mensagemOrientacao = `Seu curso técnico (${tec.nome}) está na mesma área de conhecimento de ${input.cursoNome}. Mesmo sendo profissões diferentes, parte do que você aprende agora - vocabulário, raciocínio, contato com o setor - facilita o caminho adiante.`;
    }
  }

  // ── 6) Proximo passo ─────────────────────────────────────────────────
  const proximoPasso = proximoPassoPorTrilha(input.trilhaSlug, input.cursoNome);

  // ── 7) Bloco 2: contexto ─────────────────────────────────────────────
  const contextoBlocos = gerarContexto(input);

  // ── 8) Explicacao detalhada (transparencia) ──────────────────────────
  const respostasDetalhe: ExplicacaoMatch["curso"]["respostas"] = [];
  const perguntasDoCurso = obterQuizCurso(input.cursoSlug);
  for (const p of perguntasDoCurso) {
    const r = input.respostasAfinidade.find((x) => x.perguntaId === p.id);
    if (!r) continue;
    respostasDetalhe.push({
      perguntaId: p.id,
      peso: p.peso,
      resposta: r.resposta,
      pontosGanhos: Number((p.peso * valorResposta[r.resposta]).toFixed(2)),
    });
  }

  const explicacao: ExplicacaoMatch = {
    area: {
      contagemH: input.areaQuizH,
      contagemE: input.areaQuizE,
      contagemB: input.areaQuizB,
      totalRespostas,
      areaDoCurso: areaCurso as AreaDISC,
      fracaoAreaDoCurso: Number(fracaoArea.toFixed(3)),
      pontuacaoBase: pontuacaoAreaBase,
    },
    curso: {
      pontosObtidos: afinidade.pontos,
      pontosMaximos: afinidade.maximo,
      percentual: afinidade.percentual,
      pontuacaoFinal: pontuacaoCurso,
      respostas: respostasDetalhe,
    },
    tecnico: {
      slug: input.cursoTecnicoFeito,
      nome: tec?.nome ?? null,
      correlacao,
      bonus,
      tagsCompartilhadas: resultadoCorrelacao.tagsCompartilhadas,
      nomesTagsCompartilhadas: resultadoCorrelacao.tagsCompartilhadas.map(
        (t) => nomesTag[t],
      ),
      familiaHabilitador: resultadoCorrelacao.familiaHabilitador,
      tituloOrientacao,
      mensagemOrientacao,
    },
    disc: {
      perfil: input.discPerfil,
      contagemD: input.contagemDisc?.D ?? 0,
      contagemI: input.contagemDisc?.I ?? 0,
      contagemS: input.contagemDisc?.S ?? 0,
      contagemC: input.contagemDisc?.C ?? 0,
    },
  };

  return {
    pontuacao,
    pontuacaoArea,
    pontuacaoCurso,
    faixa,
    tituloDisc,
    areaDominante: areaDominante as AreaDISC,
    justificativa,
    proximoPasso,
    contextoBlocos,
    explicacao,
  };
}

// ── Próximos passos por trilha ──────────────────────────────────────────
const proximosPassosTrilha: Record<string, (curso: string) => string> = {
  "bacharelado-presencial": (curso) =>
    `Inscreva-se no próximo ENEM e simule sua nota em cursos de ${curso} nas universidades públicas perto de você (UFPI, UESPI, IFPI).`,
  "bacharelado-ead": (curso) =>
    `Liste 3 faculdades EAD que oferecem ${curso}, confira no e-MEC se são credenciadas e visite o polo mais próximo.`,
  tecnologo: (curso) =>
    `Veja a lista de tecnólogos do IFPI mais próximo de você que tenham ${curso} e marque a data do próximo processo seletivo.`,
  "curso-tecnico": (curso) =>
    `Acesse o site do IFPI e veja se ${curso} está com inscrição aberta na sua região.`,
  "concurso-publico": (curso) =>
    `Escolha um concurso real (PM-PI, Correios, prefeitura) na linha de ${curso}, baixe o último edital e estude as matérias cobradas.`,
  "mercado-direto": (curso) =>
    `Identifique uma área prática ligada a ${curso} e procure um curso curto no SENAI, SENAC ou plataforma online para começar agora.`,
};

function proximoPassoPorTrilha(slug: string, cursoNome: string): string {
  const gen = proximosPassosTrilha[slug];
  return gen
    ? gen(cursoNome)
    : `Procure pessoas que já trilharam o caminho de ${cursoNome} e converse com essas pessoas sobre como começaram.`;
}

// ── Geracao de blocos de contexto (sem afetar nota) ─────────────────────
function gerarContexto(input: CalcularInput): BlocoContexto[] {
  const blocos: BlocoContexto[] = [];
  const isTrilhaGratuita =
    input.trilhaSlug === "concurso-publico" ||
    input.trilhaSlug === "curso-tecnico" ||
    input.trilhaSlug === "mercado-direto";
  const isTrilhaTecnica = input.trilhaSlug === "curso-tecnico";
  const isTrilhaLonga =
    input.trilhaSlug === "bacharelado-presencial" ||
    input.trilhaSlug === "bacharelado-ead";
  const isRendaBaixa =
    input.rendaFamiliar === "ATE_1K" ||
    input.rendaFamiliar === "DE_1K_A_2_5K";
  const trilhaPaga =
    input.trilhaSlug === "bacharelado-presencial" ||
    input.trilhaSlug === "bacharelado-ead" ||
    input.trilhaSlug === "tecnologo";

  if (isTrilhaGratuita && isRendaBaixa) {
    blocos.push({
      tipo: "verde",
      titulo: "Oportunidade real",
      mensagem:
        "Esta trilha tem custo baixo ou é gratuita - encaixa direto na sua realidade familiar sem depender de bolsa ou financiamento.",
    });
  }
  if (isTrilhaTecnica && input.cursoTecnicoFeito) {
    const tec = buscarCursoTecnico(input.cursoTecnicoFeito);
    blocos.push({
      tipo: "verde",
      titulo: "Você já está no caminho",
      mensagem: `Você já faz ${tec?.nome ?? "um curso técnico"}. Continuar nessa direção aproveita o que você já construiu.`,
    });
  }

  if (trilhaPaga && isRendaBaixa) {
    blocos.push({
      tipo: "azul",
      titulo: "Caminho com apoio financeiro",
      mensagem:
        "Esta trilha tem mensalidade, mas há ProUni (bolsa integral) e FIES (financiamento) para famílias com sua renda. Inscreva-se no ProUni após o ENEM.",
    });
  }
  if (input.preocupacoes.includes("SEM_DINHEIRO_FACULDADE")) {
    blocos.push({
      tipo: "azul",
      titulo: "Sobre o custo da faculdade",
      mensagem:
        "Existem 3 saídas reais: universidade pública (gratuita, exige ENEM), ProUni (bolsa) e FIES (financiamento com pagamento depois). Conheça as 3.",
    });
  }
  if (input.preocupacoes.includes("PRECISO_TRABALHAR_LOGO")) {
    blocos.push({
      tipo: "azul",
      titulo: "Renda enquanto estuda",
      mensagem:
        "Curso técnico (1-2 anos) e tecnólogo (2-3 anos) colocam você no mercado mais rápido, sem abrir mão da formação. Vale considerar como porta de entrada.",
    });
  }
  if (input.preocupacoes.includes("NAO_PASSAR_NO_ENEM")) {
    blocos.push({
      tipo: "azul",
      titulo: "ENEM não é a única porta",
      mensagem:
        "Concurso público, curso técnico e entrada direta no mercado não exigem ENEM. E o ENEM tem segunda chamada - não passar uma vez não fecha o caminho.",
    });
  }
  if (input.preocupacoes.includes("NAO_CONHECO_OPCOES")) {
    blocos.push({
      tipo: "azul",
      titulo: "Explore antes de decidir",
      mensagem:
        "Simule mais de uma carreira aqui no Léguas antes de fechar a sua escolha. Cada simulação leva 5 minutos e te dá referência de comparação.",
    });
  }
  if (input.preocupacoes.includes("MEDO_ESCOLHER_ERRADO")) {
    blocos.push({
      tipo: "azul",
      titulo: "Escolher hoje não fecha amanhã",
      mensagem:
        "Mudanças de curso são comuns e legais. O importante é começar - você ajusta a rota com a experiência. Quem nunca começa é que perde tempo.",
    });
  }

  if (input.anoCursando === "TERCEIRO" && isTrilhaLonga) {
    blocos.push({
      tipo: "cinza",
      titulo: "Prazo é o seu desafio",
      mensagem:
        "Você está no 3º ano e essa trilha leva 4-6 anos. Vale começar a se preparar agora para o ENEM deste ou do próximo ano.",
    });
  }
  if (
    input.perfilEmpreendedor === "EMPREENDEDOR" &&
    input.trilhaSlug === "concurso-publico"
  ) {
    blocos.push({
      tipo: "cinza",
      titulo: "Atenção ao seu perfil",
      mensagem:
        "Você indicou que quer empreender. Concurso público garante estabilidade, mas pode limitar autonomia e iniciativa próprias - pondere o que pesa mais para você.",
    });
  }
  if (
    input.perfilEmpreendedor === "ESTAVEL" &&
    input.trilhaSlug === "mercado-direto"
  ) {
    blocos.push({
      tipo: "cinza",
      titulo: "Atenção ao seu perfil",
      mensagem:
        "Você prioriza estabilidade. Entrada direta no mercado pode trazer variabilidade de renda e ausência de benefícios - vale começar com algo que ofereça mais previsibilidade.",
    });
  }
  if (
    input.perfilEmpreendedor === "ALTO_RISCO" &&
    isRendaBaixa &&
    input.trilhaSlug === "mercado-direto"
  ) {
    blocos.push({
      tipo: "cinza",
      titulo: "Risco vs renda",
      mensagem:
        "Sua disposição para arriscar combina com Mercado Direto, mas com renda familiar menor é prudente ter uma reserva financeira ou um trabalho-âncora nos primeiros meses.",
    });
  }

  return blocos;
}
