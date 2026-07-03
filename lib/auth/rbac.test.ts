import { describe, expect, it } from "vitest";
import {
  adminSessionFromJwt,
  escopoDeQuery,
  podeGerenciarEscola,
  podeGerenciarEstudante,
  podeGerenciarOrganizacao,
  type AdminSessionScope,
} from "./rbac";

const superAdmin: AdminSessionScope = {
  sub: "admin-1",
  adminRole: "SUPER_ADMIN",
  organizacaoId: null,
  escolaId: null,
};

const orgAdmin: AdminSessionScope = {
  sub: "admin-2",
  adminRole: "ORG_ADMIN",
  organizacaoId: "org-a",
  escolaId: null,
};

const escolaAdmin: AdminSessionScope = {
  sub: "admin-3",
  adminRole: "ESCOLA_ADMIN",
  organizacaoId: "org-a",
  escolaId: "escola-1",
};

const orgId = "org-a";
const escolaOrgA = { id: "escola-1", organizacaoId: "org-a" };
const escolaOrgB = { id: "escola-9", organizacaoId: "org-b" };

describe("podeGerenciarOrganizacao", () => {
  it("global admin gerencia qualquer organização", () => {
    expect(podeGerenciarOrganizacao(superAdmin, orgId)).toBe(true);
  });

  it("ORG_ADMIN só gerencia a própria organização", () => {
    expect(podeGerenciarOrganizacao(orgAdmin, orgId)).toBe(true);
    expect(podeGerenciarOrganizacao(orgAdmin, "org-b")).toBe(false);
  });

  it("ESCOLA_ADMIN não gerencia organização", () => {
    expect(podeGerenciarOrganizacao(escolaAdmin, orgId)).toBe(false);
  });
});

describe("podeGerenciarEscola", () => {
  it("global admin gerencia qualquer escola", () => {
    expect(podeGerenciarEscola(superAdmin, escolaOrgB)).toBe(true);
  });

  it("ORG_ADMIN gerencia escolas da sua organização", () => {
    expect(podeGerenciarEscola(orgAdmin, escolaOrgA)).toBe(true);
    expect(podeGerenciarEscola(orgAdmin, escolaOrgB)).toBe(false);
  });

  it("ESCOLA_ADMIN só gerencia a própria escola", () => {
    expect(podeGerenciarEscola(escolaAdmin, escolaOrgA)).toBe(true);
    expect(podeGerenciarEscola(escolaAdmin, escolaOrgB)).toBe(false);
  });
});

describe("podeGerenciarEstudante", () => {
  const estudanteEscola1 = {
    escolaId: "escola-1",
    escola: { organizacaoId: "org-a" },
  };
  const estudanteEscola9 = {
    escolaId: "escola-9",
    escola: { organizacaoId: "org-b" },
  };
  const estudanteSemEscola = { escolaId: null, escola: null };

  it("global admin gerencia qualquer estudante vinculado", () => {
    expect(podeGerenciarEstudante(superAdmin, estudanteEscola9)).toBe(true);
  });

  it("ORG_ADMIN gerencia estudantes das escolas da org", () => {
    expect(podeGerenciarEstudante(orgAdmin, estudanteEscola1)).toBe(true);
    expect(podeGerenciarEstudante(orgAdmin, estudanteEscola9)).toBe(false);
  });

  it("ESCOLA_ADMIN só gerencia estudantes da própria escola", () => {
    expect(podeGerenciarEstudante(escolaAdmin, estudanteEscola1)).toBe(true);
    expect(podeGerenciarEstudante(escolaAdmin, estudanteEscola9)).toBe(false);
  });

  it("estudante sem escolaId não é gerenciável por escopos restritos", () => {
    expect(podeGerenciarEstudante(orgAdmin, estudanteSemEscola)).toBe(false);
    expect(podeGerenciarEstudante(escolaAdmin, estudanteSemEscola)).toBe(false);
  });
});

describe("escopoDeQuery", () => {
  it("global admin não aplica filtro", () => {
    expect(escopoDeQuery(superAdmin)).toEqual({});
  });

  it("ORG_ADMIN filtra por organização", () => {
    expect(escopoDeQuery(orgAdmin)).toEqual({
      escola: { organizacaoId: "org-a" },
    });
  });

  it("ESCOLA_ADMIN filtra por escola", () => {
    expect(escopoDeQuery(escolaAdmin)).toEqual({ escolaId: "escola-1" });
  });
});

describe("adminSessionFromJwt", () => {
  it("monta escopo a partir do payload JWT", () => {
    const scope = adminSessionFromJwt({
      sub: "x",
      adminRole: "ORG_ADMIN",
      organizacaoId: "org-a",
      escolaId: null,
    });
    expect(scope).toEqual({
      sub: "x",
      adminRole: "ORG_ADMIN",
      organizacaoId: "org-a",
      escolaId: null,
    });
  });

  it("retorna null sem adminRole", () => {
    expect(adminSessionFromJwt({ sub: "x" })).toBeNull();
  });
});
