import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OperationsPanel } from './OperationsPanel';

describe('OperationsPanel', () => {
  it('starts with the notifications task tab selected', () => {
    const markup = renderToStaticMarkup(
      <OperationsPanel
        accessToken="test-token"
        logs={[]}
        auditLogs={[]}
        onResent={vi.fn()}
        onError={vi.fn()}
      />,
    );

    expect(markup).toContain('role="tab"');
    expect(markup).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>.*Notifikasi/);
    expect(markup).toContain('Aktivitas');
    expect(markup).toContain('Laporan');
  });
});
