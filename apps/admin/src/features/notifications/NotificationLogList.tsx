import { ReloadOutlined } from '@ant-design/icons';
import { Button, Empty, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { resendNotification, type NotificationLog } from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';
type Props = { accessToken: string; logs: NotificationLog[]; onResent: () => void; onError: (message: string) => void };
export function NotificationLogList({ accessToken, logs, onResent, onError }: Props) {
  useAdminTranslation();
  async function resend(id: string) { try { await resendNotification(accessToken, id); onResent(); } catch (error) { onError((error as Error).message); } }
  const columns: ColumnsType<NotificationLog> = [{ title: tr('Janji temu', 'Appointment'), render: (_, log) => <Space direction="vertical" size={0}><Typography.Text strong>{log.booking.code}</Typography.Text><Typography.Text type="secondary">{log.booking.patient.name}</Typography.Text></Space> }, { title: tr('Jenis', 'Type'), dataIndex: 'type' }, { title: tr('Status', 'Status'), dataIndex: 'status', render: (value) => <Tag>{value}</Tag> }, { title: tr('Kesalahan', 'Error'), dataIndex: 'error', render: (value) => value ?? '—' }, { title: tr('Tindakan', 'Actions'), width: 90, render: (_, log) => <Button type="text" icon={<ReloadOutlined />} aria-label={tr('Kirim ulang notifikasi', 'Resend notification')} title={tr('Kirim ulang notifikasi', 'Resend notification')} onClick={() => void resend(log.id)} /> }];
  return <section aria-labelledby="notifications-heading"><Typography.Title level={2} id="notifications-heading">{tr('Log notifikasi', 'Notification log')}</Typography.Title><Table rowKey="id" columns={columns} dataSource={logs} scroll={{ x: 800 }} locale={{ emptyText: <Empty description={tr('Belum ada notifikasi', 'No notifications yet')} /> }} pagination={{ pageSize: 20, showSizeChanger: false }} /></section>;
}
