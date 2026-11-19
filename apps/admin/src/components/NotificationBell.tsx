import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, List, Popover, Typography } from 'antd';
import { useState } from 'react';
import type { AdminNotification } from '../api/admin-api';
import { formatDateTime, tr, useAdminTranslation } from '../i18n';

type Props = {
  items: AdminNotification[];
  unreadCount: number;
  onMarkRead: (item: AdminNotification) => void;
  onMarkAllRead: () => void;
};

export function NotificationBell({ items, unreadCount, onMarkRead, onMarkAllRead }: Props) {
  useAdminTranslation();
  const [open, setOpen] = useState(false);

  const content = (
    <div style={{ width: 340, maxWidth: '85vw' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 8,
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 8,
        }}
      >
        <Typography.Text strong>
          {tr('Notifikasi Terbaru', 'Recent Notifications')}
        </Typography.Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={onMarkAllRead}
          >
            {tr('Tandai semua dibaca', 'Mark all read')}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={tr('Belum ada notifikasi', 'No notifications yet')}
        />
      ) : (
        <List
          size="small"
          style={{ maxHeight: 360, overflowY: 'auto' }}
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                paddingInline: 8,
                borderRadius: 6,
                background: item.isRead ? 'transparent' : 'var(--brand-50)',
              }}
              onClick={() => {
                onMarkRead(item);
                setOpen(false);
              }}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {!item.isRead && (
                      <span
                        aria-hidden="true"
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: 'var(--brand-700)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span style={{ fontSize: 13 }}>{item.title}</span>
                  </div>
                }
                description={
                  <div style={{ fontSize: 12 }}>
                    <div>{item.body}</div>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDateTime(item.createdAt)}
                    </Typography.Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Badge count={unreadCount} size="small" overflowCount={99} offset={[-3, 4]}>
        <Button
          className="admin-notification-btn"
          type="default"
          shape="circle"
          icon={<BellOutlined />}
          aria-label={tr('Notifikasi', 'Notifications')}
        />
      </Badge>
    </Popover>
  );
}
