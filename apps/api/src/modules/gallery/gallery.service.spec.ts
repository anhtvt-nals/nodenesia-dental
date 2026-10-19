import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { GalleryService } from './gallery.service.js';

describe('GalleryService', () => {
  it('rejects publishing an item without recorded consent', async () => {
    const service = new GalleryService({ create: async () => ({}) } as never, {} as never);
    await expect(service.create({ type: 'photo', afterUrl: 'https://example.com/photo.jpg', isPublished: true, consentConfirmed: false }, { userId: 'owner-id' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
