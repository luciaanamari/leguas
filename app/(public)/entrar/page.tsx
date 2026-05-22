import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessaoEstudante } from "@/lib/auth";
import LoginEstudanteForm from "@/components/cadastro/LoginEstudanteForm";

export const metadata = { title: "Entrar — Légua" };
export const dynamic = "force-dynamic";

export default async function EntrarPage() {
  if (await lerSessaoEstudante()) redirect("/trilhas");
  return (
    <main className="container" style={{ maxWidth: 460, paddingTop: "2.5rem" }}>
      <Link href="/" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ marginTop: "1rem", marginBottom: "0.25rem" }}>Já tenho cadastro</h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        Entre com o CPF e o WhatsApp que você usou no cadastro.
      </p>
      <LoginEstudanteForm />
      <p className="muted" style={{ marginTop: "1.5rem", textAlign: "center" }}>
        Ainda não tem cadastro?{" "}
        <Link href="/cadastro" style={{ fontWeight: 600 }}>
          Comece por aqui.
        </Link>
      </p>
    </main>
  );
}
