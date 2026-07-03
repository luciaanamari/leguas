import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { lerSessaoEstudante } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LOGO_PADRAO, brandingParaCss, resolverBranding } from "@/lib/branding";
import LogoutButton from "@/components/ui/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const sessao = await lerSessaoEstudante();
  if (!sessao) redirect("/entrar");

  const estudante = await prisma.estudante.findUnique({
    where: { id: sessao.sub },
    select: {
      id: true,
      nome: true,
      ativo: true,
      escola: {
        select: {
          logoUrl: true,
          organizacao: {
            select: {
              logoUrl: true,
              corBackground: true,
              corSurface: true,
              corAccent: true,
              corText: true,
            },
          },
        },
      },
    },
  });
  if (!estudante || !estudante.ativo) redirect("/entrar");

  const primeiroNome = estudante.nome.split(" ")[0];
  // As cores continuam vindo da organização; o LOGO segue regra própria:
  // - aluno vinculado a uma escola → logo da escola (se ela tiver);
  // - aluno independente (ou escola sem logo) → logo padrão do Léguas.
  // O logo da organização não é usado na área do estudante.
  const branding = resolverBranding(estudante.escola?.organizacao);
  const logoSrc = estudante.escola?.logoUrl ?? LOGO_PADRAO;
  const logoCustomizado = logoSrc !== LOGO_PADRAO;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: brandingParaCss(branding) }} />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
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
              aria-label="Léguas - voltar para o mapa de trilhas"
            >
              {logoCustomizado ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt="Léguas"
                  width={80}
                  height={80}
                  style={{ display: "block", objectFit: "contain" }}
                />
              ) : (
                <Image
                  src={LOGO_PADRAO}
                  alt="Léguas"
                  width={80}
                  height={80}
                  priority
                />
              )}
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
          Léguas - descubra seu caminho depois do ensino médio.
        </footer>
      </div>
    </>
  );
}
