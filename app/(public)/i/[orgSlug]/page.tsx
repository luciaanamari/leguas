import { notFound } from "next/navigation";
import { resolverContextoPorOrgSlug } from "@/lib/branding/contexto";
import SeletorEscolaOrg from "@/components/publico/SeletorEscolaOrg";

export const dynamic = "force-dynamic";

type Params = Promise<{ orgSlug: string }>;

export default async function OrganizacaoHome({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const resultado = await resolverContextoPorOrgSlug(orgSlug);
  if (resultado.status !== "ok") notFound();

  const { organizacaoNome, escolas } = resultado;

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <section style={{ maxWidth: 640, margin: "0 auto" }}>
        <p
          style={{
            color: "var(--color-accent-hover)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          {organizacaoNome}
        </p>
        <h1 style={{ fontSize: "2.25rem", marginBottom: "1rem", color: "var(--color-text)" }}>
          Escolha a sua escola para começar
        </h1>
        <p style={{ fontSize: "1.05rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          O Léguas mostra os caminhos possíveis depois do ensino médio e simula como seria a vida
          em cada um. Selecione a sua escola para entrar.
        </p>

        <SeletorEscolaOrg escolas={escolas} />
      </section>
    </main>
  );
}
