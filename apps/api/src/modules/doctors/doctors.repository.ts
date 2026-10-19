import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { DoctorInput, TimeOffInput, WorkingHourInput } from './admin-doctors.service.js';
import type { DoctorsReader, PublicDoctor } from './doctors.service.js';
@Injectable()
export class DoctorsRepository implements DoctorsReader {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async listPublic(): Promise<PublicDoctor[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: { isActive: true },
      include: { services: true, workingHours: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] } },
      orderBy: { sortOrder: 'asc' },
    });
    return doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      slug: doctor.slug,
      title: doctor.title,
      titleEn: doctor.titleEn,
      specialty: doctor.specialty,
      specialtyEn: doctor.specialtyEn,
      bio: doctor.bio,
      bioEn: doctor.bioEn,
      photoUrl: doctor.photoUrl,
      sipNumber: doctor.sipNumber,
      experienceYears: doctor.experienceYears,
      education: Array.isArray(doctor.education) ? doctor.education.map((item) => String(item)) : [],
      serviceIds: doctor.services.map((item) => item.serviceId),
      workingHours: doctor.workingHours.map((hour) => ({ weekday: hour.weekday, start: hour.startTime.toISOString().slice(11, 16), end: hour.endTime.toISOString().slice(11, 16) })),
    }));
  }

  listAdmin() { return this.prisma.doctor.findMany({ include: { services: true, workingHours: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] } }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
  findById(id: string) { return this.prisma.doctor.findUnique({ where: { id }, include: { services: true, workingHours: true } }); }
  create(input: DoctorInput) { const { serviceIds, ...data } = input; return this.prisma.doctor.create({ data: { ...data, services: { create: serviceIds.map((serviceId) => ({ serviceId })) } }, include: { services: true, workingHours: true } }); }
  update(id: string, input: Partial<DoctorInput>) { const { serviceIds, ...data } = input; return this.prisma.doctor.update({ where: { id }, data: { ...data, ...(serviceIds ? { services: { deleteMany: {}, create: serviceIds.map((serviceId) => ({ serviceId })) } } : {}) }, include: { services: true, workingHours: true } }); }
  replaceWorkingHours(doctorId: string, hours: WorkingHourInput[]) { return this.prisma.$transaction(async (tx) => { await tx.workingHour.deleteMany({ where: { doctorId } }); await tx.workingHour.createMany({ data: hours.map((hour) => ({ doctorId, weekday: hour.weekday, startTime: new Date(`1970-01-01T${hour.start}:00.000Z`), endTime: new Date(`1970-01-01T${hour.end}:00.000Z`) })) }); }); }
  createTimeOff(input: TimeOffInput) { return this.prisma.timeOff.create({ data: { ...input, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) }, include: { doctor: { select: { name: true } } } }); }
  listTimeOffs() { return this.prisma.timeOff.findMany({ include: { doctor: { select: { name: true } } }, orderBy: { startsAt: 'asc' } }); }
  findTimeOff(id: string) { return this.prisma.timeOff.findUnique({ where: { id } }); }
  deleteTimeOff(id: string) { return this.prisma.timeOff.delete({ where: { id } }); }
}
