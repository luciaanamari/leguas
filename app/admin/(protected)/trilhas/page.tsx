import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerEscopoAdminGlobal } from "@/lib/auth";
import TabelaTrilhas from "@/components/admin/TabelaTrilhas";

export default async function AdminTrilhasListPage() {
  if (!(await lerEscopoAdminGlobal())) {
    redirect("/admin/dashboard");
  }

  const trilhas = await prisma.trilha.findMany({
    orderBy: [{ ativo: "desc" }, { ordem: "asc" }],
  });
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Trilhas</h1>
          <p className="muted" style={{ margin: 0 }}>
            {trilhas.length} trilha(s) cadastrada(s).
          </p>
        </div>
        <Link href="/admin/trilhas/nova" className="btn btn-primary">
          + Nova trilha
        </Link>
      </div>
      <TabelaTrilhas trilhas={trilhas} />
    </div>
  );
}
