import { describe, expect, it } from 'vitest';
import { shouldEnableSwagger } from './swagger-config.js';

describe('shouldEnableSwagger', () => {
  it('does not enable Swagger in the tsx development runtime', () => {
    expect(shouldEnableSwagger({ NODE_ENV: 'development' })).toBe(false);
    expect(shouldEnableSwagger({ NODE_ENV: 'development', SWAGGER_ENABLED: 'true' })).toBe(false);
    expect(shouldEnableSwagger({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' })).toBe(true);
  });
});
