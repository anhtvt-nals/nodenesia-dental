import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { assertProductionConfig } from './config/production-config.js';
import { shouldEnableSwagger } from './config/swagger-config.js';

export async function createApi(): Promise<NestFastifyApplication> {
  assertProductionConfig();
  const adapter = new FastifyAdapter({ bodyLimit: 1_000_000 });
  adapter.getInstance().addHook('onSend', (_request, reply, _payload, done) => {
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-frame-options', 'DENY');
    reply.header('referrer-policy', 'strict-origin-when-cross-origin');
    reply.header('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production') reply.header('strict-transport-security', 'max-age=31536000; includeSubDomains');
    done();
  });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { logger: process.env.NODE_ENV === 'test' ? ['error'] : false });
  if (shouldEnableSwagger()) {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Clinic API').setVersion('1').build());
    SwaggerModule.setup('api/docs', app, document);
  }
  await app.init();
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  createApi().then((app) => app.listen(3000, '0.0.0.0'));
}
