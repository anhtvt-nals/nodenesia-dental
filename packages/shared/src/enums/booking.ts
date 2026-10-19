export const userRoles = ['owner', 'staff'] as const;
export const bookingStatuses = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
] as const;
export const serviceZones = ['front', 'molar', 'gum', 'arch'] as const;

export type UserRole = (typeof userRoles)[number];
export type BookingStatus = (typeof bookingStatuses)[number];
export type ServiceZone = (typeof serviceZones)[number];
