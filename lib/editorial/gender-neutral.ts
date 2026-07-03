/**
 * Auditoria de linguagem neutra em gênero (F5 / M6).
 * Usado em testes e scripts de revisão editorial.
 */

/** Padrões que indicam flexão de gênero indevida no feedback ao estudante. */
export const PADROES_GENERO_PROIBIDOS: RegExp[] = [
  /\bgarot[oa]s?\b/i,
  /\bmenin[oa]s?\b/i,
  /\bfeminino\b/i,
  /\bmasculino\b/i,
  /\bconverse com elas\b/i,
  /\bvocê é (?:uma )?(?:técnica|cabeleireira|professora|enfermeira|desenvolvedora|engenheira|médica|fonoaudióloga|contadora|pesquisadora|produtora|fotógrafa|ilustradora|cenógrafa|animadora|gestora|farmacêutica|biomédica)\b/i,
  /\bvocê (?:é|está|era|ficou|voltou|saiu) (?:cansad[oa]|formad[oa]|contratad[oa]|pront[oa])\b/i,
  /\bfica atent[oa]\b/i,
  /\bpode ser contratad[oa]\b/i,
  /\bpreparad[oa]\s+para\b/i,
];

export type ViolacaoGenero = {
  padrao: string;
  trecho: string;
  indice: number;
};

export function auditarTextoNeutro(texto: string): ViolacaoGenero[] {
  const violacoes: ViolacaoGenero[] = [];
  for (const padrao of PADROES_GENERO_PROIBIDOS) {
    const m = texto.match(padrao);
    if (m && m.index !== undefined) {
      violacoes.push({
        padrao: padrao.source,
        trecho: m[0],
        indice: m.index,
      });
    }
  }
  return violacoes;
}

export function assertTextoNeutro(texto: string, contexto: string): void {
  const violacoes = auditarTextoNeutro(texto);
  if (violacoes.length > 0) {
    const detalhes = violacoes.map((v) => `"${v.trecho}" (${v.padrao})`).join("; ");
    throw new Error(`${contexto}: linguagem generizada — ${detalhes}`);
  }
}

/** Substituições editoriais para narrativas em 2ª pessoa (você). */
export const SUBSTITUICOES_NEUTRAS: [RegExp, string][] = [
  [/\bVocê é fotógrafa\b/g, "Você trabalha como fotógrafo"],
  [/\bVocê é professora de dança e coreógrafa\b/g, "Você ensina dança e coreografa"],
  [/\bVocê é professora de Artes\b/g, "Você leciona Artes"],
  [/\bVocê é professora numa\b/g, "Você leciona numa"],
  [/\bVocê é professora de\b/g, "Você leciona"],
  [/\bVocê é professora\b/g, "Você leciona"],
  [/\bVocê é ilustradora\b/g, "Você trabalha como ilustrador"],
  [/\bVocê é cenógrafa\b/g, "Você trabalha como cenógrafo"],
  [/\bVocê é produtora cultural\b/g, "Você trabalha como produtor cultural"],
  [/\bVocê é produtora audiovisual\b/g, "Você trabalha como produtor audiovisual"],
  [/\bVocê é produtora de\b/g, "Você trabalha como produtor de"],
  [/\bVocê é produtora\b/g, "Você trabalha como produtor"],
  [/\bVocê é animadora\b/g, "Você trabalha como animador"],
  [/\bVocê é chef proprietária\b/g, "Você comanda um restaurante"],
  [/\bVocê é engenheira florestal\b/g, "Você atua como engenheiro florestal"],
  [/\bVocê é gestora ambiental\b/g, "Você atua como gestor ambiental"],
  [/\bVocê é técnica agroecológica\b/g, "Você atua como técnico em agroecologia"],
  [/\bVocê é médica veterinária\b/g, "Você atua como médico veterinário"],
  [/\bVocê é médica\b/g, "Você atua como médico"],
  [/\bVocê é desenvolvedora\b/g, "Você trabalha como desenvolvedor"],
  [/\bVocê é pesquisadora\b/g, "Você trabalha como pesquisador"],
  [/\bVocê é contadora\b/g, "Você trabalha como contador"],
  [/\bVocê é fonoaudióloga\b/g, "Você trabalha como fonoaudiólogo"],
  [/\bVocê é enfermeira\b/g, "Você atua na enfermagem"],
  [/\bVocê é técnica em\b/g, "Você trabalha como técnico em"],
  [/\bVocê é técnica\b/g, "Você trabalha como técnico"],
  [/\bVocê é cabeleireira\b/g, "Você trabalha como cabeleireiro"],
  [/\bVocê é gestora pública\b/g, "Você atua como gestor público"],
  [/\bVocê é gestora ambiental\b/g, "Você atua como gestor ambiental"],
  [/\bVocê é gestora\b/g, "Você atua como gestor"],
  [/\bVocê é farmacêutica\b/g, "Você trabalha como farmacêutico"],
  [/\bVocê é biomédica\b/g, "Você trabalha como biómedico"],
  [/\bVocê é engenheira\b/g, "Você atua como engenheiro"],
  [/\bVocê é diretora\b/g, "Você dirige"],
  [/\bVocê é atriz\b/g, "Você atua"],
  [/\bVocê volta cansada\b/g, "Você volta com o corpo pesado de cansaço"],
  [/\bVocê está cansada\b/g, "Você está com muito cansaço"],
  [/\bpode ser contratada como técnica\b/g, "pode ser contratado como técnico"],
  [/\bcontratada como técnica\b/g, "contratado como técnico"],
  [/\bestá formada\b/g, "está formado"],
  [/\bcom clientes próprias\b/g, "com clientes próprios"],
  [/\bfica atenta\b/g, "fica em atenção"],
  [/\bSua primeira cliente\b/g, "Seu primeiro cliente do dia"],
  [/\bestá pronta\b./g, "o serviço está pronto."],
  [/\bconverse com elas\b/g, "converse com essas pessoas"],
  [/\bAlguns são professoras\b/g, "Alguns são educadores"],
  [/\bcabeleireiras experientes\b/g, "profissionais experientes do salão"],
  [/\bEla respeita\b/g, "A família respeita"],
  [/\bleva o filho\b/g, "acompanha a criança da família"],
  [/\bSua sócia\b/g, "Seu sócio"],
  [/\bsua sócia\b/g, "seu sócio"],
];

export function neutralizarTexto(texto: string): string {
  let out = texto;
  for (const [re, sub] of SUBSTITUICOES_NEUTRAS) {
    out = out.replace(re, sub);
  }
  return out;
}
