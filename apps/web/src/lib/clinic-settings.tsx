import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from './api';
import type { ClinicSettings } from '../types';

/**
 * Placeholder shown before the public clinic settings finish loading. Keeping the
 * layout stable avoids a flash of empty contact details / opening hours.
 */
export const fallbackClinicSettings: ClinicSettings = {
  name: 'Klinik Gigi Senyum Sehat',
  tagline: 'Perawatan Gigi Spesialis yang Nyaman, Lembut, dan Transparan',
  taglineEn: 'Comfortable, Gentle, and Transparent Specialist Dental Care',
  address: 'Jl. Wolter Monginsidi No. 88, Kebayoran Baru, Jakarta Selatan 12180',
  city: 'Jakarta Selatan',
  phone: '+62 21 7208 4500',
  whatsappNumber: '6281289001234',
  instagramHandle: '@senyumsehat.dental',
  googleMapsUrl: 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan',
  timezone: 'Asia/Jakarta',
  maintenanceMode: false,
  openHoursDesc: 'Senin – Sabtu: 09:00 – 20:00 WIB (Istirahat 12:00 – 13:00)',
  openHoursDescEn: 'Monday – Saturday: 09:00 – 20:00 WIB (Break 12:00 – 13:00)',
  regularHours: {
    weekdays: 'Senin – Sabtu',
    weekdaysTime: '09:00 – 20:00 WIB',
    sunday: 'Minggu',
    sundayTime: 'Tutup (Darurat via WhatsApp)',
    breakTime: 'Istirahat: 12:00 – 13:00 WIB',
  },
  stats: [
    { label: 'Rating Google Maps (380+ Ulasan)', labelEn: 'Google Maps Rating (380+ Reviews)', value: '4.9 / 5.0', unit: 'bintang' },
    { label: 'Dokter Gigi Spesialis (SIP)', labelEn: 'Licensed Specialist Dentists (SIP)', value: '3 drg. Sp.', unit: 'spesialis' },
    { label: 'Pengalaman Klinis Tim', labelEn: 'Clinical Team Experience', value: '12+ Thn', unit: 'tahun' },
  ],
};

type ClinicSettingsState = {
  settings: ClinicSettings;
  isReady: boolean;
};

const ClinicSettingsContext = createContext<ClinicSettingsState>({ settings: fallbackClinicSettings, isReady: false });

export function ClinicSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings>(fallbackClinicSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    getSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch(() => {
        // Keep the fallback settings when the API is unreachable.
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return <ClinicSettingsContext.Provider value={{ settings, isReady }}>{children}</ClinicSettingsContext.Provider>;
}

export function useClinicSettings(): ClinicSettings {
  return useContext(ClinicSettingsContext).settings;
}

export function useClinicSettingsState(): ClinicSettingsState {
  return useContext(ClinicSettingsContext);
}
