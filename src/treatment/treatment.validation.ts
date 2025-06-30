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

  static readonly ADD_SESSION_TREATMENT: ZodType = z.object({
    care_session_id: z.number().int().positive(),
    treatments: z
      .array(
        z.object({
          treatment_id: z.number().int().positive(),
          quantity: z.coerce.number().int().positive(),
        }),
      )
      .min(1, { message: 'Penanganan harus diisi minimal satu' }),
  });
}
