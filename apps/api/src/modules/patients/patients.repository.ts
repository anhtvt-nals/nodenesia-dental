import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PatientsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  upsert(name: string, phoneE164: string) {
    return this.prisma.patient.upsert({ where: { phoneE164 }, update: { name }, create: { name, phoneE164 } });
  }

  list(query?: string) { return this.prisma.patient.findMany({ where: query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { phoneE164: { contains: query } }] } : undefined, orderBy: { createdAt: 'desc' }, take: 200, include: { _count: { select: { bookings: true } } } }); }
  findById(id: string) { return this.prisma.patient.findUnique({ where: { id } }); }
  updateNotes(id: string, notes: string | null) { return this.prisma.patient.update({ where: { id }, data: { notes } }); }
}
