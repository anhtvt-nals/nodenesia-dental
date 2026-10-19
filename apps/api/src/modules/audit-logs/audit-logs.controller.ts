import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AuditLogService } from './audit-log.service.js';

@Controller('api/v1/admin/audit-logs')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class AuditLogsController {
  constructor(@Inject(AuditLogService) private readonly audit: AuditLogService) {}
  @Get() list() { return this.audit.list(); }
}
