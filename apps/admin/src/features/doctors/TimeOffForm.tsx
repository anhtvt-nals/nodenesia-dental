import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Drawer, Empty, Form, Input, Popconfirm, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createTimeOff, deleteTimeOff, type ClinicDoctor, type TimeOff } from '../../api/admin-api';
import { copy, formatDateTime, tr, useAdminTranslation } from '../../i18n';
import { AdminHeaderActions } from '../../components/AdminHeaderActions';

type Props = { accessToken: string; doctors: ClinicDoctor[]; timeOffs: TimeOff[]; onSaved: (message: string) => void; onChanged: (timeOffs: TimeOff[]) => void; onError: (message: string) => void };
type TimeOffInput = { doctorId?: string; startsAt: string; endsAt: string; reason?: string };

export function TimeOffForm({ accessToken, doctors, timeOffs, onSaved, onChanged, onError }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<TimeOffInput>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  async function submit(values: TimeOffInput) {
    setSaving(true);
    try {
      const timeOff = await createTimeOff(accessToken, { ...values, startsAt: new Date(values.startsAt).toISOString(), endsAt: new Date(values.endsAt).toISOString() });
      onChanged([...timeOffs, timeOff]);
      form.resetFields();
      setOpen(false);
      onSaved(tr('Jadwal libur berhasil disimpan.', 'Time off saved successfully.'));
    } catch (error) { onError((error as Error).message); } finally { setSaving(false); }
  }
  async function remove(timeOff: TimeOff) { try { await deleteTimeOff(accessToken, timeOff.id); onChanged(timeOffs.filter((item) => item.id !== timeOff.id)); } catch (error) { onError((error as Error).message); } }
  const columns: ColumnsType<TimeOff> = [{ title: tr('Dokter', 'Doctor'), render: (_, timeOff) => timeOff.doctor?.name ?? tr('Seluruh klinik', 'Entire clinic') }, { title: tr('Waktu', 'Time'), render: (_, timeOff) => `${formatDateTime(timeOff.startsAt)} — ${formatDateTime(timeOff.endsAt)}` }, { title: tr('Alasan', 'Reason'), dataIndex: 'reason', render: (value) => value ?? '—' }, { title: tr('Tindakan', 'Actions'), width: 90, render: (_, timeOff) => <Popconfirm title={tr('Hapus jadwal libur ini?', 'Delete this time off?')} okText={tr('Hapus', 'Delete')} cancelText={tr('Batal', 'Cancel')} onConfirm={() => void remove(timeOff)}><Button type="text" danger icon={<DeleteOutlined />} aria-label={tr('Hapus jadwal libur', 'Delete time off')} title={tr('Hapus jadwal libur', 'Delete time off')} /></Popconfirm> }];
  return <section aria-label={tr('Jadwal libur', 'Time off')}><AdminHeaderActions><Button type="primary" onClick={() => setOpen(true)}>{tr('Daftarkan hari libur', 'Register time off')}</Button></AdminHeaderActions><Alert className="schedule-note" type="info" showIcon icon={<InfoCircleOutlined />} message={tr('Slot booking akan otomatis ditutup pada waktu libur yang terdaftar, hanya di dalam jam kerja dokter.', 'Booking slots automatically close during registered time off, within the doctor’s working hours only.')} /><Table rowKey="id" columns={columns} dataSource={timeOffs} scroll={{ x: 760 }} locale={{ emptyText: <Empty description={tr('Belum ada jadwal libur', 'No time off yet')} /> }} pagination={{ pageSize: 20, showSizeChanger: false }} />
    <Drawer className="timeoff-form-drawer" title={tr('Daftarkan hari libur', 'Register time off')} open={open} onClose={() => setOpen(false)} width={520} destroyOnHidden footer={<Space><Button onClick={() => setOpen(false)}>{copy.cancel}</Button><Button type="primary" loading={saving} onClick={() => form.submit()}>{copy.save}</Button></Space>}>
      <Form className="timeoff-form" form={form} layout="vertical" onFinish={(values) => void submit(values)}>
        <Form.Item name="doctorId" label={tr('Dokter', 'Doctor')} extra={tr('Kosongkan untuk menutup slot seluruh klinik.', 'Leave empty to close slots for the entire clinic.')}><Select allowClear placeholder={tr('Seluruh klinik', 'Entire clinic')} options={doctors.filter((doctor) => doctor.isActive).map((doctor) => ({ value: doctor.id, label: doctor.name }))} /></Form.Item>
        <Form.Item name="startsAt" label={tr('Mulai', 'Starts')} rules={[{ required: true, message: tr('Waktu mulai wajib diisi', 'Start time is required') }]}><Input type="datetime-local" /></Form.Item>
        <Form.Item name="endsAt" label={tr('Selesai', 'Ends')} rules={[{ required: true, message: tr('Waktu selesai wajib diisi', 'End time is required') }]}><Input type="datetime-local" /></Form.Item>
        <Form.Item name="reason" label={tr('Alasan', 'Reason')}><Input.TextArea rows={4} placeholder={tr('Contoh: Cuti tahunan', 'Example: Annual leave')} /></Form.Item>
      </Form>
    </Drawer>
  </section>;
}
