import { z, ZodType } from 'zod';

export class RoomValidation {
  static readonly ADD: ZodType = z.object({
    name: z
      .string({ message: 'Nama tidak boleh kosong!' })
      .min(1, 'Nama tidak boleh kosong!'),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z
      .string({ message: 'Nama tidak boleh kosong!' })
      .min(1, 'Nama tidak boleh kosong!')
      .optional(),
  });
}
