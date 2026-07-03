import Link from "next/link";
import { notFound } from "next/navigation";
import PassoCadastro from "@/components/cadastro/PassoCadastro";
import { resolverContextoPorSlug } from "@/lib/branding/contexto";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cadastro - Léguas" };

type Params = Promise<{ slug: string }>;

export default async function CadastroInstituicaoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const resultado = await resolverContextoPorSlug(slug);

  // Layout já trata "inexistente"/"indisponivel"; aqui só o caso "ok".
  if (resultado.status !== "ok") {
    if (resultado.status === "inexistente") notFound();
    return null;
  }

  const { escolaId, organizacaoId, escolaNome, organizacaoNome, cadastroAberto } =
    resultado.contexto;

  if (!cadastroAberto) {
    return (
      <main className="container" style={{ maxWidth: 560, paddingTop: "2.5rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginTop: 0 }}>Inscrições encerradas</h1>
          <p className="muted">
            No momento a {escolaNome} não está aceitando novos cadastros. Se você já tem cadastro,
            é só entrar.
          </p>
          <Link href={`/e/${slug}/entrar`} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
            Já tenho cadastro
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 640 }}>
      <header style={{ marginBottom: "2rem" }}>
        <Link href={`/e/${slug}`} className="muted" style={{ textDecoration: "none" }}>
          ← voltar
        </Link>
        <h1 style={{ marginTop: "1rem", fontSize: "1.75rem" }}>Vamos te conhecer melhor</h1>
        <p className="muted">
          Quatro passos rápidos. Suas informações ajudam a personalizar sua experiência.
        </p>
      </header>
      <PassoCadastro
        escolaContexto={{ escolaId, organizacaoId, escolaNome, organizacaoNome }}
      />
    </main>
  );
}
