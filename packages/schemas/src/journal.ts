import { z } from "zod";

export const TaxClass = z.enum(["課税", "非課税", "不課税", "免税", "対象外"]);
export const JournalInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  debitAccount: z.string().min(1),
  creditAccount: z.string().min(1),
  subAccount: z.string().optional(),
  amount: z.number().int().positive(),
  taxClass: TaxClass,
  note: z.string().max(200).optional(),
  evidenceId: z.string().optional(),
});
export type JournalInput = z.infer<typeof JournalInput>;
