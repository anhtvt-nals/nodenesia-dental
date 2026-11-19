export type TimeInterval = {
  start: string;
  end: string;
};

export type AvailableSlot = TimeInterval;

export type AvailabilityInput = {
  date: string;
  stepMinutes: number;
  durationMinutes: number;
  turnoverMinutes?: number;
  intervals: TimeInterval[];
  busy: TimeInterval[];
  /** Clinic-wide blocked windows (Jumatan, lunch...). A slot must not overlap them. */
  blocked?: TimeInterval[];
  chairOccupancy?: TimeInterval[];
  chairsCount?: number;
};
