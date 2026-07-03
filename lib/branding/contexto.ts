import { cache } from "react";
import { prisma } from "@/lib/db";
import { resolverBranding, type BrandingResolvido } from "./resolve";

export type ContextoInstituicao = {
  linkId: string;
  slug: string;
  escolaId: string;
  escolaNome: string;
  organizacaoId: string;
  organizacaoNome: string;
  /** O link/escola/org estão ativos; a rota (welcome + login) funciona. */
  branding: BrandingResolvido;
  /** Toggle "aceitar novos cadastros" (link.ativo). Login não depende disso. */
  cadastroAberto: boolean;
};

export type ResultadoContextoLink =
  | { status: "ok"; contexto: ContextoInstituicao }
  | { status: "indisponivel"; escolaNome: string; branding: BrandingResolvido }
  | { status: "inexistente" };

const brandingSelect = {
  logoUrl: true,
  corBackground: true,
  corSurface: true,
  corAccent: true,
  corText: true,
} as const;

/**
 * Resolve o contexto institucional a partir do slug de um LinkCadastro.
 * - inexistente: slug não existe → 404.
 * - indisponivel: escola ou organização inativa → rota inteira fora do ar.
 * - ok: rota disponível (welcome + login); `cadastroAberto` = link.ativo.
 *
 * Memoizado por request (cache) para layout e página dividirem 1 query.
 */
export const resolverContextoPorSlug = cache(
  async (slug: string): Promise<ResultadoContextoLink> => {
    const link = await prisma.linkCadastro.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        ativo: true,
        escola: {
          select: {
            id: true,
            nome: true,
            ativo: true,
            logoUrl: true,
            organizacao: {
              select: { id: true, nome: true, ativo: true, ...brandingSelect },
            },
          },
        },
      },
    });

    if (!link) return { status: "inexistente" };

    const org = link.escola.organizacao;
    const branding = resolverBranding(org);
    // Cascata: logo da escola tem prioridade sobre o da organização.
    if (link.escola.logoUrl) branding.logoUrl = link.escola.logoUrl;

    if (!link.escola.ativo || !org.ativo) {
      return { status: "indisponivel", escolaNome: link.escola.nome, branding };
    }

    return {
      status: "ok",
      contexto: {
        linkId: link.id,
        slug: link.slug,
        escolaId: link.escola.id,
        escolaNome: link.escola.nome,
        organizacaoId: org.id,
        organizacaoNome: org.nome,
        branding,
        cadastroAberto: link.ativo,
      },
    };
  },
);

export type EscolaDaOrg = {
  nome: string;
  municipio: string | null;
  slug: string;
  cadastroAberto: boolean;
};

export type ResultadoContextoOrg =
  | {
      status: "ok";
      organizacaoNome: string;
      branding: BrandingResolvido;
      escolas: EscolaDaOrg[];
    }
  | { status: "indisponivel" };

/**
 * Resolve a landing de uma organização pelo seu slug: branding + lista de
 * escolas ativas (com o slug do link permanente de cada uma para o aluno
 * escolher a sua). Memoizado por request.
 */
export const resolverContextoPorOrgSlug = cache(
  async (orgSlug: string): Promise<ResultadoContextoOrg> => {
    const org = await prisma.organizacao.findUnique({
      where: { slug: orgSlug },
      select: {
        nome: true,
        ativo: true,
        ...brandingSelect,
        escolas: {
          where: { ativo: true },
          orderBy: { nome: "asc" },
          select: {
            nome: true,
            municipio: true,
            links: {
              where: { permanente: true },
              select: { slug: true, ativo: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!org || !org.ativo) return { status: "indisponivel" };

    const escolas: EscolaDaOrg[] = org.escolas
      .map((e) => {
        const link = e.links[0];
        if (!link) return null;
        return {
          nome: e.nome,
          municipio: e.municipio,
          slug: link.slug,
          cadastroAberto: link.ativo,
        };
      })
      .filter((e): e is EscolaDaOrg => e !== null);

    return {
      status: "ok",
      organizacaoNome: org.nome,
      branding: resolverBranding(org),
      escolas,
    };
  },
);
