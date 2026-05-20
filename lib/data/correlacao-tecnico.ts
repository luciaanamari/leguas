// Correlacao transversal entre curso tecnico (que o aluno ja faz) e curso simulado.
//
// Modelo: 4 niveis de correlacao (ver lib/match/engine.ts):
//   - DIRETA       (+10): tec esta em cursosRelacionados[] do curso simulado
//   - TRANSVERSAL  (+5):  curso simulado e "habilitador" (TI, marketing, design,
//                         gestao, comunicacao) e compartilha pelo menos 1 tag de
//                         aplicacao com o tecnico
//   - AREA         (+3):  mesma area DISC, sem ponte transversal
//   - NENHUMA      (0):   sem relacao
//
// Vocabulario de tags e fechado e curado — 19 termos. Habilitadores tem familia
// (tecnologia/marketing/design/gestao/comunicacao) usada para escolher a
// mensagem mostrada ao aluno.

export type TagAplicacao =
  | "saude"
  | "alimentos"
  | "agro"
  | "industria"
  | "varejo"
  | "educacao"
  | "meio-ambiente"
  | "seguranca-publica"
  | "cultura"
  | "turismo"
  | "construcao"
  | "energia"
  | "logistica"
  | "financeiro"
  | "juridico"
  | "comunicacao"
  | "bem-estar-animal"
  | "qualidade-controle"
  | "tecnologia";

export type FamiliaHabilitador =
  | "tecnologia"
  | "marketing"
  | "design"
  | "gestao"
  | "comunicacao";

export interface CursoHabilitador {
  familia: FamiliaHabilitador;
  tagsCompatibilidade: TagAplicacao[];
}

export const nomesTag: Record<TagAplicacao, string> = {
  saude: "saúde",
  alimentos: "alimentos e bebidas",
  agro: "agronegócio",
  industria: "indústria",
  varejo: "varejo e comércio",
  educacao: "educação",
  "meio-ambiente": "meio ambiente",
  "seguranca-publica": "segurança pública",
  cultura: "cultura e entretenimento",
  turismo: "turismo e hospitalidade",
  construcao: "construção civil",
  energia: "energia",
  logistica: "logística",
  financeiro: "financeiro",
  juridico: "jurídico",
  comunicacao: "comunicação e mídia",
  "bem-estar-animal": "bem-estar animal",
  "qualidade-controle": "qualidade e controle",
  tecnologia: "tecnologia",
};

export const nomeFamilia: Record<FamiliaHabilitador, string> = {
  tecnologia: "tecnologia",
  marketing: "marketing e comunicação",
  design: "design",
  gestao: "gestão",
  comunicacao: "comunicação",
};

const TODAS_TAGS: TagAplicacao[] = [
  "saude",
  "alimentos",
  "agro",
  "industria",
  "varejo",
  "educacao",
  "meio-ambiente",
  "seguranca-publica",
  "cultura",
  "turismo",
  "construcao",
  "energia",
  "logistica",
  "financeiro",
  "juridico",
  "comunicacao",
  "bem-estar-animal",
  "qualidade-controle",
  "tecnologia",
];

