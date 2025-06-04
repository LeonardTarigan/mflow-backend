import { QueueStatus } from '@prisma/client';
import { z, ZodType } from 'zod';

export class QueueValidation {
  static readonly ADD: ZodType = z
    .object({
      doctor_id: z.string().uuid(),
      patient_id: z.string().uuid().optional(),
      room_id: z.number(),
      complaints: z.string().min(1).max(500),
      patient_data: z
        .object({
          name: z.string().min(1).max(100),
          nik: z.string().min(1).max(20),
          birth_date: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
              message: 'Invalid date format',
            })
            .transform((val) => new Date(val)),
          address: z.string().min(1).max(200),
          occupation: z.string().min(1).max(100),
          phone_number: z.string().min(1).max(15),
          email: z.string().email().optional(),
          gender: z.string(),
        })
        .optional(),
    })
    .refine(
      (data) =>
        (!!data.patient_id && !data.patient_data) ||
        (!data.patient_id && !!data.patient_data),
      {
        message:
          'Either patient_id or patient_data must be provided, but not both.',
        path: ['patient_id', 'patient_data'],
      },
    );

  static readonly UPDATE: ZodType = z.object({
    status: z
      .enum(Object.values(QueueStatus) as [string, ...string[]])
      .optional(),
    diagnosis: z.string().min(1).max(500).optional(),
  });
}
