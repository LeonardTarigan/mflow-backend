import { z, ZodType } from 'zod';

export class DrugOrderValidation {
  static readonly ADD: ZodType = z.object({
    care_session_id: z.number().int().positive(),
    drug_id: z.number().int().positive(),
    quantity: z.number().int().min(1).positive(),
    dose: z.string().min(1),
  });
}
