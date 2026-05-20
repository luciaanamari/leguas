// Cursos tecnicos disponiveis no Piaui — usados no cadastro como dropdown padronizado
// (substitui o input livre antigo).
//
// Cada curso tem:
//   - slug: identificador interno (kebab-case)
//   - nome: rotulo exibido ao usuario (capitalizado)
//   - area: H (Humanas) / E (Exatas) / B (Biologicas) — segue o modelo DISC do projeto
//   - cursosRelacionados: slugs de cursos do JSON de cursos onde esse tecnico
//     conta como correlacao direta (peso forte no match). Se vazio, so vale a
//     correlacao por area.
//   - tagsAplicacao: dominios de aplicacao do tecnico. Usadas para inferir
//     correlacao TRANSVERSAL com cursos habilitadores (TI, marketing, design,
//     gestao, comunicacao). Vocabulario fechado em correlacao-tecnico.ts.

import type { AreaDiscSlug } from "./quiz-disc";
import {
  cursosHabilitadores,
  ehHabilitador,
  type TagAplicacao,
  type FamiliaHabilitador,
} from "./correlacao-tecnico";

export interface CursoTecnicoOpcao {
  slug: string;
  nome: string;
  area: AreaDiscSlug;
  cursosRelacionados: string[];
  tagsAplicacao: TagAplicacao[];
}

