import { z, ZodType } from 'zod';

export class RoomValidation {
  static readonly ADD: ZodType = z.object({
    name: z.string({ message: 'Nama tidak boleh kosong' }).min(1).max(100),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(100).optional(),
  });
}
