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
    <article className="trust-card flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-hover text-xs font-semibold">
            {categoryName}
          </span>
          <span className="text-xs text-text-muted font-medium">
            {article.readTime}
          </span>
        </div>

        <h3 className="font-heading text-xl font-bold text-text mb-3 group-hover:text-primary transition-colors leading-snug">
          <Link to={localePath(`/artikel/${article.slug}`)}>
            {title}
          </Link>
        </h3>
        <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6">
          {summary}
        </p>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
        <span className="text-text-muted font-medium truncate max-w-[200px]">
          {article.authorName}
        </span>
        <Link
          to={localePath(`/artikel/${article.slug}`)}
          className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline shrink-0"
        >
          <span>{t.common.moreDetail}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
};
