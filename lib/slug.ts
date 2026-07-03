/**
 * Normaliza um texto em slug seguro para URL: minúsculo, sem acentos,
 * apenas [a-z0-9-], sem hífens duplicados nem nas pontas.
 */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (marcas diacríticas)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}

/** Formato aceito para slug de link: 3–60 chars, [a-z0-9-], sem pontas em hífen. */
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/;

export function slugValido(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

/**
 * Gera um slug único a partir de uma base, consultando um verificador de
 * existência. Acrescenta sufixos -2, -3... até achar um livre.
 */
export async function slugUnico(
  base: string,
  existe: (slug: string) => Promise<boolean>,
): Promise<string> {
  const raiz = slugify(base) || "escola";
  let candidato = raiz;
  let n = 1;
  while (await existe(candidato)) {
    n += 1;
    candidato = `${raiz.slice(0, 56)}-${n}`;
  }
  return candidato;
}
