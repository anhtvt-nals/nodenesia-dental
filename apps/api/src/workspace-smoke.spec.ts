import { describe, expect, it } from 'vitest';
import { clinicProductName } from '@clinic/shared';

describe('workspace boundary', () => {
  it('imports the shared package from the API workspace', () => {
    expect(clinicProductName).toBe('Nodenesia Dental');
  });
});
