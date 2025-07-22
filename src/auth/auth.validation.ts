import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly LOGIN: ZodType = z.object({
    email: z.string().email({ message: 'Format email invalid' }),
    password: z
      .string({ message: 'Password tidak boleh kosong' })
      .min(1, 'Password tidak boleh kosong'),
  });
}
