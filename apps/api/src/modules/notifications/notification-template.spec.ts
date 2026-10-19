import { describe, expect, it } from 'vitest';
import { renderNotification } from './notification-template.js';

describe('renderNotification', () => {
  it('uses configured variables and falls back to Bahasa template', () => {
    expect(renderNotification('confirmation', { confirmation: 'Halo {{name}}' }, { name: 'Rina' })).toBe('Halo Rina');
    expect(renderNotification('reminder_h1', {}, { name: 'Rina', date: '20/10', time: '09.00', service: 'Scaling', doctor: 'Ayu' })).toContain('Pengingat');
  });
});
