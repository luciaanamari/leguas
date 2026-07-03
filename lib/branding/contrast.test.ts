import { describe, expect, it } from "vitest";
import {
  BRANDING_DEFAULTS,
  CONTRASTE_AA_MINIMO,
  luminanciaRelativa,
  normalizarHex,
  razaoContraste,
  resolverBranding,
  validarContrasteAa,
} from "./index";
import {
  brandingCoresComContrasteSchema,
  mesclarCoresBranding,
  validarContrasteBranding,
} from "@/lib/validations/branding";

describe("normalizarHex", () => {
  it("expande #RGB para #RRGGBB", () => {
    expect(normalizarHex("#fff")).toBe("#FFFFFF");
    expect(normalizarHex("#abc")).toBe("#AABBCC");
  });

  it("mantém #RRGGBB em maiúsculas", () => {
    expect(normalizarHex("#12203c")).toBe("#12203C");
  });
});

describe("razaoContraste", () => {
  it("preto sobre branco tem contraste máximo (~21:1)", () => {
    const ratio = razaoContraste("#000000", "#FFFFFF");
    expect(ratio).toBeGreaterThan(20);
    expect(ratio).toBeLessThanOrEqual(21);
  });

  it("cores iguais têm contraste 1:1", () => {
    expect(razaoContraste("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("é simétrico (ordem não importa)", () => {
    const ab = razaoContraste("#12203C", "#FFFFFF");
    const ba = razaoContraste("#FFFFFF", "#12203C");
    expect(ab).toBeCloseTo(ba, 10);
  });
});

describe("validarContrasteAa", () => {
  it("aceita par padrão do Léguas", () => {
    const { ok, ratio } = validarContrasteAa(
      BRANDING_DEFAULTS["--color-text"],
      BRANDING_DEFAULTS["--color-background"],
    );
    expect(ok).toBe(true);
    expect(ratio).toBeGreaterThan(CONTRASTE_AA_MINIMO);
  });

  it("rejeita texto claro sobre fundo claro", () => {
    const { ok, ratio } = validarContrasteAa("#F5F5F5", "#FFFFFF");
    expect(ok).toBe(false);
    expect(ratio).toBeLessThan(CONTRASTE_AA_MINIMO);
  });

  it("aceita texto escuro sobre fundo claro customizado", () => {
    const { ok } = validarContrasteAa("#12203C", "#E8F0FE");
    expect(ok).toBe(true);
  });
});

describe("luminanciaRelativa", () => {
  it("branco tem luminância maior que preto", () => {
    expect(luminanciaRelativa("#FFFFFF")).toBeGreaterThan(
      luminanciaRelativa("#000000"),
    );
  });
});

describe("resolverBranding", () => {
  it("usa defaults quando organização é nula", () => {
    const { cssVars, logoUrl } = resolverBranding(null);
    expect(cssVars["--color-background"]).toBe(BRANDING_DEFAULTS["--color-background"]);
    expect(cssVars["--color-accent"]).toBe(BRANDING_DEFAULTS["--color-accent"]);
    expect(logoUrl).toBe("/images/logo.svg");
  });

  it("sobrescreve apenas campos preenchidos", () => {
    const { cssVars } = resolverBranding({
      corAccent: "#FF0000",
      corBackground: null,
    });
    expect(cssVars["--color-accent"]).toBe("#FF0000");
    expect(cssVars["--color-background"]).toBe(BRANDING_DEFAULTS["--color-background"]);
  });
});

describe("validarContrasteBranding", () => {
  it("rejeita merge que resulta em baixo contraste", () => {
    const erro = validarContrasteBranding({
      corText: "#EEEEEE",
      corBackground: "#FFFFFF",
    });
    expect(erro).not.toBeNull();
    expect(erro?.ratio).toBeLessThan(CONTRASTE_AA_MINIMO);
  });

  it("preserva cor existente no merge e valida o par efetivo", () => {
    const mesclado = mesclarCoresBranding(
      { corBackground: "#FFFFFF" },
      { corText: "#12203C", corBackground: "#F5F6F8" },
    );
    const erro = validarContrasteBranding({ corBackground: "#FFFFFF" }, {
      corText: mesclado.corText,
      corBackground: "#F5F6F8",
    });
    expect(erro).toBeNull();
  });
});

describe("brandingCoresComContrasteSchema", () => {
  it("aceita payload válido", () => {
    const parsed = brandingCoresComContrasteSchema.safeParse({
      corBackground: "#FFFFFF",
      corText: "#12203C",
    });
    expect(parsed.success).toBe(true);
  });

  it("bloqueia combinação ilegível", () => {
    const parsed = brandingCoresComContrasteSchema.safeParse({
      corText: "#DDDDDD",
      corBackground: "#FFFFFF",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toMatch(/Contraste/);
    }
  });
});
