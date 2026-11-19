import { ContentFormDrawer } from '../content/ContentFormDrawer';
import { EditOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Form, Input, Space, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { createFaq, updateFaq, type AdminFaq, type ServerPagination } from '../../api/admin-api';
import { AdminPageHeader, AdminTable } from '../../components/ui';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  faqs: AdminFaq[];
  onChanged: (faqs: AdminFaq[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

type FaqInput = { question: string; answer: string };

export function FaqManager({ accessToken, faqs, onChanged, onError, pagination }: Props) {
  useAdminTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<FaqInput>();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdminFaq>();
  const [saving, setSaving] = useState(false);

  function openEditor(faq?: AdminFaq) {
    setSelected(faq);
    form.setFieldsValue(faq ? { question: faq.question, answer: faq.answer } : { question: '', answer: '' });
    setOpen(true);
  }

  function closeEditor() {
    form.resetFields();
    setSelected(undefined);
    setOpen(false);
  }

  async function submit(values: FaqInput) {
    setSaving(true);
    try {
      const faq = selected ? await updateFaq(accessToken, selected.id, values) : await createFaq(accessToken, values);
      onChanged(selected ? faqs.map((item) => (item.id === faq.id ? faq : item)) : [...faqs, faq]);
      message.success(selected ? tr('FAQ diperbarui', 'FAQ updated') : tr('FAQ ditambahkan', 'FAQ added'));
      closeEditor();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(faq: AdminFaq) {
    try {
      const updated = await updateFaq(accessToken, faq.id, { isPublished: !faq.isPublished });
      onChanged(faqs.map((item) => (item.id === faq.id ? updated : item)));
      message.success(updated.isPublished ? tr('FAQ dipublikasikan', 'FAQ published') : tr('FAQ disembunyikan', 'FAQ hidden'));
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const columns: ColumnsType<AdminFaq> = [
    { title: tr('Pertanyaan', 'Question'), dataIndex: 'question' },
    {
      title: tr('Dipublikasikan', 'Published'),
      width: 140,
      render: (_, faq) => <Switch checked={faq.isPublished} onChange={() => void toggle(faq)} />,
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 112,
      align: 'right',
      render: (_, faq) => (
        <Space size={2}>
          <Button type="text" icon={<EditOutlined />} aria-label={tr('Ubah FAQ', 'Edit FAQ')} title={tr('Ubah FAQ', 'Edit FAQ')} onClick={() => openEditor(faq)} />
          <Button
            type="text"
            icon={faq.isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            aria-label={faq.isPublished ? tr('Sembunyikan FAQ', 'Hide FAQ') : tr('Publikasikan FAQ', 'Publish FAQ')}
            title={faq.isPublished ? tr('Sembunyikan FAQ', 'Hide FAQ') : tr('Publikasikan FAQ', 'Publish FAQ')}
            onClick={() => void toggle(faq)}
          />
        </Space>
      ),
    },
  ];

  return (
    <section aria-labelledby="faqs-heading">
      <AdminPageHeader
        title={tr('Tanya Jawab (FAQ)', 'FAQ')}
        description={tr('Kelola pertanyaan yang sering diajukan pasien di website klinik.', 'Manage frequently asked questions shown on the clinic website.')}
        meta={`${pagination?.total ?? faqs.length} FAQ`}
        actions={<Button type="primary" onClick={() => openEditor()}>{tr('Tambah FAQ', 'Add FAQ')}</Button>}
      />

      <AdminTable<AdminFaq>
        rowKey="id"
        columns={columns}
        dataSource={faqs}
        pagination={pagination ? { ...pagination, showSizeChanger: false } : undefined}
        emptyTitle={tr('Belum ada FAQ', 'No FAQs yet')}
        renderMobileCard={(faq) => (
          <div className="admin-mobile-card">
            <div className="admin-mobile-card__top">
              <strong>{faq.question}</strong>
              <Space size={4}>
                <Button type="text" icon={<EditOutlined />} aria-label={tr('Ubah FAQ', 'Edit FAQ')} onClick={() => openEditor(faq)} />
                <Switch checked={faq.isPublished} onChange={() => void toggle(faq)} />
              </Space>
            </div>
          </div>
        )}
      />

      <ContentFormDrawer title={selected ? tr('Ubah FAQ', 'Edit FAQ') : tr('Tambah FAQ', 'Add FAQ')} open={open} onClose={closeEditor} onSave={() => form.submit()} saving={saving}>
        <Form form={form} layout="vertical" disabled={saving} scrollToFirstError onFinish={(values) => void submit(values)}>
          <Form.Item name="question" label={tr('Pertanyaan', 'Question')} rules={[{ required: true, message: tr('Pertanyaan wajib diisi', 'Question is required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="answer" label={tr('Jawaban', 'Answer')} rules={[{ required: true, message: tr('Jawaban wajib diisi', 'Answer is required') }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </ContentFormDrawer>
    </section>
  );
}
