import { Tabs, Typography } from 'antd';
import type { ReactNode } from 'react';
import { tr, useAdminTranslation } from '../../i18n';

type Props = { items: Array<{ key: string; label: string; count: number; children: ReactNode }> };
export function ContentWorkspace({ items }: Props) {
  useAdminTranslation();
  return <section className="content-workspace" aria-labelledby="content-workspace-title">
    <div className="content-workspace__intro">
      <span className="content-workspace__eyebrow">{tr('WEBSITE KLINIK', 'CLINIC WEBSITE')}</span>
      <Typography.Title level={2} id="content-workspace-title">{tr('Kelola konten website', 'Manage website content')}</Typography.Title>
      <Typography.Paragraph>{tr('Perbarui informasi, cerita, dan foto yang dilihat pasien di website Anda.', 'Keep the information, stories, and photos on your website up to date.')}</Typography.Paragraph>
    </div>
    <Tabs defaultActiveKey="articles" size="large" items={items.map((item) => ({ key: item.key, label: <span className="content-workspace__tab">{item.label}<span className="content-workspace__count">{item.count}</span></span>, children: <div className="content-workspace__panel">{item.children}</div> }))} />
  </section>;
}
