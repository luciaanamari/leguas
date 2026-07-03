import { z } from "zod";

/** Alterna o link permanente da escola: aceitar novos cadastros ou não. */
export const atualizarLinkSchema = z.object({
  ativo: z.boolean(),
});

export type AtualizarLinkInput = z.infer<typeof atualizarLinkSchema>;
