import { describe, expect, it } from 'vitest';
import { renderNotification } from './notification-template.js';

describe('renderNotification', () => {
  it('uses the code-owned Bahasa template and interpolates variables', () => {
    expect(renderNotification('confirmation', { name: 'Rina', service: 'Scaling', doctor: 'Ayu', date: '20/10', time: '09.00', code: 'BOOK-001', link: '/booking/kelola/BOOK-001' })).toContain('Rina');
    expect(renderNotification('reminder_h1', { name: 'Rina', date: '20/10', time: '09.00', service: 'Scaling', doctor: 'Ayu' })).toContain('Pengingat');
  });
});
