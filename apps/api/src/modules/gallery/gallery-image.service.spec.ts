import { afterEach, describe, expect, it, vi } from 'vitest';
import { GalleryImageService } from './gallery-image.service.js';

const { send, destroy } = vi.hoisted(() => ({ send: vi.fn().mockResolvedValue({}), destroy: vi.fn() }));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = send;
    destroy = destroy;
  },
  PutObjectCommand: class {
    constructor(public input: unknown) {}
  },
}));

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);

function configure() {
  for (const [key, value] of Object.entries({
    R2_ACCOUNT_ID: 'account',
    R2_ACCESS_KEY_ID: 'access',
    R2_SECRET_ACCESS_KEY: 'secret',
    R2_BUCKET: 'dental',
    R2_PUBLIC_URL: 'https://images.example/',
  })) {
    vi.stubEnv(key, value);
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('GalleryImageService', () => {
  it.each([
    ['image/svg+xml', Buffer.from('svg')],
    ['image/png', Buffer.alloc(11 * 1024 * 1024)],
    ['image/jpeg', Buffer.alloc(0)],
  ])('rejects invalid image metadata', async (type, body) => {
    await expect(new GalleryImageService().upload(type as string, body as Buffer)).rejects.toThrow('Use a JPG');
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects files disguised as images', async () => {
    await expect(new GalleryImageService().upload('image/png', Buffer.from('not an image'))).rejects.toThrow('does not match');
  });

  it('reports missing storage configuration', async () => {
    vi.stubEnv('R2_ACCOUNT_ID', '');
    await expect(new GalleryImageService().upload('image/png', png)).rejects.toThrow('not configured');
  });

  it('uploads bytes through Cloudflare R2 and returns a public URL', async () => {
    configure();
    const result = await new GalleryImageService().upload('image/png', png);
    expect(result.url).toMatch(/^https:\/\/images.example\/dental\/gallery\/[\da-f-]+\.png$/);
    expect(send.mock.calls[0][0].input).toMatchObject({
      Bucket: 'dental',
      Body: png,
      ContentType: 'image/png',
      ContentLength: png.length,
    });
    expect(destroy).toHaveBeenCalled();
  });

  it('returns an actionable error when R2 upload fails', async () => {
    configure();
    send.mockRejectedValueOnce(new Error('connection timeout'));
    await expect(new GalleryImageService().upload('image/png', png)).rejects.toThrow('Gallery image storage upload to Cloudflare R2 failed');
    expect(destroy).toHaveBeenCalled();
  });

  it('returns a default image URL without uploading to R2 when DEMO_MODE=true', async () => {
    process.env.DEMO_MODE = 'true';
    try {
      const result = await new GalleryImageService().upload('image/png', png);
      expect(result.url).toMatch(/^https:\/\//);
      expect(send).not.toHaveBeenCalled();
    } finally {
      delete process.env.DEMO_MODE;
    }
  });
});
