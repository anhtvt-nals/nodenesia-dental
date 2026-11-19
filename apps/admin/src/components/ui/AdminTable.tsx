import { useEffect, useState, type ReactNode } from 'react';
import { Button, Pagination, Skeleton, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { AdminEmptyState } from './AdminEmptyState';
import { tr } from '../../i18n';

export type TableDensity = 'comfortable' | 'compact';

type Props<T extends object> = {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey: TableProps<T>['rowKey'];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  pagination?: TableProps<T>['pagination'];
  rowClassName?: TableProps<T>['rowClassName'];
  showDensityToggle?: boolean;
  toolbarExtra?: ReactNode;
  renderMobileCard?: (record: T) => ReactNode;
};

export function AdminTable<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  pagination = { pageSize: 20, showSizeChanger: false },
  rowClassName,
  toolbarExtra,
  renderMobileCard,
}: Props<T>) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (loading && dataSource.length === 0) {
    return (
      <div className="admin-table-skeleton" aria-busy="true">
        <Skeleton active title={{ width: '35%' }} paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!loading && dataSource.length === 0) {
    return (
      <div className="admin-table-empty-card">
        <AdminEmptyState
          title={emptyTitle ?? tr('Belum ada data', 'No data yet')}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      {toolbarExtra && (
        <div className="admin-table-meta-bar">
          <div className="admin-table-meta-bar__left">{toolbarExtra}</div>
        </div>
      )}

      {isMobile && renderMobileCard ? (
        <>
          <div className="admin-mobile-cards">
            {dataSource.map((item, idx) => {
              const key =
                typeof rowKey === 'function'
                  ? rowKey(item)
                  : String((item as Record<string, unknown>)[String(rowKey)] ?? idx);
              return (
                <div key={key} className="admin-mobile-card">
                  {renderMobileCard(item)}
                </div>
              );
            })}
          </div>
          {pagination && typeof pagination === 'object' && (pagination.total ?? 0) > (pagination.pageSize ?? 20) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pagination
                size="small"
                current={pagination.current}
                pageSize={pagination.pageSize ?? 20}
                total={pagination.total}
                onChange={pagination.onChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ) : (
        <Table<T>
          rowKey={rowKey}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          size="middle"
          sticky={{ offsetHeader: 62 }}
          pagination={pagination}
          rowClassName={rowClassName}
          locale={{
            emptyText: (
              <Button type="link" onClick={onEmptyAction}>
                {emptyTitle ?? tr('Belum ada data', 'No data yet')}
              </Button>
            ),
          }}
        />
      )}
    </div>
  );
}
