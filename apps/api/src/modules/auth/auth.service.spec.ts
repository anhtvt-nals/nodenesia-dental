import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  it('rejects an inactive account before issuing a session', async () => {
    const users = {
      findByEmail: vi.fn().mockResolvedValue({
        id: 'user-id',
        email: 'owner@example.com',
        name: 'Owner',
        role: 'owner',
        isActive: false,
        passwordHash: 'hash',
      }),
    };
    const service = new AuthService(users as never, {} as never, {} as never);

    await expect(service.login({ email: 'owner@example.com', password: 'correct-password' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an unknown refresh token', async () => {
    const refreshTokens = { findById: vi.fn().mockResolvedValue(null) };
    const service = new AuthService({} as never, refreshTokens as never, {} as never);

    await expect(service.refresh('missing.invalid')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('does not revoke a refresh token until its secret is verified', async () => {
    const refreshTokens = { findById: vi.fn().mockResolvedValue({ id: 'token-id', revokedAt: null, expiresAt: new Date(Date.now() + 60_000), tokenHash: await import('argon2').then(({ hash }) => hash('correct-secret')) }), revoke: vi.fn() };
    const service = new AuthService({} as never, refreshTokens as never, {} as never);
    await expect(service.logout('token-id.wrong-secret')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(refreshTokens.revoke).not.toHaveBeenCalled();
  });
});
