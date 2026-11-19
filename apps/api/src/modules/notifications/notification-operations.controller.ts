import { Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { parsePagination } from '../../common/pagination.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { NotificationOperationsService } from './notification-operations.service.js';

@Controller('api/v1/admin/notifications')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class NotificationOperationsController {
  constructor(@Inject(NotificationOperationsService) private readonly notifications: NotificationOperationsService) {}
  @Get() list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pagination = parsePagination({ page, pageSize });
    return this.notifications.listPaginated(pagination.page, pagination.pageSize, pagination.skip);
  }
  @Post(':id/resend') resend(@Param('id') id: string, @Req() request: { user: { sub: string }; ip?: string }) { return this.notifications.resend(id, { userId: request.user.sub, ip: request.ip }); }
}
