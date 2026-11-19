import { firstValueFrom, take } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AdminNotificationsService } from './admin-notifications.service.js';

describe('AdminNotificationsService', () => {
  it('persists and broadcasts a real-time notification event', async () => {
    const now = new Date('2026-11-13T16:00:00.000Z');
    const create = vi.fn().mockResolvedValue({
      id: 'notif-1',
      type: 'booking_created',
      title: 'Janji temu baru (DNT-1234)',
      body: 'Budi · Scaling (09:00 WIB)',
      entityType: 'booking',
      entityId: 'DNT-1234',
      isRead: false,
      readAt: null,
      createdAt: now,
    });
    const service = new AdminNotificationsService({ adminNotification: { create } } as never);

    const nextEvent = firstValueFrom(service.stream().pipe(take(1)));
    const created = await service.createAndBroadcast({
      type: 'booking_created',
      title: 'Janji temu baru (DNT-1234)',
      body: 'Budi · Scaling (09:00 WIB)',
      entityType: 'booking',
      entityId: 'DNT-1234',
    });

    const event = await nextEvent;
    expect(created.id).toBe('notif-1');
    expect(event.type).toBe('notification');
    expect(event.data).toMatchObject({ id: 'notif-1', entityId: 'DNT-1234', isRead: false });
  });

  it('lists paginated notifications with unreadCount', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValueOnce(12).mockResolvedValueOnce(3);
    const service = new AdminNotificationsService({ adminNotification: { findMany, count } } as never);

    const result = await service.list({ page: '2', pageSize: '10' });
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(result).toEqual({ items: [], total: 12, unreadCount: 3, page: 2, pageSize: 10 });
  });
});
