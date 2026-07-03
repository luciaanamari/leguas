import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  bucketPrivado,
  bucketPublico,
  presignTtlPadrao,
  s3,
  s3PublicUrl,
} from "./client";

export { bucketPrivado, bucketPublico };

/** Nome do bucket público (compat: import direto por constante). */
export const BUCKET_PUBLIC = bucketPublico();
export const BUCKET_PRIVATE = bucketPrivado();

export async function enviarObjeto(params: {
  bucket: string;
  key: string;
  corpo: Buffer;
  contentType: string;
}): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      Body: params.corpo,
      ContentType: params.contentType,
    }),
  );
}

export async function removerObjeto(params: {
  bucket: string;
  key: string;
}): Promise<void> {
  await s3().send(
    new DeleteObjectCommand({ Bucket: params.bucket, Key: params.key }),
  );
}

/**
 * URL pública de um objeto do bucket público. `S3_PUBLIC_URL` já inclui o
 * bucket (ex.: https://s3.dominio/legua-public), então basta concatenar a chave.
 */
export function urlPublica(key: string): string {
  return `${s3PublicUrl()}/${key}`;
}

/** URL assinada temporária para um objeto do bucket privado (foto de aluno). */
export async function urlAssinada(
  key: string,
  ttlSegundos: number = presignTtlPadrao(),
): Promise<string> {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: bucketPrivado(), Key: key }),
    { expiresIn: ttlSegundos },
  );
}
