import type { ReactNode } from 'react';
import { Button, Input, Space, Tag } from 'antd';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { tr } from '../../i18n';

export type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type Props = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  activeChips?: ActiveFilterChip[];
  onResetAll?: () => void;
  rightSlot?: ReactNode;
};

export function AdminFilterBar({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filters,
  activeChips = [],
  onResetAll,
  rightSlot,
}: Props) {
  return (
    <div className="admin-filter-wrap">
      <div className="filter-toolbar">
        <Space wrap size={10} className="filter-toolbar__fields">
          {onSearchChange !== undefined && (
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: 'var(--color-text-muted)' }} />}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? tr('Cari...', 'Search...')}
              aria-label={searchPlaceholder ?? tr('Cari', 'Search')}
              style={{ width: 240 }}
            />
          )}
          {filters}
        </Space>
        {rightSlot && <div className="filter-toolbar__right">{rightSlot}</div>}
      </div>

      {activeChips.length > 0 && (
        <div className="admin-active-filters" aria-label={tr('Filter aktif', 'Active filters')}>
          <span className="admin-active-filters__label">{tr('Filter aktif:', 'Active filters:')}</span>
          <Space wrap size={6}>
            {activeChips.map((chip) => (
              <Tag
                key={chip.key}
                closable
                onClose={(e) => {
                  e.preventDefault();
                  chip.onRemove();
                }}
                className="admin-filter-chip"
              >
                {chip.label}
              </Tag>
            ))}
            {onResetAll && (
              <Button
                type="link"
                size="small"
                icon={<ClearOutlined />}
                onClick={onResetAll}
                className="admin-filter-reset"
              >
                {tr('Hapus semua filter', 'Reset all')}
              </Button>
            )}
          </Space>
        </div>
      )}
    </div>
  );
}
