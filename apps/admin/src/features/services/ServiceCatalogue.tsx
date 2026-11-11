import { EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, Form, Input, InputNumber, Select, Space, Switch, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createService, updateService, type ClinicService, type ServiceInput } from '../../api/admin-api';
import { copy, formatCurrency, tr, useAdminTranslation } from '../../i18n';
import { AdminHeaderActions } from '../../components/AdminHeaderActions';

type Props = { accessToken: string; services: ClinicService[]; onChanged: (services: ClinicService[]) => void; onError: (message: string) => void };
const initialService: ServiceInput = { slug: '', name: '', shortDesc: '', description: '', zone: 'gum', category: 'prevention', durationMinutes: 45, priceFrom: '0', priceTo: null, priceNote: null, isActive: true, sortOrder: 0 };

export function ServiceCatalogue({ accessToken, services, onChanged, onError }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<ServiceInput>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicService>();
  const [saving, setSaving] = useState(false);
  async function submit(values: ServiceInput) {
    setSaving(true);
    try { const input = { ...initialService, ...values, priceFrom: String(values.priceFrom), priceTo: values.priceTo ? String(values.priceTo) : null }; const saved = editing ? await updateService(accessToken, editing.id, input) : await createService(accessToken, input); onChanged(editing ? services.map((item) => item.id === editing.id ? saved : item) : [...services, saved]); form.resetFields(); setOpen(false); } catch (error) { onError((error as Error).message); } finally { setSaving(false); }
  }
  async function toggle(service: ClinicService) { try { const updated = await updateService(accessToken, service.id, { isActive: !service.isActive }); onChanged(services.map((item) => item.id === service.id ? updated : item)); } catch (error) { onError((error as Error).message); } }
  const columns: ColumnsType<ClinicService> = [{ title: tr('Layanan', 'Service'), dataIndex: 'name', render: (name, service) => <Space direction="vertical" size={0}><Typography.Text strong>{name}</Typography.Text><Typography.Text type="secondary">{service.shortDesc}</Typography.Text></Space> }, { title: tr('Durasi', 'Duration'), dataIndex: 'durationMinutes', width: 120, render: (value) => tr(`${value} menit`, `${value} minutes`) }, { title: tr('Harga', 'Price'), dataIndex: 'priceFrom', width: 150, render: formatCurrency }, { title: tr('Aktif', 'Active'), width: 110, render: (_, service) => <Switch checked={service.isActive} onChange={() => void toggle(service)} /> }, { title: tr('Tindakan', 'Actions'), width: 140, render: (_, service) => <Space><Button type="text" icon={<EditOutlined />} aria-label={tr('Ubah layanan', 'Edit service')} title={tr('Ubah layanan', 'Edit service')} onClick={() => { setEditing(service); form.setFieldsValue(service); setOpen(true); }} /><Button type="text" icon={service.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />} aria-label={service.isActive ? tr('Sembunyikan layanan', 'Hide service') : tr('Tampilkan layanan', 'Show service')} title={service.isActive ? tr('Sembunyikan layanan', 'Hide service') : tr('Tampilkan layanan', 'Show service')} onClick={() => void toggle(service)} /></Space> }];
  return <section aria-label={tr('Layanan', 'Services')}><AdminHeaderActions><Button type="primary" onClick={() => { setEditing(undefined); form.resetFields(); form.setFieldsValue(initialService); setOpen(true); }}>{tr('Tambah layanan', 'Add service')}</Button></AdminHeaderActions><Table rowKey="id" columns={columns} dataSource={services} scroll={{ x: 720 }} locale={{ emptyText: <Empty description={tr('Belum ada layanan', 'No services yet')} /> }} pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (total, range) => tr(`Menampilkan ${range[0]}-${range[1]} dari ${total}`, `Showing ${range[0]}-${range[1]} of ${total}`) }} />
    <Drawer className="service-form-drawer" title={editing ? tr('Ubah layanan', 'Edit service') : tr('Tambah layanan', 'Add service')} open={open} onClose={() => setOpen(false)} width={520} destroyOnHidden footer={<Space><Button onClick={() => setOpen(false)}>{copy.cancel}</Button><Button type="primary" loading={saving} onClick={() => form.submit()}>{copy.save}</Button></Space>}>
      <Form className="service-form" form={form} layout="vertical" initialValues={initialService} onFinish={(values) => void submit(values)}>
        <Form.Item name="slug" label="Slug" rules={[{ required: true, message: tr('Slug wajib diisi', 'Slug is required') }]}><Input /></Form.Item>
        <Form.Item name="name" label={tr('Nama layanan', 'Service name')} rules={[{ required: true, message: tr('Nama layanan wajib diisi', 'Service name is required') }]}><Input /></Form.Item>
        <Form.Item name="shortDesc" label={tr('Deskripsi singkat', 'Short description')} rules={[{ required: true, message: tr('Deskripsi wajib diisi', 'Description is required') }]}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="description" label={tr('Deskripsi lengkap', 'Full description')} rules={[{ required: true, message: tr('Deskripsi wajib diisi', 'Description is required') }]}><Input.TextArea rows={5} /></Form.Item>
        <Form.Item name="zone" label={tr('Area gigi', 'Dental zone')}><Select options={['front', 'molar', 'gum', 'arch'].map((value) => ({ value, label: value }))} /></Form.Item>
        <Form.Item name="category" label={tr('Kategori', 'Category')}><Select options={['prevention', 'aesthetic', 'orthodontic', 'restorative', 'surgery', 'pediatric'].map((value) => ({ value, label: value }))} /></Form.Item>
        <Form.Item name="durationMinutes" label={tr('Durasi (menit)', 'Duration (minutes)')}><InputNumber min={15} max={480} /></Form.Item>
        <Form.Item name="priceFrom" label={tr('Harga mulai dari', 'Starting price')}><Input /></Form.Item>
        <Form.Item name="priceTo" label={tr('Harga hingga', 'Maximum price')}><Input /></Form.Item>
        <Form.Item name="priceNote" label={tr('Catatan harga', 'Price note')}><Input /></Form.Item>
        <Form.Item name="sortOrder" label={tr('Urutan', 'Sort order')}><InputNumber min={0} max={10000} /></Form.Item>
        <Form.Item name="isActive" label={tr('Aktif', 'Active')} valuePropName="checked"><Switch /></Form.Item>
      </Form>
    </Drawer>
  </section>;
}