// Lista de cursos habilitadores e suas tags de compatibilidade.
// Cursos NAO listados aqui sao tratados como verticais — neles a correlacao
// transversal nao se aplica.
export const cursosHabilitadores: Record<string, CursoHabilitador> = {
  // ── Tecnologia ─────────────────────────────────────────────────────────
  "ciencia-computacao": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "sistemas-informacao": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "analise-desenvolvimento": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "engenharia-software": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "redes-computadores": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "seguranca-informacao": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "ciencia-dados": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "inteligencia-artificial": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "desenvolvimento-web": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "desenvolvimento-mobile": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "cloud-computing": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  devops: { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "banco-dados": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "tecnico-informatica": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  "tecnico-redes": { familia: "tecnologia", tagsCompatibilidade: TODAS_TAGS },
  robotica: {
    familia: "tecnologia",
    tagsCompatibilidade: ["industria", "agro", "saude", "logistica", "energia"],
  },
  "jogos-digitais": {
    familia: "tecnologia",
    tagsCompatibilidade: ["cultura", "educacao", "comunicacao"],
  },
  "sistemas-embarcados": {
    familia: "tecnologia",
    tagsCompatibilidade: ["industria", "energia", "agro", "saude", "logistica"],
  },

  // ── Marketing ──────────────────────────────────────────────────────────
  marketing: { familia: "marketing", tagsCompatibilidade: TODAS_TAGS },
  "publicidade-propaganda": { familia: "marketing", tagsCompatibilidade: TODAS_TAGS },
  "comunicacao-digital": { familia: "marketing", tagsCompatibilidade: TODAS_TAGS },
  "midias-digitais": { familia: "marketing", tagsCompatibilidade: TODAS_TAGS },
  "gestao-redes-sociais": { familia: "marketing", tagsCompatibilidade: TODAS_TAGS },
  "relacoes-publicas": { familia: "marketing", tagsCompatibilidade: TODAS_TAGS },
  "assessoria-imprensa": { familia: "marketing", tagsCompatibilidade: TODAS_TAGS },

  // ── Design ─────────────────────────────────────────────────────────────
  "design-grafico": { familia: "design", tagsCompatibilidade: TODAS_TAGS },
  "ux-ui-design": { familia: "design", tagsCompatibilidade: TODAS_TAGS },
  "design-produto": {
    familia: "design",
    tagsCompatibilidade: ["industria", "varejo", "cultura", "saude", "alimentos"],
  },
  "design-interiores": {
    familia: "design",
    tagsCompatibilidade: ["construcao", "varejo", "turismo", "saude", "cultura"],
  },
  "arquitetura-interiores": {
    familia: "design",
    tagsCompatibilidade: ["construcao", "varejo", "turismo", "saude", "cultura"],
  },
  ilustracao: {
    familia: "design",
    tagsCompatibilidade: ["cultura", "educacao", "comunicacao", "varejo"],
  },
  animacao: {
    familia: "design",
    tagsCompatibilidade: ["cultura", "educacao", "comunicacao"],
  },
  fotografia: { familia: "design", tagsCompatibilidade: TODAS_TAGS },

  // ── Gestão ─────────────────────────────────────────────────────────────
  administracao: { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  "gestao-projetos": { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  "gestao-rh": { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  "gestao-financeira": { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  "ciencias-contabeis": { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  economia: { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  financas: { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  empreendedorismo: { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  logistica: { familia: "gestao", tagsCompatibilidade: TODAS_TAGS },
  "comercio-exterior": {
    familia: "gestao",
    tagsCompatibilidade: ["industria", "agro", "alimentos", "varejo"],
  },
  "gestao-comercial": {
    familia: "gestao",
    tagsCompatibilidade: ["varejo", "industria", "agro", "alimentos"],
  },
  "gestao-publica": {
    familia: "gestao",
    tagsCompatibilidade: ["seguranca-publica", "saude", "educacao", "meio-ambiente"],
  },
  "administracao-publica": {
    familia: "gestao",
    tagsCompatibilidade: ["seguranca-publica", "saude", "educacao", "meio-ambiente"],
  },

  // ── Comunicação ────────────────────────────────────────────────────────
  jornalismo: { familia: "comunicacao", tagsCompatibilidade: TODAS_TAGS },
  "producao-audiovisual": { familia: "comunicacao", tagsCompatibilidade: TODAS_TAGS },
};

export function ehHabilitador(cursoSlug: string): boolean {
  return cursoSlug in cursosHabilitadores;
}

// Mensagens curadas por par (tag x familia). Onde nao houver entrada, o engine
// cai para um template paramétrico em `mensagemTransversalGenerica`.
type MensagensCuradas = Partial<
  Record<TagAplicacao, Partial<Record<FamiliaHabilitador, string>>>
>;

export const mensagensCuradas: MensagensCuradas = {
  alimentos: {
    tecnologia:
      "A indústria alimentícia depende cada vez mais de software para rastreabilidade, controle de qualidade e cadeia logística — quem entende os dois lados é raro no mercado.",
    marketing:
      "Marca de alimento vive de comunicação. Quem conhece a cadeia produtiva tem vantagem real ao criar campanha que conversa com produtor e consumidor.",
    design:
      "Embalagem, identidade visual e experiência de marca em food são áreas inteiras. Seu conhecimento técnico vira diferencial para criar produto que funciona.",
    gestao:
      "Gestão na cadeia alimentícia exige entender produção, logística e padrão sanitário. Seu técnico vira atalho para liderança nesse setor.",
  },
  saude: {
    tecnologia:
      "TI na saúde explodiu — prontuário eletrônico, telemedicina, dispositivo médico — e o setor precisa de quem entende protocolo clínico, não só código.",
    marketing:
      "Comunicação em saúde é altamente regulada. Entender o lado clínico ajuda a criar campanha que respeita norma e fala com paciente.",
    design:
      "Design de UX em produto de saúde precisa de gente que entende fluxo clínico, prontuário e jargão. Seu técnico é diferencial.",
    gestao:
      "Gestão hospitalar e de clínica exige domínio do operacional clínico. Seu técnico abre porta para cargo de coordenação em saúde.",
  },
  agro: {
    tecnologia:
      "Agritech é uma das áreas que mais cresceu no Brasil — software, sensor, drone, satélite — e quem entende lavoura ou pecuária tem vantagem ao desenhar solução.",
    marketing:
      "Comunicação para agronegócio é mercado próprio. Quem fala a língua do produtor rural cria campanha que ressoa no setor.",
    design:
      "Design de produto e embalagem no agro tem demanda crescente. Seu conhecimento da cadeia produtiva vira diferencial.",
    gestao:
      "Gestão de propriedade rural, cooperativa e cadeia agroindustrial pede quem entende campo e escritório. Seu técnico é trilha pronta.",
  },
  industria: {
    tecnologia:
      "Indústria 4.0 conecta software, automação e processo produtivo. Quem entende chão de fábrica acelera projeto de transformação digital.",
    marketing:
      "Marketing B2B industrial é nicho onde técnico vira ativo — falar com engenheiro de cliente, entender o produto, criar material técnico que vende.",
    design:
      "Design industrial pede gente que conhece restrição de produção. Seu técnico vira ponte entre estética e fabricação real.",
    gestao:
      "Gestão industrial mistura processo, pessoas e custo. Seu técnico abre acesso a cargo de supervisão e coordenação.",
  },
  varejo: {
    tecnologia:
      "Varejo digital é grande motor de tecnologia — e-commerce, ERP, integração de loja. Quem viveu operação desenha sistema melhor.",
    marketing:
      "Marketing de varejo vive de campanha de conversão e fidelização. Entender o ponto de venda é vantagem na criação.",
    design:
      "Design de loja, vitrine e identidade visual de marca varejista são áreas inteiras que pedem quem viveu o atendimento.",
    gestao:
      "Gestão de varejo conecta estoque, equipe, vitrine e venda. Seu técnico cria caminho mais curto para liderar loja ou rede.",
  },
  "meio-ambiente": {
    tecnologia:
      "Tecnologia ambiental — monitoramento, sensor, sistema de informação geográfica — precisa de quem entende campo, não só código.",
    marketing:
      "Sustentabilidade virou agenda de marca. Quem conhece norma e prática ambiental cria comunicação que convence em vez de greenwashing.",
    gestao:
      "Gestão ambiental em empresa e fiscalização no setor público pedem técnico que conhece o processo por dentro.",
  },
  cultura: {
    tecnologia:
      "Tecnologia para cultura — streaming, jogo, plataforma criativa, edição — precisa de quem domina o ofício artístico.",
    marketing:
      "Marketing cultural depende de quem conhece linguagem artística e público. Combinação rara no mercado.",
    design:
      "Design para projeto cultural pede sensibilidade artística. Seu técnico te coloca na conversa com mais propriedade.",
    gestao:
      "Gestão cultural, captação via Lei Rouanet e produção de evento pedem quem entende o lado artístico. Seu técnico vira diferencial.",
  },
  turismo: {
    tecnologia:
      "Tech para turismo — plataforma de reserva, app de guia, gestão hoteleira — precisa de quem viveu o setor para desenhar bem.",
    marketing:
      "Marketing turístico vive de imagem, narrativa e jornada. Quem conhece o destino por dentro entrega comunicação mais autêntica.",
    gestao:
      "Gestão hoteleira, agência e operadora pedem quem entende experiência do hóspede. Seu técnico abre porta para gestão direta.",
  },
  logistica: {
    tecnologia:
      "Logtech é grande área — roteirização, gestão de frota, integração de marketplace. Precisa de quem entende fluxo físico real.",
    gestao:
      "Gestão logística é coração de muita empresa. Seu técnico cria atalho para coordenação em distribuição e transporte.",
  },
  educacao: {
    tecnologia:
      "Edtech precisa de quem entende sala de aula — plataforma de ensino, ferramenta de gestão escolar, aprendizagem adaptativa.",
    marketing:
      "Marketing educacional fala com aluno, pai e gestor. Entender o trabalho pedagógico ajuda a criar campanha que respeita a sala de aula.",
    design:
      "Design instrucional, material didático e interface de plataforma educacional pedem quem entende como gente aprende.",
  },
  "seguranca-publica": {
    tecnologia:
      "Tecnologia para segurança pública — análise criminal, vigilância, gestão de operação — precisa de quem entende dinâmica de campo.",
    gestao:
      "Gestão pública em segurança pede quem entende operação. Seu técnico vira ativo em coordenação e política pública.",
  },
  energia: {
    tecnologia:
      "Setor de energia (renovável, smart grid, eficiência) precisa de software de monitoramento e otimização. Quem conhece a infra física tem vantagem.",
    gestao:
      "Gestão no setor elétrico, solar e eólico mistura técnico, regulatório e comercial. Seu técnico abre porta.",
  },
  construcao: {
    tecnologia:
      "Construtech traz BIM, gestão de obra e IoT em canteiro. Quem viveu obra entrega solução que fala com engenheiro de campo.",
    design:
      "Design de espaço e produto para construção civil pede quem conhece restrição técnica. Seu técnico evita projeto inviável.",
    gestao:
      "Gestão de obra e empresa de construção pede quem entende canteiro. Seu técnico é trilha para coordenação direta.",
  },
  financeiro: {
    tecnologia:
      "Fintech é setor enorme — pagamento, crédito, investimento — e quem entende rotina contábil ou financeira desenha produto melhor.",
    marketing:
      "Marketing de banco e financeira é regulado e técnico. Quem entende produto financeiro cria campanha mais responsável.",
  },
  juridico: {
    tecnologia:
      "Lawtech cresce rápido — automação de petição, análise de contrato, jurimetria — e precisa de quem fala a língua jurídica.",
    marketing:
      "Comunicação para escritório de advocacia tem norma rígida da OAB. Quem entende o lado jurídico evita risco.",
  },
  comunicacao: {
    tecnologia:
      "Mídia e comunicação migraram para plataforma digital — newsroom integrada, automação editorial. Precisa de quem entende a redação.",
    design:
      "Design editorial, identidade visual de veículo e produto de mídia pedem quem entende o ritmo da redação.",
  },
  "bem-estar-animal": {
    tecnologia:
      "Petech — app, telemedicina veterinária, gestão de clínica animal — é setor em alta e pede quem entende o lado clínico animal.",
  },
  "qualidade-controle": {
    tecnologia:
      "Software de gestão da qualidade, rastreabilidade e auditoria pede quem viveu a norma (ISO, BPF, HACCP) por dentro.",
    gestao:
      "Gestão da qualidade é cargo cobiçado em indústria. Seu técnico é entrada direta.",
  },
  tecnologia: {
    marketing:
      "Marketing de produto de tecnologia precisa de quem fala a língua técnica. Entender o produto evita campanha que não vende.",
    design:
      "Design de produto digital pede quem entende sistema. Sua base técnica vira vantagem para entregar UI consistente com a infra.",
    gestao:
      "Gestão de produto e projeto em TI pede quem entende código. Seu técnico é trilha direta para PM ou tech lead.",
  },
};

export function mensagemTransversalGenerica(
  tags: TagAplicacao[],
  familia: FamiliaHabilitador,
  nomeCurso: string,
  nomeTecnico: string,
): string {
  const rotuloTags = tags.map((t) => nomesTag[t]).join(" e ");
  const rotuloFamilia = nomeFamilia[familia];
  return `Profissionais de ${rotuloFamilia} que atuam em ${rotuloTags} têm vantagem quando conhecem o lado prático do setor. Seu ${nomeTecnico} cria essa ponte para ${nomeCurso}.`;
}

export function escolherMensagemTransversal(
  tagsCompartilhadas: TagAplicacao[],
  familia: FamiliaHabilitador,
  nomeCurso: string,
  nomeTecnico: string,
): string {
  // Preferimos a primeira mensagem curada que existir para alguma das tags em comum.
  for (const tag of tagsCompartilhadas) {
    const curada = mensagensCuradas[tag]?.[familia];
    if (curada) return curada;
  }
  return mensagemTransversalGenerica(tagsCompartilhadas, familia, nomeCurso, nomeTecnico);
}
