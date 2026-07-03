import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal } from "@/lib/auth";
import FormularioOrganizacao from "@/components/admin/FormularioOrganizacao";

type Params = Promise<{ id: string }>;

export default async function EditarOrganizacaoPage({ params }: { params: Params }) {
  if (!(await lerEscopoAdminGlobal())) {
    redirect("/admin/dashboard");
  }

  const { id } = await params;
  const organizacao = await prisma.organizacao.findUnique({ where: { id } });
  if (!organizacao) notFound();

  return (
    <div>
      <Link
        href={`/admin/organizacoes/${organizacao.id}`}
        className="muted"
        style={{ textDecoration: "none" }}
      >
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
        Editar organização
      </h1>
      <FormularioOrganizacao organizacao={organizacao} />
    </div>
  );
}
