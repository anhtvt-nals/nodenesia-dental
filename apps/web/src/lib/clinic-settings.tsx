import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from './api';
import type { ClinicSettings } from '../types';

/**
 * Placeholder shown before the public clinic settings finish loading. Keeping the
 * layout stable avoids a flash of empty contact details / opening hours.
 */
export const fallbackClinicSettings: ClinicSettings = {
  name: 'Klinik Gigi',
  tagline: '',
  taglineEn: '',
  address: '',
  city: '',
  phone: '',
  whatsappNumber: '',
  instagramHandle: '',
  googleMapsUrl: '',
  timezone: 'Asia/Jakarta',
  openHoursDesc: '',
  openHoursDescEn: '',
  regularHours: { weekdays: '', weekdaysTime: '', sunday: '', sundayTime: '', breakTime: '' },
  stats: [],
};

const ClinicSettingsContext = createContext<ClinicSettings>(fallbackClinicSettings);

export function ClinicSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings>(fallbackClinicSettings);

  useEffect(() => {
    let active = true;
    getSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch(() => {
        // Keep the fallback settings when the API is unreachable.
      });
    return () => {
      active = false;
    };
  }, []);

  return <ClinicSettingsContext.Provider value={settings}>{children}</ClinicSettingsContext.Provider>;
}

export function useClinicSettings(): ClinicSettings {
  return useContext(ClinicSettingsContext);
}
