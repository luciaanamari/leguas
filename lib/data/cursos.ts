import areasData1 from "./cursos-1.json";
import areasData2 from "./cursos-2.json";
import areasData3 from "./cursos-3.json";
import areasData4 from "./cursos-4.json";

export interface Curso {
  slug: string;
  nome: string;
  descricaoCurta: string;
  duracao: string;
  salarioMedio: string;
  narrativaEstudante: string;
  narrativaProfissional: string;
}

export interface Area {
  slug: string;
  nome: string;
  icon: string;
  descricao: string;
  cursos: Curso[];
}

/**
 * Represents the six post-high-school paths.
 * We define this locally because the Prisma enum does not include TECNOLOGO.
 */
export type TrilhaType =
  | "PRESENCIAL"
  | "EAD"
  | "TECNOLOGO"
  | "TECNICO"
  | "CONCURSO"
  | "MERCADO";

export const todasAsAreas: Area[] = [
  ...(areasData1 as Area[]),
  ...(areasData2 as Area[]),
  ...(areasData3 as Area[]),
  ...(areasData4 as Area[]),
];

// Maps trilha slug (from DB) → TrilhaType enum value
export const slugParaModalidade: Record<string, TrilhaType> = {
  "bacharelado-presencial": "PRESENCIAL",
  "bacharelado-ead": "EAD",
  tecnologo: "TECNOLOGO",
  "curso-tecnico": "TECNICO",
  "concurso-publico": "CONCURSO",
  "mercado-direto": "MERCADO",
};

/**
 * Which trilha modalidades each course belongs to.
 * A course can belong to multiple modalidades (e.g. Administração fits
 * PRESENCIAL, EAD and CONCURSO).
 */
