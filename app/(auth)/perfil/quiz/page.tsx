import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessaoEstudante } from "@/lib/auth";
import RefazerQuiz from "@/components/perfil/RefazerQuiz";

export const dynamic = "force-dynamic";

export default async function PerfilQuizPage() {
  const sessao = await lerSessaoEstudante();
  if (!sessao) redirect("/entrar");

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <Link href="/perfil" className="muted" style={{ textDecoration: "none" }}>
        ← voltar para meu perfil
      </Link>
      <h1 style={{ fontSize: "1.6rem", margin: "1rem 0 0.5rem" }}>Refazer quiz</h1>
      <p className="muted" style={{ margin: "0 0 1.5rem", lineHeight: 1.5 }}>
        Responda as 8 perguntas de novo. O perfil mais recente passa a valer para simulações
        futuras.
      </p>
      <RefazerQuiz />
    </div>
  );
}
