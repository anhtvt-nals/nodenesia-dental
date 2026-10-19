import { describe, expect, it, vi } from 'vitest';
import { TestimonialsService } from './testimonials.service.js';

describe('TestimonialsService', () => {
  it('audits publication of an approved testimonial', async () => {
    const repository = { findById: vi.fn().mockResolvedValue({ id: 'review-id', isPublished: false }), update: vi.fn().mockResolvedValue({ id: 'review-id', isPublished: true }) };
    const audit = { record: vi.fn() };
    const service = new TestimonialsService(repository as never, audit as never);
    await service.update('review-id', { isPublished: true }, { userId: 'owner-id' });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ entity: 'testimonial' }));
  });
});
