/**
 * Migra logos de organização do disco local (public/uploads/logos) para o
 * object storage (bucket público) e atualiza Organizacao.logoUrl para a URL
 * pública nova. Idempotente: só processa quem ainda aponta para /uploads/logos.
 *
 * Uso: npx tsx scripts/migrar-logos-para-s3.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { bucketPublico, enviarObjeto, urlPublica } from "../lib/storage";

// Carrega env (tsx não carrega .env.local sozinho).
config({ path: ".env.local" });
config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const PREFIXO_LOCAL = "/uploads/logos/";
const DIR = path.join(process.cwd(), "public", "uploads", "logos");

function mimeDeExt(ext: string): string {
  const e = ext.toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function main() {
  const orgs = await prisma.organizacao.findMany({
    where: { logoUrl: { startsWith: PREFIXO_LOCAL } },
    select: { id: true, logoUrl: true },
  });
  console.log(`${orgs.length} organização(ões) com logo local para migrar.`);

  let ok = 0;
  for (const org of orgs) {
    const nome = path.basename(org.logoUrl!);
    const arquivo = path.join(DIR, nome);
    try {
      const buffer = await readFile(arquivo);
      const mime = mimeDeExt(path.extname(nome));
      const key = `organizacoes/${org.id}/logo`;
      await enviarObjeto({ bucket: bucketPublico(), key, corpo: buffer, contentType: mime });
      const url = `${urlPublica(key)}?v=${Date.now()}`;
      await prisma.organizacao.update({ where: { id: org.id }, data: { logoUrl: url } });
      console.log(`  ok: ${org.id} -> ${url}`);
      ok++;
    } catch (e) {
      console.error(`  FALHA ${org.id} (${arquivo}): ${(e as Error).message}`);
    }
  }
  console.log(`Concluído: ${ok}/${orgs.length} migrados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
