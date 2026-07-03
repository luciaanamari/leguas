const RAZAO_MINIMA_AA = 4.5;

type Rgb = { r: number; g: number; b: number };

/** Normaliza `#RGB` ou `#RRGGBB` para `#RRGGBB` em maiúsculas. */
export function normalizarHex(hex: string): string {
  const limpo = hex.trim();
  const match = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.exec(limpo);
  if (!match) {
    throw new Error(`Cor hex inválida: ${hex}`);
  }
  const raw = match[1];
  if (raw.length === 3) {
    const [r, g, b] = raw.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return `#${raw}`.toUpperCase();
}

function hexParaRgb(hex: string): Rgb {
  const norm = normalizarHex(hex).slice(1);
  return {
    r: parseInt(norm.slice(0, 2), 16),
    g: parseInt(norm.slice(2, 4), 16),
    b: parseInt(norm.slice(4, 6), 16),
  };
}

function canalLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Luminância relativa WCAG 2.x (0–1). */
export function luminanciaRelativa(hex: string): number {
  const { r, g, b } = hexParaRgb(hex);
  const rl = canalLinear(r);
  const gl = canalLinear(g);
  const bl = canalLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** Razão de contraste entre duas cores (1–21). */
export function razaoContraste(foreground: string, background: string): number {
  const l1 = luminanciaRelativa(foreground);
  const l2 = luminanciaRelativa(background);
  const claro = Math.max(l1, l2);
  const escuro = Math.min(l1, l2);
  return (claro + 0.05) / (escuro + 0.05);
}

export type ResultadoContraste = {
  ok: boolean;
  ratio: number;
  minimo: number;
};

/** Valida contraste WCAG AA entre texto e fundo (mínimo 4.5:1). */
export function validarContrasteAa(
  texto: string,
  fundo: string,
  minimo: number = RAZAO_MINIMA_AA,
): ResultadoContraste {
  const ratio = razaoContraste(texto, fundo);
  return { ok: ratio >= minimo, ratio, minimo };
}

export const CONTRASTE_AA_MINIMO = RAZAO_MINIMA_AA;