export const cursosTecnicos: CursoTecnicoOpcao[] = [
  {
    slug: "tec-acucar-alcool",
    nome: "Técnico em Açúcar e Álcool",
    area: "EXATAS",
    cursosRelacionados: ["engenharia-quimica", "quimica", "agronomia", "agronegocio"],
    tagsAplicacao: ["alimentos", "industria", "agro", "energia"],
  },
  {
    slug: "tec-administracao",
    nome: "Técnico em Administração",
    area: "HUMANAS",
    cursosRelacionados: [
      "tecnico-administracao",
      "administracao",
      "ciencias-contabeis",
      "gestao-comercial",
      "gestao-publica",
      "administracao-publica",
    ],
    tagsAplicacao: ["varejo", "financeiro"],
  },
  {
    slug: "tec-administracao-empreendedorismo",
    nome: "Técnico em Administração com ênfase em Empreendedorismo",
    area: "HUMANAS",
    cursosRelacionados: ["administracao", "empreendedorismo", "marketing", "gestao-comercial"],
    tagsAplicacao: ["varejo", "financeiro"],
  },
  {
    slug: "tec-administracao-empreendedorismo-inovacao",
    nome: "Técnico em Administração com ênfase em Empreendedorismo, Inovação e Economia Criativa",
    area: "HUMANAS",
    cursosRelacionados: ["administracao", "empreendedorismo", "marketing", "producao-cultural", "gestao-projetos"],
    tagsAplicacao: ["varejo", "cultura", "financeiro"],
  },
  {
    slug: "tec-agente-comunitario-saude",
    nome: "Técnico em Agente Comunitário de Saúde",
    area: "BIOLOGICAS",
    cursosRelacionados: ["enfermagem", "servico-social", "medicina", "psicologia", "tecnico-enfermagem"],
    tagsAplicacao: ["saude", "educacao"],
  },
  {
    slug: "tec-agricultura-precisao",
    nome: "Técnico em Agricultura com ênfase em Mecanização e Agricultura de Precisão",
    area: "BIOLOGICAS",
    cursosRelacionados: ["agronomia", "agronegocio", "tecnico-agropecuaria", "agroecologia"],
    tagsAplicacao: ["agro", "qualidade-controle"],
  },
  {
    slug: "tec-agroindustria",
    nome: "Técnico em Agroindústria",
    area: "BIOLOGICAS",
    cursosRelacionados: ["tecnico-agroindustria", "agronomia", "agronegocio", "engenharia-quimica", "zootecnia"],
    tagsAplicacao: ["alimentos", "agro", "industria"],
  },
  {
    slug: "tec-agropecuaria",
    nome: "Técnico em Agropecuária",
    area: "BIOLOGICAS",
    cursosRelacionados: ["tecnico-agropecuaria", "agronomia", "zootecnia", "agronegocio", "medicina-veterinaria"],
    tagsAplicacao: ["agro", "bem-estar-animal"],
  },
  {
    slug: "tec-alimentos",
    nome: "Técnico em Alimentos",
    area: "BIOLOGICAS",
    cursosRelacionados: ["nutricao", "engenharia-quimica", "agronegocio", "tecnico-nutricao"],
    tagsAplicacao: ["alimentos", "qualidade-controle", "industria"],
  },
  {
    slug: "tec-alimentos-laticinios",
    nome: "Técnico em Alimentos com ênfase em Laticínios",
    area: "BIOLOGICAS",
    cursosRelacionados: ["nutricao", "zootecnia", "agronegocio", "engenharia-quimica"],
    tagsAplicacao: ["alimentos", "agro", "qualidade-controle"],
  },
  {
    slug: "tec-analises-clinicas",
    nome: "Técnico em Análises Clínicas",
    area: "BIOLOGICAS",
    cursosRelacionados: ["tecnico-analises-clinicas", "biomedicina", "farmacia", "biologia", "medicina"],
    tagsAplicacao: ["saude", "qualidade-controle"],
  },
  {
    slug: "tec-artesanato-empreendedorismo",
    nome: "Técnico em Artesanato com ênfase em Empreendedorismo",
    area: "HUMANAS",
    cursosRelacionados: ["empreendedorismo", "design-produto", "moda", "artes-visuais", "producao-cultural"],
    tagsAplicacao: ["cultura", "varejo"],
  },
  {
    slug: "tec-controle-ambiental",
    nome: "Técnico em Controle Ambiental",
    area: "BIOLOGICAS",
    cursosRelacionados: [
      "engenharia-ambiental",
      "gestao-ambiental",
      "biologia",
      "tecnico-meio-ambiente",
      "engenharia-sanitaria",
    ],
    tagsAplicacao: ["meio-ambiente", "qualidade-controle", "industria"],
  },
  {
    slug: "tec-desenvolvimento-sistemas",
    nome: "Técnico em Desenvolvimento de Sistemas",
    area: "EXATAS",
    cursosRelacionados: [
      "tecnico-informatica",
      "analise-desenvolvimento",
      "ciencia-computacao",
      "sistemas-informacao",
      "engenharia-software",
      "desenvolvimento-web",
      "desenvolvimento-mobile",
    ],
    tagsAplicacao: ["tecnologia"],
  },
  {
    slug: "tec-desenvolvimento-sistemas-ciencia-dados",
    nome: "Técnico em Desenvolvimento de Sistemas com ênfase em Ciência de Dados",
    area: "EXATAS",
    cursosRelacionados: [
      "ciencia-dados",
      "estatistica",
      "ciencia-computacao",
      "inteligencia-artificial",
      "analise-desenvolvimento",
    ],
    tagsAplicacao: ["tecnologia"],
  },
  {
    slug: "tec-design-joias",
    nome: "Técnico em Design de Joias",
    area: "HUMANAS",
    cursosRelacionados: ["design-produto", "design-grafico", "moda", "artes-visuais", "empreendedorismo"],
    tagsAplicacao: ["cultura", "varejo"],
  },
  {
    slug: "tec-eletrotecnica-eletromecanica",
    nome: "Técnico em Eletrotécnica com ênfase em Eletromecânica",
    area: "EXATAS",
    cursosRelacionados: [
      "tecnico-eletrotecnica",
      "engenharia-eletrica",
      "engenharia-mecanica",
      "tecnico-mecanica",
    ],
    tagsAplicacao: ["industria", "energia"],
  },
  {
    slug: "tec-eletrotecnica-hidrogenio-verde",
    nome: "Técnico em Eletrotécnica com ênfase em Hidrogênio Verde",
    area: "EXATAS",
    cursosRelacionados: [
      "tecnico-eletrotecnica",
      "engenharia-eletrica",
      "engenharia-quimica",
      "engenharia-ambiental",
    ],
    tagsAplicacao: ["energia", "industria", "meio-ambiente"],
  },
  {
    slug: "tec-enfermagem",
    nome: "Técnico em Enfermagem",
    area: "BIOLOGICAS",
    cursosRelacionados: ["tecnico-enfermagem", "enfermagem", "medicina", "fisioterapia", "nutricao"],
    tagsAplicacao: ["saude"],
  },
  {
    slug: "tec-farmacia",
    nome: "Técnico em Farmácia",
    area: "BIOLOGICAS",
    cursosRelacionados: ["tecnico-farmacia", "farmacia", "biomedicina", "tecnico-analises-clinicas"],
    tagsAplicacao: ["saude", "varejo"],
  },
  {
    slug: "tec-gastronomia",
    nome: "Técnico em Gastronomia",
    area: "HUMANAS",
    cursosRelacionados: ["gastronomia", "confeitaria", "culinaria-regional", "hotelaria", "empreendedorismo"],
    tagsAplicacao: ["alimentos", "turismo"],
  },
  {
    slug: "tec-guia-turismo",
    nome: "Técnico em Guia de Turismo",
    area: "HUMANAS",
    cursosRelacionados: ["turismo", "hotelaria", "eventos", "historia"],
    tagsAplicacao: ["turismo", "cultura"],
  },
  {
    slug: "tec-hospedagem",
    nome: "Técnico em Hospedagem",
    area: "HUMANAS",
    cursosRelacionados: ["hotelaria", "turismo", "administracao", "eventos", "gastronomia"],
    tagsAplicacao: ["turismo", "varejo"],
  },
  {
    slug: "tec-informatica-internet",
    nome: "Técnico em Informática para Internet",
    area: "EXATAS",
    cursosRelacionados: [
      "tecnico-informatica",
      "desenvolvimento-web",
      "desenvolvimento-mobile",
      "analise-desenvolvimento",
      "ciencia-computacao",
      "ux-ui-design",
    ],
    tagsAplicacao: ["tecnologia"],
  },
  {
    slug: "tec-logistica",
    nome: "Técnico em Logística",
    area: "HUMANAS",
    cursosRelacionados: ["logistica", "administracao", "gestao-comercial", "comercio-exterior"],
    tagsAplicacao: ["logistica", "varejo", "industria"],
  },
  {
    slug: "tec-manutencao-automotiva",
    nome: "Técnico em Manutenção Automotiva",
    area: "EXATAS",
    cursosRelacionados: ["tecnico-mecanica", "engenharia-mecanica", "tecnico-eletrotecnica"],
    tagsAplicacao: ["industria", "logistica"],
  },
  {
    slug: "tec-marketing-digital",
    nome: "Técnico em Marketing Digital",
    area: "HUMANAS",
    cursosRelacionados: [
      "marketing",
      "publicidade-propaganda",
      "comunicacao-digital",
      "gestao-redes-sociais",
      "midias-digitais",
      "design-grafico",
    ],
    tagsAplicacao: ["comunicacao", "varejo"],
  },
  {
    slug: "tec-mineracao",
    nome: "Técnico em Mineração",
    area: "EXATAS",
    cursosRelacionados: ["geociencias", "engenharia-civil", "engenharia-quimica", "engenharia-ambiental"],
    tagsAplicacao: ["industria", "meio-ambiente"],
  },
  {
    slug: "tec-modelagem-vestuario",
    nome: "Técnico em Modelagem do Vestuário",
    area: "HUMANAS",
    cursosRelacionados: ["moda", "design-produto", "artes-visuais", "empreendedorismo"],
    tagsAplicacao: ["industria", "cultura", "varejo"],
  },
  {
    slug: "tec-nutricao-dietetica",
    nome: "Técnico em Nutrição e Dietética",
    area: "BIOLOGICAS",
    cursosRelacionados: ["tecnico-nutricao", "nutricao", "gastronomia", "enfermagem", "educacao-fisica"],
    tagsAplicacao: ["alimentos", "saude"],
  },
  {
    slug: "tec-pesca",
    nome: "Técnico em Pesca",
    area: "BIOLOGICAS",
    cursosRelacionados: ["pesca-aquicultura", "engenharia-ambiental", "biologia", "zootecnia"],
    tagsAplicacao: ["alimentos", "meio-ambiente", "agro"],
  },
  {
    slug: "tec-planejamento-producao",
    nome: "Técnico em Planejamento e Controle da Produção",
    area: "EXATAS",
    cursosRelacionados: ["engenharia-producao", "logistica", "administracao", "gestao-projetos"],
    tagsAplicacao: ["industria", "logistica", "qualidade-controle"],
  },
  {
    slug: "tec-portos",
    nome: "Técnico em Portos",
    area: "HUMANAS",
    cursosRelacionados: ["logistica", "comercio-exterior", "administracao"],
    tagsAplicacao: ["logistica"],
  },
  {
    slug: "tec-producao-audio-video",
    nome: "Técnico em Produção de Áudio e Vídeo",
    area: "HUMANAS",
    cursosRelacionados: [
      "cinema-audiovisual",
      "producao-audiovisual",
      "radio-tv",
      "publicidade-propaganda",
      "comunicacao-digital",
    ],
    tagsAplicacao: ["comunicacao", "cultura"],
  },
  {
    slug: "tec-programacao-jogos",
    nome: "Técnico em Programação de Jogos Digitais",
    area: "EXATAS",
    cursosRelacionados: [
      "jogos-digitais",
      "ciencia-computacao",
      "engenharia-software",
      "analise-desenvolvimento",
      "animacao",
    ],
    tagsAplicacao: ["tecnologia", "cultura"],
  },
  {
    slug: "tec-saude-bucal",
    nome: "Técnico em Saúde Bucal",
    area: "BIOLOGICAS",
    cursosRelacionados: ["tecnico-saude-bucal", "odontologia", "enfermagem"],
    tagsAplicacao: ["saude"],
  },
  {
    slug: "tec-seguranca-trabalho",
    nome: "Técnico em Segurança do Trabalho",
    area: "EXATAS",
    cursosRelacionados: [
      "tecnico-seguranca-trabalho",
      "engenharia-civil",
      "engenharia-mecanica",
      "enfermagem",
      "engenharia-sanitaria",
    ],
    tagsAplicacao: ["industria", "construcao", "qualidade-controle"],
  },
  {
    slug: "tec-servicos-restaurante-bar",
    nome: "Técnico em Serviços de Restaurante e Bar",
    area: "HUMANAS",
    cursosRelacionados: ["gastronomia", "hotelaria", "turismo", "empreendedorismo"],
    tagsAplicacao: ["alimentos", "turismo", "varejo"],
  },
  {
    slug: "tec-sistemas-energia-renovavel",
    nome: "Técnico em Sistemas de Energia Renovável",
    area: "EXATAS",
    cursosRelacionados: [
      "engenharia-eletrica",
      "engenharia-ambiental",
      "engenharia-mecanica",
      "tecnico-eletrotecnica",
    ],
    tagsAplicacao: ["energia", "meio-ambiente", "industria"],
  },
  {
    slug: "tec-transporte-aquaviario",
    nome: "Técnico em Transporte Aquaviário",
    area: "HUMANAS",
    cursosRelacionados: ["logistica", "comercio-exterior"],
    tagsAplicacao: ["logistica"],
  },
  {
    slug: "tec-zootecnia",
    nome: "Técnico em Zootecnia",
    area: "BIOLOGICAS",
    cursosRelacionados: ["zootecnia", "agronomia", "medicina-veterinaria", "tecnico-agropecuaria"],
    tagsAplicacao: ["agro", "bem-estar-animal"],
  },
];

