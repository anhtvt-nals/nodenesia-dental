import { describe, expect, it } from 'vitest';
import { parseContentObject } from './content-json';

describe('parseContentObject', () => {
  it('accepts JSON objects but rejects arrays and scalar values', () => {
    expect(parseContentObject('{"title":"Halo"}')).toEqual({ title: 'Halo' });
    expect(() => parseContentObject('[]')).toThrow('JSON object');
    expect(() => parseContentObject('"text"')).toThrow('JSON object');
  });
});
