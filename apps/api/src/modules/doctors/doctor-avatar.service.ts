import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DoctorAvatarService {
  async upload(contentType: string, body: Buffer) {
    const input = { contentType, size: body.length };
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    if (!extensions[input.contentType] || !Number.isInteger(input.size) || input.size < 1 || input.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Use a JPG, PNG or WebP image up to 5 MB.');
    }
    const validSignature = contentType === 'image/jpeg' ? body.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
      : contentType === 'image/png' ? body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : body.toString('ascii', 0, 4) === 'RIFF' && body.toString('ascii', 8, 12) === 'WEBP';
    if (!validSignature) throw new BadRequestException('Image content does not match its file type.');
    if (process.env.DEMO_MODE === 'true') {
      return {
        photoUrl:
          process.env.DEMO_DEFAULT_AVATAR_URL ||
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&crop=faces&w=1200&h=750&q=80',
      };
    }
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
      throw new ServiceUnavailableException('Avatar storage is not configured.');
    }
    const key = `doctors/avatars/${randomUUID()}.${extensions[input.contentType]}`;
    const client = new S3Client({ region: 'auto', endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY } });
    try {
      await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType, ContentLength: body.length, CacheControl: 'public, max-age=31536000, immutable' }));
      return { photoUrl: `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}` };
    } catch {
      throw new BadGatewayException('Avatar storage upload failed. Please try again.');
    } finally { client.destroy(); }
  }
}
