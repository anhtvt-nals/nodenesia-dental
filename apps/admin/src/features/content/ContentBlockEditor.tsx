import { ContentFormDrawer } from './ContentFormDrawer';
import { AlignLeftOutlined, EditOutlined, FileTextOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Empty, Form, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { saveContentBlock, type ContentBlock } from '../../api/admin-api';
import { parseContentObject } from './content-json';
import { tr, useAdminTranslation } from '../../i18n';

type Props = { accessToken: string; blocks: ContentBlock[]; onChanged: (blocks: ContentBlock[]) => void; onError: (message: string) => void };
type ContentInput = { key: string; locale: string; json: string };
function preview(content: Record<string, unknown>) {
  return Object.values(content).filter((value): value is string => typeof value === 'string').join(' · ') || Object.keys(content).join(', ');
}
export function ContentBlockEditor({ accessToken, blocks, onChanged, onError }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<ContentInput>();
  const [selected, setSelected] = useState<ContentBlock>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [locale, setLocale] = useState('all');
  const [notice, contextHolder] = message.useMessage();

  function select(block?: ContentBlock) {
    setSelected(block);
    form.resetFields();
    form.setFieldsValue(block ? { key: block.key, locale: block.locale, json: JSON.stringify(block.content, null, 2) } : { key: '', locale: 'id', json: '{}' });
    setOpen(true);
  }
  async function submit(values: ContentInput) {
    setSaving(true);
    try {
      const saved = await saveContentBlock(accessToken, values.key.trim(), { locale: values.locale, content: parseContentObject(values.json) });
      onChanged([...blocks.filter((block) => block.key !== saved.key || block.locale !== saved.locale), saved]);
      setOpen(false);
      void notice.success(tr('Blok konten tersimpan.', 'Content block saved.'));
    } catch (error) { onError((error as Error).message); } finally { setSaving(false); }
  }
  const query = search.trim().toLowerCase();
  const filtered = blocks.filter((block) => (locale === 'all' || block.locale === locale) && `${block.key} ${preview(block.content)}`.toLowerCase().includes(query));
  const columns: ColumnsType<ContentBlock> = [
    { title: tr('Blok konten', 'Content block'), dataIndex: 'key', width: 240, render: (key, block) => <Space size={12}><span className="content-block-icon"><FileTextOutlined /></span><div><Button type="link" className="content-block-key" onClick={() => select(block)}>{key}</Button><Typography.Text type="secondary" className="content-block-meta">{tr(`${Object.keys(block.content).length} kolom konten`, `${Object.keys(block.content).length} content fields`)}</Typography.Text></div></Space> },
    { title: tr('Pratinjau', 'Preview'), render: (_, block) => <Typography.Paragraph ellipsis={{ rows: 2 }} className="content-block-preview">{preview(block.content) || '—'}</Typography.Paragraph> },
    { title: tr('Bahasa', 'Language'), dataIndex: 'locale', width: 150, render: (value) => <Tag color={value === 'en' ? 'blue' : 'cyan'}>{value === 'en' ? 'English' : value === 'id' ? 'Indonesia' : value}</Tag> },
    { title: tr('Tindakan', 'Actions'), width: 110, render: (_, block) => <Button icon={<EditOutlined />} onClick={() => select(block)}>{tr('Ubah', 'Edit')}</Button> },
  ];
  return <section aria-labelledby="content-heading">
    {contextHolder}
    <div className="content-block-heading"><div><Typography.Title level={2} id="content-heading">{tr('Blok konten', 'Content blocks')}</Typography.Title><Typography.Paragraph type="secondary">{tr('Kelola teks terstruktur dalam setiap bahasa website.', 'Manage structured website copy for each language.')}</Typography.Paragraph></div><Button type="primary" icon={<PlusOutlined />} onClick={() => select()}>{tr('Tambah blok', 'Add block')}</Button></div>
    <div className="content-block-toolbar">
      <Input prefix={<SearchOutlined />} allowClear value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tr('Cari nama atau isi konten…', 'Search block name or content…')} aria-label={tr('Cari blok konten', 'Search content blocks')} />
      <Select value={locale} onChange={setLocale} aria-label={tr('Filter bahasa', 'Filter language')} options={[{ value: 'all', label: tr('Semua bahasa', 'All languages') }, { value: 'id', label: 'Indonesia' }, { value: 'en', label: 'English' }]} />
      <span role="status">{tr(`${filtered.length} blok`, `${filtered.length} blocks`)}</span>
    </div>
    <Table rowKey={(block) => `${block.key}:${block.locale}`} columns={columns} dataSource={filtered} scroll={{ x: 680 }} locale={{ emptyText: <Empty description={blocks.length ? tr('Tidak ada hasil. Coba kata kunci atau bahasa lain.', 'No matches. Try another search or language.') : tr('Belum ada blok konten. Tambahkan blok pertama Anda.', 'No content blocks yet. Add your first block.')} /> }} pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true }} />
    <ContentFormDrawer title={selected ? tr('Ubah blok konten', 'Edit content block') : tr('Tambah blok konten', 'Add content block')} open={open} saving={saving} onClose={() => setOpen(false)} onSave={() => form.submit()} width={720} saveLabel={tr('Simpan perubahan', 'Save changes')} note={tr('Perubahan berlaku setelah disimpan.', 'Changes take effect after saving.')}>
      <Form form={form} layout="vertical" disabled={saving} onFinish={(values) => void submit(values)} scrollToFirstError>
        <div className="content-block-identity">
          <Form.Item name="key" label={tr('Nama blok', 'Block key')} extra={tr('Identitas unik yang digunakan website.', 'Unique identifier used by the website.')} rules={[{ required: true, whitespace: true, message: tr('Nama blok wajib diisi.', 'Enter a block key.') }, { validator: async (_, value) => { if (!selected && blocks.some((block) => block.key === value?.trim() && block.locale === form.getFieldValue('locale'))) throw new Error(tr('Blok untuk bahasa ini sudah ada. Ubah blok yang tersedia.', 'This block already exists for this language. Edit the existing block.')); } }]} dependencies={['locale']}><Input disabled={Boolean(selected)} placeholder="home.hero" /></Form.Item>
          <Form.Item name="locale" label={tr('Bahasa konten', 'Content language')} rules={[{ required: true }]}><Select disabled={Boolean(selected)} options={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }]} /></Form.Item>
        </div>
        <Alert type="info" showIcon message={tr('Pertahankan struktur konten', 'Keep the content structure')} description={tr('Ubah nilai teks tanpa mengganti nama kolom yang digunakan website.', 'Edit text values while preserving the field names used by the website.')} />
        <div className="content-block-editor-heading"><Typography.Text strong>{tr('Isi konten (JSON)', 'Content (JSON)')}</Typography.Text><Button type="text" size="small" disabled={saving} icon={<AlignLeftOutlined />} onClick={async () => { try { await form.validateFields(['json']); form.setFieldValue('json', JSON.stringify(parseContentObject(form.getFieldValue('json')), null, 2)); } catch { /* Inline validation explains the error. */ } }}>{tr('Rapikan', 'Format')}</Button></div>
        <Form.Item name="json" aria-label="JSON" validateTrigger="onBlur" rules={[{ validator: async (_, value) => { try { parseContentObject(value); } catch { throw new Error(tr('Masukkan JSON object yang valid. Periksa tanda kutip, koma, dan kurung.', 'Enter a valid JSON object. Check quotes, commas, and braces.')); } } }]}><Input.TextArea aria-label={tr('Isi konten JSON', 'JSON content')} spellCheck={false} rows={18} className="content-block-code" /></Form.Item>
      </Form>
    </ContentFormDrawer>
  </section>;
}
