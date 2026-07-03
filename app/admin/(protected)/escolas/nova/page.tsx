import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ehAdminGlobal, lerEscopoAdmin } from "@/lib/auth";
import FormularioEscola from "@/components/admin/FormularioEscola";

export default async function NovaEscolaPage() {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  if (escopo.adminRole === "ESCOLA_ADMIN") {
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
        <Link href="/admin/escolas" className="muted" style={{ textDecoration: "none" }}>
          ← voltar
        </Link>
        <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
          Nova escola
        </h1>
        <FormularioEscola organizacoes={organizacoes} />
      </div>
    );
  }

  if (escopo.adminRole === "ORG_ADMIN" && escopo.organizacaoId) {
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: escopo.organizacaoId },
      select: { id: true, nome: true, ativo: true },
    });
    if (!organizacao?.ativo) redirect("/admin/dashboard");

    return (
      <div>
        <Link href="/admin/escolas" className="muted" style={{ textDecoration: "none" }}>
          ← voltar
        </Link>
        <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
          Nova escola
        </h1>
        <FormularioEscola organizacoes={[]} organizacaoTravada={organizacao} />
      </div>
    );
  }

  redirect("/admin/dashboard");
}
