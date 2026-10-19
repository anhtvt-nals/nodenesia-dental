import { z } from 'zod';

export const createPublicBookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  serviceId: z.string().min(1),
  doctorId: z.string().min(1).optional(),
  startsAt: z.string().datetime(),
  complaint: z.string().trim().max(500).optional(),
  website: z.string().max(0).optional(),
});

export type CreatePublicBookingInput = z.infer<typeof createPublicBookingSchema>;
