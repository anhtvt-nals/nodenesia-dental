import { z } from 'zod';
import { bookingStatuses } from '../enums/booking.js';

export const bookingSummarySchema = z.object({
  code: z.string().min(1),
  status: z.enum(bookingStatuses),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  doctorName: z.string().min(1),
  serviceName: z.string().min(1),
});

export type BookingSummary = z.infer<typeof bookingSummarySchema>;
