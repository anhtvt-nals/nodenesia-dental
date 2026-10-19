import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { Roles } from './roles.decorator.js';
import { AdminUsersService } from './admin-users.service.js';

const createUserSchema = z.object({ email: z.string().email(), name: z.string().trim().min(1).max(120), role: z.enum(['owner', 'staff']), password: z.string().min(12).max(200) });
@Controller('api/v1/admin/users')
@UseGuards(AccessTokenGuard)
@Roles('owner')
export class AdminUsersController {
  constructor(@Inject(AdminUsersService) private readonly users: AdminUsersService) {}
  @Get() list() { return this.users.list(); }
  @Post() create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.users.create(createUserSchema.parse(body), { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch(':id/active') setActive(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.users.setActive(id, z.object({ isActive: z.boolean() }).parse(body).isActive, { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
