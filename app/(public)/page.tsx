import Link from "next/link";

export default function HomePage() {
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
          Léguas
        </p>
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            color: "var(--color-text)",
          }}
        >
          Você é do 3º ano. E o próximo passo?
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)" }}>
          Em poucos minutos, você descobre quais caminhos existem depois do ensino médio, simula
          como seria a vida em cada um e recebe um próximo passo concreto para o seu.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
          <Link href="/cadastro" className="btn btn-primary">
            Começar agora
          </Link>
          <Link href="/entrar" className="btn btn-secondary">
            Já tenho cadastro
          </Link>
          <Link href="/admin/login" className="btn btn-ghost">
            Acesso institucional
          </Link>
        </div>
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          Estuda numa escola parceira? Ela pode ter um link próprio do Léguas — é só pedir o link
          (ou o QR code) na sua escola.
        </p>
        <p className="muted" style={{ marginTop: "1rem" }}>
          O Léguas é gratuito, funciona no celular e foi feito pensando no estudante de escola
          pública do Piauí.
        </p>
      </section>
    </main>
  );
}
