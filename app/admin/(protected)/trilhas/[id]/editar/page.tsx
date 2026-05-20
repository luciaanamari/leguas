import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import FormularioTrilha from "@/components/admin/FormularioTrilha";

type Params = Promise<{ id: string }>;

export default async function EditarTrilhaPage({ params }: { params: Params }) {
  const { id } = await params;
  const trilha = await prisma.trilha.findUnique({ where: { id } });
  if (!trilha) notFound();
  return (
    <div>
      <Link href="/admin/trilhas" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
        Editar trilha
      </h1>
      <FormularioTrilha trilha={trilha} />
    </div>
  );
}
