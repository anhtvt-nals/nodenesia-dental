import { FormEvent, useState } from 'react';
import { updateSettings, type Settings } from '../../api/admin-api';

type Props = { settings: Settings; accessToken: string; onSaved: (settings: Settings) => void };

export function SettingsEditor({ settings, accessToken, onSaved }: Props) {
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { onSaved(await updateSettings(accessToken, { name: String(form.get('name')), timezone: String(form.get('timezone')), slotStepMinutes: Number(form.get('slotStepMinutes')), bookingLeadMinutes: Number(form.get('bookingLeadMinutes')), bookingHorizonDays: Number(form.get('bookingHorizonDays')), chairsCount: Number(form.get('chairsCount')), reminderTemplates: Object.fromEntries(['confirmation', 'reminder_h1', 'reminder_2h', 'review_request'].map((key) => [key, String(form.get(key)).trim()]).filter(([, value]) => value)) })); setMessage('Đã lưu cấu hình.'); } catch (error) { setMessage((error as Error).message); }
  }
  return <form onSubmit={submit}><h2>Cấu hình phòng khám</h2><label>Tên<input name="name" defaultValue={settings.name} required /></label><label>Timezone<input name="timezone" defaultValue={settings.timezone} required /></label><label>Slot (phút)<input name="slotStepMinutes" type="number" defaultValue={settings.slotStepMinutes} min="5" max="60" required /></label><label>Đặt trước (phút)<input name="bookingLeadMinutes" type="number" defaultValue={settings.bookingLeadMinutes} min="0" required /></label><label>Horizon (ngày)<input name="bookingHorizonDays" type="number" defaultValue={settings.bookingHorizonDays} min="1" required /></label><label>Số ghế<input name="chairsCount" type="number" defaultValue={settings.chairsCount} min="1" required /></label><fieldset><legend>Template WhatsApp</legend><label>Xác nhận<textarea name="confirmation" defaultValue={settings.reminderTemplates?.confirmation} placeholder="Halo {{name}}, jadwal {{service}}…" /></label><label>H-1<textarea name="reminder_h1" defaultValue={settings.reminderTemplates?.reminder_h1} placeholder="Pengingat: besok…" /></label><label>H-2<textarea name="reminder_2h" defaultValue={settings.reminderTemplates?.reminder_2h} placeholder="Pengingat: jadwal…" /></label><label>Yêu cầu review<textarea name="review_request" defaultValue={settings.reminderTemplates?.review_request} placeholder="Terima kasih…" /></label><p>Biến: {'{{name}}'}, {'{{service}}'}, {'{{doctor}}'}, {'{{date}}'}, {'{{time}}'}, {'{{link}}'}, {'{{code}}'}</p></fieldset><button>Lưu cấu hình</button><p aria-live="polite">{message}</p></form>;
}
