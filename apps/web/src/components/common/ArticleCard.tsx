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
    <article className="group bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card hover:shadow-hover hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-text-muted mb-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {categoryName}
          </span>
          <span className="inline-flex items-center gap-1 font-medium bg-bg-alt px-2.5 py-1 rounded-md text-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{article.readTime}</span>
          </span>
        </div>

        <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary group-hover:text-primary transition-colors mb-2.5 leading-snug">
          <Link to={localePath(`/artikel/${article.slug}`)}>
            {title}
          </Link>
        </h3>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3 mb-6">
          {summary}
        </p>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
        <div className="truncate">
          <span className="text-text-muted block text-[11px]">Ditinjau oleh</span>
          <span className="font-bold text-secondary truncate block">
            {article.authorName}
          </span>
        </div>
        <Link
          to={localePath(`/artikel/${article.slug}`)}
          className="inline-flex items-center gap-1 text-primary font-bold hover:text-primary-hover shrink-0"
        >
          <span>{t.common.moreDetail}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
};
