import { z } from "zod";

export const esqueciSenhaSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
});

export type EsqueciSenhaInput = z.infer<typeof esqueciSenhaSchema>;

export const MENSAGEM_ESQUECI_SENHA_GENERICO =
  "Se houver cadastro com esse e-mail, sua escola foi avisada. Aguarde o contato da escola.";
