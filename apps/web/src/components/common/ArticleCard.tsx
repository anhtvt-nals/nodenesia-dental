import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { useI18n } from '../../i18n';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { lang, t, localePath } = useI18n();
  const title = lang === 'en' ? article.titleEn : article.title;
  const summary = lang === 'en' ? article.summaryEn : article.summary;
  const categoryName = lang === 'en' ? article.categoryNameEn : article.categoryName;

  return (
    <article className="py-6 border-b border-border flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-text-muted mb-2">
          <span className="font-medium">{categoryName}</span>
          <span>{article.readTime}</span>
        </div>

        <h3 className="font-heading text-xl font-bold text-text mb-2 leading-snug">
          <Link to={localePath(`/artikel/${article.slug}`)} className="hover:text-primary transition-colors">
            {title}
          </Link>
        </h3>
        <p className="text-sm text-text-muted leading-relaxed mb-4">
          {summary}
        </p>
      </div>

      <div className="pt-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-text-muted font-medium truncate">
          {article.authorName}
        </span>
        <Link
          to={localePath(`/artikel/${article.slug}`)}
          className="text-sm text-primary font-semibold hover:underline underline-offset-4 shrink-0"
        >
          {t.common.moreDetail}
        </Link>
      </div>
    </article>
  );
};
