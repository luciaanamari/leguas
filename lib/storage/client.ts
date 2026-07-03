import { S3Client } from "@aws-sdk/client-s3";

// Cliente S3 (MinIO/S3-compatível). Singleton via globalThis para evitar
// múltiplas instâncias no hot reload de desenvolvimento.
const globalForS3 = globalThis as unknown as { _s3Client?: S3Client };

export function s3(): S3Client {
  if (globalForS3._s3Client) return globalForS3._s3Client;
  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
  globalForS3._s3Client = client;
  return client;
}

// Lidos em tempo de chamada (não na carga do módulo) para funcionar tanto no
// Next (env já carregado) quanto em scripts tsx que carregam .env depois.
export function bucketPublico(): string {
  return process.env.S3_BUCKET_PUBLIC ?? "legua-public";
}
export function bucketPrivado(): string {
  return process.env.S3_BUCKET_PRIVATE ?? "legua-private";
}
/** Base pública dos objetos do bucket público (já inclui o bucket). */
export function s3PublicUrl(): string {
  return (process.env.S3_PUBLIC_URL ?? "").replace(/\/+$/, "");
}
export function presignTtlPadrao(): number {
  return Number(process.env.S3_PRESIGN_TTL ?? "3600");
}
