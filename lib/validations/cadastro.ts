import { z } from "zod";
import {
  AnoEscolar,
  RendaFamiliar,
  PerfilEmpreendedor,
  Preocupacao,
} from "@prisma/client";
import { cursosTecnicos } from "@/lib/data/cursos-tecnicos";

const cpfDigits = (v: string) => v.replace(/\D/g, "");

function validaCpf(cpf: string): boolean {
  const digitos = cpfDigits(cpf);
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(digitos[i], 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(digitos[9], 10)) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(digitos[i], 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(digitos[10], 10);
}

const respostaDiscSchema = z.object({
  perguntaId: z.number().int().min(1).max(8),
  opcaoId: z.enum(["A", "B", "C", "D"]),
});

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome completo").max(120, "Nome muito longo"),
    email: z.string().trim().toLowerCase().email("E-mail inválido").max(200),
    senha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres").max(128),
    confirmarSenha: z.string(),
    dataNascimento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
      .refine((s) => {
        const d = new Date(s);
        const minima = new Date();
        minima.setFullYear(minima.getFullYear() - 100);
        const maxima = new Date();
        maxima.setFullYear(maxima.getFullYear() - 13);
        return d >= minima && d <= maxima;
      }, "Data de nascimento inválida"),
    cpf: z
      .string()
      .transform(cpfDigits)
      .refine((s) => s.length === 11, "CPF deve ter 11 dígitos")
      .refine(validaCpf, "CPF inválido"),
    whatsapp: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .refine(
        (v) => v.length === 0 || (v.length >= 10 && v.length <= 11),
        "WhatsApp inválido",
      )
      .optional()
      .or(z.literal("")),
    rendaFamiliar: z.nativeEnum(RendaFamiliar),
    escolaNome: z.string().trim().min(2, "Informe o nome da escola").max(160),
    escolaAno: z.nativeEnum(AnoEscolar),
    cursoTecnico: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined))
      .refine(
        (v) => v == null || cursosTecnicos.some((c) => c.slug === v),
        "Selecione um curso técnico válido da lista",
      ),
    perfilEmpreendedor: z.nativeEnum(PerfilEmpreendedor),
    preocupacoes: z
      .array(z.nativeEnum(Preocupacao))
      .min(1, "Selecione ao menos uma preocupação")
      .max(5),
    respostasDisc: z
      .array(respostaDiscSchema)
      .length(8, "Responda as 8 perguntas do quiz vocacional"),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type CadastroInput = z.infer<typeof cadastroSchema>;

export const loginEstudanteSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export type LoginEstudanteInput = z.infer<typeof loginEstudanteSchema>;

export const loginAdminSchema = z.object({
  email: z.string().email("Email inválido").trim().toLowerCase(),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type LoginAdminInput = z.infer<typeof loginAdminSchema>;
