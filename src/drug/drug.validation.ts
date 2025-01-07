import { z, ZodType } from 'zod';

export class DrugValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string().min(1).max(100),
    unit: z.string().min(1).max(100),
    price: z.number().min(0),
  });
}
