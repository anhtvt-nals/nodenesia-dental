import { describe, expect, it } from 'vitest';
import { SettingsService } from './settings.service.js';

const publicSettings = {
  name: 'Klinik Demo',
  phone: '+6221000000',
  waNumber: '+628120000000',
  address: 'Jakarta',
  timezone: 'Asia/Jakarta',
  tagline: null,
  taglineEn: null,
  city: null,
  instagramHandle: null,
  googleMapsUrl: null,
  openHours: null,
  stats: null,
};

describe('SettingsService', () => {
  it('returns only public clinic settings', async () => {
    const service = new SettingsService({ getPublic: async () => publicSettings });
    await expect(service.getPublic()).resolves.toEqual(publicSettings);
  });

  it('does not leak admin scheduling configuration', async () => {
    const service = new SettingsService({ getPublic: async () => publicSettings });
    await expect(service.getPublic()).resolves.not.toHaveProperty('slotStepMinutes');
  });
});
