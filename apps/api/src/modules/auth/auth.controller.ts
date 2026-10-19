import { BadRequestException, Body, Controller, Get, Inject, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { z, ZodError } from 'zod';
import { AuthService } from './auth.service.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { clearRefreshCookie, readRefreshCookie, refreshCookie } from './refresh-cookie.js';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

@Controller('api/v1/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: FastifyReply) {
    try {
      const { refreshToken, ...session } = await this.auth.login(loginSchema.parse(body));
      response.header('set-cookie', refreshCookie(refreshToken));
      return session;
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Post('refresh')
  async refresh(@Req() request: { headers: { cookie?: string } }, @Res({ passthrough: true }) response: FastifyReply) {
    try {
      const rawToken = readRefreshCookie(request.headers.cookie);
      if (!rawToken) throw new UnauthorizedException('Invalid refresh token');
      const { refreshToken, ...session } = await this.auth.refresh(rawToken);
      response.header('set-cookie', refreshCookie(refreshToken));
      return session;
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Post('logout')
  async logout(@Req() request: { headers: { cookie?: string } }, @Res({ passthrough: true }) response: FastifyReply) {
    try {
      const rawToken = readRefreshCookie(request.headers.cookie);
      if (rawToken) await this.auth.logout(rawToken);
      response.header('set-cookie', clearRefreshCookie());
      return { ok: true };
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@Req() request: { user: { sub: string } }) { return this.auth.me(request.user.sub); }
}
