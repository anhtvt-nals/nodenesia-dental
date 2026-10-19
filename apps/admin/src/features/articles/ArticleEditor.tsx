import { FormEvent } from 'react';
import { createArticle, type Article, type ArticleCategory } from '../../api/admin-api';

type Props = { accessToken: string; categories: ArticleCategory[]; onCreated: (article: Article) => void; onError: (message: string) => void };

export function ArticleEditor({ accessToken, categories, onCreated, onError }: Props) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const publishedAt = String(form.get('publishedAt'));
      const article = await createArticle(accessToken, { slug: String(form.get('slug')), title: String(form.get('title')), excerpt: String(form.get('excerpt')), body: String(form.get('body')), categoryId: String(form.get('categoryId')) || null, coverUrl: String(form.get('coverUrl')) || null, seoTitle: String(form.get('seoTitle')) || null, seoDesc: String(form.get('seoDesc')) || null, publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null });
      event.currentTarget.reset();
      onCreated(article);
    } catch (error) { onError((error as Error).message); }
  }
  return <form onSubmit={submit}><h3>Bài viết mới</h3><label>Tiêu đề<input name="title" required /></label><label>Slug<input name="slug" pattern="[a-z0-9-]+" required /></label><label>Danh mục<select name="categoryId"><option value="">Chưa phân loại</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Tóm tắt<textarea name="excerpt" maxLength={500} required /></label><label>Nội dung<textarea name="body" maxLength={50000} required /></label><label>Ảnh bìa URL<input name="coverUrl" type="url" /></label><label>SEO title<input name="seoTitle" maxLength={240} /></label><label>SEO description<textarea name="seoDesc" maxLength={500} /></label><label>Xuất bản lúc (để trống là bản nháp)<input name="publishedAt" type="datetime-local" /></label><button>Lưu bài viết</button></form>;
}
