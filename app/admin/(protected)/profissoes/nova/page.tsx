import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal } from "@/lib/auth";
import FormularioProfissao from "@/components/admin/FormularioProfissao";

export default async function NovaProfissaoPage() {
  if (!(await lerEscopoAdminGlobal())) {
    redirect("/admin/dashboard");
  }

  const trilhas = await prisma.trilha.findMany({
    where: { ativo: true },
    orderBy: { titulo: "asc" },
    select: { id: true, titulo: true },
  });
  return (
    <div>
      <Link href="/admin/profissoes" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
        Nova profissão
      </h1>
      <FormularioProfissao trilhas={trilhas} />
    </div>
  );
}
