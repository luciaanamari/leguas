import { prisma } from "@/lib/db";
import { slugUnico } from "@/lib/slug";

/**
 * Garante que a escola tenha seu link permanente de cadastro/login.
 * Idempotente: retorna o existente ou cria um novo com slug único.
 */
export async function garantirLinkPermanente(escolaId: string, escolaNome: string) {
  const existente = await prisma.linkCadastro.findFirst({
    where: { escolaId, permanente: true },
  });
  if (existente) return existente;

  const slug = await slugUnico(
    escolaNome,
    async (s) => (await prisma.linkCadastro.count({ where: { slug: s } })) > 0,
  );

  return prisma.linkCadastro.create({
    data: {
      escolaId,
      slug,
      rotulo: "Link principal",
      permanente: true,
      ativo: true,
    },
  });
}
