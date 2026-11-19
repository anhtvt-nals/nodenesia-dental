import { ContentFormDrawer } from '../content/ContentFormDrawer';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { AdminImageUpload } from '../../components/ui';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Image as CKImage,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  Underline,
  Undo,
  type Editor,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createArticle,
  updateArticle,
  uploadGalleryImage,
  type Article,
  type ArticleCategory,
} from '../../api/admin-api';
import { tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  categories: ArticleCategory[];
  article?: Article; // When provided, works in Edit mode; otherwise Create mode
  trigger?: React.ReactNode;
  onSaved: (article: Article) => void;
  onError: (message: string) => void;
};

type ArticleInput = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  categoryId?: string;
  coverUrl?: string;
  seoTitle?: string;
  seoDesc?: string;
  publishedAt?: string;
};

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

function createR2UploadPlugin(
  onUploadImage: (file: File) => Promise<string>,
  onUploadError?: (message: string) => void,
) {
  return function R2UploadAdapterPlugin(editor: Editor) {
    const fileRepository = editor.plugins.get('FileRepository');

    fileRepository.createUploadAdapter = (loader) => ({
      upload: async () => {
        const file = await loader.file;
        if (!file) {
          throw new Error(tr('File gambar tidak ditemukan.', 'Image file not found.'));
        }
        try {
          const url = await onUploadImage(file);
          return { default: url };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          onUploadError?.(message);
          throw error;
        }
      },
      abort: () => {},
    });
  };
}

function CKEditorField({
  value = '',
  onChange,
  onUploadImage,
  onUploadError,
  disabled,
  placeholder,
}: {
  value?: string;
  onChange?: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onUploadError?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const editorConfig = useMemo(
    () => ({
      licenseKey: 'GPL',
      plugins: [
        Essentials,
        Paragraph,
        Heading,
        Bold,
        Italic,
        Underline,
        Link,
        List,
        BlockQuote,
        CKImage,
        ImageCaption,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        ImageResize,
        Undo,
      ],
      extraPlugins: [createR2UploadPlugin(onUploadImage, onUploadError)],
      toolbar: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        '|',
        'link',
        'uploadImage',
        'bulletedList',
        'numberedList',
        'blockQuote',
      ],
      image: {
        toolbar: [
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
          '|',
          'toggleImageCaption',
          'imageTextAlternative',
        ],
      },
      placeholder,
    }),
    [onUploadImage, onUploadError, placeholder],
  );

  return (
    <div className="article-ckeditor">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        disabled={disabled}
        config={editorConfig}
        onChange={(_, editor) => {
          onChange?.(editor.getData());
        }}
      />
    </div>
  );
}

