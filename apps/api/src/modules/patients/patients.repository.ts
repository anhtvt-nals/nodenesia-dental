import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PatientsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  upsert(name: string, phoneE164?: string) {
    if (!phoneE164) {
      const token = randomBytes(8).toString('hex').replace(/[0-9]/g, (d) => String.fromCharCode(97 + Number(d)));
      return this.prisma.patient.create({ data: { name, phoneE164: `wa-pending-${token}` } });
    }
    return this.prisma.patient.upsert({ where: { phoneE164 }, update: { name }, create: { name, phoneE164 } });
  }

  list(query?: string) { return this.prisma.patient.findMany({ where: query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { phoneE164: { contains: query } }] } : undefined, orderBy: { createdAt: 'desc' }, take: 200, include: { _count: { select: { bookings: true } } } }); }
  async listPaginated(query: string | undefined, skip: number, take: number) {
    const where = query ? { OR: [{ name: { contains: query, mode: 'insensitive' as const } }, { phoneE164: { contains: query } }] } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.patient.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { _count: { select: { bookings: true } } } }),
      this.prisma.patient.count({ where }),
    ]);
    return { items, total };
  }
  findById(id: string) { return this.prisma.patient.findUnique({ where: { id } }); }
  updateNotes(id: string, notes: string | null) { return this.prisma.patient.update({ where: { id }, data: { notes } }); }
}
