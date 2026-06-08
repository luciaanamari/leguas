import Link from "next/link";
import PassoCadastro from "@/components/cadastro/PassoCadastro";

export const metadata = {
  title: "Cadastro - Léguas",
};

export default function CadastroPage() {
  return (
    <main className="container" style={{ maxWidth: 640 }}>
      <header style={{ marginBottom: "2rem" }}>
        <Link href="/" className="muted" style={{ textDecoration: "none" }}>
          ← voltar
        </Link>
        <h1 style={{ marginTop: "1rem", fontSize: "1.75rem" }}>
          Vamos te conhecer melhor
        </h1>
        <p className="muted">
          Quatro passos rápidos. Suas informações ficam protegidas e ajudam a personalizar
          sua experiência.
        </p>
      </header>
      <PassoCadastro />
    </main>
  );
}
