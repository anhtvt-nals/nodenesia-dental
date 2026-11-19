import type { ReactNode } from 'react';
import { Space, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

type Props = {
  title: string;
  description?: string;
  meta?: string;
  showTimezone?: boolean;
  actions?: ReactNode;
};

export function AdminPageHeader({ title, description, meta, showTimezone, actions }: Props) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header__main">
        <div className="admin-page-header__title-row">
          <Typography.Title level={2} className="admin-page-header__title">
            {title}
          </Typography.Title>
          {meta && <span className="admin-page-header__meta">{meta}</span>}
          {showTimezone && (
            <Tag className="admin-tz-pill" icon={<ClockCircleOutlined />}>
              WIB · GMT+7
            </Tag>
          )}
        </div>
        {description && <p className="admin-page-header__desc">{description}</p>}
      </div>
      {actions && (
        <Space wrap size={8} className="admin-page-header__actions">
          {actions}
        </Space>
      )}
    </header>
  );
}
