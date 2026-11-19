import { Empty, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { AuditLog, ServerPagination } from '../../api/admin-api';
import { formatDateTime, tr, useAdminTranslation } from '../../i18n';
export function AuditLogList({ logs, pagination }: { logs: AuditLog[]; pagination?: ServerPagination }) {
  useAdminTranslation();
  const columns: ColumnsType<AuditLog> = [{ title: tr('Waktu', 'Time'), dataIndex: 'createdAt', render: formatDateTime }, { title: tr('Pengguna', 'User'), render: (_, log) => log.user?.name ?? tr('Sistem', 'System') }, { title: tr('Tindakan', 'Actions'), dataIndex: 'action' }, { title: tr('Objek', 'Object'), render: (_, log) => `${log.entity} ${log.entityId ?? ''}` }];
  return <section aria-labelledby="audit-heading"><Typography.Title level={2} id="audit-heading">{tr('Log audit', 'Audit log')}</Typography.Title><Table rowKey="id" columns={columns} dataSource={logs} scroll={{ x: 720 }} locale={{ emptyText: <Empty description={tr('Belum ada aktivitas tercatat', 'No recorded activity yet')} /> }} pagination={pagination ? { ...pagination, showSizeChanger: false } : { pageSize: 20, showSizeChanger: false }} /></section>;
}