export function buscarCursoTecnico(slug: string): CursoTecnicoOpcao | undefined {
  return cursosTecnicos.find((c) => c.slug === slug);
}

export type CorrelacaoTecnico =
  | "DIRETA" // tec em cursosRelacionados[] do curso simulado
  | "TRANSVERSAL" // curso simulado e habilitador e compartilha tag com o tec
  | "AREA" // mesma area DISC, sem ponte direta nem transversal
  | "NENHUMA";

export interface ResultadoCorrelacao {
  correlacao: CorrelacaoTecnico;
  tagsCompartilhadas: TagAplicacao[]; // somente preenchido em TRANSVERSAL
  familiaHabilitador: FamiliaHabilitador | null; // somente em TRANSVERSAL
}

export function classificarCorrelacao(
  tecnicoSlug: string | null | undefined,
  cursoSimuladoSlug: string,
  areaCursoSimulado: AreaDiscSlug,
): ResultadoCorrelacao {
  if (!tecnicoSlug) {
    return { correlacao: "NENHUMA", tagsCompartilhadas: [], familiaHabilitador: null };
  }
  const tec = buscarCursoTecnico(tecnicoSlug);
  if (!tec) {
    return { correlacao: "NENHUMA", tagsCompartilhadas: [], familiaHabilitador: null };
  }

  // 1) DIRETA
  if (tec.cursosRelacionados.includes(cursoSimuladoSlug)) {
    return { correlacao: "DIRETA", tagsCompartilhadas: [], familiaHabilitador: null };
  }

  // 2) TRANSVERSAL — curso simulado e habilitador e compartilha tag
  if (ehHabilitador(cursoSimuladoSlug)) {
    const habilitador = cursosHabilitadores[cursoSimuladoSlug];
    const compartilhadas = tec.tagsAplicacao.filter((t) =>
      habilitador.tagsCompatibilidade.includes(t),
    );
    if (compartilhadas.length > 0) {
      return {
        correlacao: "TRANSVERSAL",
        tagsCompartilhadas: compartilhadas,
        familiaHabilitador: habilitador.familia,
      };
    }
  }

  // 3) AREA
  if (tec.area === areaCursoSimulado) {
    return { correlacao: "AREA", tagsCompartilhadas: [], familiaHabilitador: null };
  }

  return { correlacao: "NENHUMA", tagsCompartilhadas: [], familiaHabilitador: null };
}

// Bonus aplicado na pontuacao final (componente "area"):
export const bonusCorrelacao: Record<CorrelacaoTecnico, number> = {
  DIRETA: 10,
  TRANSVERSAL: 5,
  AREA: 3,
  NENHUMA: 0,
};
