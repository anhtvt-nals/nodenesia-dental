import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Empty, Space, Switch, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { updateArticle, type Article, type ArticleCategory } from '../../api/admin-api';
import { ArticleCategoryForm } from './ArticleCategoryForm';
import { ArticleEditor } from './ArticleEditor';
import { tr, useAdminTranslation } from '../../i18n';
type Props = { accessToken: string; articles: Article[]; categories: ArticleCategory[]; onArticlesChanged: (articles: Article[]) => void; onCategoriesChanged: (categories: ArticleCategory[]) => void; onError: (message: string) => void };
export function ArticleManager({ accessToken, articles, categories, onArticlesChanged, onCategoriesChanged, onError }: Props) {
  useAdminTranslation();
  async function toggle(article: Article) { try { const updated = await updateArticle(accessToken, article.id, { publishedAt: article.publishedAt ? null : new Date().toISOString() }); onArticlesChanged(articles.map((item) => item.id === article.id ? updated : item)); } catch (error) { onError((error as Error).message); } }
  const columns: ColumnsType<Article> = [{ title: tr('Artikel', 'Article'), dataIndex: 'title' }, { title: tr('Kategori', 'Category'), render: (_, article) => article.category?.name ?? '—' }, { title: tr('Dipublikasikan', 'Published'), width: 150, render: (_, article) => <Switch checked={Boolean(article.publishedAt)} onChange={() => void toggle(article)} /> }, { title: tr('Tindakan', 'Actions'), width: 90, render: (_, article) => <Button type="text" icon={article.publishedAt ? <EyeInvisibleOutlined /> : <EyeOutlined />} aria-label={article.publishedAt ? tr('Batalkan publikasi artikel', 'Unpublish article') : tr('Publikasikan artikel', 'Publish article')} title={article.publishedAt ? tr('Batalkan publikasi artikel', 'Unpublish article') : tr('Publikasikan artikel', 'Publish article')} onClick={() => void toggle(article)} /> }];
  return <section aria-labelledby="articles-heading"><Space className="section-heading"><Typography.Title level={2} id="articles-heading">{tr('Artikel', 'Articles')}</Typography.Title><ArticleCategoryForm accessToken={accessToken} onCreated={(category) => onCategoriesChanged([...categories, category])} onError={onError} /><ArticleEditor accessToken={accessToken} categories={categories} onCreated={(article) => onArticlesChanged([...articles, article])} onError={onError} /></Space><Table rowKey="id" columns={columns} dataSource={articles} locale={{ emptyText: <Empty description={tr('Belum ada artikel', 'No articles yet')} /> }} pagination={{ pageSize: 20, showSizeChanger: false }} /></section>;
}
