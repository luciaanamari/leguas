import { z } from "zod";
import { respostasDiscQuizSchema } from "@/lib/validations/cadastro";

export const refazerQuizSchema = z.object({
  respostasDisc: respostasDiscQuizSchema,
});

export type RefazerQuizInput = z.infer<typeof refazerQuizSchema>;
