import { updateArticle, type Article, type ArticleCategory } from '../../api/admin-api';
import { ArticleCategoryForm } from './ArticleCategoryForm';
import { ArticleEditor } from './ArticleEditor';

type Props = { accessToken: string; articles: Article[]; categories: ArticleCategory[]; onArticlesChanged: (articles: Article[]) => void; onCategoriesChanged: (categories: ArticleCategory[]) => void; onError: (message: string) => void };

export function ArticleManager({ accessToken, articles, categories, onArticlesChanged, onCategoriesChanged, onError }: Props) {
  async function toggle(article: Article) {
    try {
      const updated = await updateArticle(accessToken, article.id, { publishedAt: article.publishedAt ? null : new Date().toISOString() });
      onArticlesChanged(articles.map((item) => item.id === article.id ? updated : item));
    } catch (error) { onError((error as Error).message); }
  }
  return <section aria-labelledby="articles-heading"><h2 id="articles-heading">Bài viết</h2><table><thead><tr><th>Tiêu đề</th><th>Danh mục</th><th>Public</th></tr></thead><tbody>{articles.map((article) => <tr key={article.id}><td>{article.title}</td><td>{article.category?.name ?? '—'}</td><td><button type="button" onClick={() => void toggle(article)}>{article.publishedAt ? 'Đang hiển thị' : 'Bản nháp'}</button></td></tr>)}</tbody></table><ArticleCategoryForm accessToken={accessToken} onCreated={(category) => onCategoriesChanged([...categories, category])} onError={onError} /><ArticleEditor accessToken={accessToken} categories={categories} onCreated={(article) => onArticlesChanged([...articles, article])} onError={onError} /></section>;
}
