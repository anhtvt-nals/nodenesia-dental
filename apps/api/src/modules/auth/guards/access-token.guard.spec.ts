import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AccessTokenGuard } from './access-token.guard.js';

describe('AccessTokenGuard', () => {
  it('rejects a request without a bearer token', async () => {
    const guard = new AccessTokenGuard({} as never, {} as never);
    const context = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    };

    await expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns forbidden when an authenticated staff user enters an owner-only route', async () => {
    const guard = new AccessTokenGuard({ verifyAsync: vi.fn().mockResolvedValue({ sub: 'staff-id', role: 'staff' }) } as never, { getAllAndOverride: vi.fn().mockReturnValue(['owner']) } as never);
    const context = { getHandler: () => undefined, getClass: () => undefined, switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'Bearer token' } }) }) };
    await expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
