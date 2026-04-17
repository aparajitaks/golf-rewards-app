import { z } from "zod";

export const scoreFormSchema = z.object({
  score_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  points: z.coerce.number().int().min(1).max(45),
});

export type ScoreFormValues = z.infer<typeof scoreFormSchema>;
