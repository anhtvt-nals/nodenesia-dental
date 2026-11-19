import { ContentFormDrawer } from '../content/ContentFormDrawer';
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PictureOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { AdminImageUpload } from '../../components/ui';
import {
  Button,
  Checkbox,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import {
  createGalleryItem,
  deleteGalleryItem,
  updateGalleryItem,
  uploadGalleryImage,
  type ClinicService,
  type GalleryItem,
  type ServerPagination,
} from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  items: GalleryItem[];
  services?: ClinicService[];
  onChanged: (items: GalleryItem[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

type GalleryFormValues = {
  type: 'before_after' | 'photo';
  beforeUrl?: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  captionEn?: string;
  treatmentDuration?: string;
  serviceId?: string;
  consentConfirmed: boolean;
  sortOrder: number;
};

export function GalleryManager({ accessToken, items, services = [], onChanged, onError, pagination }: Props) {
  const [form] = Form.useForm<GalleryFormValues>();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  useAdminTranslation();

  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  function handleCreate() {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'before_after',
      consentConfirmed: false,
      sortOrder: items.length > 0 ? Math.max(...items.map((i) => i.sortOrder || 0)) + 10 : 0,
    });
    setOpen(true);
  }

  function handleEdit(item: GalleryItem) {
    setEditingItem(item);
    form.resetFields();
    form.setFieldsValue({
      type: item.type,
      beforeUrl: item.beforeUrl || undefined,
      afterUrl: item.afterUrl || '',
      beforeLabel: item.beforeLabel || undefined,
      afterLabel: item.afterLabel || undefined,
      caption: item.caption || undefined,
      captionEn: item.captionEn || undefined,
      treatmentDuration: item.treatmentDuration || undefined,
      serviceId: item.serviceId || undefined,
      consentConfirmed: item.consentConfirmed,
      sortOrder: item.sortOrder ?? 0,
    });
    setOpen(true);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteGalleryItem(accessToken, id);
      onChanged(items.filter((item) => item.id !== id));
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  async function submit(values: GalleryFormValues) {
    setSaving(true);
    try {
      const payload = {
        type: values.type,
        beforeUrl: values.beforeUrl ? values.beforeUrl.trim() : null,
        afterUrl: values.afterUrl.trim(),
        beforeLabel: values.beforeLabel ? values.beforeLabel.trim() : null,
        afterLabel: values.afterLabel ? values.afterLabel.trim() : null,
        caption: values.caption ? values.caption.trim() : null,
        captionEn: values.captionEn ? values.captionEn.trim() : null,
        treatmentDuration: values.treatmentDuration ? values.treatmentDuration.trim() : null,
        serviceId: values.serviceId || null,
        consentConfirmed: Boolean(values.consentConfirmed),
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingItem) {
        const updated = await updateGalleryItem(accessToken, editingItem.id, payload);
        onChanged(items.map((item) => (item.id === editingItem.id ? { ...item, ...updated } : item)));
      } else {
        const created = await createGalleryItem(accessToken, {
          ...payload,
          isPublished: false,
        });
        onChanged([...items, created]);
      }
      setOpen(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(item: GalleryItem) {
    try {
      const updated = await updateGalleryItem(accessToken, item.id, { isPublished: !item.isPublished });
      onChanged(items.map((current) => (current.id === item.id ? { ...current, ...updated } : current)));
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const columns: ColumnsType<GalleryItem> = [
    {
      title: tr('Pratinjau Foto', 'Visual Preview'),
      width: 170,
      render: (_, item) => {
        if (item.type === 'before_after') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={item.beforeUrl || ''}
                  fallback="https://placehold.co/80x60/f1f5f9/64748b?text=Before"
                  alt={item.beforeLabel || 'Before'}
                  width={64}
                  height={48}
                  style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-border)' }}
                />
                <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>{tr('Sebelum', 'Before')}</div>
              </div>
              <span style={{ color: 'var(--color-muted)', fontWeight: 600 }}>→</span>
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={item.afterUrl || ''}
                  fallback="https://placehold.co/80x60/ecfdf5/047857?text=After"
                  alt={item.afterLabel || 'After'}
                  width={64}
                  height={48}
                  style={{ objectFit: 'cover', borderRadius: 6, border: '1.5px solid var(--color-primary)' }}
                />
                <div style={{ fontSize: 10, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>{tr('Sesudah', 'After')}</div>
              </div>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image
              src={item.afterUrl || ''}
              fallback="https://placehold.co/80x60/f1f5f9/64748b?text=Photo"
              alt={item.caption || 'Treatment photo'}
              width={64}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-border)' }}
            />
            <Tag className="admin-tag admin-tag--info">{tr('Foto Tunggal', 'Single photo')}</Tag>
          </div>
        );
      },
    },
    {
      title: tr('Perawatan & Layanan', 'Treatment & Service'),
      render: (_, item) => {
        const serviceName = item.service?.name || services.find((s) => s.id === item.serviceId)?.name;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {serviceName ? (
                <Tag className="admin-tag admin-tag--brand">
                  {serviceName}
                </Tag>
              ) : (
                <Tag className="admin-tag admin-tag--neutral">{tr('Umum', 'General')}</Tag>
              )}
              {item.treatmentDuration && (
                <Tag icon={<ClockCircleOutlined />} className="admin-tag admin-tag--neutral">
                  {item.treatmentDuration}
                </Tag>
              )}
            </div>
            {item.type === 'before_after' && (item.beforeLabel || item.afterLabel) && (
              <div style={{ fontSize: 12, color: 'var(--neutral-900)' }}>
                {item.beforeLabel && <span style={{ color: 'var(--neutral-600)' }}>{item.beforeLabel}</span>}
                {item.beforeLabel && item.afterLabel && <span> &rarr; </span>}
                {item.afterLabel && <strong style={{ color: 'var(--brand-700)' }}>{item.afterLabel}</strong>}
              </div>
            )}
            {item.caption && (
              <div style={{ fontSize: 12, color: 'var(--neutral-600)', lineHeight: 1.4 }}>
                {item.caption}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: tr('Persetujuan Pasien', 'Consent'),
      width: 145,
      render: (_, item) =>
        item.consentConfirmed ? (
          <Tag className="admin-tag admin-tag--success">
            {tr('Terkonfirmasi', 'Confirmed')}
          </Tag>
        ) : (
          <Tag className="admin-tag admin-tag--danger">
            {tr('Belum Ada', 'Missing')}
          </Tag>
        ),
    },
    {
      title: tr('Publikasi', 'Published'),
      width: 110,
      render: (_, item) => (
        <Tooltip
          title={
            !item.consentConfirmed
              ? tr('Perlu persetujuan pasien sebelum dipublikasikan', 'Consent required before publishing')
              : undefined
          }
        >
          <Switch
            checked={item.isPublished}
            disabled={!item.consentConfirmed}
            onChange={() => void togglePublish(item)}
          />
        </Tooltip>
      ),
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 110,
      render: (_, item) => (
        <Space size={4}>
          <Tooltip title={tr('Ubah', 'Edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(item)}
              aria-label={tr('Ubah', 'Edit')}
            />
          </Tooltip>
          <Tooltip title={item.isPublished ? tr('Sembunyikan foto', 'Hide photo') : tr('Publikasikan foto', 'Publish photo')}>
            <Button
              type="text"
              disabled={!item.consentConfirmed}
              icon={item.isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => void togglePublish(item)}
              aria-label={item.isPublished ? tr('Sembunyikan foto', 'Hide photo') : tr('Publikasikan foto', 'Publish photo')}
            />
          </Tooltip>
          <Popconfirm
            title={tr('Hapus foto ini?', 'Delete this photo?')}
            description={tr('Tindakan ini tidak dapat dibatalkan.', 'This action cannot be undone.')}
            okText={tr('Hapus', 'Delete')}
            cancelText={tr('Batal', 'Cancel')}
            okButtonProps={{ danger: true, loading: deletingId === item.id }}
            onConfirm={() => void handleDelete(item.id)}
          >
            <Tooltip title={tr('Hapus', 'Delete')}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label={tr('Hapus', 'Delete')}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section aria-labelledby="gallery-heading">
      <Space className="section-heading">
        <Typography.Title level={2} id="gallery-heading">
          {tr('Galeri Hasil Perawatan', 'Treatment Gallery')}
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {tr('Tambah Foto Perawatan', 'Add Case Photo')}
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        locale={{
          emptyText: <Empty description={tr('Belum ada foto perawatan di galeri', 'No gallery items yet')} />,
        }}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : { pageSize: 15, showSizeChanger: false }}
      />

      <ContentFormDrawer
        title={editingItem ? tr('Ubah Foto Perawatan', 'Edit Case Photo') : tr('Tambah Foto Perawatan', 'Add New Case Photo')}
        open={open}
        onClose={() => {
          if (!saving && !uploadingBefore && !uploadingAfter) {
            setOpen(false);
            setEditingItem(null);
          }
        }}
        onSave={() => form.submit()}
        saving={saving}
      >
        <Form form={form} layout="vertical" disabled={saving} scrollToFirstError onFinish={(values) => void submit(values)}>
          <Form.Item name="type" label={tr('Format Tampilan', 'Format')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'before_after', label: tr('Perbandingan Sebelum & Sesudah (Before & After)', 'Before & After Comparison') },
                { value: 'photo', label: tr('Foto Tunggal Hasil Perawatan', 'Single Result Photo') },
              ]}
            />
          </Form.Item>

          <Form.Item name="serviceId" label={tr('Layanan Perawatan Gigi', 'Dental Service')}>
            <Select
              allowClear
              placeholder={tr('Pilih layanan terkait', 'Select matching service')}
              options={serviceOptions}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.type !== next.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'before_after' ? (
                <>
                  <Form.Item
                    name="beforeUrl"
                    label={tr('Foto Sebelum Perawatan (Before)', 'Before Photo')}
                    rules={[{ required: true, message: tr('Unggah foto sebelum perawatan', 'Please upload before photo') }]}
                    extra={tr('JPG, PNG, atau WebP maksimal 10 MB ke Cloudflare R2.', 'JPG, PNG or WebP up to 10 MB to Cloudflare R2.')}
                  >
                    <AdminImageUpload
                      onUpload={(file) => uploadGalleryImage(accessToken, file)}
                      onError={onError}
                      onUploadingChange={setUploadingBefore}
                      disabled={saving}
                      emptyLabel={tr('Belum ada foto Before', 'No before photo')}
                    />
                  </Form.Item>

                  <Form.Item
                    name="beforeLabel"
                    label={tr('Keterangan singkat sebelum perawatan', 'Before Status Label')}
                  >
                    <Input placeholder={tr('Contoh: Gigi bernoda, susunan tidak rata', 'e.g., Heavy stains, misaligned')} />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="afterUrl"
            label={tr('Foto Sesudah Perawatan / Foto Utama', 'After / Main Photo')}
            rules={[{ required: true, message: tr('Unggah foto sesudah perawatan', 'Please upload after photo') }]}
            extra={tr('JPG, PNG, atau WebP maksimal 10 MB ke Cloudflare R2.', 'JPG, PNG or WebP up to 10 MB to Cloudflare R2.')}
          >
            <AdminImageUpload
              onUpload={(file) => uploadGalleryImage(accessToken, file)}
              onError={onError}
              onUploadingChange={setUploadingAfter}
              disabled={saving}
              emptyLabel={tr('Belum ada foto', 'No photo yet')}
            />
          </Form.Item>

          <Form.Item
            name="afterLabel"
            label={tr('Keterangan singkat hasil perawatan', 'After Result Label')}
          >
            <Input placeholder={tr('Contoh: Gigi tampak lebih cerah dan rapi', 'e.g., Natural bright white shade')} />
          </Form.Item>

          <Form.Item
            name="treatmentDuration"
            label={tr('Durasi / Lama Perawatan', 'Treatment Duration')}
          >
            <Input placeholder={tr('Contoh: 60 menit, 2 minggu, 6 bulan', 'e.g., 60 mins, 2 weeks, 6 months')} />
          </Form.Item>

          <Form.Item
            name="caption"
            label={tr('Detail Kasus Perawatan (Bahasa Indonesia)', 'Case Description (Main)')}
          >
            <Input.TextArea rows={3} placeholder={tr('Catatan kondisi awal, metode tindakan, dan hasil perawatan...', 'Notes on diagnosis, technique used...')} />
          </Form.Item>

          <Form.Item
            name="captionEn"
            label={tr('Detail Kasus Perawatan (English - Opsional)', 'Case Description (English - Optional)')}
          >
            <Input.TextArea rows={2} placeholder="English clinical description..." />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label={tr('Urutan Tampilan', 'Sort Order')}
          >
            <InputNumber min={0} max={10000} style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ padding: 12, background: 'var(--brand-50)', borderRadius: 8, border: '1px solid var(--brand-100)', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 6 }}>
              {tr('Etika Medis & Persetujuan Pasien (Informed Consent)', 'Medical Ethics & Consent')}
            </div>
            <Form.Item
              name="consentConfirmed"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error(tr('Konfirmasi persetujuan tertulis pasien wajib dicentang', 'Consent must be confirmed'))),
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Checkbox>
                {tr(
                  'Pasien telah menandatangani formulir persetujuan (Informed Consent) untuk publikasi foto hasil perawatan.',
                  'Patient has provided signed written informed consent for medical photo publication.'
                )}
              </Checkbox>
            </Form.Item>
          </div>
        </Form>
      </ContentFormDrawer>
    </section>
  );
}
