export const clinicProductName = 'Nodenesia Dental';

export {
  bookingStatuses,
  serviceZones,
  userRoles,
  type BookingStatus,
  type ServiceZone,
  type UserRole,
} from './enums/booking.js';

export {
  createPublicBookingSchema,
  type CreatePublicBookingInput,
} from './schemas/booking.js';
export { slotQuerySchema, slotSchema, type Slot, type SlotQuery } from './schemas/slots.js';
export { bookingSummarySchema, type BookingSummary } from './schemas/booking-summary.js';
