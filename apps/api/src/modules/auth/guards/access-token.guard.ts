import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { rolesKey } from '../roles.decorator.js';

type AccessPayload = { sub: string; role: 'owner' | 'staff' };

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: AccessPayload }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Bearer token is required');

    try {
      const payload = await this.jwt.verifyAsync<AccessPayload>(token);
      const roles = this.reflector.getAllAndOverride<Array<'owner' | 'staff'>>(rolesKey, [context.getHandler(), context.getClass()]);
      if (roles?.length && !roles.includes(payload.role)) throw new ForbiddenException('Insufficient role');
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
