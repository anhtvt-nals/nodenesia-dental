import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { RefreshTokenRepository } from './refresh-token.repository.js';
import { UsersRepository } from './users.repository.js';

export type LoginInput = { email: string; password: string };

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(RefreshTokenRepository) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async login(input: LoginInput) {
    const user = await this.users.findByEmail(input.email.toLowerCase());
    if (!user?.isActive || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession(user);
  }

  async refresh(rawToken: string) {
    const token = await this.verifyRefreshToken(rawToken);

    const user = await this.users.findById(token.userId);
    if (!user?.isActive) throw new UnauthorizedException('Invalid refresh token');
    await this.refreshTokens.revoke(token.id);

    return this.createSession(user);
  }

  async logout(rawToken: string) {
    const token = await this.verifyRefreshToken(rawToken);
    await this.refreshTokens.revoke(token.id);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user?.isActive) throw new UnauthorizedException('Invalid access token');
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  private async verifyRefreshToken(rawToken: string) {
    const [tokenId, tokenSecret] = rawToken.split('.');
    if (!tokenId || !tokenSecret) throw new UnauthorizedException('Invalid refresh token');
    const token = await this.refreshTokens.findById(tokenId);
    if (!token || token.revokedAt || token.expiresAt <= new Date() || !(await argon2.verify(token.tokenHash, tokenSecret))) throw new UnauthorizedException('Invalid refresh token');
    return token;
  }

  private async createSession(user: { id: string; email: string; name: string; role: 'owner' | 'staff' }) {
    const accessToken = await this.jwt.signAsync({ role: user.role }, { subject: user.id, expiresIn: '15m' });
    const tokenSecret = randomBytes(32).toString('base64url');
    const refresh = await this.refreshTokens.create(
      user.id,
      await argon2.hash(tokenSecret),
      new Date(Date.now() + 30 * 24 * 60 * 60_000),
    );
    const refreshToken = `${refresh.id}.${tokenSecret}`;

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
