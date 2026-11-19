import { EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Drawer, Form, Input, InputNumber, Select, Space, Switch, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createService, updateService, type ClinicService, type ServerPagination, type ServiceInput } from '../../api/admin-api';
import { AdminPageHeader, AdminTable } from '../../components/ui';
import { copy, formatCurrency, tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  services: ClinicService[];
  onChanged: (services: ClinicService[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

const initialService: ServiceInput = {
  slug: '',
  name: '',
  shortDesc: '',
  description: '',
  zone: 'gum',
  category: 'prevention',
  durationMinutes: 45,
  priceFrom: '0',
  priceTo: null,
  priceNote: null,
  isActive: true,
  sortOrder: 0,
};

export function ServiceCatalogue({ accessToken, services, onChanged, onError, pagination }: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<ServiceInput>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicService>();
  const [saving, setSaving] = useState(false);

  async function submit(values: ServiceInput) {
    setSaving(true);
    try {
      const input = {
        ...initialService,
        ...values,
        priceFrom: String(values.priceFrom),
        priceTo: values.priceTo ? String(values.priceTo) : null,
      };
      const saved = editing
        ? await updateService(accessToken, editing.id, input)
        : await createService(accessToken, input);
      onChanged(editing ? services.map((item) => (item.id === editing.id ? saved : item)) : [...services, saved]);
      message.success(editing ? tr('Layanan diperbarui', 'Service updated') : tr('Layanan ditambahkan', 'Service added'));
      form.resetFields();
      setOpen(false);
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(service: ClinicService) {
    try {
      const updated = await updateService(accessToken, service.id, { isActive: !service.isActive });
      onChanged(services.map((item) => (item.id === service.id ? updated : item)));
      message.success(
        updated.isActive
          ? tr(`${service.name} diaktifkan`, `${service.name} activated`)
          : tr(`${service.name} disembunyikan`, `${service.name} hidden`),
      );
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const columns: ColumnsType<ClinicService> = [
    {
      title: tr('Layanan', 'Service'),
      dataIndex: 'name',
      render: (name: string, service) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{name}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {service.shortDesc}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: tr('Durasi', 'Duration'),
      dataIndex: 'durationMinutes',
      width: 120,
      render: (value: number) => tr(`${value} mnt`, `${value} min`),
    },
    {
      title: tr('Harga', 'Price'),
      dataIndex: 'priceFrom',
      width: 150,
      render: formatCurrency,
    },
    {
      title: tr('Aktif', 'Active'),
      width: 100,
      render: (_, service) => (
        <Switch
          checked={service.isActive}
          aria-label={tr(`Aktifkan ${service.name}`, `Toggle ${service.name}`)}
          onChange={() => void toggle(service)}
        />
      ),
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 110,
      align: 'right',
      render: (_, service) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={tr(`Ubah layanan ${service.name}`, `Edit service ${service.name}`)}
            title={tr('Ubah layanan', 'Edit service')}
            onClick={() => {
              setEditing(service);
              form.setFieldsValue(service);
              setOpen(true);
            }}
          />
          <Button
            type="text"
            icon={service.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            aria-label={service.isActive ? tr('Sembunyikan layanan', 'Hide service') : tr('Tampilkan layanan', 'Show service')}
            title={service.isActive ? tr('Sembunyikan layanan', 'Hide service') : tr('Tampilkan layanan', 'Show service')}
            onClick={() => void toggle(service)}
          />
        </Space>
      ),
    },
  ];

  return (
    <section aria-label={tr('Layanan', 'Services')}>
      <AdminPageHeader
        title={tr('Katalog Layanan', 'Services Catalogue')}
        description={tr('Kelola daftar tindakan perawatan gigi, durasi, dan estimasi biaya.', 'Manage dental treatments, durations, and pricing.')}
        meta={`${services.length} ${tr('layanan', 'services')}`}
        actions={
          <Button
            type="primary"
            onClick={() => {
              setEditing(undefined);
              form.resetFields();
              form.setFieldsValue(initialService);
              setOpen(true);
            }}
          >
            {tr('Tambah layanan', 'Add service')}
          </Button>
        }
      />

      <AdminTable<ClinicService>
        rowKey="id"
        columns={columns}
        dataSource={services}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        emptyTitle={tr('Belum ada layanan', 'No services yet')}
        renderMobileCard={(service) => (
          <div className="admin-mobile-card">
            <div className="admin-mobile-card__top">
              <div>
                <strong>{service.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                  {formatCurrency(service.priceFrom)} · {service.durationMinutes} {tr('mnt', 'min')}
                </div>
              </div>
              <Switch checked={service.isActive} onChange={() => void toggle(service)} />
            </div>
            <div className="admin-mobile-card__actions">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(service);
                  form.setFieldsValue(service);
                  setOpen(true);
                }}
              >
                {tr('Ubah', 'Edit')}
              </Button>
            </div>
          </div>
        )}
      />

      <Drawer
        className="service-form-drawer"
        title={editing ? tr('Ubah layanan', 'Edit service') : tr('Tambah layanan', 'Add service')}
        open={open}
        onClose={() => setOpen(false)}
        width={520}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>{copy.cancel}</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {copy.save}
            </Button>
          </Space>
        }
      >
        <Form className="service-form" form={form} layout="vertical" initialValues={initialService} onFinish={(values) => void submit(values)}>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: tr('Slug wajib diisi', 'Slug is required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label={tr('Nama layanan', 'Service name')} rules={[{ required: true, message: tr('Nama layanan wajib diisi', 'Service name is required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shortDesc" label={tr('Deskripsi singkat', 'Short description')} rules={[{ required: true, message: tr('Deskripsi wajib diisi', 'Description is required') }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="description" label={tr('Deskripsi lengkap', 'Full description')} rules={[{ required: true, message: tr('Deskripsi wajib diisi', 'Description is required') }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item name="zone" label={tr('Area gigi', 'Dental zone')}>
            <Select options={['front', 'molar', 'gum', 'arch'].map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name="category" label={tr('Kategori', 'Category')}>
            <Select options={['prevention', 'aesthetic', 'orthodontic', 'restorative', 'surgery', 'pediatric'].map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name="durationMinutes" label={tr('Durasi (menit)', 'Duration (minutes)')}>
            <InputNumber min={15} max={480} />
          </Form.Item>
          <Form.Item name="priceFrom" label={tr('Harga mulai dari', 'Starting price')}>
            <Input />
          </Form.Item>
          <Form.Item name="priceTo" label={tr('Harga hingga', 'Maximum price')}>
            <Input />
          </Form.Item>
          <Form.Item name="priceNote" label={tr('Catatan harga', 'Price note')}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label={tr('Urutan', 'Sort order')}>
            <InputNumber min={0} max={10000} />
          </Form.Item>
          <Form.Item name="isActive" label={tr('Aktif', 'Active')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </section>
  );
}
