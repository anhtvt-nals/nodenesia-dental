export type PublicClinicSettings = {
  name: string;
  phone: string;
  waNumber: string;
  address: string;
  timezone: string;
  tagline: string | null;
  taglineEn: string | null;
  city: string | null;
  instagramHandle: string | null;
  googleMapsUrl: string | null;
  openHours: unknown;
  stats: unknown;
  blockedTimes?: unknown;
  paymentMethods?: unknown;
  cancelCutoffHours?: number;
  autoReleaseHours?: number;
};

export interface SettingsReader {
  getPublic(): Promise<PublicClinicSettings>;
}

export class SettingsService {
  constructor(private readonly repository: SettingsReader) {}

  getPublic(): Promise<PublicClinicSettings> {
    return this.repository.getPublic();
  }
}
