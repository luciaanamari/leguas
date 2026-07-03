import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ehAdminGlobal, lerEscopoAdmin, podeGerenciarEscola } from "@/lib/auth";
import FormularioEscola from "@/components/admin/FormularioEscola";

type Params = Promise<{ id: string }>;

export default async function EditarEscolaPage({ params }: { params: Params }) {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  if (escopo.adminRole === "ESCOLA_ADMIN") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;
  const escola = await prisma.escola.findUnique({ where: { id } });
  if (!escola) notFound();

  if (!podeGerenciarEscola(escopo, escola)) {
    redirect("/admin/dashboard");
  }

  if (ehAdminGlobal(escopo)) {
    const organizacoes = await prisma.organizacao.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    });

    return (
      <div>
        <Link href={`/admin/escolas/${escola.id}`} className="muted" style={{ textDecoration: "none" }}>
          ← voltar
        </Link>
        <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
          Editar escola
        </h1>
        <FormularioEscola escola={escola} organizacoes={organizacoes} />
      </div>
    );
  }

  if (escopo.adminRole === "ORG_ADMIN" && escopo.organizacaoId) {
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: escopo.organizacaoId },
      select: { id: true, nome: true },
    });
    if (!organizacao) redirect("/admin/dashboard");

    return (
      <div>
        <Link href={`/admin/escolas/${escola.id}`} className="muted" style={{ textDecoration: "none" }}>
          ← voltar
        </Link>
        <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
          Editar escola
        </h1>
        <FormularioEscola escola={escola} organizacoes={[]} organizacaoTravada={organizacao} />
      </div>
    );
  }

  redirect("/admin/dashboard");
}
