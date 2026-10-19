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
    <article className="hairline-border p-6 bg-[#F4F1EA] flex flex-col justify-between h-full group hover:bg-[#E9E4D8]/30 transition-colors">
      <div>
        {/* Zero-Pill unboxed metadata discipline */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#14201C]/50 mb-3">
          <span>{categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readTime}</span>
        </div>
        <h3 className="font-serif text-xl md:text-2xl text-[#14201C] mb-3 group-hover:text-[#1F3D36] transition-colors leading-snug">
          <Link to={localePath(`/artikel/${article.slug}`)}>
            {title}
          </Link>
        </h3>
        <p className="text-sm text-[#14201C]/75 leading-relaxed line-clamp-3 mb-6">
          {summary}
        </p>
      </div>

      <div className="pt-4 hairline-t flex items-center justify-between text-xs font-mono">
        <span className="text-[#14201C]/60 truncate max-w-[200px]">
          {article.authorName}
        </span>
        <Link
          to={localePath(`/artikel/${article.slug}`)}
          className="text-[#1F3D36] hover:text-[#14201C] underline underline-offset-4 shrink-0"
        >
          {t.common.moreDetail} →
        </Link>
      </div>
    </article>
  );
};
