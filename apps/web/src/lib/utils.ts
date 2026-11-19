export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Validates Indonesian phone format (08... or +62... or 62...)
 * Accepts 08xx / +62xx / 62xx with 9–13 digits after the prefix.
 */
export function isValidIndonesianPhone(input: string): boolean {
  return validateIndonesianWhatsApp(input).valid;
}

export function validateIndonesianWhatsApp(input: string): { valid: boolean; normalized: string; error?: string } {
  if (!input) return { valid: false, normalized: '', error: 'Nomor tidak valid. Contoh: 08123456789' };
  const cleaned = input.replace(/[\s\-\(\)\+]/g, '');
  let rest = '';
  if (cleaned.startsWith('08')) {
    rest = cleaned.slice(1);
  } else if (cleaned.startsWith('628')) {
    rest = cleaned.slice(2);
  } else {
    return { valid: false, normalized: '', error: 'Nomor tidak valid. Contoh: 08123456789' };
  }
  if (!/^8\d{8,12}$/.test(rest)) {
    return { valid: false, normalized: '', error: 'Nomor tidak valid. Contoh: 08123456789' };
  }
  return { valid: true, normalized: `62${rest}` };
}

/**
 * Formats a date string (YYYY-MM-DD) into Indonesian ("Jumat, 13 November 2026") or English ("Friday, November 13, 2026")
 */
export function formatDateSummary(dateStr: string, isEn = false): string {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0];
  const [y, m, d] = clean.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);
}

/**
 * Normalizes phone number to international E.164 without plus for WhatsApp wa.me links
 * e.g. 08123456789 -> 628123456789
 * +628123456789 -> 628123456789
 */
export function normalizePhoneForWhatsApp(input: string): string {
  const cleaned = input.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  return cleaned;
}

/**
 * Normalizes to standard display E.164 format (+62 812-xxxx-xxxx)
 */
export function formatPhoneDisplay(input: string): string {
  const wa = normalizePhoneForWhatsApp(input);
  if (wa.startsWith('62') && wa.length >= 10) {
    const prefix = '+62';
    const rest = wa.slice(2);
    return `${prefix} ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
  }
  return input;
}

/**
 * Formats Rupiah price
 */
export function formatRupiah(amount: number, isEn = false): string {
  if (isEn) {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      return `IDR ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `IDR ${(amount / 1000).toFixed(0)}k`;
    }
    return `IDR ${amount.toLocaleString('en-US')}`;
  }

  // Indonesian format
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1).replace('.', ',');
    return `Rp ${formatted} jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)} rb`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Formats exact currency value: e.g. Rp 1.500.000 / IDR 1,500,000
 */
export function formatExactCurrency(amount: number, isEn = false): string {
  if (isEn) {
    return `IDR ${amount.toLocaleString('en-US')}`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Generates next 14 calendar dates for booking
 */
export function getNextAvailableDates(daysCount = 14) {
  const dates = [];
  const now = new Date();
  
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    const isSunday = dayOfWeek === 0;

    const dateStr = d.toISOString().split('T')[0];
    dates.push({
      date: dateStr,
      dateObj: d,
      dayOfWeek,
      isSunday,
      isClosed: isSunday, // Sunday closed
    });
  }
  return dates;
}

/**
 * Checks if clinic is currently open in Asia/Jakarta timezone
 * Hours: Monday-Saturday 09:00 - 20:00 (Break 12:00 - 13:00), Sunday Closed
 */
export function getClinicOpenStatus(): {
  isOpen: boolean;
  statusTextId: string;
  statusTextEn: string;
  nextOpenId: string;
  nextOpenEn: string;
} {
  try {
    // Current time in Asia/Jakarta
    const jakartaTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
    }).format(new Date());

    const now = new Date();
    // Convert to Jakarta parts
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'narrow',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now);

    const hourPart = parts.find((p) => p.type === 'hour')?.value || '10';
    const minutePart = parts.find((p) => p.type === 'minute')?.value || '00';
    const hour = parseInt(hourPart, 10);
    const minute = parseInt(minutePart, 10);
    const timeVal = hour * 60 + minute;

    const dayName = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
    }).format(now);

    const isSunday = dayName === 'Sun';
    const isBreak = timeVal >= 12 * 60 && timeVal < 13 * 60;
    const isWorkingHours = timeVal >= 9 * 60 && timeVal < 20 * 60;

    const isOpen = !isSunday && isWorkingHours && !isBreak;

    let statusTextId = 'Buka Sekarang';
    let statusTextEn = 'Open Now';
    let nextOpenId = 'Tutup pukul 20:00 WIB';
    let nextOpenEn = 'Closes at 20:00 WIB';

    if (isSunday) {
      statusTextId = 'Tutup Hari Ini';
      statusTextEn = 'Closed Today';
      nextOpenId = 'Buka kembali Senin pukul 09:00 WIB';
      nextOpenEn = 'Reopens Monday at 09:00 WIB';
    } else if (isBreak) {
      statusTextId = 'Istirahat Siang';
      statusTextEn = 'Lunch Break';
      nextOpenId = 'Buka kembali pukul 13:00 WIB';
      nextOpenEn = 'Reopens at 13:00 WIB';
    } else if (timeVal < 9 * 60) {
      statusTextId = 'Belum Buka';
      statusTextEn = 'Not Yet Open';
      nextOpenId = 'Buka hari ini pukul 09:00 WIB';
      nextOpenEn = 'Opens today at 09:00 WIB';
    } else if (timeVal >= 20 * 60) {
      statusTextId = 'Sudah Tutup';
      statusTextEn = 'Closed for Today';
      nextOpenId = 'Buka besok pukul 09:00 WIB';
      nextOpenEn = 'Opens tomorrow at 09:00 WIB';
    }

    return {
      isOpen,
      statusTextId,
      statusTextEn,
      nextOpenId,
      nextOpenEn,
    };
  } catch {
    return {
      isOpen: true,
      statusTextId: 'Buka Sekarang',
      statusTextEn: 'Open Now',
      nextOpenId: 'Senin–Sabtu 09:00 – 20:00 WIB',
      nextOpenEn: 'Mon–Sat 09:00 – 20:00 WIB',
    };
  }
}

/**
 * Creates WhatsApp Click-to-Chat Link with encoded prefilled message
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = normalizePhoneForWhatsApp(phone);
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}
