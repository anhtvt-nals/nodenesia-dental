import { Button, Empty, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { Booking } from '../../api/admin-api';
import { formatDateTime, formatPhone, statusText, tr, useAdminTranslation } from '../../i18n';

type Props = { bookings: Booking[]; onCancel: (code: string) => void; onStatus: (code: string, status: 'confirmed' | 'completed' | 'no_show') => void };
const statusColor: Record<string, string> = { pending: 'gold', confirmed: 'blue', completed: 'green', cancelled: 'default', no_show: 'red' };

export function BookingsList({ bookings, onCancel, onStatus, title = 'Janji temu', action }: Props & { title?: string; action?: ReactNode }) {
  useAdminTranslation();
  const columns: ColumnsType<Booking> = [
    { title: tr('Waktu', 'Time'), dataIndex: 'startsAt', width: 190, render: (value) => formatDateTime(value) },
    { title: tr('Pasien', 'Patient'), width: 190, render: (_, booking) => <Space direction="vertical" size={0}><Typography.Text strong>{booking.patient.name}</Typography.Text><Typography.Text type="secondary">{formatPhone(booking.patient.phone)}</Typography.Text></Space> },
    { title: tr('Layanan', 'Service'), dataIndex: 'service', width: 170 }, { title: tr('Dokter', 'Doctor'), dataIndex: 'doctor', width: 160 },
    { title: tr('Status', 'Status'), dataIndex: 'status', width: 170, render: (status) => <Tag color={statusColor[status]}>{statusText(status)}</Tag> },
    { title: tr('Tindakan', 'Actions'), width: 180, render: (_, booking) => <Space size={4} wrap>{booking.status === 'pending' && <Button type="text" size="small" icon={<CheckOutlined />} aria-label={tr('Konfirmasi', 'Confirm')} title={tr('Konfirmasi', 'Confirm')} onClick={() => onStatus(booking.code, 'confirmed')} />}{['pending', 'confirmed'].includes(booking.status) && <Button type="text" size="small" danger icon={<StopOutlined />} aria-label={tr('Tidak hadir', 'No show')} title={tr('Tidak hadir', 'No show')} onClick={() => onStatus(booking.code, 'no_show')} />}{booking.status === 'confirmed' && <Button type="text" size="small" icon={<CheckOutlined />} aria-label={tr('Selesai', 'Complete')} title={tr('Selesai', 'Complete')} onClick={() => onStatus(booking.code, 'completed')} />}{['pending', 'confirmed'].includes(booking.status) && <Popconfirm title={tr('Batalkan janji temu ini?', 'Cancel this appointment?')} okText={tr('Batalkan', 'Cancel appointment')} cancelText={tr('Kembali', 'Back')} onConfirm={() => onCancel(booking.code)}><Button type="text" size="small" danger icon={<CloseOutlined />} aria-label={tr('Batalkan', 'Cancel appointment')} title={tr('Batalkan', 'Cancel appointment')} /></Popconfirm>}</Space> },
  ];
  return <section className="data-section" aria-labelledby="bookings-heading"><Space className="section-heading"><Typography.Title level={2} id="bookings-heading">{title === 'Janji temu' ? tr('Janji temu', 'Appointments') : title}</Typography.Title>{action}</Space><Table rowKey="code" columns={columns} dataSource={bookings} size="middle" scroll={{ x: 1100 }} locale={{ emptyText: <Empty description={tr('Belum ada janji temu', 'No appointments yet')} /> }} pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (total, range) => tr(`Menampilkan ${range[0]}-${range[1]} dari ${total}`, `Showing ${range[0]}-${range[1]} of ${total}`) }} /></section>;
}
