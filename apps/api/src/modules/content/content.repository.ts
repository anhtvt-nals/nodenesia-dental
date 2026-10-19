import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ContentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  get(key: string, locale: string) { return this.prisma.contentBlock.findUnique({ where: { key_locale: { key, locale } } }); }
  list() { return this.prisma.contentBlock.findMany({ orderBy: [{ key: 'asc' }, { locale: 'asc' }] }); }
  upsert(key: string, locale: string, content: object) { return this.prisma.contentBlock.upsert({ where: { key_locale: { key, locale } }, update: { content }, create: { key, locale, content } }); }
}
