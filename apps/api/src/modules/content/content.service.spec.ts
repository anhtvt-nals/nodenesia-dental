import { describe, expect, it, vi } from 'vitest';
import { ContentService } from './content.service.js';
describe('ContentService', () => {
  it('upserts a locale-specific block and records its prior value', async () => {
    const repository = { get: vi.fn().mockResolvedValue({ content: { title: 'Before' } }), upsert: vi.fn().mockResolvedValue({ key: 'hero', locale: 'id' }) };
    const audit = { record: vi.fn() };
    const service = new ContentService(repository as never, audit as never);
    await service.save('hero', 'id', { title: 'After' }, { userId: 'owner-id' });
    expect(repository.upsert).toHaveBeenCalledWith('hero', 'id', { title: 'After' });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'hero:id' }));
  });
});
