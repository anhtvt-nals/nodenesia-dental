import { Button, Empty, Form, Input, Modal, Select, Space, Typography } from 'antd';
import { useEffect } from 'react';
import { replaceWorkingHours, type ClinicDoctor, type WorkingHourInput } from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';
type Props = { accessToken: string; doctor?: ClinicDoctor; onClose: () => void; onChanged: (doctor: ClinicDoctor) => void; onError: (message: string) => void };
const days = [['Minggu', 'Sunday'], ['Senin', 'Monday'], ['Selasa', 'Tuesday'], ['Rabu', 'Wednesday'], ['Kamis', 'Thursday'], ['Jumat', 'Friday'], ['Sabtu', 'Saturday']] as const;
const toClock = (value: string) => value.slice(11, 16);
export function WorkingHoursEditor({ accessToken, doctor, onClose, onChanged, onError }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<{ hours: WorkingHourInput[] }>();
  useEffect(() => form.setFieldsValue({ hours: doctor?.workingHours.map((hour) => ({ weekday: hour.weekday, start: toClock(hour.startTime), end: toClock(hour.endTime) })) ?? [] }), [doctor, form]);
  if (!doctor) return <Empty description={tr('Pilih dokter untuk mengubah jam kerja', 'Choose a doctor to edit working hours')} />;
  const doctorId = doctor.id;
  async function submit(values: { hours: WorkingHourInput[] }) { try { onChanged(await replaceWorkingHours(accessToken, doctorId, values.hours)); } catch (error) { onError((error as Error).message); } }
  return <Modal title={`${tr('Jam kerja', 'Working hours')}: ${doctor.name}`} open onCancel={onClose} onOk={() => form.submit()} okText={tr('Simpan perubahan', 'Save changes')} cancelText={tr('Batal', 'Cancel')}><Form form={form} layout="vertical" onFinish={(values) => void submit(values)}><Form.List name="hours">{(fields, { add, remove }) => <>{fields.map((field) => <Space key={field.key} align="start" wrap><Form.Item {...field} name={[field.name, 'weekday']} label={tr('Hari', 'Day')} rules={[{ required: true }]}><Select style={{ width: 150 }} options={days.map(([id, en], value) => ({ value, label: tr(id, en) }))} /></Form.Item><Form.Item {...field} name={[field.name, 'start']} label={tr('Mulai', 'Starts')} rules={[{ required: true }]}><Input type="time" /></Form.Item><Form.Item {...field} name={[field.name, 'end']} label={tr('Selesai', 'Ends')} rules={[{ required: true }]}><Input type="time" /></Form.Item><Button danger type="text" onClick={() => remove(field.name)}>{tr('Hapus', 'Delete')}</Button></Space>)}<Button type="dashed" onClick={() => add({ weekday: 1, start: '09:00', end: '17:00' })}>{tr('Tambah jam', 'Add hours')}</Button></>}</Form.List></Form></Modal>;
}
