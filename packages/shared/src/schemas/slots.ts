import { z } from 'zod';

export const slotQuerySchema = z.object({
  serviceId: z.string().min(1),
  doctorId: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const slotSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  doctorId: z.string().min(1),
});

export type Slot = z.infer<typeof slotSchema>;
export type SlotQuery = z.infer<typeof slotQuerySchema>;
