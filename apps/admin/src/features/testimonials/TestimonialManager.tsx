import { ContentFormDrawer } from '../content/ContentFormDrawer';
import { EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Form, Input, InputNumber, Space, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createTestimonial, updateTestimonial, type ServerPagination, type Testimonial } from '../../api/admin-api';
import { AdminPageHeader, AdminTable } from '../../components/ui';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  testimonials: Testimonial[];
  onChanged: (testimonials: Testimonial[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

type TestimonialInput = { name: string; text: string; rating: number; source: string; sortOrder: number };

export function TestimonialManager({ accessToken, testimonials, onChanged, onError, pagination }: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<TestimonialInput>();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Testimonial>();
  const [saving, setSaving] = useState(false);

  function openEditor(testimonial?: Testimonial) {
    setSelected(testimonial);
    form.setFieldsValue(testimonial
      ? { name: testimonial.name, text: testimonial.text, rating: testimonial.rating, source: testimonial.source, sortOrder: testimonial.sortOrder }
      : { rating: 5, source: 'Google', sortOrder: 0 });
    setOpen(true);
  }

  function closeEditor() {
    form.resetFields();
    setSelected(undefined);
    setOpen(false);
  }

  async function submit(values: TestimonialInput) {
    setSaving(true);
    try {
      const testimonial = selected
        ? await updateTestimonial(accessToken, selected.id, values)
        : await createTestimonial(accessToken, { ...values, isPublished: false });
      onChanged(selected ? testimonials.map((item) => (item.id === testimonial.id ? testimonial : item)) : [...testimonials, testimonial]);
      message.success(selected ? tr('Testimoni diperbarui', 'Testimonial updated') : tr('Testimoni ditambahkan', 'Testimonial added'));
      closeEditor();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(testimonial: Testimonial) {
    try {
      const updated = await updateTestimonial(accessToken, testimonial.id, { isPublished: !testimonial.isPublished });
      onChanged(testimonials.map((item) => (item.id === testimonial.id ? updated : item)));
      message.success(updated.isPublished ? tr('Testimoni dipublikasikan', 'Testimonial published') : tr('Testimoni disembunyikan', 'Testimonial hidden'));
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const columns: ColumnsType<Testimonial> = [
    { title: tr('Pasien', 'Patient'), dataIndex: 'name' },
    { title: tr('Nilai', 'Rating'), dataIndex: 'rating', width: 100, render: (value: number) => `${value}/5` },
    { title: tr('Sumber', 'Source'), dataIndex: 'source', width: 130 },
    {
      title: tr('Dipublikasikan', 'Published'),
      width: 140,
      render: (_, item) => <Switch checked={item.isPublished} onChange={() => void toggle(item)} />,
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 112,
      align: 'right',
      render: (_, item) => (
        <Space size={2}>
          <Button type="text" icon={<EditOutlined />} aria-label={tr('Ubah testimoni', 'Edit testimonial')} title={tr('Ubah testimoni', 'Edit testimonial')} onClick={() => openEditor(item)} />
          <Button
            type="text"
            icon={item.isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            aria-label={item.isPublished ? tr('Sembunyikan testimoni', 'Hide testimonial') : tr('Publikasikan testimoni', 'Publish testimonial')}
            title={item.isPublished ? tr('Sembunyikan testimoni', 'Hide testimonial') : tr('Publikasikan testimoni', 'Publish testimonial')}
            onClick={() => void toggle(item)}
          />
        </Space>
      ),
    },
  ];

  return (
    <section aria-labelledby="testimonials-heading">
      <AdminPageHeader
        title={tr('Testimoni Pasien', 'Patient Testimonials')}
        description={tr('Kurasi ulasan pasien untuk ditampilkan di halaman utama.', 'Curate patient reviews to display on the website.')}
        meta={`${testimonials.length} ${tr('ulasan', 'reviews')}`}
        actions={
          <Button
            type="primary"
            onClick={() => openEditor()}
          >
            {tr('Tambah testimoni', 'Add testimonial')}
          </Button>
        }
      />

      <AdminTable<Testimonial>
        rowKey="id"
        columns={columns}
        dataSource={testimonials}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        emptyTitle={tr('Belum ada testimoni', 'No testimonials yet')}
        renderMobileCard={(item) => (
          <div className="admin-mobile-card">
            <div className="admin-mobile-card__top">
              <div>
                <strong>{item.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{item.rating}/5 · {item.source}</div>
              </div>
              <Space size={4}>
                <Button type="text" icon={<EditOutlined />} aria-label={tr('Ubah testimoni', 'Edit testimonial')} onClick={() => openEditor(item)} />
                <Switch checked={item.isPublished} onChange={() => void toggle(item)} />
              </Space>
            </div>
          </div>
        )}
      />

      <ContentFormDrawer title={selected ? tr('Ubah testimoni', 'Edit testimonial') : tr('Tambah testimoni', 'Add testimonial')} open={open} onClose={closeEditor} onSave={() => form.submit()} saving={saving}>
        <Form form={form} layout="vertical" disabled={saving} scrollToFirstError onFinish={(values) => void submit(values)}>
          <Form.Item name="name" label={tr('Nama', 'Name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="text" label={tr('Ulasan', 'Testimonial')} rules={[{ required: true }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item name="rating" label={tr('Nilai', 'Rating')}>
            <InputNumber min={1} max={5} />
          </Form.Item>
          <Form.Item name="source" label={tr('Sumber', 'Source')}>
            <Input />
          </Form.Item>
        </Form>
      </ContentFormDrawer>
    </section>
  );
}
