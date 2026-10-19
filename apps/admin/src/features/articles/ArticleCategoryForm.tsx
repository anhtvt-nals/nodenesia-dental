import { FormEvent } from 'react';
import { createArticleCategory, type ArticleCategory } from '../../api/admin-api';

type Props = { accessToken: string; onCreated: (category: ArticleCategory) => void; onError: (message: string) => void };

export function ArticleCategoryForm({ accessToken, onCreated, onError }: Props) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const category = await createArticleCategory(accessToken, { name: String(form.get('name')), slug: String(form.get('slug')), sortOrder: Number(form.get('sortOrder')) });
      event.currentTarget.reset();
      onCreated(category);
    } catch (error) { onError((error as Error).message); }
  }
  return <form onSubmit={submit}><h3>Thêm danh mục</h3><label>Tên<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9-]+" required /></label><label>Thứ tự<input name="sortOrder" type="number" min="0" defaultValue="0" required /></label><button>Thêm danh mục</button></form>;
}
