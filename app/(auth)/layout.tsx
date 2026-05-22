import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { lerSessaoEstudante } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const sessao = await lerSessaoEstudante();
  if (!sessao) redirect("/entrar");

  const estudante = await prisma.estudante.findUnique({
    where: { id: sessao.sub },
    select: { id: true, nome: true, ativo: true },
  });
  if (!estudante || !estudante.ativo) redirect("/entrar");

  const primeiroNome = estudante.nome.split(" ")[0];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "var(--header-height)",
            padding: "0.75rem 1.25rem",
          }}
        >
          <Link
            href="/trilhas"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
            aria-label="Légua — voltar para o mapa de trilhas"
          >
            <Image
              src="/images/logo.svg"
              alt="Légua"
              width={80}
              height={80}
              priority
            />
          </Link>
          <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/trilhas" style={{ color: "var(--color-text)" }}>
              Trilhas
            </Link>
            <Link href="/perfil" style={{ color: "var(--color-text)" }}>
              Olá, {primeiroNome}
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <footer
        className="container"
        style={{
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        Légua — descubra seu caminho depois do ensino médio.
      </footer>
    </div>
  );
}
