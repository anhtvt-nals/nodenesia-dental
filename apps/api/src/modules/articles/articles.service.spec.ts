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

  it('deletes an article and records an audit log', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({ id: 'art-1', title: 'Test Article' }),
      delete: vi.fn().mockResolvedValue({ id: 'art-1' }),
    };
    const audit = { record: vi.fn().mockResolvedValue(undefined) };
    const service = new ArticlesService(repository as never, audit as never);
    await expect(service.delete('art-1', { userId: 'u1' })).resolves.toEqual({ id: 'art-1', success: true });
    expect(repository.delete).toHaveBeenCalledWith('art-1');
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'delete', entityId: 'art-1' }));
  });
});
