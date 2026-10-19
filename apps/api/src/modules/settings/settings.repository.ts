import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { PublicClinicSettings, SettingsReader } from './settings.service.js';
import type { AdminClinicSettings, AdminSettingsRepository } from './admin-settings.service.js';

@Injectable()
export class SettingsRepository implements SettingsReader, AdminSettingsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async getPublic(): Promise<PublicClinicSettings> {
    const settings = await this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });
    return {
      name: settings.name,
      phone: settings.phone,
      waNumber: settings.waNumber,
      address: settings.address,
      timezone: settings.timezone,
      tagline: settings.tagline,
      taglineEn: settings.taglineEn,
      city: settings.city,
      instagramHandle: settings.instagramHandle,
      googleMapsUrl: settings.googleMapsUrl,
      openHours: settings.openHours,
      stats: settings.stats,
    };
  }

  async getAdmin(): Promise<AdminClinicSettings> {
    return this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });
  }

  async update(input: Partial<AdminClinicSettings>): Promise<AdminClinicSettings> {
    return this.prisma.clinicSettings.update({ where: { id: 'default' }, data: input });
  }
}
