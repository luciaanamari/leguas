import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessaoEstudante } from "@/lib/auth";
import EsqueciSenhaForm from "@/components/cadastro/EsqueciSenhaForm";

export const metadata = { title: "Esqueci a senha - Léguas" };
export const dynamic = "force-dynamic";

export default async function EsqueciSenhaPage() {
  if (await lerSessaoEstudante()) redirect("/perfil");

  return (
    <main className="container" style={{ maxWidth: 460, paddingTop: "2.5rem" }}>
      <Link href="/entrar" className="muted" style={{ textDecoration: "none" }}>
        ← voltar para entrar
      </Link>
      <h1 style={{ marginTop: "1rem", marginBottom: "0.25rem" }}>Esqueci minha senha</h1>
      <p className="muted" style={{ marginBottom: "1.5rem", lineHeight: 1.5 }}>
        Informe seu e-mail. Se houver cadastro, sua escola receberá a solicitação e poderá gerar
        uma senha temporária para você.
      </p>
      <EsqueciSenhaForm />
    </main>
  );
}
