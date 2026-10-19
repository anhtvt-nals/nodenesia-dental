import { describe, expect, it } from 'vitest';
import { assertProductionConfig } from './production-config.js';

describe('assertProductionConfig', () => {
  it('rejects unsafe production secrets and accepts complete HTTPS configuration', () => {
    expect(() => assertProductionConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://db', PUBLIC_WEB_URL: 'http://clinic.test', JWT_SECRET: 'short' })).toThrow('JWT_SECRET');
    expect(() => assertProductionConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://db', PUBLIC_WEB_URL: 'https://clinic.test', JWT_SECRET: 'a'.repeat(32) })).not.toThrow();
  });
});
