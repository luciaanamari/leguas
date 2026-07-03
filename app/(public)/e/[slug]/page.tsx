import Link from "next/link";
import { notFound } from "next/navigation";
import { resolverContextoPorSlug } from "@/lib/branding/contexto";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export default async function InstituicaoHome({ params }: { params: Params }) {
  const { slug } = await params;
  const resultado = await resolverContextoPorSlug(slug);

  // Layout já trata "inexistente"/"indisponivel"; aqui só seguimos no caso "ok".
  if (resultado.status !== "ok") {
    if (resultado.status === "inexistente") notFound();
    return null;
  }

  const { escolaNome, organizacaoNome, cadastroAberto } = resultado.contexto;

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <section style={{ maxWidth: 720, margin: "0 auto" }}>
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
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "var(--color-text)" }}>
          Bem-vindo à {escolaNome}
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)" }}>
          Em poucos minutos, você descobre quais caminhos existem depois do ensino médio, simula
          como seria a vida em cada um e recebe um próximo passo concreto para o seu.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
          {cadastroAberto && (
            <Link href={`/e/${slug}/cadastro`} className="btn btn-primary">
              Começar agora
            </Link>
          )}
          <Link href={`/e/${slug}/entrar`} className="btn btn-secondary">
            Já tenho cadastro
          </Link>
        </div>
        {!cadastroAberto && (
          <p className="muted" style={{ marginTop: "1rem" }}>
            As inscrições estão fechadas no momento. Se você já tem cadastro, entre normalmente.
          </p>
        )}
        <p className="muted" style={{ marginTop: "2rem" }}>
          O Léguas é gratuito, funciona no celular e foi feito pensando no estudante de escola
          pública do Piauí.
        </p>
      </section>
    </main>
  );
}
