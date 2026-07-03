import { redirect } from "next/navigation";
import { lerEscopoAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import FormularioPersonalizacao from "@/components/admin/FormularioPersonalizacao";

export const dynamic = "force-dynamic";

const brandingSelect = {
  id: true,
  nome: true,
  logoUrl: true,
  corBackground: true,
  corSurface: true,
  corAccent: true,
  corText: true,
} as const;

export default async function PersonalizacaoOrgAdminPage() {
  const escopo = await lerEscopoAdmin();
  if (!escopo || escopo.adminRole !== "ORG_ADMIN" || !escopo.organizacaoId) {
    redirect("/admin/dashboard");
  }

  const organizacao = await prisma.organizacao.findUnique({
    where: { id: escopo.organizacaoId },
    select: brandingSelect,
  });
  if (!organizacao) redirect("/admin/dashboard");

  return (
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
  );
}
