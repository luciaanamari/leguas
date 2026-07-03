import { notFound } from "next/navigation";
import { resolverContextoPorSlug } from "@/lib/branding/contexto";
import {
  CabecalhoInstituicao,
  MolduraInstituicao,
} from "@/components/publico/MolduraInstituicao";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export default async function InstituicaoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { slug } = await params;
  const resultado = await resolverContextoPorSlug(slug);

  if (resultado.status === "inexistente") notFound();

  if (resultado.status === "indisponivel") {
    return (
      <MolduraInstituicao branding={resultado.branding}>
        <CabecalhoInstituicao branding={resultado.branding} href={`/e/${slug}`} />
        <main className="container" style={{ flex: 1, maxWidth: 560, paddingTop: "3rem" }}>
          <div className="card" style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", marginTop: 0 }}>Página indisponível</h1>
            <p className="muted">
              A página {resultado.escolaNome ? `da ${resultado.escolaNome} ` : ""}
              não está disponível no momento. Procure a sua escola para mais informações.
            </p>
          </div>
        </main>
      </MolduraInstituicao>
    );
  }

  const { branding } = resultado.contexto;
  return (
    <MolduraInstituicao branding={branding}>
      <CabecalhoInstituicao branding={branding} href={`/e/${slug}`} />
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
