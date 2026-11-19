export type CreateBooking = {
  patientId: string;
  doctorId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  turnoverEndsAt?: string | null;
  complaint?: string | null;
  bookingFor?: string | null;
  bookerName?: string | null;
  bookerPhone?: string | null;
  patientAge?: number | null;
  patientType?: string | null;
  birthDate?: Date | null;
  payer?: string | null;
  parentBookingId?: string | null;
  chairIndex?: number | null;
  status?: 'pending' | 'confirmed';
  skipNotifications?: boolean;
};

export type CreatedBooking = CreateBooking & {
  code: string;
  status: 'pending' | 'confirmed';
  manageToken: string;
};

export interface BookingsWriter {
  create(input: CreateBooking): Promise<CreatedBooking>;
}

export class BookingsService {
  constructor(private readonly repository: BookingsWriter) {}
  create(input: CreateBooking) {
    return this.repository.create(input);
  }
}
