import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, podeGerenciarOrganizacao } from "@/lib/auth";
import {
  resolverBranding,
  salvarLogoOrganizacao,
  validarArquivoLogo,
} from "@/lib/branding";
import {
  brandingCoresSchema,
  mesclarCoresBranding,
  validarContrasteBranding,
} from "@/lib/validations/branding";

type Ctx = { params: Promise<{ id: string }> };

const brandingSelect = {
  id: true,
  nome: true,
  logoUrl: true,
  corBackground: true,
  corSurface: true,
  corAccent: true,
  corText: true,
} as const;

type OrganizacaoBrandingRow = {
  id: string;
  nome: string;
  logoUrl: string | null;
  corBackground: string | null;
  corSurface: string | null;
  corAccent: string | null;
  corText: string | null;
};

async function autorizarBranding(
  ctx: Ctx,
): Promise<
  | { ok: true; id: string; organizacao: OrganizacaoBrandingRow }
  | { ok: false; response: NextResponse }
> {
  const escopo = await lerEscopoAdmin();
  if (!escopo) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
    };
  }

  const { id } = await ctx.params;
  if (!podeGerenciarOrganizacao(escopo, id)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Acesso negado" }, { status: 403 }),
    };
  }

  const organizacao = await prisma.organizacao.findUnique({
    where: { id },
    select: brandingSelect,
  });
  if (!organizacao) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 },
      ),
    };
  }

  return { ok: true, id, organizacao };
}

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await autorizarBranding(ctx);
  if (!auth.ok) return auth.response;

  const { organizacao: existente, id } = auth;

  const body = await req.json().catch(() => null);
  const parsed = brandingCoresSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const coresExistentes = {
    corBackground: existente.corBackground,
    corSurface: existente.corSurface,
    corAccent: existente.corAccent,
    corText: existente.corText,
  };

  const erroContraste = validarContrasteBranding(parsed.data, coresExistentes);
  if (erroContraste) {
    return NextResponse.json(
      {
        error: erroContraste.mensagem,
        contraste: { ratio: erroContraste.ratio, campo: erroContraste.campo },
      },
      { status: 400 },
    );
  }

  const mesclado = mesclarCoresBranding(parsed.data, coresExistentes);

  const organizacao = await prisma.organizacao.update({
    where: { id },
    data: {
      corBackground: mesclado.corBackground,
      corSurface: mesclado.corSurface,
      corAccent: mesclado.corAccent,
      corText: mesclado.corText,
    },
    select: brandingSelect,
  });

  return NextResponse.json({
    organizacao,
    branding: resolverBranding(organizacao),
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const auth = await autorizarBranding(ctx);
  if (!auth.ok) return auth.response;

  const { id } = auth;

  const form = await req.formData().catch(() => null);
  const campo = form?.get("logo");
  if (!campo || !(campo instanceof File)) {
    return NextResponse.json(
      { error: "Envie o arquivo no campo logo (multipart/form-data)." },
      { status: 400 },
    );
  }

  const validado = await validarArquivoLogo(campo);
  if (!validado.ok) {
    return NextResponse.json({ error: validado.error }, { status: 400 });
  }

  // Chave determinística: o novo upload sobrescreve o anterior no bucket.
  const logoUrl = await salvarLogoOrganizacao(validado.buffer, id, validado.mime);

  const organizacao = await prisma.organizacao.update({
    where: { id },
    data: { logoUrl },
    select: brandingSelect,
  });

  return NextResponse.json({
    organizacao,
    branding: resolverBranding(organizacao),
  });
}
