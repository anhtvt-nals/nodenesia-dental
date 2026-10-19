import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class AdminUsersService {
  constructor(@Inject(UsersRepository) private readonly users: UsersRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  list() { return this.users.list(); }
  async create(input: { email: string; name: string; role: 'owner' | 'staff'; password: string }, actor: { userId: string; ip?: string }) {
    const email = input.email.toLowerCase();
    if (await this.users.findByEmail(email)) throw new ConflictException('Email already exists');
    const user = await this.users.create({ email, name: input.name, role: input.role, passwordHash: await argon2.hash(input.password) });
    await this.audit.record({ ...actor, action: 'create', entity: 'user', entityId: user.id, diff: { email: user.email, name: user.name, role: user.role } });
    return user;
  }

  async setActive(id: string, isActive: boolean, actor: { userId: string; ip?: string }) {
    if (id === actor.userId && !isActive) throw new ForbiddenException('You cannot deactivate yourself');
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    if (!isActive && existing.isActive && existing.role === 'owner' && await this.users.countActiveOwners() <= 1) throw new ConflictException('Cannot deactivate the last active owner');
    const user = await this.users.updateActive(id, isActive);
    await this.audit.record({ ...actor, action: isActive ? 'activate' : 'deactivate', entity: 'user', entityId: id, diff: { email: user.email, isActive } });
    return user;
  }
}
