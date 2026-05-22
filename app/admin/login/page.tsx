import Link from "next/link";
import { redirect } from "next/navigation";
import LoginAdminForm from "@/components/admin/LoginAdminForm";
import { lerSessaoAdmin } from "@/lib/auth";

export const metadata = {
  title: "Légua Admin — Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ redirect?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sessao = await lerSessaoAdmin();
  if (sessao) redirect("/admin/dashboard");
  const sp = await searchParams;
  return (
    <main className="container" style={{ maxWidth: 460, paddingTop: "3rem" }}>
      <Link href="/" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Légua Admin</h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        Acesso restrito. Use seu email e senha de administrador.
      </p>
      <LoginAdminForm redirectTo={sp.redirect} />
    </main>
  );
}
