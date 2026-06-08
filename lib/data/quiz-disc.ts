// Quiz vocacional DISC - 8 perguntas
// Cada opcao pontua simultaneamente uma area (H/E/B) e um perfil DISC (D/I/S/C).
// O estudante nunca ve os rotulos - escolhe apenas a opcao que mais combina com ele.

export type AreaDiscSlug = "HUMANAS" | "EXATAS" | "BIOLOGICAS";
export type DiscLetra = "D" | "I" | "S" | "C";

export interface OpcaoDisc {
  id: "A" | "B" | "C" | "D";
  texto: string;
  area: AreaDiscSlug;
  disc: DiscLetra;
}

export interface PerguntaDisc {
  id: number;
  texto: string;
  opcoes: OpcaoDisc[];
}

export const perguntasDisc: PerguntaDisc[] = [
  {
    id: 1,
    texto: "Quando surge um problema no grupo, você costuma:",
    opcoes: [
      { id: "A", texto: "Tomar a frente e decidir logo o que fazer", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Conversar com todos e buscar consenso", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Apoiar quem está sofrendo mais com o problema", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Analisar as causas antes de agir", area: "EXATAS", disc: "C" },
    ],
  },
  {
    id: 2,
    texto: "Qual dessas atividades você faria por prazer, sem ninguém pedir?",
    opcoes: [
      { id: "A", texto: "Organizar um evento ou liderar um projeto", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Escrever, contar histórias ou criar conteúdo", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Cuidar de alguém, plantas ou animais", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Montar, programar ou resolver um desafio técnico", area: "EXATAS", disc: "C" },
    ],
  },
  {
    id: 3,
    texto: "Numa tarefa em equipe, o seu papel natural é:",
    opcoes: [
      { id: "A", texto: "Definir o que precisa ser feito e cobrar resultados", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Motivar o grupo e manter o clima positivo", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Garantir que ninguém fique pra trás", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Checar se tudo está correto antes de entregar", area: "EXATAS", disc: "C" },
    ],
  },
  {
    id: 4,
    texto: "O que mais te incomoda no dia a dia?",
    opcoes: [
      { id: "A", texto: "Perder tempo com processos lentos ou indecisão", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Trabalhar sozinho sem poder conversar com ninguém", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Ambientes de muita pressão e conflito", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Fazer algo sem entender o motivo ou sem planejamento", area: "EXATAS", disc: "C" },
    ],
  },
  {
    id: 5,
    texto: "Qual dessas matérias ou atividades escolares mais combina com você?",
    opcoes: [
      { id: "A", texto: "Debates, oratória ou gestão de projetos", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Teatro, comunicação, literatura ou artes", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Biologia, saúde, natureza ou educação física", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Matemática, física, química ou informática", area: "EXATAS", disc: "C" },
    ],
  },
  {
    id: 6,
    texto: "Se você pudesse escolher como trabalhar, preferia:",
    opcoes: [
      { id: "A", texto: "Ter autonomia para tomar decisões e ver resultados rápidos", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Trabalhar com muita gente diferente e criar conexões", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Ter estabilidade, rotina previsível e um time de confiança", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Ter processos claros, qualidade garantida e tempo para pensar", area: "EXATAS", disc: "C" },
    ],
  },
  {
    id: 7,
    texto: "Quando você aprende algo novo, você está satisfeito quando:",
    opcoes: [
      { id: "A", texto: "Já consegue aplicar e ver resultado concreto", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Consegue explicar para alguém e ver que entendeu", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Sente que vai ajudar alguém de verdade um dia", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Domina completamente o assunto, sem dúvida alguma", area: "EXATAS", disc: "C" },
    ],
  },
  {
    id: 8,
    texto: "Se você fosse escolher uma causa para defender, qual seria?",
    opcoes: [
      { id: "A", texto: "Justiça, direitos ou liderança comunitária", area: "HUMANAS", disc: "D" },
      { id: "B", texto: "Cultura, comunicação ou educação criativa", area: "HUMANAS", disc: "I" },
      { id: "C", texto: "Saúde, bem-estar animal ou meio ambiente", area: "BIOLOGICAS", disc: "S" },
      { id: "D", texto: "Tecnologia, inovação ou sustentabilidade", area: "EXATAS", disc: "C" },
    ],
  },
];

export interface RespostaDisc {
  perguntaId: number;
  opcaoId: "A" | "B" | "C" | "D";
}

export interface ResultadoDisc {
  areaH: number;
  areaE: number;
  areaB: number;
  disc: DiscLetra;
  areaDominante: AreaDiscSlug;
  contagemDisc: Record<DiscLetra, number>;
}

export function calcularDisc(respostas: RespostaDisc[]): ResultadoDisc {
  const area = { HUMANAS: 0, EXATAS: 0, BIOLOGICAS: 0 };
  const contagemDisc: Record<DiscLetra, number> = { D: 0, I: 0, S: 0, C: 0 };

  for (const r of respostas) {
    const pergunta = perguntasDisc.find((p) => p.id === r.perguntaId);
    if (!pergunta) continue;
    const opcao = pergunta.opcoes.find((o) => o.id === r.opcaoId);
    if (!opcao) continue;
    area[opcao.area] += 1;
    contagemDisc[opcao.disc] += 1;
  }

  // Perfil DISC dominante (desempate prioriza D > I > S > C - letra de maior contagem)
  const ordemDisc: DiscLetra[] = ["D", "I", "S", "C"];
  let disc: DiscLetra = "D";
  let maxDisc = -1;
  for (const letra of ordemDisc) {
    if (contagemDisc[letra] > maxDisc) {
      maxDisc = contagemDisc[letra];
      disc = letra;
    }
  }

  const ordemArea: AreaDiscSlug[] = ["HUMANAS", "EXATAS", "BIOLOGICAS"];
  let areaDominante: AreaDiscSlug = "HUMANAS";
  let maxArea = -1;
  for (const a of ordemArea) {
    if (area[a] > maxArea) {
      maxArea = area[a];
      areaDominante = a;
    }
  }

  return {
    areaH: area.HUMANAS,
    areaE: area.EXATAS,
    areaB: area.BIOLOGICAS,
    disc,
    areaDominante,
    contagemDisc,
  };
}

// Tabela 12 combinações DISC × Área (Seção 2 do documento)
// O título é o que o estudante vê no resultado; a sigla DISC nunca aparece.
export const tituloDiscArea: Record<DiscLetra, Record<AreaDiscSlug, string>> = {
  D: {
    HUMANAS: "você age, decide e lidera",
    EXATAS: "você resolve com velocidade",
    BIOLOGICAS: "você cuida com determinação",
  },
  I: {
    HUMANAS: "você comunica e inspira",
    EXATAS: "você explica o que é difícil",
    BIOLOGICAS: "você cuida e conecta",
  },
  S: {
    HUMANAS: "você apoia e constrói vínculos",
    EXATAS: "você executa com precisão e calma",
    BIOLOGICAS: "você cuida com paciência",
  },
  C: {
    HUMANAS: "você analisa antes de concluir",
    EXATAS: "você pensa antes de agir",
    BIOLOGICAS: "você investiga com rigor",
  },
};

export const nomesArea: Record<AreaDiscSlug, string> = {
  HUMANAS: "Humanas",
  EXATAS: "Exatas",
  BIOLOGICAS: "Biológicas",
};

// Descricoes humanizadas - usadas na tela de perfil vocacional apos o cadastro.
// Nunca expoem a sigla DISC ao estudante.
export const descricaoPerfil: Record<DiscLetra, { rotulo: string; resumo: string; pontosFortes: string[]; cuidados: string }> = {
  D: {
    rotulo: "Você é um Decisor",
    resumo:
      "Você age rápido, gosta de resultado concreto e não tem medo de tomar decisões difíceis quando precisa. Em grupo, costuma assumir liderança naturalmente.",
    pontosFortes: ["Iniciativa", "Pragmatismo", "Velocidade de decisão", "Foco em resultado"],
    cuidados:
      "Atenção para não atropelar processos longos. Carreiras que exigem muito tempo de estudo antes de ver impacto podem te frustrar - escolha caminhos com entregas frequentes.",
  },
  I: {
    rotulo: "Você é um Influenciador",
    resumo:
      "Você se conecta com pessoas com facilidade, sabe se expressar e contagia o grupo com entusiasmo. Brilha quando o trabalho envolve comunicar, ensinar ou inspirar.",
    pontosFortes: ["Comunicação", "Empatia", "Criatividade", "Networking"],
    cuidados:
      "Cuidado com trabalhos isolados e muito técnicos sem contato humano - você pode perder motivação. Busque ambientes coletivos.",
  },
  S: {
    rotulo: "Você é Estável e Confiável",
    resumo:
      "Você é paciente, consistente e a pessoa em que todos confiam. Prefere ambientes previsíveis e tem um cuidado genuíno com quem está ao seu redor.",
    pontosFortes: ["Confiabilidade", "Paciência", "Trabalho em equipe", "Cuidado com pessoas"],
    cuidados:
      "Carreiras de muita pressão constante e mudança brusca podem te desgastar. Valorize estabilidade e ambientes onde você possa construir vínculo de longo prazo.",
  },
  C: {
    rotulo: "Você é Analítico e Preciso",
    resumo:
      "Você gosta de entender as coisas a fundo antes de agir, valoriza qualidade e detalhe, e tem prazer em chegar à resposta certa. Não se contenta com superficialidade.",
    pontosFortes: ["Análise", "Atenção a detalhes", "Rigor técnico", "Pensamento crítico"],
    cuidados:
      "Cuidado com a paralisia por análise. Em carreiras que pedem decisão rápida sem dados completos, lembre que progresso vale mais que perfeição.",
  },
};

export const descricaoArea: Record<AreaDiscSlug, string> = {
  HUMANAS:
    "Você se conecta com temas ligados a pessoas, sociedade, comunicação e liderança. Cursos típicos: Direito, Administração, Pedagogia, Psicologia, Letras.",
  EXATAS:
    "Você se identifica com lógica, números, tecnologia e estruturas. Cursos típicos: Engenharias, Ciência da Computação, Arquitetura, Matemática, Física.",
  BIOLOGICAS:
    "Você se identifica com saúde, cuidado com a vida, natureza e meio ambiente. Cursos típicos: Medicina, Enfermagem, Nutrição, Biologia, Agronomia.",
};
