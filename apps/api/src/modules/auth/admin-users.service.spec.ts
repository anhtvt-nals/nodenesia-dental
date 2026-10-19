import { ConflictException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminUsersService } from './admin-users.service.js';

describe('AdminUsersService', () => {
  it('does not create duplicate email accounts', async () => {
    const users = { findByEmail: vi.fn().mockResolvedValue({ id: 'existing' }) };
    const service = new AdminUsersService(users as never, {} as never);
    await expect(service.create({ email: 'owner@clinic.local', name: 'Owner', role: 'owner', password: 'long-enough-password' }, { userId: 'owner-id' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not let an owner deactivate their own account', async () => {
    const service = new AdminUsersService({} as never, {} as never);
    await expect(service.setActive('owner-id', false, { userId: 'owner-id' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('keeps at least one active owner', async () => {
    const users = { findById: vi.fn().mockResolvedValue({ id: 'other-owner', isActive: true, role: 'owner' }), countActiveOwners: vi.fn().mockResolvedValue(1) };
    const service = new AdminUsersService(users as never, {} as never);
    await expect(service.setActive('other-owner', false, { userId: 'owner-id' })).rejects.toBeInstanceOf(ConflictException);
  });
});
