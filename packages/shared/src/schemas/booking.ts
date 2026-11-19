import { z } from 'zod';

/** Indonesian mobile number in E.164: +62 8xx..., 9–13 digits after the 62 prefix. */
export const indonesianPhoneE164 = z.string().regex(/^\+628\d{8,12}$/, 'Nomor tidak valid. Contoh: 08123456789');

export const bookingForValues = ['self', 'child', 'other_family'] as const;
export const patientTypeValues = ['new', 'returning'] as const;
export const payerValues = ['umum', 'asuransi'] as const;
export const patientGenderValues = ['female', 'male'] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createPublicBookingSchema = z
  .object({
    /** Patient full name. Single-word names are allowed (min 2 chars). */
    name: z.string().trim().min(2).max(120),
    /** Patient's own WhatsApp (optional when confirming directly via WhatsApp). */
    phone: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      indonesianPhoneE164.optional(),
    ),
    serviceId: z.string().min(1),
    doctorId: z.string().min(1).optional(),
    startsAt: z.string().datetime(),
    complaint: z.string().trim().max(500).optional(),
    parentBookingId: z.string().uuid().optional(),
    website: z.string().max(0).optional(),

    bookingFor: z.enum(bookingForValues).default('self'),
    /** Required when bookingFor !== 'self'. */
    booker: z.object({ name: z.string().trim().min(2).max(120), phone: indonesianPhoneE164 }).optional(),
    patientAge: z.number().int().min(0).max(120).optional(),

    patientType: z.enum(patientTypeValues).default('new'),
    birthDate: isoDate.optional(),

    payer: z.enum(payerValues).default('umum'),

    whatsappConsent: z.literal(true).default(true),
    dataProcessingConsent: z.literal(true).default(true),
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (v.bookingFor !== 'self') {
      if (!v.booker) issue('booker', 'Nama dan nomor WhatsApp pemesan wajib diisi.');
      if (v.patientAge === undefined && !v.birthDate) issue('patientAge', 'Usia pasien wajib diisi.');
    }
  });

export type CreatePublicBookingInput = z.infer<typeof createPublicBookingSchema>;

/** A recurring blocked window (Jumatan, Dzuhur, lunch…) applied to every doctor. weekdays: 0=Sun..6=Sat. */
export const blockedTimeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(60),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});
export type BlockedTime = z.infer<typeof blockedTimeSchema>;
