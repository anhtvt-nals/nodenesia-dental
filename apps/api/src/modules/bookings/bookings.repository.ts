import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Prisma } from '@prisma/client';
import type { BookingsWriter, CreateBooking, CreatedBooking } from './bookings.service.js';

@Injectable()
export class BookingsRepository implements BookingsWriter {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async create(input: CreateBooking): Promise<CreatedBooking> {
    return this.createWithSource({ ...input, status: 'pending' }, 'web');
  }

  createAdmin(input: CreateBooking) {
    return this.createWithSource({ ...input, status: input.status ?? 'confirmed' }, 'admin');
  }

  private async createWithSource(input: CreateBooking, source: 'web' | 'admin'): Promise<CreatedBooking> {
    try {
      const { skipNotifications, ...bookingData } = input;
      const manageToken = randomBytes(32).toString('base64url');
      const status = bookingData.status ?? (source === 'web' ? 'pending' : 'confirmed');
      const booking = await this.prisma.$transaction(async (tx) => {
        const created = await tx.booking.create({
          data: {
            ...bookingData,
            status,
            startsAt: new Date(bookingData.startsAt),
            endsAt: new Date(bookingData.endsAt),
            turnoverEndsAt: bookingData.turnoverEndsAt ? new Date(bookingData.turnoverEndsAt) : null,
            code: `DNT-${randomBytes(4).toString('hex').toUpperCase()}`,
            manageTokenHash: await argon2.hash(manageToken),
            source,
          },
        });
        if (!skipNotifications && status === 'confirmed') {
          await tx.notificationLog.create({ data: { bookingId: created.id, type: 'confirmation', channel: 'whatsapp', provider: 'pending', scheduledAt: new Date() } });
          const now = new Date();
          const reminderCandidates: Prisma.NotificationLogCreateManyInput[] = [
            { bookingId: created.id, type: 'reminder_h1', channel: 'whatsapp', provider: 'pending', scheduledAt: new Date(created.startsAt.getTime() - 24 * 60 * 60_000) },
            { bookingId: created.id, type: 'reminder_2h', channel: 'whatsapp', provider: 'pending', scheduledAt: new Date(created.startsAt.getTime() - 2 * 60 * 60_000) },
          ];
          const reminders = reminderCandidates.filter((reminder) => reminder.scheduledAt > now);
          if (reminders.length) await tx.notificationLog.createMany({ data: reminders });
        }
        return created;
      });
      return { ...bookingData, code: booking.code, status, manageToken };
    } catch (error) {
      if (error instanceof Error && error.message.includes('bookings_no_overlap')) throw new ConflictException('Selected slot is no longer available');
      throw error;
    }
  }
}
