const defaults: Record<string, string> = {
  confirmation: 'Halo {{name}}, janji temu Anda ({{code}}) untuk {{service}} bersama {{doctor}} pada {{date}} pukul {{time}} telah DIKONFIRMASI. Mohon hadir 10 menit sebelumnya. Kelola: {{link}}',
  reminder_h1: 'Pengingat: besok {{date}} pukul {{time}} Anda memiliki jadwal {{service}} dengan {{doctor}}.',
  reminder_2h: 'Pengingat: jadwal {{service}} Anda dengan {{doctor}} dimulai pukul {{time}}.',
  review_request: 'Terima kasih telah berkunjung. Kami menantikan ulasan Anda.',
};

export function renderNotification(type: string, values: Record<string, string>) {
  const template = defaults[type] ?? `Jadwal {{code}}`;
  return template.replace(/{{(name|service|doctor|date|time|link|code)}}/g, (_, key: string) => values[key] ?? '');
}
