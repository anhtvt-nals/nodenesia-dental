import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import {
  createArticleCategory,
  deleteArticleCategory,
  type ArticleCategory,
} from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  categories: ArticleCategory[];
  onChanged: (categories: ArticleCategory[]) => void;
  onError: (message: string) => void;
};

type CategoryInput = { name: string; slug: string; sortOrder: number };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function ArticleCategoryForm({ accessToken, categories, onChanged, onError }: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<CategoryInput>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const watchedName = Form.useWatch('name', form);

  const handleAutoSlug = () => {
    if (!watchedName) return;
    form.setFieldValue('slug', slugify(watchedName));
  };

  async function submit(values: CategoryInput) {
    setSaving(true);
    try {
      const created = await createArticleCategory(accessToken, values);
      onChanged([...categories, created]);
      form.resetFields();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteArticleCategory(accessToken, id);
      onChanged(categories.filter((c) => c.id !== id));
    } catch (error) {
      onError((error as Error).message);
    }
  }

  return (
    <>
      <Button icon={<FolderOutlined />} onClick={() => setOpen(true)}>
        {tr('Kelola Kategori', 'Manage Categories')} ({categories.length})
      </Button>

      <Drawer
        title={tr('Kelola Kategori Artikel', 'Article Categories')}
        open={open}
        onClose={() => setOpen(false)}
        width={680}
      >
        <Card
          size="small"
          title={
            <Space>
              <PlusOutlined />
              <span>{tr('Tambah kategori baru', 'Add New Category')}</span>
            </Space>
          }
          style={{ marginBottom: 24, background: 'var(--color-bg)' }}
        >
          <Form
            form={form}
            layout="vertical"
            disabled={saving}
            onFinish={(values) => void submit(values)}
            initialValues={{ sortOrder: 0 }}
          >
            <Row gutter={12}>
              <Col xs={24} sm={10}>
                <Form.Item
                  name="name"
                  label={tr('Nama kategori', 'Name')}
                  rules={[{ required: true, message: tr('Nama kategori wajib diisi', 'Name is required') }]}
                >
                  <Input placeholder={tr('Contoh: Perawatan Gigi', 'e.g. Oral Care')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="slug"
                  label={
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <span>Slug</span>
                      <Button
                        type="link"
                        size="small"
                        onClick={handleAutoSlug}
                        style={{ padding: 0, height: 'auto', fontSize: 11 }}
                      >
                        {tr('Buat otomatis', 'Auto-generate')}
                      </Button>
                    </Space>
                  }
                  rules={[
                    { required: true, message: tr('Slug wajib diisi', 'Slug is required') },
                    { pattern: /^[a-z0-9-]+$/, message: tr('Hanya huruf kecil, angka, dan tanda hubung', 'Alphanumeric with dashes') },
                  ]}
                >
                  <Input placeholder="perawatan-gigi" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item name="sortOrder" label={tr('Urutan', 'Sort')}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={saving} icon={<PlusOutlined />}>
              {tr('Simpan Kategori', 'Save Category')}
            </Button>
          </Form>
        </Card>

        <div>
          <Typography.Title level={5} style={{ marginBottom: 12 }}>
            {tr('Daftar kategori saat ini', 'Existing Categories')} ({categories.length})
          </Typography.Title>
          <Table
            rowKey="id"
            dataSource={categories}
            pagination={false}
            size="small"
            locale={{ emptyText: <Empty description={tr('Belum ada kategori', 'No categories yet')} /> }}
            columns={[
              {
                title: tr('Nama kategori', 'Category Name'),
                render: (_, cat) => (
                  <Space direction="vertical" size={1}>
                    <Typography.Text strong>{cat.name}</Typography.Text>
                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>/artikel?kategori={cat.slug}</span>
                  </Space>
                ),
              },
              {
                title: tr('Slug', 'Slug'),
                dataIndex: 'slug',
                render: (slug) => <Tag>{slug}</Tag>,
              },
              {
                title: tr('Urutan', 'Order'),
                dataIndex: 'sortOrder',
                width: 80,
              },
              {
                title: tr('Hapus', 'Delete'),
                width: 70,
                render: (_, cat) => (
                  <Popconfirm
                    title={tr('Hapus kategori ini?', 'Delete this category?')}
                    description={tr('Artikel dalam kategori ini akan menjadi tanpa kategori.', 'Articles will be unassigned.')}
                    okText={tr('Hapus', 'Delete')}
                    cancelText={tr('Batal', 'Cancel')}
                    onConfirm={() => void handleDelete(cat.id)}
                  >
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} aria-label={tr(`Hapus kategori ${cat.name}`, `Delete category ${cat.name}`)} />
                  </Popconfirm>
                ),
              },
            ]}
          />
        </div>
      </Drawer>
    </>
  );
}
