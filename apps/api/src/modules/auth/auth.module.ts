import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RefreshTokenRepository } from './refresh-token.repository.js';
import { UsersRepository } from './users.repository.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'local-development-secret-change-me' }), forwardRef(() => AuditLogsModule)],
  controllers: [AuthController, AdminUsersController],
  providers: [UsersRepository, RefreshTokenRepository, AuthService, AccessTokenGuard, AdminUsersService],
  exports: [AccessTokenGuard, JwtModule],
})
export class AuthModule {}
