export type NotificationMessage = { to: string; text: string };
export type ProviderReceipt = { id: string };

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<ProviderReceipt>;
}
