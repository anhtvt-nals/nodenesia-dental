import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { DoctorsRepository } from './doctors.repository.js';

export type DoctorInput = { slug: string; name: string; title?: string | null; specialty?: string | null; bio?: string | null; photoUrl?: string | null; gender?: string | null; sipNumber?: string | null; isActive?: boolean; sortOrder?: number; serviceIds: string[] };
export type WorkingHourInput = { weekday: number; start: string; end: string };
export type TimeOffInput = { doctorId?: string | null; startsAt: string; endsAt: string; reason?: string };
type Actor = { userId: string; ip?: string };

@Injectable()
export class AdminDoctorsService {
  constructor(@Inject(DoctorsRepository) private readonly repository: DoctorsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}

  list() { return this.repository.listAdmin(); }

  async create(input: DoctorInput, actor: Actor) {
    const doctor = await this.repository.create(input);
    await this.audit.record({ ...actor, action: 'create', entity: 'doctor', entityId: doctor.id, diff: input });
    return doctor;
  }

  async update(id: string, input: Partial<DoctorInput>, actor: Actor) {
    const before = await this.repository.findById(id);
    if (!before) throw new NotFoundException('Doctor not found');
    const doctor = await this.repository.update(id, input);
    await this.audit.record({ ...actor, action: 'update', entity: 'doctor', entityId: id, diff: { before, after: input } });
    return doctor;
  }

  async remove(id: string, actor: Actor) {
    const doctor = await this.repository.findById(id);
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (await this.repository.countBookings(id)) throw new ConflictException('Dokter tidak dapat dihapus karena masih memiliki jadwal janji temu.');
    await this.repository.delete(id);
    await this.audit.record({ ...actor, action: 'delete', entity: 'doctor', entityId: id, diff: doctor });
  }

  async replaceWorkingHours(id: string, input: WorkingHourInput[], actor: Actor) {
    if (!await this.repository.findById(id)) throw new NotFoundException('Doctor not found');
    this.validateHours(input);
    await this.repository.replaceWorkingHours(id, input);
    await this.audit.record({ ...actor, action: 'replace_working_hours', entity: 'doctor', entityId: id, diff: { workingHours: input } });
    return this.repository.findById(id);
  }

  async addTimeOff(input: TimeOffInput, actor: Actor) {
    if (input.doctorId && !await this.repository.findById(input.doctorId)) throw new NotFoundException('Doctor not found');
    if (new Date(input.endsAt) <= new Date(input.startsAt)) throw new BadRequestException('Time off must end after it starts');
    const timeOff = await this.repository.createTimeOff(input);
    await this.audit.record({ ...actor, action: 'create', entity: 'time_off', entityId: timeOff.id, diff: input });
    return timeOff;
  }

  listTimeOffs() { return this.repository.listTimeOffs(); }

  async removeTimeOff(id: string, actor: Actor) {
    const timeOff = await this.repository.findTimeOff(id);
    if (!timeOff) throw new NotFoundException('Time off not found');
    await this.repository.deleteTimeOff(id);
    await this.audit.record({ ...actor, action: 'delete', entity: 'time_off', entityId: id, diff: timeOff });
  }

  private validateHours(hours: WorkingHourInput[]) {
    for (const hour of hours) {
      if (hour.end <= hour.start) throw new BadRequestException('Working hour end must be after start');
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hour.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hour.end)) throw new BadRequestException('Invalid working hour');
    }
    for (const day of new Set(hours.map((hour) => hour.weekday))) {
      const shifts = hours.filter((hour) => hour.weekday === day).sort((a, b) => a.start.localeCompare(b.start));
      if (shifts.some((shift, index) => index > 0 && shifts[index - 1].end > shift.start)) throw new BadRequestException('Working hours cannot overlap');
    }
  }
}
