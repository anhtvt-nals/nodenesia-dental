import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'staff';
  isActive: boolean;
  passwordHash: string;
};

@Injectable()
export class UsersRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  list() { return this.prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }, orderBy: { createdAt: 'desc' } }); }

  create(input: { email: string; name: string; role: 'owner' | 'staff'; passwordHash: string }) { return this.prisma.user.create({ data: input, select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true } }); }
  updateActive(id: string, isActive: boolean) { return this.prisma.user.update({ where: { id }, data: { isActive }, select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true } }); }
  countActiveOwners() { return this.prisma.user.count({ where: { role: 'owner', isActive: true } }); }
}
