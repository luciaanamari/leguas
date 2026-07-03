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

export const organizacaoSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  cnpj: z.string().trim().max(18).optional().nullable(),
  contato: z.string().trim().max(160).optional().nullable(),
  ativo: z.coerce.boolean().optional().default(true),
});

export type OrganizacaoInput = z.infer<typeof organizacaoSchema>;

export const escolaSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  organizacaoId: z.string().min(1),
  inep: z.string().trim().max(20).optional().nullable(),
  municipio: z.string().trim().max(120).optional().nullable(),
  ativo: z.coerce.boolean().optional().default(true),
});

export type EscolaInput = z.infer<typeof escolaSchema>;

export const criarOrgAdminSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
});

export type CriarOrgAdminInput = z.infer<typeof criarOrgAdminSchema>;

export const criarEscolaAdminSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
});

export type CriarEscolaAdminInput = z.infer<typeof criarEscolaAdminSchema>;

export const gerarSenhaEstudanteSchema = z.object({
  solicitacaoId: z.string().min(1).optional(),
});

export type GerarSenhaEstudanteInput = z.infer<typeof gerarSenhaEstudanteSchema>;
