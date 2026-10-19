import { Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { NotificationOperationsService } from './notification-operations.service.js';

@Controller('api/v1/admin/notifications')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class NotificationOperationsController {
  constructor(@Inject(NotificationOperationsService) private readonly notifications: NotificationOperationsService) {}
  @Get() list() { return this.notifications.list(); }
  @Post(':id/resend') resend(@Param('id') id: string, @Req() request: { user: { sub: string }; ip?: string }) { return this.notifications.resend(id, { userId: request.user.sub, ip: request.ip }); }
}
