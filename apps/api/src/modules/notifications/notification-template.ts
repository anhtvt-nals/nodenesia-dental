const defaults: Record<string, string> = {
  confirmation: 'Halo {{name}}, jadwal {{service}} dengan {{doctor}} telah dibuat: {{date}} {{time}}. Kelola: {{link}}',
  reminder_h1: 'Pengingat: besok {{date}} pukul {{time}} Anda memiliki jadwal {{service}} dengan {{doctor}}.',
  reminder_2h: 'Pengingat: jadwal {{service}} Anda dengan {{doctor}} dimulai pukul {{time}}.',
  review_request: 'Terima kasih telah berkunjung. Kami menantikan ulasan Anda.',
};

export function renderNotification(type: string, templates: unknown, values: Record<string, string>) {
  const custom = templates && typeof templates === 'object' && !Array.isArray(templates) ? (templates as Record<string, unknown>)[type] : undefined;
  const template = typeof custom === 'string' && custom.trim() ? custom : defaults[type] ?? `Jadwal {{code}}`;
  return template.replace(/{{(name|service|doctor|date|time|link|code)}}/g, (_, key: string) => values[key] ?? '');
}