export function ArticleEditor({
  accessToken,
  categories,
  article,
  trigger,
  onSaved,
  onError,
}: Props) {
  useAdminTranslation();
  const [form] = Form.useForm<ArticleInput>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [publishMode, setPublishMode] = useState<'published' | 'draft'>('published');

  // Watch form fields for live previews & stats
  const watchedTitle = Form.useWatch('title', form) || '';
  const watchedSlug = Form.useWatch('slug', form) || '';
  const watchedBody = Form.useWatch('body', form) || '';
  const watchedExcerpt = Form.useWatch('excerpt', form) || '';
  const watchedCover = Form.useWatch('coverUrl', form) || '';
  const watchedCategory = Form.useWatch('categoryId', form);
  const watchedSeoTitle = Form.useWatch('seoTitle', form) || '';
  const watchedSeoDesc = Form.useWatch('seoDesc', form) || '';

  const isEdit = Boolean(article);

  const handleEditorImageUpload = useCallback(
    (file: File) => uploadGalleryImage(accessToken, file),
    [accessToken],
  );

  // Calculate live word count & reading time (strip HTML tags from CKEditor)
  const stats = useMemo(() => {
    const plain = watchedBody.replace(/<[^>]+>/g, ' ').trim();
    if (!plain) return { words: 0, characters: 0, readMinutes: 1 };
    const words = plain.split(/\s+/).filter(Boolean).length;
    const characters = plain.length;
    const readMinutes = Math.max(1, Math.ceil(words / 180));
    return { words, characters, readMinutes };
  }, [watchedBody]);

  // Sync form values on open
  useEffect(() => {
    if (open) {
      if (article) {
        form.setFieldsValue({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          body: article.body,
          categoryId: article.categoryId || undefined,
          coverUrl: article.coverUrl || '',
          seoTitle: article.seoTitle || '',
          seoDesc: article.seoDesc || '',
          publishedAt: article.publishedAt
            ? new Date(article.publishedAt).toISOString().slice(0, 16)
            : undefined,
        });
        setPublishMode(article.publishedAt ? 'published' : 'draft');
      } else {
        form.resetFields();
        setPublishMode('published');
      }
      setActiveTab('edit');
    }
  }, [article, form, open]);

  const handleAutoSlug = () => {
    if (!watchedTitle) return;
    form.setFieldValue('slug', slugify(watchedTitle));
  };

  async function submit(values: ArticleInput) {
    setSaving(true);
    try {
      let publishedAtValue: string | null = null;
      if (publishMode === 'published') {
        publishedAtValue = values.publishedAt
          ? new Date(values.publishedAt).toISOString()
          : new Date().toISOString();
      }

      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        excerpt: values.excerpt.trim(),
        body: values.body.trim(),
        categoryId: values.categoryId || null,
        coverUrl: values.coverUrl ? values.coverUrl.trim() : null,
        seoTitle: values.seoTitle ? values.seoTitle.trim() : null,
        seoDesc: values.seoDesc ? values.seoDesc.trim() : null,
        publishedAt: publishedAtValue,
      };

      let savedArticle: Article;
      if (isEdit && article) {
        savedArticle = await updateArticle(accessToken, article.id, payload);
      } else {
        savedArticle = await createArticle(accessToken, payload);
      }

      onSaved(savedArticle);
      setOpen(false);
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const selectedCategoryName =
    categories.find((c) => c.id === watchedCategory)?.name || tr('Umum', 'General');

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : isEdit ? (
        <Button
          size="small"
          type="text"
          icon={<EditOutlined />}
          onClick={() => setOpen(true)}
          title={tr('Sunting artikel', 'Edit article')}
        />
      ) : (
        <Button type="primary" icon={<FileTextOutlined />} onClick={() => setOpen(true)}>
          {tr('Tambah artikel baru', 'Add new article')}
        </Button>
      )}

      <ContentFormDrawer
        title={
          <Space>
            <span>{isEdit ? tr('Sunting Artikel', 'Edit Article') : tr('Tulis Artikel Baru', 'New Dental Article')}</span>
            {isEdit && <Tag className="admin-tag admin-tag--neutral">{article?.slug}</Tag>}
          </Space>
        }
        open={open}
        onClose={() => setOpen(false)}
        onSave={() => form.submit()}
        saving={saving}
        width={920}
      >
        <div style={{ marginBottom: 16 }}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'edit' | 'preview')}
            items={[
              {
                key: 'edit',
                label: (
                  <span>
                    <EditOutlined /> {tr('Editor', 'Editor')}
                  </span>
                ),
              },
              {
                key: 'preview',
                label: (
                  <span>
                    <EyeOutlined /> {tr('Pratinjau Langsung', 'Live Preview')}
                  </span>
                ),
              },
            ]}
          />
        </div>

        {activeTab === 'preview' ? (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '24px 32px',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {watchedCover && (
              <div style={{ marginBottom: 20, borderRadius: 10, overflow: 'hidden', maxHeight: 320 }}>
                <img
                  src={watchedCover}
                  alt={watchedTitle}
                  style={{ width: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <Space size={6} style={{ marginBottom: 12 }}>
              <Tag className="admin-tag admin-tag--info">{selectedCategoryName}</Tag>
              <span style={{ fontSize: 12, color: 'var(--neutral-600)' }}>· {stats.readMinutes} {tr('mnt baca', 'min read')}</span>
              <span style={{ fontSize: 12, color: 'var(--neutral-600)' }}>· {publishMode === 'published' ? tr('Dipublikasikan', 'Published') : tr('Draf', 'Draft')}</span>
            </Space>

            <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 12, color: 'var(--color-primary)' }}>
              {watchedTitle || tr('Judul artikel belum diisi...', 'Untitled article...')}
            </Typography.Title>

            {watchedExcerpt && (
              <p style={{ fontSize: 16, color: 'var(--color-muted)', fontStyle: 'italic', marginBottom: 24, borderLeft: '3px solid var(--color-primary)', paddingLeft: 12 }}>
                {watchedExcerpt}
              </p>
            )}

            <Divider style={{ margin: '16px 0' }} />

            {watchedBody && /<[a-z][\s\S]*>/i.test(watchedBody) ? (
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'var(--neutral-900)',
                  minHeight: 200,
                }}
                dangerouslySetInnerHTML={{ __html: watchedBody }}
              />
            ) : (
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'var(--neutral-900)',
                  whiteSpace: 'pre-wrap',
                  minHeight: 200,
                }}
              >
                {watchedBody || tr('Isi artikel akan tampil di sini...', 'Article content will be rendered here...')}
              </div>
            )}
          </div>
        ) : (
          /* Form Editor */
          <Form form={form} layout="vertical" disabled={saving} scrollToFirstError onFinish={(values) => void submit(values)}>
            <Row gutter={16}>
              <Col xs={24} md={16}>
                <Form.Item
                  name="title"
                  label={tr('Judul Artikel', 'Article title')}
                  rules={[{ required: true, message: tr('Judul artikel wajib diisi', 'Title is required') }]}
                  extra={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                        {watchedTitle.length}/240 {tr('karakter', 'chars')}
                      </span>
                      <Button
                        type="link"
                        size="small"
                        onClick={handleAutoSlug}
                        style={{ padding: 0, height: 'auto', fontSize: 12 }}
                      >
                        {tr('Buat slug otomatis', 'Generate slug')}
                      </Button>
                    </div>
                  }
                >
                  <Input placeholder={tr('Contoh: Panduan Merawat Gigi Setelah Veneer', 'e.g. Veneer Aftercare Guide')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="slug"
                  label={tr('URL Slug', 'URL Slug')}
                  rules={[
                    { required: true, message: tr('Slug wajib diisi', 'Slug is required') },
                    { pattern: /^[a-z0-9-]+$/, message: tr('Slug hanya boleh huruf kecil, angka, dan tanda hubung', 'Slug must be lower-case alphanumeric with dashes') },
                  ]}
                  extra={<span style={{ fontSize: 11, color: 'var(--color-muted)' }}>/artikel/{watchedSlug || 'slug-artikel'}</span>}
                >
                  <Input placeholder="panduan-perawatan-veneer" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="categoryId" label={tr('Kategori Artikel', 'Category')}>
                  <Select
                    allowClear
                    placeholder={tr('Pilih kategori', 'Select category')}
                    options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={tr('Status Publikasi', 'Publication status')}>
                  <Radio.Group
                    value={publishMode}
                    onChange={(e) => setPublishMode(e.target.value)}
                    buttonStyle="solid"
                    style={{ width: '100%' }}
                  >
                    <Radio.Button value="published" style={{ width: '50%', textAlign: 'center' }}>
                      <CheckCircleOutlined /> {tr('Publikasikan', 'Publish')}
                    </Radio.Button>
                    <Radio.Button value="draft" style={{ width: '50%', textAlign: 'center' }}>
                      {tr('Simpan Draf', 'Draft')}
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="coverUrl"
              label={tr('Gambar Sampul (Cover)', 'Cover image')}
              extra={tr('Unggah JPG, PNG, atau WebP maksimal 10 MB ke Cloudflare R2.', 'Upload JPG, PNG, or WebP up to 10 MB to Cloudflare R2.')}
            >
              <AdminImageUpload
                onUpload={(file) => uploadGalleryImage(accessToken, file)}
                onError={onError}
                disabled={saving}
                emptyLabel={tr('Belum ada sampul', 'No cover image')}
                uploadLabel={tr('Unggah sampul', 'Upload cover')}
                replaceLabel={tr('Ganti sampul', 'Change cover')}
              />
            </Form.Item>

            <Form.Item
              name="excerpt"
              label={tr('Ringkasan Artikel (Excerpt)', 'Article summary (Excerpt)')}
              rules={[{ required: true, message: tr('Ringkasan artikel wajib diisi', 'Summary is required') }]}
              extra={<span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{watchedExcerpt.length}/500 {tr('karakter', 'chars')}</span>}
            >
              <Input.TextArea
                rows={2}
                maxLength={500}
                placeholder={tr('Ringkasan singkat 1-2 kalimat yang menjelaskan isi artikel...', 'Brief 1-2 sentence lead...')}
              />
            </Form.Item>

            <Form.Item
              name="body"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{tr('Isi Artikel (Detail)', 'Article body')}</span>
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--neutral-600)' }}>
                    {stats.words} {tr('kata', 'words')} · ~{stats.readMinutes} {tr('mnt baca', 'min read')}
                  </span>
                </div>
              }
              rules={[{ required: true, message: tr('Isi artikel wajib diisi', 'Body is required') }]}
            >
              <CKEditorField
                disabled={saving}
                onUploadImage={handleEditorImageUpload}
                onUploadError={onError}
                placeholder={tr(
                  'Tulis isi artikel atau berita klinik di sini...',
                  'Write article or clinic news content here...',
                )}
              />
            </Form.Item>

            <Card
              size="small"
              title={
                <Space>
                  <GlobalOutlined style={{ color: 'var(--color-primary)' }} />
                  <span>{tr('Optimasi SEO & Pratinjau Google', 'Google Search / SERP Preview')}</span>
                </Space>
              }
              style={{ background: 'var(--color-bg)', marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="seoTitle" label={tr('Judul SEO (Meta Title)', 'SEO title')}>
                    <Input placeholder={watchedTitle || tr('Judul SEO yang tampil di Google', 'SEO Title')} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="seoDesc" label={tr('Deskripsi SEO (Meta Description)', 'SEO description')}>
                    <Input.TextArea rows={2} placeholder={watchedExcerpt || tr('Deskripsi singkat untuk hasil pencarian Google...', 'SEO meta description')} />
                  </Form.Item>
                </Col>
              </Row>

              <div
                style={{
                  background: '#fff',
                  border: '1px solid #dfe1e5',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: 'arial, sans-serif',
                }}
              >
                <div style={{ fontSize: 12, color: '#202124', marginBottom: 2 }}>
                  senyumsehat.id › artikel › <span style={{ color: '#5f6368' }}>{watchedSlug || 'duong-dan-bai-viet'}</span>
                </div>
                <div style={{ fontSize: 18, color: '#1a0dab', cursor: 'pointer', lineHeight: 1.3, marginBottom: 4 }}>
                  {watchedSeoTitle || watchedTitle || tr('Judul artikel yang tampil di Google Search', 'Article Title on Google Search')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.4 }}>
                  {watchedSeoDesc || watchedExcerpt || tr('Cuplikan deskripsi artikel akan tampil di sini pada hasil pencarian Google...', 'Article meta description snippet on search results...')}
                </div>
              </div>
            </Card>
          </Form>
        )}
      </ContentFormDrawer>
    </>
  );
}
