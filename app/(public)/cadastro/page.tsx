import Link from "next/link";
import PassoCadastro from "@/components/cadastro/PassoCadastro";

export const metadata = {
  title: "Cadastro - Léguas",
};

// Cadastro independente (fora do ambiente de uma escola/organização).
// O aluno informa o nome da escola em texto livre; não há vínculo institucional.
// O cadastro por link continua em /e/{slug}/cadastro.
export default function CadastroPage() {
  return (
    <main className="container" style={{ maxWidth: 640 }}>
      <header style={{ marginBottom: "2rem" }}>
        <Link href="/" className="muted" style={{ textDecoration: "none" }}>
          ← voltar
        </Link>
        <h1 style={{ marginTop: "1rem", fontSize: "1.75rem" }}>Vamos te conhecer melhor</h1>
        <p className="muted">
          Quatro passos rápidos. Suas informações ajudam a personalizar sua experiência.
        </p>
      </header>
      <PassoCadastro />
    </main>
  );
}
