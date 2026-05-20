// Quiz de afinidade por curso — perguntas individuais para cada um dos 158 cursos
// listados em lib/data/cursos-*.json. 3 perguntas por curso (1 fase ALUNO peso 1
// + 2 fase PROFISSIONAL peso 2). Cada curso tem suas proprias perguntas — sem
// reuso entre cursos.
//
// Banco de perguntas mora em quiz-afinidade-cursos.json. Esse arquivo apenas
// expoe tipos e helpers para o resto do sistema.

import bancoPerguntas from "./quiz-afinidade-cursos.json";

export type RespostaAfinidade = "SIM" | "MAIS_OU_MENOS" | "NAO";

export interface PerguntaAfinidade {
  id: number;
  texto: string;
  peso: 1 | 2;
  fase: "ALUNO" | "PROFISSIONAL";
}

const banco = bancoPerguntas as unknown as Record<string, PerguntaAfinidade[]>;

// Fallback raro: usado apenas se um curso for adicionado nos JSONs de cursos
// sem registrar suas perguntas. Mantemos perguntas claramente neutras pra
// nao distorcer o match silenciosamente — a tela vai funcionar mas o
// estudante percebe que foi generico.
const generico: PerguntaAfinidade[] = [
  {
    id: 1,
    peso: 1,
    fase: "ALUNO",
    texto:
      "Você simulou um dia nessa carreira e, mesmo que não tenha se identificado com tudo, houve algum momento em que pensou \"isso eu conseguiria fazer\"?",
  },
  {
    id: 2,
    peso: 2,
    fase: "PROFISSIONAL",
    texto:
      "Se você imaginasse daqui a 5 anos trabalhando nessa área, essa imagem te anima mais do que te assusta?",
  },
  {
    id: 3,
    peso: 2,
    fase: "PROFISSIONAL",
    texto:
      "Você acha que o que essa profissão exige de você são características que você já tem ou quer desenvolver?",
  },
];

export function obterQuizCurso(cursoSlug: string): PerguntaAfinidade[] {
  return banco[cursoSlug] ?? generico;
}

export function perguntasAluno(cursoSlug: string): PerguntaAfinidade[] {
  return obterQuizCurso(cursoSlug).filter((p) => p.fase === "ALUNO");
}

export function perguntasProfissional(cursoSlug: string): PerguntaAfinidade[] {
  return obterQuizCurso(cursoSlug).filter((p) => p.fase === "PROFISSIONAL");
}

export interface RespostaAfinidadePergunta {
  perguntaId: number;
  resposta: RespostaAfinidade;
}

const valorResposta: Record<RespostaAfinidade, number> = {
  SIM: 1,
  MAIS_OU_MENOS: 0.5,
  NAO: 0,
};

/** Retorna percentual 0-100 normalizado pelos pesos das perguntas. */
export function calcularAfinidadeCurso(
  cursoSlug: string,
  respostas: RespostaAfinidadePergunta[],
): { percentual: number; pontos: number; maximo: number } {
  const perguntas = obterQuizCurso(cursoSlug);
  const maximo = perguntas.reduce((acc, p) => acc + p.peso, 0);
  let pontos = 0;
  for (const p of perguntas) {
    const r = respostas.find((x) => x.perguntaId === p.id);
    if (!r) continue;
    pontos += p.peso * valorResposta[r.resposta];
  }
  const percentual = maximo > 0 ? Math.round((pontos / maximo) * 100) : 0;
  return { percentual, pontos, maximo };
}
