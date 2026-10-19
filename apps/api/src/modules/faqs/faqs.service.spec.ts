import { describe, expect, it, vi } from 'vitest';
import { FaqsService } from './faqs.service.js';

describe('FaqsService', () => {
  it('keeps unpublished FAQs out of the public reader and audits publication changes', async () => {
    const repository = { listPublic: vi.fn().mockResolvedValue([]), findById: vi.fn().mockResolvedValue({ id: 'faq-id', isPublished: false }), update: vi.fn().mockResolvedValue({ id: 'faq-id', isPublished: true }) };
    const audit = { record: vi.fn() };
    const service = new FaqsService(repository as never, audit as never);
    await expect(service.listPublic()).resolves.toEqual([]);
    await service.update('faq-id', { isPublished: true }, { userId: 'owner-id' });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ entity: 'faq', entityId: 'faq-id' }));
  });
});
