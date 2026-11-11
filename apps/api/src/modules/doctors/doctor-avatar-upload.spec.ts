import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { describe, expect, it } from 'vitest';

describe('avatar multipart limits', () => {
  it('accepts images above the JSON body limit and rejects images above 5 MB', async () => {
    const app = Fastify({ bodyLimit: 1_000_000 });
    await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 } });
    app.post('/upload', async (request) => {
      const file = await request.file();
      const body = await file!.toBuffer();
      return { size: body.length };
    });
    const inject = (size: number) => app.inject({ method: 'POST', url: '/upload', headers: { 'content-type': 'multipart/form-data; boundary=avatar-test' }, payload: Buffer.concat([
      Buffer.from('--avatar-test\r\nContent-Disposition: form-data; name="file"; filename="avatar.png"\r\nContent-Type: image/png\r\n\r\n'),
      Buffer.alloc(size), Buffer.from('\r\n--avatar-test--\r\n'),
    ]) });
    try {
      const accepted = await inject(2 * 1024 * 1024);
      expect(accepted.statusCode).toBe(200);
      expect(accepted.json().size).toBe(2 * 1024 * 1024);
      const rejected = await inject(5 * 1024 * 1024 + 1);
      expect(rejected.statusCode).toBe(413);
    } finally { await app.close(); }
  });
});
