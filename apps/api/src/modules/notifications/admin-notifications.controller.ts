import { Controller, Get, Inject, Param, Patch, Post, Query, Sse, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminNotificationsService } from './admin-notifications.service.js';

@Controller('api/v1/admin/in-app-notifications')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class AdminNotificationsController {
  constructor(
    @Inject(AdminNotificationsService)
    private readonly notifications: AdminNotificationsService,
  ) {}

  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.notifications.list({ page, pageSize });
  }

  @Sse('stream')
  stream() {
    return this.notifications.stream();
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }

  @Post('read-all')
  markAllRead() {
    return this.notifications.markAllRead();
  }
}
