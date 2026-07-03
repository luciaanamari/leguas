import { BRANDING_DEFAULTS, LOGO_PADRAO, type OrganizacaoBranding } from "./defaults";

export type BrandingResolvido = {
  cssVars: Record<string, string>;
  logoUrl: string;
};

function corOuPadrao(
  valor: string | null | undefined,
  varName: keyof typeof BRANDING_DEFAULTS,
): string {
  if (valor) return valor;
  return BRANDING_DEFAULTS[varName];
}

/** Resolve branding da organização com fallback para o tema padrão do Léguas. */
export function resolverBranding(org: OrganizacaoBranding | null | undefined): BrandingResolvido {
  const raw = org?.logoUrl?.trim();
  // Caminhos locais legados (/uploads/...) foram descontinuados com o object
  // storage; se sobrar algum no banco, tratamos como inexistente (logo padrão).
  const logoUrl = raw && !raw.startsWith("/uploads/") ? raw : LOGO_PADRAO;
  return {
    cssVars: {
      "--color-background": corOuPadrao(org?.corBackground, "--color-background"),
      "--color-surface": corOuPadrao(org?.corSurface, "--color-surface"),
      "--color-text": corOuPadrao(org?.corText, "--color-text"),
      "--color-accent": corOuPadrao(org?.corAccent, "--color-accent"),
    },
    logoUrl,
  };
}

/** Gera bloco CSS para injeção inline (`:root` ou wrapper). */
export function brandingParaCss(branding: BrandingResolvido): string {
  const decls = Object.entries(branding.cssVars)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join(" ");
  return `:root { ${decls} }`;
}
