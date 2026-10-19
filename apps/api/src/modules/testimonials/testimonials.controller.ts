import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { TestimonialsService } from './testimonials.service.js';

const schema = z.object({ name: z.string().trim().min(1).max(120), text: z.string().trim().min(1).max(3000), rating: z.number().int().min(1).max(5), source: z.string().trim().min(1).max(120), isPublished: z.boolean().optional(), sortOrder: z.number().int().min(0).max(10_000).optional() });
const actor = (request: { user: { sub: string }; ip?: string }) => ({ userId: request.user.sub, ip: request.ip });

@Controller('api/v1')
export class TestimonialsController {
  constructor(@Inject(TestimonialsService) private readonly testimonials: TestimonialsService) {}
  @Get('public/testimonials') listPublic() { return this.testimonials.listPublic(); }
  @Get('admin/testimonials') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') listAdmin() { return this.testimonials.listAdmin(); }
  @Post('admin/testimonials') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.testimonials.create(schema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('admin/testimonials/:id') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.testimonials.update(id, schema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
