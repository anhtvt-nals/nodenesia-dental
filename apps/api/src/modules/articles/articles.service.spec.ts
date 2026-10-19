import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ArticlesService } from './articles.service.js';
describe('ArticlesService', () => {
  it('does not expose drafts through the public repository contract', async () => {
    const repository = { listPublic: vi.fn().mockResolvedValue([]) };
    const service = new ArticlesService(repository as never, {} as never);
    await expect(service.listPublic()).resolves.toEqual([]);
    expect(repository.listPublic).toHaveBeenCalled();
  });

  it('does not return an unpublished article by slug', async () => {
    const repository = { findPublicBySlug: vi.fn().mockResolvedValue(null) };
    const service = new ArticlesService(repository as never, {} as never);
    await expect(service.getPublicBySlug('draft-article')).rejects.toBeInstanceOf(NotFoundException);
  });
});
