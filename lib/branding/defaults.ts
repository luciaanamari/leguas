/** Valores padrão do Léguas — espelham `app/globals.css` (:root). */
export const LOGO_PADRAO = "/images/logo.svg";

export const LOGO_TAMANHO_MAX_MB = 5;
export const LOGO_TAMANHO_MAX_BYTES = LOGO_TAMANHO_MAX_MB * 1024 * 1024;
export const LOGO_DIMENSAO_MAX_PX = 800;

export const BRANDING_DEFAULTS = {
  "--color-background": "#ffffff",
  "--color-surface": "#f5f6f8",
  "--color-text": "#12203c",
  "--color-accent": "#e2ac40",
} as const;

export type BrandingCssVar = keyof typeof BRANDING_DEFAULTS;

export type BrandingCores = {
  corBackground: string | null;
  corSurface: string | null;
  corAccent: string | null;
  corText: string | null;
};

export type BrandingCoresInput = {
  corBackground?: string | null;
  corSurface?: string | null;
  corAccent?: string | null;
  corText?: string | null;
};

export type OrganizacaoBranding = BrandingCoresInput & {
  logoUrl?: string | null;
};
