import Link from "next/link";
import { redirect } from "next/navigation";
import { lerEscopoAdminGlobal } from "@/lib/auth";
import FormularioOrganizacao from "@/components/admin/FormularioOrganizacao";

export default async function NovaOrganizacaoPage() {
  if (!(await lerEscopoAdminGlobal())) {
    redirect("/admin/dashboard");
  }

  return (
    <div>
      <Link href="/admin/organizacoes" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
        Nova organização
      </h1>
      <FormularioOrganizacao />
    </div>
  );
}
