export {
  BRANDING_DEFAULTS,
  LOGO_DIMENSAO_MAX_PX,
  LOGO_PADRAO,
  LOGO_TAMANHO_MAX_BYTES,
  LOGO_TAMANHO_MAX_MB,
  type BrandingCores,
  type BrandingCoresInput,
  type BrandingCssVar,
  type OrganizacaoBranding,
} from "./defaults";
export {
  CONTRASTE_AA_MINIMO,
  luminanciaRelativa,
  normalizarHex,
  razaoContraste,
  validarContrasteAa,
  type ResultadoContraste,
} from "./contrast";
export {
  brandingParaCss,
  resolverBranding,
  type BrandingResolvido,
} from "./resolve";
export {
  chaveLogoEscola,
  chaveLogoOrganizacao,
  removerLogoEscola,
  removerLogoOrganizacao,
  salvarLogoEscola,
  salvarLogoOrganizacao,
  validarArquivoLogo,
  type ResultadoValidacaoLogo,
} from "./logo-upload";
