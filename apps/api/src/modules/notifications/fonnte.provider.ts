import type { NotificationMessage, ProviderReceipt } from './notification.provider.js';

export class FonnteProvider {
  constructor(private readonly token: string) {}

  async send(message: NotificationMessage): Promise<ProviderReceipt> {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: this.token, 'content-type': 'application/json' },
      body: JSON.stringify({ target: message.to, message: message.text }),
    });
    if (!response.ok) throw new Error(`Fonnte request failed: ${response.status}`);
    const body = await response.json() as { id?: string };
    return { id: body.id ?? crypto.randomUUID() };
  }
}
