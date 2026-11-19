import { ContentFormDrawer } from '../content/ContentFormDrawer';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Form, Input, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createPromotion, updatePromotion, type Promotion, type ServerPagination } from '../../api/admin-api';
import { AdminPageHeader, AdminTable } from '../../components/ui';
import { formatDateTime, tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  promotions: Promotion[];
  onChanged: (promotions: Promotion[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

type PromotionInput = { title: string; description: string; startsAt: string; endsAt: string };

export function PromotionManager({ accessToken, promotions, onChanged, onError, pagination }: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<PromotionInput>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(values: PromotionInput) {
    setSaving(true);
    try {
      const promotion = await createPromotion(accessToken, {
        ...values,
        serviceId: null,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
        isPublished: false,
      });
      onChanged([...promotions, promotion]);
      message.success(tr('Promosi ditambahkan', 'Promotion added'));
      form.resetFields();
      setOpen(false);
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(promotion: Promotion) {
    try {
      const updated = await updatePromotion(accessToken, promotion.id, { isPublished: !promotion.isPublished });
      onChanged(promotions.map((item) => (item.id === promotion.id ? updated : item)));
      message.success(updated.isPublished ? tr('Promosi dipublikasikan', 'Promotion published') : tr('Promosi disembunyikan', 'Promotion hidden'));
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const columns: ColumnsType<Promotion> = [
    { title: tr('Promosi', 'Promotion'), dataIndex: 'title' },
    {
      title: tr('Periode', 'Period'),
      render: (_, promotion) => `${formatDateTime(promotion.startsAt)} — ${formatDateTime(promotion.endsAt)}`,
    },
    {
      title: tr('Dipublikasikan', 'Published'),
      width: 140,
      render: (_, promotion) => <Switch checked={promotion.isPublished} onChange={() => void toggle(promotion)} />,
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 80,
      align: 'right',
      render: (_, promotion) => (
        <Button
          type="text"
          icon={promotion.isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          aria-label={promotion.isPublished ? tr('Sembunyikan promosi', 'Hide promotion') : tr('Publikasikan promosi', 'Publish promotion')}
          title={promotion.isPublished ? tr('Sembunyikan promosi', 'Hide promotion') : tr('Publikasikan promosi', 'Publish promotion')}
          onClick={() => void toggle(promotion)}
        />
      ),
    },
  ];

  return (
    <section aria-labelledby="promotions-heading">
      <AdminPageHeader
        title={tr('Promosi Klinik', 'Promotions')}
        description={tr('Kelola penawaran dan promo perawatan gigi yang tampil di website.', 'Manage dental offers and promotions displayed on the website.')}
        meta={`${pagination?.total ?? promotions.length} ${tr('promosi', 'promotions')}`}
        actions={<Button type="primary" onClick={() => setOpen(true)}>{tr('Tambah promosi', 'Add promotion')}</Button>}
      />

      <AdminTable<Promotion>
        rowKey="id"
        columns={columns}
        dataSource={promotions}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        emptyTitle={tr('Belum ada promosi', 'No promotions yet')}
        renderMobileCard={(promotion) => (
          <div className="admin-mobile-card">
            <div className="admin-mobile-card__top">
              <strong>{promotion.title}</strong>
              <Switch checked={promotion.isPublished} onChange={() => void toggle(promotion)} />
            </div>
            <div className="admin-mobile-card__meta">
              <span>{formatDateTime(promotion.startsAt)} — {formatDateTime(promotion.endsAt)}</span>
            </div>
          </div>
        )}
      />

      <ContentFormDrawer title={tr('Tambah promosi', 'Add promotion')} open={open} onClose={() => setOpen(false)} onSave={() => form.submit()} saving={saving}>
        <Form form={form} layout="vertical" disabled={saving} scrollToFirstError onFinish={(values) => void submit(values)}>
          <Form.Item name="title" label={tr('Judul', 'Title')} rules={[{ required: true, message: tr('Judul wajib diisi', 'Title is required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={tr('Deskripsi', 'Description')} rules={[{ required: true, message: tr('Deskripsi wajib diisi', 'Description is required') }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="startsAt" label={tr('Mulai', 'Starts')} rules={[{ required: true, message: tr('Waktu mulai wajib diisi', 'Start time is required') }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="endsAt" label={tr('Selesai', 'Ends')} rules={[{ required: true, message: tr('Waktu selesai wajib diisi', 'End time is required') }]}>
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </ContentFormDrawer>
    </section>
  );
}
