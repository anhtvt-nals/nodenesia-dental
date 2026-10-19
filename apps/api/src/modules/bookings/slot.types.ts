export type TimeInterval = {
  start: string;
  end: string;
};

export type AvailableSlot = TimeInterval;

export type AvailabilityInput = {
  date: string;
  stepMinutes: number;
  durationMinutes: number;
  intervals: TimeInterval[];
  busy: TimeInterval[];
};
