import { z, ZodType } from 'zod';

export class DrugValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string({ message: 'Nama tidak boleh kosong!' }).min(1),
    unit: z.string({ message: 'Unit tidak boleh kosong!' }).min(1),
    price: z.number({ message: 'Harga tidak boleh kosong' }).min(0),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string({ message: 'Nama tidak boleh kosong!' }).min(1).optional(),
    unit: z.string({ message: 'Unit tidak boleh kosong!' }).min(1).optional(),
    price: z
      .number({ message: 'Harga tidak boleh kosong' })
      .min(0)
      .int()
      .positive()
      .optional(),
    amount_sold: z.number().int().positive().optional(),
  });
}
