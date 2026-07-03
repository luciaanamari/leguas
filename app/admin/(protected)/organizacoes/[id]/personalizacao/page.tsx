import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { lerEscopoAdmin, podeGerenciarOrganizacao } from "@/lib/auth";
import { prisma } from "@/lib/db";
import FormularioPersonalizacao from "@/components/admin/FormularioPersonalizacao";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

const brandingSelect = {
  id: true,
  nome: true,
  logoUrl: true,
  corBackground: true,
  corSurface: true,
  corAccent: true,
  corText: true,
} as const;

export default async function PersonalizacaoOrganizacaoPage({
  params,
}: {
  params: Params;
}) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  const { id } = await params;
  if (!podeGerenciarOrganizacao(escopo, id)) {
    redirect("/admin/dashboard");
  }

  const organizacao = await prisma.organizacao.findUnique({
    where: { id },
    select: brandingSelect,
  });
  if (!organizacao) notFound();

  return (
    <div>
      <Link
        href={`/admin/organizacoes/${organizacao.id}`}
        className="muted"
        style={{ textDecoration: "none" }}
      >
        ← voltar para {organizacao.nome}
      </Link>
      <div style={{ marginTop: "1rem" }}>
        <FormularioPersonalizacao
          organizacaoId={organizacao.id}
          nomeOrganizacao={organizacao.nome}
          inicial={{
            logoUrl: organizacao.logoUrl,
            corBackground: organizacao.corBackground,
            corSurface: organizacao.corSurface,
            corAccent: organizacao.corAccent,
            corText: organizacao.corText,
          }}
        />
      </div>
    </div>
  );
}
