import { z, ZodType } from 'zod';

export class DrugValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string().min(1).max(100),
    unit: z.string().min(1).max(100),
    price: z.number().min(0),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(100).optional(),
    unit: z.string().min(1).max(100).optional(),
    price: z.number().min(0).int().positive().optional(),
    amount_sold: z.number().int().positive().optional(),
  });
}
