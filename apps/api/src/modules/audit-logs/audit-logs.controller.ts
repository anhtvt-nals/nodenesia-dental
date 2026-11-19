import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { parsePagination } from '../../common/pagination.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AuditLogService } from './audit-log.service.js';

@Controller('api/v1/admin/audit-logs')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class AuditLogsController {
  constructor(@Inject(AuditLogService) private readonly audit: AuditLogService) {}
  @Get() list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pagination = parsePagination({ page, pageSize });
    return this.audit.listPaginated(pagination.page, pagination.pageSize, pagination.skip);
  }
}
