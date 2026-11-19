import { Inject, Injectable, type MessageEvent } from '@nestjs/common';
import { interval, map, merge, Observable, Subject } from 'rxjs';
import { parsePagination, type PaginationQuery } from '../../common/pagination.js';
import { PrismaService } from '../../prisma/prisma.service.js';

export type AdminNotificationPayload = {
  id: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

@Injectable()
export class AdminNotificationsService {
  private readonly events$ = new Subject<AdminNotificationPayload>();

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createAndBroadcast(input: {
    type: string;
    title: string;
    body: string;
    entityType?: string;
    entityId?: string;
  }): Promise<AdminNotificationPayload> {
    const created = await this.prisma.adminNotification.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      },
    });
    const payload: AdminNotificationPayload = {
      id: created.id,
      type: created.type,
      title: created.title,
      body: created.body,
      entityType: created.entityType,
      entityId: created.entityId,
      isRead: created.isRead,
      readAt: created.readAt ? created.readAt.toISOString() : null,
      createdAt: created.createdAt.toISOString(),
    };
    this.events$.next(payload);
    return payload;
  }

  async list(query: PaginationQuery = {}) {
    const { page, pageSize, skip } = parsePagination(query, 20, 100);
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.adminNotification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.adminNotification.count(),
      this.prisma.adminNotification.count({ where: { isRead: false } }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        entityType: item.entityType,
        entityId: item.entityId,
        isRead: item.isRead,
        readAt: item.readAt ? item.readAt.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      unreadCount,
      page,
      pageSize,
    };
  }

  async markRead(id: string) {
    await this.prisma.adminNotification.updateMany({
      where: { id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { id, isRead: true };
  }

  async markAllRead() {
    const result = await this.prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  stream(): Observable<MessageEvent> {
    const notifications = this.events$.asObservable().pipe(
      map((payload): MessageEvent => ({
        type: 'notification',
        data: payload,
      })),
    );
    const heartbeat = interval(25_000).pipe(
      map((): MessageEvent => ({
        type: 'ping',
        data: { ts: Date.now() },
      })),
    );
    return merge(notifications, heartbeat);
  }
}
