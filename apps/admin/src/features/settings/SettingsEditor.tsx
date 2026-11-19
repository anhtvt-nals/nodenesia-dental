import { Alert, App as AntdApp, Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Tabs, type InputNumberProps, type TabsProps } from 'antd';
import { DeleteOutlined, EnvironmentOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { updateSettings, type Settings } from '../../api/admin-api';
import { AdminPageHeader } from '../../components/ui';
import { tr, useAdminTranslation } from '../../i18n';

type Props = { settings: Settings; accessToken: string; onSaved: (settings: Settings) => void };

export function SettingsEditor({ settings, accessToken, onSaved }: Props) {
  useAdminTranslation();
  const { message: toast } = AntdApp.useApp();
  const [form] = Form.useForm<Settings>();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    form.setFieldsValue(settings);
    setDirty(false);
  }, [form, settings]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  async function submit(values: Settings) {
    setSaving(true);
    setMessage('');
    try {
      onSaved(await updateSettings(accessToken, values));
      setDirty(false);
      const okMsg = tr('Pengaturan berhasil disimpan.', 'Settings saved successfully.');
      setMessage(okMsg);
      toast.success(okMsg);
    } catch (error) {
      const errMsg = (error as Error).message;
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  }

  const weekdayOptions = [
    { value: 1, label: tr('Senin', 'Monday') },
    { value: 2, label: tr('Selasa', 'Tuesday') },
    { value: 3, label: tr('Rabu', 'Wednesday') },
    { value: 4, label: tr('Kamis', 'Thursday') },
    { value: 5, label: tr('Jumat', 'Friday') },
    { value: 6, label: tr('Sabtu', 'Saturday') },
    { value: 0, label: tr('Minggu', 'Sunday') },
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: 'profile',
      label: <SettingsTabLabel icon={<EnvironmentOutlined />} label={tr('Profil klinik', 'Clinic profile')} />,
      children: (
        <Row gutter={[20, 20]}>
          <Col xs={24} xl={16}>
            <Card className="settings-card" title={<SettingsCardTitle title={tr('Identitas & kontak', 'Identity & contact')} description={tr('Informasi ini tampil di website publik dan pesan pasien.', 'This information appears on the public website and patient messages.')} />}>
              <Form.Item name="name" label={tr('Nama klinik', 'Clinic name')} rules={[{ required: true, message: tr('Nama klinik wajib diisi', 'Clinic name is required') }]}>
                <Input />
              </Form.Item>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item name="tagline" label={tr('Tagline (Bahasa Indonesia)', 'Tagline (Indonesian)')}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="taglineEn" label={tr('Tagline (English)', 'Tagline (English)')}><Input /></Form.Item></Col>
              </Row>
              <Row gutter={[12, 0]}>
                <Col xs={24} sm={12}><Form.Item name="phone" label={tr('Nomor telepon', 'Phone number')} rules={[{ required: true, message: tr('Nomor telepon wajib diisi', 'Phone number is required') }]}><Input placeholder="+62 21 ..." /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item name="waNumber" label={tr('Nomor WhatsApp', 'WhatsApp number')} rules={[{ required: true, message: tr('Nomor WhatsApp wajib diisi', 'WhatsApp number is required') }]}><Input placeholder="62812..." /></Form.Item></Col>
              </Row>
              <Form.Item name="address" label={tr('Alamat', 'Address')} rules={[{ required: true, message: tr('Alamat wajib diisi', 'Address is required') }]}><Input.TextArea rows={3} /></Form.Item>
              <Row gutter={[12, 0]}>
                <Col xs={24} sm={12}><Form.Item name="city" label={tr('Kota', 'City')}><Input /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item name="instagramHandle" label={tr('Instagram', 'Instagram')}><Input placeholder="@clinic" /></Form.Item></Col>
              </Row>
              <Form.Item name="googleMapsUrl" label={tr('Link Google Maps', 'Google Maps link')}><Input type="url" placeholder="https://maps.google.com/..." /></Form.Item>
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="settings-card settings-card--aside" title={<SettingsCardTitle title={tr('Preferensi admin', 'Admin preferences')} description={tr('Pengaturan lokal untuk workspace ini.', 'Local settings for this workspace.')} />}>
              <Form.Item name="adminLocale" label={tr('Bahasa admin', 'Admin language')} extra={tr('Diterapkan setelah pengaturan disimpan.', 'Applied after settings are saved.')}><Select options={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }]} /></Form.Item>
              <Form.Item name="timezone" label={tr('Zona waktu', 'Time zone')} rules={[{ required: true, message: tr('Zona waktu wajib diisi', 'Time zone is required') }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: 'Asia/Jakarta', label: 'WIB · Jakarta (GMT+7)' },
                    { value: 'Asia/Makassar', label: 'WITA · Makassar (GMT+8)' },
                    { value: 'Asia/Jayapura', label: 'WIT · Jayapura (GMT+9)' },
                    { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
                    { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (GMT+7)' },
                  ]}
                />
              </Form.Item>
              <div className="settings-tip"><SettingOutlined /><span>{tr('Gunakan data kontak yang sama dengan kanal komunikasi resmi klinik.', 'Use the same contact details as your clinic’s official channels.')}</span></div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'operations',
      label: <SettingsTabLabel icon={<SettingOutlined />} label={tr('Operasional', 'Operations')} />,
      children: (
        <Row gutter={[20, 20]}>
          <Col xs={24}>
            <Card className="settings-card" title={<SettingsCardTitle title={tr('Aturan janji temu & Anti-No Show', 'Appointment & Anti-No Show Rules')} description={tr('Atur kapasitas, interval, auto-release slot, dan batas pembatalan.', 'Set capacity, interval, slot auto-release, and cancellation limits.')} />}>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12} lg={4}><Form.Item name="slotStepMinutes" label={tr('Interval jadwal', 'Schedule interval')} extra={tr('Dalam menit', 'In minutes')}><NumberWithUnit min={5} max={60} unit={tr('menit', 'min')} /></Form.Item></Col>
                <Col xs={24} sm={12} lg={4}><Form.Item name="bookingLeadMinutes" label={tr('Pemesanan minimum', 'Minimum lead time')} extra={tr('Lead time', 'Lead time')}><NumberWithUnit min={0} unit={tr('menit', 'min')} /></Form.Item></Col>
                <Col xs={24} sm={12} lg={4}><Form.Item name="bookingHorizonDays" label={tr('Rentang pemesanan', 'Booking horizon')} extra={tr('Hari ke depan', 'Days ahead')}><NumberWithUnit min={1} unit={tr('hari', 'days')} /></Form.Item></Col>
                <Col xs={24} sm={12} lg={4}><Form.Item name="chairsCount" label={tr('Jumlah kursi', 'Number of chairs')} extra={tr('Kapasitas klinik', 'Clinic capacity')}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} sm={12} lg={4}><Form.Item name="cancelCutoffHours" label={tr('Batas batal jadwal', 'Cancel cutoff')} extra={tr('Maks. sebelum janji', 'Hours before appointment')}><NumberWithUnit min={1} max={48} unit={tr('jam', 'hours')} /></Form.Item></Col>
                <Col xs={24} sm={12} lg={4}><Form.Item name="autoReleaseHours" label={tr('Auto-release slot', 'Auto-release window')} extra={tr('Batas waktu konfirmasi', 'Confirmation window')}><NumberWithUnit min={1} max={168} unit={tr('jam', 'hours')} /></Form.Item></Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} xl={15}>
            <Card className="settings-card" title={<SettingsCardTitle title={tr('Waktu terblokir klinik', 'Clinic blocked times')} description={tr('Jadwal ini otomatis memblokir slot bagi semua dokter.', 'These times automatically block availability across all doctors.')} />}>
              <Form.List name="blockedTimes">
                {(fields, { add, remove }) => (
                  <Space direction="vertical" className="settings-blocked-times" size={12}>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} className="settings-blocked-time" gutter={[12, 12]} align="middle">
                        <Col xs={24} sm={6}><Form.Item {...restField} name={[name, 'label']} label={tr('Nama waktu', 'Label')} rules={[{ required: true, message: 'Wajib diisi' }]} style={{ margin: 0 }}><Input placeholder="Contoh: Sholat Jumat" /></Form.Item></Col>
                        <Col xs={12} sm={4}><Form.Item {...restField} name={[name, 'start']} label={tr('Mulai', 'Start')} rules={[{ required: true, message: 'Wajib' }]} style={{ margin: 0 }}><Input placeholder="11:30" /></Form.Item></Col>
                        <Col xs={12} sm={4}><Form.Item {...restField} name={[name, 'end']} label={tr('Selesai', 'End')} rules={[{ required: true, message: 'Wajib' }]} style={{ margin: 0 }}><Input placeholder="13:00" /></Form.Item></Col>
                        <Col xs={20} sm={8}><Form.Item {...restField} name={[name, 'weekdays']} label={tr('Hari berlaku', 'Days')} style={{ margin: 0 }}><Select mode="multiple" placeholder={tr('Pilih hari', 'Select days')} options={weekdayOptions} allowClear /></Form.Item></Col>
                        <Col xs={4} sm={2} className="settings-blocked-time__remove"><Button type="text" danger icon={<DeleteOutlined />} aria-label={tr('Hapus waktu terblokir', 'Remove blocked time')} onClick={() => remove(name)} /></Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add({ id: `block-${Date.now()}`, label: 'Istirahat', start: '12:00', end: '13:00', weekdays: [1, 2, 3, 4, 5, 6] })} block icon={<PlusOutlined />}>{tr('Tambah waktu terblokir', 'Add blocked time')}</Button>
                  </Space>
                )}
              </Form.List>
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card className="settings-card settings-card--aside" title={<SettingsCardTitle title={tr('Metode pembayaran', 'Payment methods')} description={tr('Ditampilkan kepada pasien saat booking.', 'Shown to patients during booking.')} />}>
              <Form.Item name="paymentMethods" label={tr('Metode pembayaran aktif', 'Active payment methods')}><Select mode="tags" placeholder={tr('Ketik atau pilih metode pembayaran', 'Type or select a payment method')} options={[{ value: 'QRIS', label: 'QRIS' }, { value: 'GoPay', label: 'GoPay' }, { value: 'OVO', label: 'OVO' }, { value: 'DANA', label: 'DANA' }, { value: 'Kartu Debit & Kredit', label: 'Kartu Debit & Kredit' }, { value: 'Transfer Bank (BCA / Mandiri / BRI)', label: 'Transfer Bank (BCA / Mandiri / BRI)' }, { value: 'Asuransi Swasta', label: 'Asuransi Swasta' }]} /></Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <section className="settings-page" aria-labelledby="settings-heading">
      <AdminPageHeader
        title={tr('Pengaturan Klinik', 'Settings')}
        description={tr(
          'Kelola identitas klinik, aturan jadwal, dan waktu terblokir.',
          'Manage your clinic identity, scheduling rules, and blocked times.',
        )}
        showTimezone
      />

      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => setDirty(true)}
        onFinish={(values) => void submit(values)}
      >
        <div className="settings-workspace">
          <Tabs defaultActiveKey="profile" items={tabItems} />
        </div>

        {message && (
          <Alert
            className="settings-alert"
            type={message === tr('Pengaturan berhasil disimpan.', 'Settings saved successfully.') ? 'success' : 'error'}
            showIcon
            message={message}
          />
        )}

        <div className="sticky-save">
          <div>
            <strong>{dirty ? tr('Ada perubahan belum disimpan', 'Unsaved changes') : tr('Simpan perubahan', 'Save changes')}</strong>
            <span>{tr('Perubahan akan diterapkan pada seluruh sistem.', 'Changes will be applied to the system.')}</span>
          </div>
          <Button className="settings-save-button" type="primary" htmlType="submit" loading={saving}>
            {saving ? tr('Menyimpan…', 'Saving…') : tr('Simpan perubahan', 'Save changes')}
          </Button>
        </div>
      </Form>
    </section>
  );
}

function SettingsCardTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="settings-card__title">
      <span>{title}</span>
      <small>{description}</small>
    </div>
  );
}

function SettingsTabLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <span className="settings-tab-label">{icon}<span>{label}</span></span>;
}

function NumberWithUnit({ unit, ...inputProps }: InputNumberProps<number> & { unit: string }) {
  return (
    <span className="settings-number-unit">
      <InputNumber {...inputProps} />
      <span className="settings-number-unit__suffix">{unit}</span>
    </span>
  );
}
