import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  LinkOutlined,
  PictureOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminPageHeader, AdminTable } from '../../components/ui';
import { useMemo, useState } from 'react';
import {
  deleteArticle,
  updateArticle,
  type Article,
  type ArticleCategory,
  type ServerPagination,
} from '../../api/admin-api';
import { ArticleCategoryForm } from './ArticleCategoryForm';
import { ArticleEditor } from './ArticleEditor';
import { formatDateTime, tr, useAdminTranslation } from '../../i18n';

type Props = {
  accessToken: string;
  articles: Article[];
  categories: ArticleCategory[];
  onArticlesChanged: (articles: Article[]) => void;
  onCategoriesChanged: (categories: ArticleCategory[]) => void;
  onError: (message: string) => void;
  pagination?: ServerPagination;
};

export function ArticleManager({
  accessToken,
  articles,
  categories,
  onArticlesChanged,
  onCategoriesChanged,
  onError,
  pagination,
}: Props) {
  useAdminTranslation();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Stats
  const publishedCount = articles.filter((a) => Boolean(a.publishedAt)).length;
  const draftCount = articles.length - publishedCount;

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Search text filter
      if (searchText.trim()) {
        const query = searchText.toLowerCase();
        const matchTitle = article.title.toLowerCase().includes(query);
        const matchSlug = article.slug.toLowerCase().includes(query);
        const matchExcerpt = article.excerpt?.toLowerCase().includes(query);
        if (!matchTitle && !matchSlug && !matchExcerpt) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (article.categoryId !== selectedCategory) return false;
      }

      // Status filter
      if (statusFilter === 'published') {
        if (!article.publishedAt) return false;
      } else if (statusFilter === 'draft') {
        if (article.publishedAt) return false;
      }

      return true;
    });
  }, [articles, searchText, selectedCategory, statusFilter]);

  async function togglePublish(article: Article) {
    try {
      const nextPublishedAt = article.publishedAt ? null : new Date().toISOString();
      const updated = await updateArticle(accessToken, article.id, {
        publishedAt: nextPublishedAt,
      });
      onArticlesChanged(
        articles.map((item) => (item.id === article.id ? { ...item, ...updated } : item)),
      );
    } catch (error) {
      onError((error as Error).message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteArticle(accessToken, id);
      onArticlesChanged(articles.filter((a) => a.id !== id));
    } catch (error) {
      onError((error as Error).message);
    }
  }

  const handleArticleSaved = (saved: Article) => {
    const exists = articles.some((a) => a.id === saved.id);
    if (exists) {
      onArticlesChanged(articles.map((a) => (a.id === saved.id ? saved : a)));
    } else {
      onArticlesChanged([saved, ...articles]);
    }
  };

  const columns: ColumnsType<Article> = [
    {
      title: tr('Artikel & Berita', 'Article & Content'),
      width: 380,
      render: (_, article) => {
        const readMinutes = Math.max(
          1,
          Math.ceil((article.body?.split(/\s+/).filter(Boolean).length || 0) / 180),
        );
        return (
          <Space orientation="horizontal" align="start" size={14} style={{ width: '100%' }}>
            {article.coverUrl ? (
              <img
                src={article.coverUrl}
                alt={article.title}
                style={{
                  width: 72,
                  height: 48,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  flexShrink: 0,
                }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 48,
                  borderRadius: 8,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-muted)',
                  flexShrink: 0,
                }}
              >
                <PictureOutlined style={{ fontSize: 20 }} />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <Typography.Text strong style={{ fontSize: 14, color: 'var(--color-primary)', display: 'block' }}>
                {article.title}
              </Typography.Text>
              <Space size={6} wrap style={{ marginTop: 2 }}>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>/artikel/{article.slug}</span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>· ~{readMinutes} {tr('mnt baca', 'min read')}</span>
              </Space>
              {article.excerpt && (
                <Typography.Text
                  type="secondary"
                  ellipsis
                  style={{ fontSize: 12, marginTop: 4, display: 'block', maxWidth: 320 }}
                >
                  {article.excerpt}
                </Typography.Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: tr('Kategori', 'Category'),
      width: 160,
      render: (_, article) => (
        <Tag className="admin-tag admin-tag--info">
          {article.category?.name ?? tr('Umum', 'General')}
        </Tag>
      ),
    },
    {
      title: tr('Status Publikasi', 'Publication Status'),
      width: 200,
      render: (_, article) => {
        const isPublished = Boolean(article.publishedAt);
        return (
          <Space direction="vertical" size={4}>
            <Space size={8}>
              <Switch
                size="small"
                checked={isPublished}
                onChange={() => void togglePublish(article)}
              />
              <Tag className={`admin-tag ${isPublished ? 'admin-tag--success' : 'admin-tag--neutral'}`}>
                {isPublished ? tr('Dipublikasikan', 'Published') : tr('Draf', 'Draft')}
              </Tag>
            </Space>
            {article.publishedAt && (
              <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                {formatDateTime(article.publishedAt)}
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: tr('Aksi', 'Actions'),
      width: 140,
      render: (_, article) => (
        <Space size={4}>
          <ArticleEditor
            accessToken={accessToken}
            categories={categories}
            article={article}
            onSaved={handleArticleSaved}
            onError={onError}
          />

          <Tooltip title={tr('Lihat di situs web', 'View live article')}>
            <Button
              type="text"
              size="small"
              icon={<LinkOutlined />}
              aria-label={tr(`Lihat artikel ${article.title}`, `View article ${article.title}`)}
              onClick={() => window.open(`/artikel/${article.slug}`, '_blank')}
            />
          </Tooltip>

          <Popconfirm
            title={tr('Hapus artikel ini?', 'Delete this article?')}
            description={tr('Artikel akan dihapus permanen dari sistem.', 'This cannot be undone.')}
            okText={tr('Hapus', 'Delete')}
            cancelText={tr('Batal', 'Cancel')}
            onConfirm={() => void handleDelete(article.id)}
          >
            <Tooltip title={tr('Hapus artikel', 'Delete article')}>
              <Button type="text" danger size="small" icon={<DeleteOutlined />} aria-label={tr(`Hapus artikel ${article.title}`, `Delete article ${article.title}`)} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section aria-labelledby="articles-heading" className="data-section">
      <AdminPageHeader
        title={tr('Artikel & Edukasi Gigi', 'Articles & Oral Health')}
        description={tr(
          'Kelola berita klinik, artikel edukasi pasien, kategori, dan pengaturan SEO.',
          'Manage clinic news, patient education articles, categories, and SEO settings.',
        )}
        meta={`${articles.length} ${tr('artikel', 'articles')}`}
        actions={
          <Space wrap>
            <ArticleCategoryForm
              accessToken={accessToken}
              categories={categories}
              onChanged={onCategoriesChanged}
              onError={onError}
            />
            <ArticleEditor
              accessToken={accessToken}
              categories={categories}
              onSaved={handleArticleSaved}
              onError={onError}
            />
          </Space>
        }
      />

      <Row className="article-stats" gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title={tr('Total Artikel', 'Total Articles')}
              value={articles.length}
              prefix={<FileTextOutlined style={{ color: 'var(--brand-700)' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title={tr('Dipublikasikan', 'Published Articles')}
              value={publishedCount}
              valueStyle={{ color: 'var(--brand-700)' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic
              title={tr('Draf', 'Draft Articles')}
              value={draftCount}
              valueStyle={{ color: 'var(--neutral-600)' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="article-filter-card"
        size="small"
        style={{
          marginBottom: 16,
          background: 'var(--color-bg)',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--color-muted)' }} />}
              placeholder={tr('Cari judul, slug, atau ringkasan...', 'Search by title, slug, excerpt...')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={7}>
            <Select
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: 'all', label: tr('Semua Kategori', 'All Categories') },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Col>
          <Col xs={12} md={7}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: tr('Semua Status', 'All Statuses') },
                { value: 'published', label: tr('Dipublikasikan Saja', 'Published Only') },
                { value: 'draft', label: tr('Draf Saja', 'Drafts Only') },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <AdminTable<Article>
        rowKey="id"
        columns={columns}
        dataSource={filteredArticles}
        emptyTitle={searchText || selectedCategory !== 'all' || statusFilter !== 'all'
          ? tr('Tidak ada artikel yang sesuai filter', 'No articles match the filter')
          : tr('Belum ada artikel', 'No articles yet')}
        pagination={pagination ? {
          ...pagination,
          showSizeChanger: false,
          showTotal: (total, range) =>
            tr(
              `${range[0]}-${range[1]} dari ${total} artikel`,
              `${range[0]}-${range[1]} of ${total} articles`,
            ),
        } : {
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) =>
            tr(
              `Menampilkan ${range[0]}-${range[1]} dari ${total} artikel`,
              `Showing ${range[0]}-${range[1]} of ${total} articles`,
            ),
        }}
        renderMobileCard={(article) => {
          const isPublished = Boolean(article.publishedAt);
          const readMinutes = Math.max(1, Math.ceil((article.body?.split(/\s+/).filter(Boolean).length || 0) / 180));
          return (
            <article className="admin-mobile-card article-mobile-card">
              <div className="admin-mobile-card__top">
                <div className="article-mobile-card__identity">
                  {article.coverUrl ? (
                    <img className="article-mobile-card__cover" src={article.coverUrl} alt="" />
                  ) : (
                    <span className="article-mobile-card__placeholder" aria-hidden="true"><PictureOutlined /></span>
                  )}
                  <div>
                    <strong>{article.title}</strong>
                    <span className="article-mobile-card__slug">/artikel/{article.slug}</span>
                  </div>
                </div>
                <Switch
                  checked={isPublished}
                  aria-label={tr(`Ubah status ${article.title}`, `Change status for ${article.title}`)}
                  onChange={() => void togglePublish(article)}
                />
              </div>
              <div className="article-mobile-card__meta">
                <Tag className="admin-tag admin-tag--info">{article.category?.name ?? tr('Umum', 'General')}</Tag>
                <span>~{readMinutes} {tr('mnt baca', 'min read')}</span>
                <Tag className={`admin-tag ${isPublished ? 'admin-tag--success' : 'admin-tag--neutral'}`}>
                  {isPublished ? tr('Dipublikasikan', 'Published') : tr('Draf', 'Draft')}
                </Tag>
              </div>
              {article.excerpt && <p className="article-mobile-card__excerpt">{article.excerpt}</p>}
              <div className="admin-mobile-card__actions article-mobile-card__actions">
                <ArticleEditor
                  accessToken={accessToken}
                  categories={categories}
                  article={article}
                  onSaved={handleArticleSaved}
                  onError={onError}
                  trigger={<Button icon={<EditOutlined />}>{tr('Sunting', 'Edit')}</Button>}
                />
                <Button icon={<LinkOutlined />} onClick={() => window.open(`/artikel/${article.slug}`, '_blank')}>
                  {tr('Lihat', 'View')}
                </Button>
                <Popconfirm
                  title={tr('Hapus artikel ini?', 'Delete this article?')}
                  description={tr('Artikel akan dihapus permanen dari sistem.', 'This cannot be undone.')}
                  okText={tr('Hapus', 'Delete')}
                  cancelText={tr('Batal', 'Cancel')}
                  onConfirm={() => void handleDelete(article.id)}
                >
                  <Button danger icon={<DeleteOutlined />} aria-label={tr(`Hapus artikel ${article.title}`, `Delete article ${article.title}`)} />
                </Popconfirm>
              </div>
            </article>
          );
        }}
      />
    </section>
  );
}
