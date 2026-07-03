import { z } from "zod";
import {
  BRANDING_DEFAULTS,
  normalizarHex,
  resolverBranding,
  validarContrasteAa,
  type BrandingCoresInput,
  type OrganizacaoBranding,
} from "@/lib/branding";

export const corHexSchema = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Use cor em formato hex (#RRGGBB)")
  .transform(normalizarHex);

export const brandingCoresSchema = z.object({
  corBackground: corHexSchema.nullable().optional(),
  corSurface: corHexSchema.nullable().optional(),
  corAccent: corHexSchema.nullable().optional(),
  corText: corHexSchema.nullable().optional(),
});

export type BrandingCoresInputValidated = z.infer<typeof brandingCoresSchema>;

/** Mescla cores parciais com valores existentes (null explícito limpa o campo). */
export function mesclarCoresBranding(
  entrada: BrandingCoresInput,
  existente?: BrandingCoresInput | null,
): OrganizacaoBranding {
  const resultado: OrganizacaoBranding = {
    corBackground: existente?.corBackground ?? null,
    corSurface: existente?.corSurface ?? null,
    corAccent: existente?.corAccent ?? null,
    corText: existente?.corText ?? null,
  };

  if ("corBackground" in entrada) resultado.corBackground = entrada.corBackground ?? null;
  if ("corSurface" in entrada) resultado.corSurface = entrada.corSurface ?? null;
  if ("corAccent" in entrada) resultado.corAccent = entrada.corAccent ?? null;
  if ("corText" in entrada) resultado.corText = entrada.corText ?? null;

  return resultado;
}

export type ErroContrasteBranding = {
  campo: "corText" | "corBackground";
  mensagem: string;
  ratio: number;
};

/** Valida contraste texto×fundo das cores efetivas após merge. */
export function validarContrasteBranding(
  entrada: BrandingCoresInput,
  existente?: BrandingCoresInput | null,
): ErroContrasteBranding | null {
  const mesclado = mesclarCoresBranding(entrada, existente);
  const { cssVars } = resolverBranding(mesclado);
  const fundo = cssVars["--color-background"] ?? BRANDING_DEFAULTS["--color-background"];
  const texto = cssVars["--color-text"] ?? BRANDING_DEFAULTS["--color-text"];
  const { ok, ratio } = validarContrasteAa(texto, fundo);
  if (ok) return null;

  return {
    campo: "corText",
    mensagem: `Contraste entre texto e fundo insuficiente (${ratio.toFixed(2)}:1; mínimo 4.5:1). Escolha cores mais distintas.`,
    ratio,
  };
}

export const brandingCoresComContrasteSchema = brandingCoresSchema.superRefine((data, ctx) => {
  const erro = validarContrasteBranding(data);
  if (erro) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: erro.mensagem,
      path: [erro.campo],
    });
  }
});
