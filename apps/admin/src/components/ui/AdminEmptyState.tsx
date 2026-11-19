import type { ReactNode } from 'react';
import { Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminEmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <div className="admin-empty-state" role="status">
      <div className="admin-empty-state__icon" aria-hidden="true">
        {icon ?? <InboxOutlined />}
      </div>
      <p className="admin-empty-state__title">{title}</p>
      {description && <p className="admin-empty-state__desc">{description}</p>}
      {actionLabel && onAction && (
        <Button type="primary" onClick={onAction} className="admin-empty-state__cta">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
