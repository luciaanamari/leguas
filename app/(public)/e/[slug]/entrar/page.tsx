import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { lerSessaoEstudante } from "@/lib/auth";
import { resolverContextoPorSlug } from "@/lib/branding/contexto";
import LoginEstudanteForm from "@/components/cadastro/LoginEstudanteForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar - Léguas" };

type Params = Promise<{ slug: string }>;

export default async function EntrarInstituicaoPage({ params }: { params: Params }) {
  if (await lerSessaoEstudante()) redirect("/trilhas");

  const { slug } = await params;
  const resultado = await resolverContextoPorSlug(slug);
  if (resultado.status !== "ok") {
    if (resultado.status === "inexistente") notFound();
    return null;
  }

  const { escolaNome, cadastroAberto } = resultado.contexto;

  return (
    <main className="container" style={{ maxWidth: 460, paddingTop: "2.5rem" }}>
      <Link href={`/e/${slug}`} className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ marginTop: "1rem", marginBottom: "0.25rem" }}>Entrar na {escolaNome}</h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        Entre com o seu e-mail e senha.
      </p>
      <LoginEstudanteForm />
      {cadastroAberto && (
        <p className="muted" style={{ marginTop: "1.5rem", textAlign: "center" }}>
          Ainda não tem cadastro?{" "}
          <Link href={`/e/${slug}/cadastro`} style={{ fontWeight: 600 }}>
            Comece por aqui.
          </Link>
        </p>
      )}
    </main>
  );
}
