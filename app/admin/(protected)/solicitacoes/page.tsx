import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerEscopoAdmin, escopoSolicitacoesSenha } from "@/lib/auth";
import ListaSolicitacoesSenha from "@/components/admin/ListaSolicitacoesSenha";

export const dynamic = "force-dynamic";

export default async function SolicitacoesSenhaPage() {
  const escopo = await lerEscopoAdmin();
  if (!escopo) redirect("/admin/login");

  if (escopo.adminRole === "EDITOR") {
    redirect("/admin/dashboard");
  }

  const solicitacoes = await prisma.solicitacaoRedefinicaoSenha.findMany({
    where: escopoSolicitacoesSenha(escopo),
    orderBy: { criadoEm: "asc" },
    include: {
      estudante: {
        select: {
          id: true,
          nome: true,
          email: true,
          escola: {
            select: {
              nome: true,
              organizacao: { select: { nome: true } },
            },
          },
        },
      },
    },
  });

  const serializadas = solicitacoes.map((s) => ({
    id: s.id,
    criadoEm: s.criadoEm.toISOString(),
    estudante: s.estudante,
  }));

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.35rem" }}>
        Solicitações de senha
      </h1>
      <p className="muted" style={{ margin: "0 0 1.5rem", lineHeight: 1.5 }}>
        Alunos que pediram redefinição de senha. Gere um código temporário e repasse pela escola
        (WhatsApp, presencial, etc.).
      </p>
      <ListaSolicitacoesSenha solicitacoes={serializadas} />
    </div>
  );
}
