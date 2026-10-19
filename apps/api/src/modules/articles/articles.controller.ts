import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ArticlesService } from './articles.service.js';

const categorySchema = z.object({ name: z.string().trim().min(1).max(120), slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(80), sortOrder: z.number().int().min(0).max(10_000).optional() });
const articleSchema = z.object({ slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120), title: z.string().trim().min(1).max(240), excerpt: z.string().trim().min(1).max(500), body: z.string().trim().min(1).max(50_000), categoryId: z.string().uuid().nullable().optional(), coverUrl: z.string().url().nullable().optional(), seoTitle: z.string().trim().max(240).nullable().optional(), seoDesc: z.string().trim().max(500).nullable().optional(), publishedAt: z.string().datetime().nullable().optional() });
const slugSchema = z.string().regex(/^[a-z0-9-]+$/).max(120);
const actor = (request: { user: { sub: string }; ip?: string }) => ({ userId: request.user.sub, ip: request.ip });
@Controller('api/v1')
export class ArticlesController {
  constructor(@Inject(ArticlesService) private readonly articles: ArticlesService) {}
  @Get('public/articles') listPublic() { return this.articles.listPublic(); }
  @Get('public/articles/:slug') getPublic(@Param('slug') slug: string) { try { return this.articles.getPublicBySlug(slugSchema.parse(slug)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Get('public/article-categories') listPublicCategories() { return this.articles.listCategories(); }
  @Get('admin/articles') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') listAdmin() { return this.articles.listAdmin(); }
  @Get('admin/article-categories') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') listCategories() { return this.articles.listCategories(); }
  @Post('admin/article-categories') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') createCategory(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.articles.createCategory(categorySchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Post('admin/articles') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.articles.create(articleSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('admin/articles/:id') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.articles.update(id, articleSchema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
