import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { updateSettings, type Settings } from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';
type Props = { settings: Settings; accessToken: string; onSaved: (settings: Settings) => void };
export function SettingsEditor({ settings, accessToken, onSaved }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<Settings>(); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => form.setFieldsValue(settings), [form, settings]);
  async function submit(values: Settings) { setSaving(true); setMessage(''); try { onSaved(await updateSettings(accessToken, values)); setMessage(tr('Pengaturan berhasil disimpan.', 'Settings saved successfully.')); } catch (error) { setMessage((error as Error).message); } finally { setSaving(false); } }
  return <section className="settings-page" aria-labelledby="settings-heading">
    <div className="settings-page__intro"><Typography.Title level={2} id="settings-heading">{tr('Pengaturan', 'Settings')}</Typography.Title><Typography.Paragraph>{tr('Kelola identitas klinik, aturan jadwal, dan komunikasi pasien.', 'Manage your clinic identity, scheduling rules, and patient communications.')}</Typography.Paragraph></div>
    <Form form={form} layout="vertical" onFinish={(values) => void submit(values)}>
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={12}><Card className="settings-card" title={<SettingsCardTitle title={tr('Profil klinik', 'Clinic profile')} description={tr('Informasi dasar yang digunakan seluruh sistem.', 'Core information used across the system.')} />}>
          <Form.Item name="name" label={tr('Nama klinik', 'Clinic name')} rules={[{ required: true, message: tr('Nama klinik wajib diisi', 'Clinic name is required') }]}><Input /></Form.Item>
          <Form.Item name="timezone" label={tr('Zona waktu', 'Time zone')} rules={[{ required: true, message: tr('Zona waktu wajib diisi', 'Time zone is required') }]}><Input /></Form.Item>
        </Card></Col>
        <Col xs={24} xl={12}><Card className="settings-card" title={<SettingsCardTitle title={tr('Bahasa & tampilan', 'Language & display')} description={tr('Pilih bahasa untuk seluruh area admin.', 'Choose the language used throughout admin.')} />}>
          <Form.Item name="adminLocale" label={tr('Bahasa admin', 'Admin language')} extra={tr('Diterapkan setelah pengaturan disimpan.', 'Applied after settings are saved.')}><Select options={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }]} /></Form.Item>
        </Card></Col>
        <Col xs={24}><Card className="settings-card" title={<SettingsCardTitle title={tr('Aturan janji temu', 'Appointment rules')} description={tr('Atur ketersediaan jadwal dan kapasitas operasional.', 'Set appointment availability and operational capacity.')} />}>
          <Row gutter={[16, 0]}><Col xs={24} sm={12} lg={6}><Form.Item name="slotStepMinutes" label={tr('Interval jadwal', 'Schedule interval')} extra={tr('Dalam menit', 'In minutes')}><InputNumber min={5} max={60} addonAfter={tr('menit', 'min')} /></Form.Item></Col><Col xs={24} sm={12} lg={6}><Form.Item name="bookingLeadMinutes" label={tr('Pemesanan minimum', 'Minimum lead time')} extra={tr('Dalam menit', 'In minutes')}><InputNumber min={0} addonAfter={tr('menit', 'min')} /></Form.Item></Col><Col xs={24} sm={12} lg={6}><Form.Item name="bookingHorizonDays" label={tr('Rentang pemesanan', 'Booking horizon')} extra={tr('Hari ke depan', 'Days ahead')}><InputNumber min={1} addonAfter={tr('hari', 'days')} /></Form.Item></Col><Col xs={24} sm={12} lg={6}><Form.Item name="chairsCount" label={tr('Jumlah kursi', 'Number of chairs')} extra={tr('Kapasitas klinik', 'Clinic capacity')}><InputNumber min={1} /></Form.Item></Col></Row>
        </Card></Col>
        <Col xs={24}><Card className="settings-card" title={<SettingsCardTitle title={tr('Template WhatsApp', 'WhatsApp templates')} description={tr('Gunakan variabel agar pesan terasa personal.', 'Use variables to keep messages personal.')} />}>
          <Row gutter={[16, 0]}><Col xs={24} lg={12}><Form.Item name={['reminderTemplates', 'confirmation']} label={tr('Konfirmasi', 'Confirmation')}><Input.TextArea rows={4} placeholder={tr('Halo {{name}}, jadwal {{service}}...', 'Hello {{name}}, your {{service}} appointment...')} /></Form.Item></Col><Col xs={24} lg={12}><Form.Item name={['reminderTemplates', 'reminder_h1']} label={tr('Pengingat H-1', '1-day reminder')}><Input.TextArea rows={4} /></Form.Item></Col><Col xs={24} lg={12}><Form.Item name={['reminderTemplates', 'reminder_2h']} label={tr('Pengingat H-2', '2-hour reminder')}><Input.TextArea rows={4} /></Form.Item></Col><Col xs={24} lg={12}><Form.Item name={['reminderTemplates', 'review_request']} label={tr('Permintaan ulasan', 'Review request')}><Input.TextArea rows={4} /></Form.Item></Col></Row>
          <div className="settings-variables"><strong>{tr('Variabel tersedia', 'Available variables')}</strong><span>{'{{name}}'}</span><span>{'{{service}}'}</span><span>{'{{doctor}}'}</span><span>{'{{date}}'}</span><span>{'{{time}}'}</span><span>{'{{link}}'}</span><span>{'{{code}}'}</span></div>
        </Card></Col>
      </Row>
      {message && <Alert className="settings-alert" type={message === tr('Pengaturan berhasil disimpan.', 'Settings saved successfully.') ? 'success' : 'error'} showIcon message={message} />}
      <div className="sticky-save"><div><strong>{tr('Simpan perubahan', 'Save changes')}</strong><span>{tr('Perubahan akan diterapkan pada sistem.', 'Changes will be applied to the system.')}</span></div><Button className="settings-save-button" type="primary" htmlType="submit" loading={saving}>{tr('Simpan perubahan', 'Save changes')}</Button></div>
    </Form>
  </section>;
}

function SettingsCardTitle({ title, description }: { title: string; description: string }) {
  return <div className="settings-card__title"><span>{title}</span><small>{description}</small></div>;
}
