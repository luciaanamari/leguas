import { z } from "zod";
import { ModalidadeTrilha } from "@prisma/client";

export const trilhaSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  titulo: z.string().trim().min(2).max(120),
  modalidade: z.nativeEnum(ModalidadeTrilha),
  descricaoCurta: z.string().trim().min(10).max(240),
  descricaoCompleta: z.string().trim().min(10),
  comoEntrar: z.string().trim().min(5),
  duracao: z.string().trim().min(2),
  custoEstimado: z.string().trim().min(2),
  primeirosPassos: z.string().trim().min(5),
  ordem: z.coerce.number().int().min(0).max(999),
  ativo: z.coerce.boolean().optional().default(true),
});

export type TrilhaInput = z.infer<typeof trilhaSchema>;

export const profissaoSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  descricao: z.string().trim().min(5).max(500),
  trilhaId: z.string().min(1),
  ativo: z.coerce.boolean().optional().default(true),
});

export type ProfissaoInput = z.infer<typeof profissaoSchema>;

export const estudanteUpdateSchema = z.object({
  nome: z.string().trim().min(2).max(120).optional(),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 11)
    .optional(),
  escolaNome: z.string().trim().min(2).max(160).optional(),
  ativo: z.coerce.boolean().optional(),
});
