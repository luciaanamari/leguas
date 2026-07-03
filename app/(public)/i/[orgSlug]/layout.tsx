import { notFound } from "next/navigation";
import { resolverContextoPorOrgSlug } from "@/lib/branding/contexto";
import {
  CabecalhoInstituicao,
  MolduraInstituicao,
} from "@/components/publico/MolduraInstituicao";

export const dynamic = "force-dynamic";

type Params = Promise<{ orgSlug: string }>;

export default async function OrganizacaoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { orgSlug } = await params;
  const resultado = await resolverContextoPorOrgSlug(orgSlug);

  if (resultado.status !== "ok") notFound();

  return (
    <MolduraInstituicao branding={resultado.branding}>
      <CabecalhoInstituicao branding={resultado.branding} href={`/i/${orgSlug}`} />
      <main style={{ flex: 1 }}>{children}</main>
      <footer
        className="container"
        style={{
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        Léguas — descubra seu caminho depois do ensino médio.
      </footer>
    </MolduraInstituicao>
  );
}
