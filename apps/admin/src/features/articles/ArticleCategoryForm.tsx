import { ContentFormDrawer } from '../content/ContentFormDrawer';
import { Button, Form, Input, InputNumber } from 'antd';
import { useState } from 'react';
import { createArticleCategory, type ArticleCategory } from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';
type Props = { accessToken: string; onCreated: (category: ArticleCategory) => void; onError: (message: string) => void };
type CategoryInput = { name: string; slug: string; sortOrder: number };
export function ArticleCategoryForm({ accessToken, onCreated, onError }: Props) { const [form] = Form.useForm<CategoryInput>(); const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false);
  useAdminTranslation();
  async function submit(values: CategoryInput) { setSaving(true); try { onCreated(await createArticleCategory(accessToken, values)); form.resetFields(); setOpen(false); } catch (error) { onError((error as Error).message); } finally { setSaving(false); } }
  return <><Button onClick={() => { form.setFieldsValue({ sortOrder: 0 }); setOpen(true); }}>{tr('Tambah kategori', 'Add category')}</Button><ContentFormDrawer title={tr('Tambah kategori', 'Add category')} open={open} onClose={() => setOpen(false)} onSave={() => form.submit()} saving={saving}><Form form={form} layout="vertical" disabled={saving} scrollToFirstError onFinish={(values) => void submit(values)}><Form.Item name="name" label={tr('Nama', 'Name')} rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="sortOrder" label={tr('Urutan', 'Order')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Form></ContentFormDrawer></>; }