export const courseModalidades: Record<string, TrilhaType[]> = {
  // ── SAÚDE ──────────────────────────────────────────────────────────────
  medicina: ["PRESENCIAL", "CONCURSO"],
  enfermagem: ["PRESENCIAL", "EAD", "CONCURSO"],
  farmacia: ["PRESENCIAL", "CONCURSO"],
  odontologia: ["PRESENCIAL", "CONCURSO"],
  fisioterapia: ["PRESENCIAL", "CONCURSO"],
  biologia: ["PRESENCIAL", "EAD", "CONCURSO"],
  nutricao: ["PRESENCIAL", "EAD", "CONCURSO"],
  psicologia: ["PRESENCIAL", "EAD", "CONCURSO"],
  biomedicina: ["PRESENCIAL"],
  "educacao-fisica": ["PRESENCIAL", "EAD", "CONCURSO"],
  fonoaudiologia: ["PRESENCIAL", "CONCURSO"],
  "terapia-ocupacional": ["PRESENCIAL", "CONCURSO"],
  "medicina-veterinaria": ["PRESENCIAL"],
  "servico-social": ["PRESENCIAL", "EAD", "CONCURSO"],
  "tecnico-enfermagem": ["TECNICO", "CONCURSO"],
  "tecnico-farmacia": ["TECNICO"],
  "tecnico-radiologia": ["TECNICO", "CONCURSO"],
  "tecnico-analises-clinicas": ["TECNICO"],
  "tecnico-saude-bucal": ["TECNICO"],
  "tecnico-nutricao": ["TECNICO"],

  // ── EXATAS ─────────────────────────────────────────────────────────────
  "engenharia-civil": ["PRESENCIAL", "CONCURSO"],
  "engenharia-eletrica": ["PRESENCIAL", "CONCURSO"],
  "engenharia-mecanica": ["PRESENCIAL"],
  "engenharia-producao": ["PRESENCIAL", "EAD"],
  "arquitetura-urbanismo": ["PRESENCIAL", "CONCURSO"],
  matematica: ["PRESENCIAL", "EAD", "CONCURSO"],
  fisica: ["PRESENCIAL", "CONCURSO"],
  quimica: ["PRESENCIAL", "CONCURSO"],
  "engenharia-ambiental": ["PRESENCIAL", "CONCURSO"],
  "engenharia-quimica": ["PRESENCIAL"],
  estatistica: ["PRESENCIAL", "EAD", "CONCURSO"],
  "engenharia-computacao": ["PRESENCIAL"],
  geociencias: ["PRESENCIAL"],
  meteorologia: ["PRESENCIAL", "CONCURSO"],
  "tecnico-eletrotecnica": ["TECNICO"],
  "tecnico-edificacoes": ["TECNICO"],
  "tecnico-quimica": ["TECNICO"],
  "tecnico-mecanica": ["TECNICO"],
  "tecnico-seguranca-trabalho": ["TECNICO", "CONCURSO"],
  "engenharia-sanitaria": ["PRESENCIAL", "CONCURSO"],

  // ── HUMANAS ────────────────────────────────────────────────────────────
  direito: ["PRESENCIAL", "EAD", "CONCURSO"],
  historia: ["PRESENCIAL", "EAD", "CONCURSO"],
  filosofia: ["PRESENCIAL", "EAD", "CONCURSO"],
  "ciencias-sociais": ["PRESENCIAL", "EAD", "CONCURSO"],
  "servico-social-humanas": ["PRESENCIAL", "EAD", "CONCURSO"],
  "relacoes-internacionais": ["PRESENCIAL"],
  pedagogia: ["PRESENCIAL", "EAD", "CONCURSO"],
  "ciencia-politica": ["PRESENCIAL", "EAD", "CONCURSO"],
  antropologia: ["PRESENCIAL"],
  arqueologia: ["PRESENCIAL"],
  geografia: ["PRESENCIAL", "EAD", "CONCURSO"],
  "gestao-publica": ["PRESENCIAL", "EAD", "CONCURSO"],
  sociologia: ["PRESENCIAL", "EAD", "CONCURSO"],
  "licenciatura-historia": ["PRESENCIAL", "EAD", "CONCURSO"],
  "educacao-especial": ["PRESENCIAL", "EAD", "CONCURSO"],
  teologia: ["PRESENCIAL", "EAD"],
  museologia: ["PRESENCIAL"],
  "administracao-publica": ["PRESENCIAL", "EAD", "CONCURSO"],
  "defesa-social": ["PRESENCIAL", "CONCURSO"],
  "politicas-publicas": ["PRESENCIAL", "EAD", "CONCURSO"],

  // ── LINGUÍSTICA ────────────────────────────────────────────────────────
  jornalismo: ["PRESENCIAL", "CONCURSO"],
  "publicidade-propaganda": ["PRESENCIAL", "EAD"],
  "letras-portugues": ["PRESENCIAL", "EAD", "CONCURSO"],
  "letras-ingles": ["PRESENCIAL", "EAD", "CONCURSO"],
  "relacoes-publicas": ["PRESENCIAL", "EAD"],
  "secretariado-executivo": ["PRESENCIAL", "EAD", "TECNOLOGO", "MERCADO"],
  "licenciatura-letras": ["PRESENCIAL", "EAD", "CONCURSO"],
  "comunicacao-digital": ["TECNOLOGO", "EAD", "MERCADO"],
  linguistica: ["PRESENCIAL", "EAD"],
  editoracao: ["PRESENCIAL", "EAD"],
  "letras-espanhol": ["PRESENCIAL", "EAD", "CONCURSO"],
  "traducao-interpretacao": ["PRESENCIAL", "MERCADO"],
  "assessoria-imprensa": ["PRESENCIAL", "TECNOLOGO"],
  "radio-tv": ["PRESENCIAL"],
  "producao-editorial": ["PRESENCIAL", "TECNOLOGO"],
  libras: ["PRESENCIAL", "EAD", "CONCURSO"],
  "midias-digitais": ["TECNOLOGO", "MERCADO"],
  "gestao-redes-sociais": ["TECNOLOGO", "MERCADO"],
  "escrita-criativa": ["TECNOLOGO", "MERCADO"],

  // ── TECNOLOGIA ─────────────────────────────────────────────────────────
  "ciencia-computacao": ["PRESENCIAL"],
  "sistemas-informacao": ["PRESENCIAL", "EAD"],
  "analise-desenvolvimento": ["TECNOLOGO", "EAD"],
  "engenharia-software": ["PRESENCIAL"],
  "redes-computadores": ["TECNOLOGO"],
  "seguranca-informacao": ["PRESENCIAL", "TECNOLOGO", "EAD"],
  "ciencia-dados": ["PRESENCIAL", "TECNOLOGO"],
  "inteligencia-artificial": ["PRESENCIAL"],
  "desenvolvimento-web": ["TECNOLOGO", "MERCADO"],
  "desenvolvimento-mobile": ["TECNOLOGO", "MERCADO"],
  "cloud-computing": ["TECNOLOGO", "MERCADO"],
  "ux-ui-design": ["TECNOLOGO", "MERCADO"],
  "jogos-digitais": ["PRESENCIAL", "TECNOLOGO"],
  robotica: ["PRESENCIAL"],
  devops: ["TECNOLOGO", "MERCADO"],
  "banco-dados": ["TECNOLOGO", "EAD"],
  "ti-saude": ["TECNOLOGO"],
  "sistemas-embarcados": ["PRESENCIAL"],
  "tecnico-informatica": ["TECNICO", "MERCADO"],
  "tecnico-redes": ["TECNICO"],

  // ── NEGÓCIOS ───────────────────────────────────────────────────────────
  administracao: ["PRESENCIAL", "EAD", "CONCURSO"],
  "ciencias-contabeis": ["PRESENCIAL", "EAD", "CONCURSO"],
  economia: ["PRESENCIAL", "CONCURSO"],
  marketing: ["PRESENCIAL", "EAD", "TECNOLOGO"],
  "comercio-exterior": ["PRESENCIAL", "EAD"],
  financas: ["PRESENCIAL", "EAD"],
  logistica: ["TECNOLOGO", "EAD"],
  "gestao-rh": ["TECNOLOGO", "EAD"],
  "gestao-projetos": ["TECNOLOGO", "EAD"],
  empreendedorismo: ["TECNOLOGO", "MERCADO"],
  turismo: ["PRESENCIAL", "EAD", "TECNOLOGO"],
  hotelaria: ["PRESENCIAL", "TECNOLOGO"],
  eventos: ["TECNOLOGO", "MERCADO"],
  agronegocio: ["PRESENCIAL", "EAD"],
  "gestao-comercial": ["TECNOLOGO", "EAD", "MERCADO"],
  "gestao-financeira": ["TECNOLOGO", "EAD"],
  "tecnico-administracao": ["TECNICO"],
  "tecnico-contabilidade": ["TECNICO"],
  comercio: ["TECNICO", "MERCADO"],

  // ── ARTES ──────────────────────────────────────────────────────────────
  "design-grafico": ["PRESENCIAL", "EAD", "TECNOLOGO", "MERCADO"],
  "arquitetura-interiores": ["PRESENCIAL", "EAD"],
  musica: ["PRESENCIAL", "MERCADO"],
  teatro: ["PRESENCIAL"],
  "cinema-audiovisual": ["PRESENCIAL"],
  fotografia: ["PRESENCIAL", "TECNOLOGO", "MERCADO"],
  danca: ["PRESENCIAL", "MERCADO"],
  "artes-visuais": ["PRESENCIAL", "EAD", "CONCURSO"],
  moda: ["PRESENCIAL", "TECNOLOGO"],
  animacao: ["PRESENCIAL", "TECNOLOGO"],
  "design-produto": ["PRESENCIAL", "TECNOLOGO"],
  gastronomia: ["TECNOLOGO", "MERCADO"],
  confeitaria: ["TECNICO", "MERCADO"],
  "culinaria-regional": ["TECNICO", "MERCADO"],
  "producao-cultural": ["PRESENCIAL"],
  "arte-educacao": ["PRESENCIAL", "CONCURSO"],
  ilustracao: ["TECNOLOGO", "MERCADO"],
  cenografia: ["PRESENCIAL"],
  "producao-audiovisual": ["TECNOLOGO", "MERCADO"],
  "design-interiores": ["TECNOLOGO", "MERCADO"],

  // ── AGROPECUÁRIA ───────────────────────────────────────────────────────
  agronomia: ["PRESENCIAL", "CONCURSO"],
  zootecnia: ["PRESENCIAL", "CONCURSO"],
  "medicina-veterinaria-rural": ["PRESENCIAL"],
  "engenharia-florestal": ["PRESENCIAL", "CONCURSO"],
  "gestao-ambiental": ["TECNOLOGO", "EAD", "CONCURSO"],
  agroecologia: ["PRESENCIAL", "TECNOLOGO"],
  "tecnico-agropecuaria": ["TECNICO"],
  "pesca-aquicultura": ["PRESENCIAL", "TECNOLOGO"],
  cooperativismo: ["PRESENCIAL", "TECNOLOGO"],
  "agronegocio-rural": ["PRESENCIAL", "EAD"],
  fruticultura: ["TECNOLOGO", "TECNICO"],
  "ovinocultura-caprinocultura": ["TECNICO", "MERCADO"],
  avicultura: ["TECNICO"],
  apicultura: ["TECNICO", "MERCADO"],
  "irrigacao-drenagem": ["TECNOLOGO", "TECNICO"],
  "tecnico-meio-ambiente": ["TECNICO"],
  "tecnico-agroindustria": ["TECNICO"],
  "producao-organica": ["TECNICO", "MERCADO"],
  "extrativismo-sustentavel": ["TECNICO", "MERCADO"],
  "gestao-propriedades-rurais": ["TECNOLOGO", "MERCADO"],
};

export function buscarArea(slug: string): Area | undefined {
  return todasAsAreas.find((a) => a.slug === slug);
}

export function buscarCurso(
  areaSlug: string,
  cursoSlug: string,
): Curso | undefined {
  const area = buscarArea(areaSlug);
  return area?.cursos.find((c) => c.slug === cursoSlug);
}

/** Returns courses in an area that match the given trilha slug */
export function cursosPorTrilha(area: Area, trilhaSlug: string): Curso[] {
  const modalidade = slugParaModalidade[trilhaSlug];
  if (!modalidade) return area.cursos;
  return area.cursos.filter((c) =>
    (courseModalidades[c.slug] ?? []).includes(modalidade),
  );
}

/** Returns areas that have at least one course matching the trilha slug */
export function areasPorTrilha(trilhaSlug: string): Area[] {
  return todasAsAreas.filter(
    (area) => cursosPorTrilha(area, trilhaSlug).length > 0,
  );
}
