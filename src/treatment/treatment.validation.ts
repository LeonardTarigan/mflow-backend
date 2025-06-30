import { z, ZodType } from 'zod';

export class TreatmentValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string({ message: 'Nama tidak boleh kosong' }).min(1).max(100),
    price: z.coerce.number().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z
      .string({ message: 'Nama tidak boleh kosong' })
      .min(1)
      .max(100)
      .optional(),
    price: z.coerce.number().min(1).optional(),
  });
}
