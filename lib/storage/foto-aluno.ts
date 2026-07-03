import { bucketPrivado, enviarObjeto, removerObjeto } from "./index";

type VinculoAluno = {
  alunoId: string;
  organizacaoId?: string | null;
  escolaId?: string | null;
};

/**
 * Chave da foto do aluno no bucket privado. Aluno com vínculo institucional
 * fica aninhado sob organização/escola; aluno independente vai para o prefixo
 * plano `alunos/{id}`. Somente ids no caminho.
 */
export function chaveFotoAluno(v: VinculoAluno): string {
  if (v.organizacaoId && v.escolaId) {
    return `organizacoes/${v.organizacaoId}/escolas/${v.escolaId}/alunos/${v.alunoId}/perfil`;
  }
  return `alunos/${v.alunoId}/perfil`;
}

/** Envia a foto para o bucket privado e devolve a CHAVE (não a URL). */
export async function salvarFotoAluno(
  buffer: Buffer,
  vinculo: VinculoAluno,
  mime: string,
): Promise<string> {
  const key = chaveFotoAluno(vinculo);
  await enviarObjeto({ bucket: bucketPrivado(), key, corpo: buffer, contentType: mime });
  return key;
}

export async function removerFotoAluno(key: string): Promise<void> {
  try {
    await removerObjeto({ bucket: bucketPrivado(), key });
  } catch {
    // objeto já inexistente
  }
}
