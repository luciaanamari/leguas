import {
  LOGO_DIMENSAO_MAX_PX,
  LOGO_TAMANHO_MAX_BYTES,
  LOGO_TAMANHO_MAX_MB,
} from "./defaults";
import { BUCKET_PUBLIC, enviarObjeto, removerObjeto, urlPublica } from "@/lib/storage";

type TipoLogo = "png" | "jpg" | "svg";

type ResultadoOk = {
  ok: true;
  buffer: Buffer;
  ext: TipoLogo;
  mime: string;
};

type ResultadoErro = {
  ok: false;
  error: string;
};

export type ResultadoValidacaoLogo = ResultadoOk | ResultadoErro;

function detectarTipo(buffer: Buffer): { ext: TipoLogo; mime: string } | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ext: "png", mime: "image/png" };
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }

  const inicio = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf8").trim();
  if (inicio.startsWith("<svg") || inicio.startsWith("<?xml")) {
    if (!/<svg[\s>]/i.test(inicio)) return null;
    return { ext: "svg", mime: "image/svg+xml" };
  }

  return null;
}

function dimensoesPng(buffer: Buffer): { w: number; h: number } | null {
  if (buffer.length < 24) return null;
  return {
    w: buffer.readUInt32BE(16),
    h: buffer.readUInt32BE(20),
  };
}

function dimensoesJpeg(buffer: Buffer): { w: number; h: number } | null {
  let i = 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buffer[i + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      if (i + 9 >= buffer.length) return null;
      return {
        h: buffer.readUInt16BE(i + 5),
        w: buffer.readUInt16BE(i + 7),
      };
    }
    const len = buffer.readUInt16BE(i + 2);
    if (len < 2) return null;
    i += 2 + len;
  }
  return null;
}

function validarDimensoes(buffer: Buffer, ext: TipoLogo): string | null {
  if (ext === "svg") return null;

  const dim =
    ext === "png" ? dimensoesPng(buffer) : dimensoesJpeg(buffer);
  if (!dim) return "Não foi possível ler as dimensões da imagem.";

  if (dim.w > LOGO_DIMENSAO_MAX_PX || dim.h > LOGO_DIMENSAO_MAX_PX) {
    return `Logo muito grande (${dim.w}×${dim.h}px). Máximo ${LOGO_DIMENSAO_MAX_PX}×${LOGO_DIMENSAO_MAX_PX}px.`;
  }

  return null;
}

export async function validarArquivoLogo(arquivo: File): Promise<ResultadoValidacaoLogo> {
  if (arquivo.size === 0) {
    return { ok: false, error: "Arquivo vazio." };
  }
  if (arquivo.size > LOGO_TAMANHO_MAX_BYTES) {
    return { ok: false, error: `Arquivo muito grande. Máximo ${LOGO_TAMANHO_MAX_MB} MB.` };
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const tipo = detectarTipo(buffer);
  if (!tipo) {
    return { ok: false, error: "Formato inválido. Use PNG, JPG ou SVG." };
  }

  const erroDim = validarDimensoes(buffer, tipo.ext);
  if (erroDim) {
    return { ok: false, error: erroDim };
  }

  return { ok: true, buffer, ext: tipo.ext, mime: tipo.mime };
}

/** Chave determinística do logo da organização no bucket público. */
export function chaveLogoOrganizacao(organizacaoId: string): string {
  return `organizacoes/${organizacaoId}/logo`;
}

/**
 * Envia o logo da organização para o object storage (bucket público) e devolve
 * a URL pública completa com cache-bust. A chave é determinística (sobrescreve o
 * anterior, sem órfãos). Guardamos a URL pronta em `Organizacao.logoUrl`.
 */
export async function salvarLogoOrganizacao(
  buffer: Buffer,
  organizacaoId: string,
  mime: string,
): Promise<string> {
  const key = chaveLogoOrganizacao(organizacaoId);
  await enviarObjeto({ bucket: BUCKET_PUBLIC, key, corpo: buffer, contentType: mime });
  return `${urlPublica(key)}?v=${Date.now()}`;
}

/** Remove o logo da organização do bucket (usado ao apagar/limpar o branding). */
export async function removerLogoOrganizacao(organizacaoId: string): Promise<void> {
  try {
    await removerObjeto({ bucket: BUCKET_PUBLIC, key: chaveLogoOrganizacao(organizacaoId) });
  } catch {
    // objeto já inexistente
  }
}

/** Chave determinística do logo da escola no bucket público. */
export function chaveLogoEscola(organizacaoId: string, escolaId: string): string {
  return `organizacoes/${organizacaoId}/escolas/${escolaId}/logo`;
}

export async function salvarLogoEscola(
  buffer: Buffer,
  organizacaoId: string,
  escolaId: string,
  mime: string,
): Promise<string> {
  const key = chaveLogoEscola(organizacaoId, escolaId);
  await enviarObjeto({ bucket: BUCKET_PUBLIC, key, corpo: buffer, contentType: mime });
  return `${urlPublica(key)}?v=${Date.now()}`;
}

export async function removerLogoEscola(
  organizacaoId: string,
  escolaId: string,
): Promise<void> {
  try {
    await removerObjeto({ bucket: BUCKET_PUBLIC, key: chaveLogoEscola(organizacaoId, escolaId) });
  } catch {
    // objeto já inexistente
  }
}
