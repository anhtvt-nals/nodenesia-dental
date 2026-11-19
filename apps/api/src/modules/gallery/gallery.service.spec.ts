import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { GalleryService } from './gallery.service.js';

describe('GalleryService', () => {
  it('rejects publishing an item without recorded consent', async () => {
    const service = new GalleryService({ create: async () => ({}) } as never, {} as never);
    await expect(service.create({ type: 'photo', afterUrl: 'https://example.com/photo.jpg', isPublished: true, consentConfirmed: false }, { userId: 'owner-id' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes an item and records an audit log', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({ id: 'item-1', caption: 'Test' }),
      delete: vi.fn().mockResolvedValue({ id: 'item-1' }),
    };
    const mockAudit = { record: vi.fn().mockResolvedValue(undefined) };
    const service = new GalleryService(mockRepo as never, mockAudit as never);

    const result = await service.delete('item-1', { userId: 'owner-id', ip: '127.0.0.1' });
    expect(result).toEqual({ success: true });
    expect(mockRepo.delete).toHaveBeenCalledWith('item-1');
    expect(mockAudit.record).toHaveBeenCalled();
  });

  it('throws NotFoundException when deleting non-existent item', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const service = new GalleryService(mockRepo as never, {} as never);
    await expect(service.delete('missing-id', { userId: 'owner-id' })).rejects.toBeInstanceOf(NotFoundException);
  });
});
