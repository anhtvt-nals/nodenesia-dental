export type CreateBooking = { patientId: string; doctorId: string; serviceId: string; startsAt: string; endsAt: string; complaint?: string | null };
export type CreatedBooking = CreateBooking & { code: string; status: 'confirmed'; manageToken: string };
export interface BookingsWriter { create(input: CreateBooking): Promise<CreatedBooking>; }
export class BookingsService { constructor(private readonly repository: BookingsWriter) {} create(input: CreateBooking) { return this.repository.create(input); } }
