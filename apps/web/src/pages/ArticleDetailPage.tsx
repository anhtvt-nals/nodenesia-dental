import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getArticle } from '../lib/api';
import { Article } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, localePath } = useI18n();

  const [article, setArticle] = useState<Article | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const data = await getArticle(slug);
      setArticle(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-[#14201C]/60">
        {t.common.loading}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Artikel Tidak Ditemukan</h1>
        <Link
          to={localePath('/artikel')}
          className="px-6 py-2.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider"
        >
          {t.articles.backToArticles}
        </Link>
      </div>
    );
  }

  const title = lang === 'en' ? article.titleEn : article.title;
  const content = lang === 'en' ? article.contentEn : article.content;
  const categoryName = lang === 'en' ? article.categoryNameEn : article.categoryName;

  return (
    <>
      <AppHelmet
        title={title}
        description={lang === 'en' ? article.summaryEn : article.summary}
        path={`/artikel/${article.slug}`}
      />

      <div className="py-12 md:py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              to={localePath('/artikel')}
              className="text-xs font-mono text-[#14201C]/60 hover:text-[#14201C] underline underline-offset-4"
            >
              ← {t.articles.backToArticles}
            </Link>
          </div>

          <header className="mb-8 pb-8 hairline-b">
            {/* Zero-Pill Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#1F3D36] uppercase tracking-wider mb-4">
              <span>{categoryName}</span>
              <span aria-hidden="true">·</span>
              <span>{article.readTime}</span>
              <span aria-hidden="true">·</span>
              <span>{article.publishedAt}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight leading-tight mb-6 text-balance">
              {title}
            </h1>

            <div className="flex items-center justify-between gap-4 text-xs font-mono text-[#14201C]/70 pt-4 hairline-t">
              <div>
                <span className="text-[#14201C]/50 block">Ditinjau oleh medis:</span>
                <span className="font-medium text-[#14201C]">{article.authorName} ({article.authorTitle})</span>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="px-3 py-1.5 hairline-border bg-[#E9E4D8]/50 hover:bg-[#E9E4D8] transition-colors whitespace-nowrap"
              >
                {copied ? t.articles.copiedAlert : t.articles.shareArticle}
              </button>
            </div>
          </header>

          {/* Article Body */}
          <div className="prose max-w-none text-[#14201C]/85 font-sans text-base leading-relaxed space-y-6">
            {content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Consultation CTA */}
          <div className="mt-12 p-8 hairline-border bg-[#E9E4D8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl text-[#14201C] mb-1">
                Ingin berkonsultasi mengenai keluhan gigi Anda?
              </h3>
              <p className="text-xs font-mono text-[#14201C]/70">
                Jadwalkan pemeriksaan klinis bersama dokter kami
              </p>
            </div>
            <Link
              to={localePath('/booking')}
              className="px-6 py-3 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors whitespace-nowrap text-center"
            >
              Buat Janji Temu →
            </Link>
          </div>
        </article>
      </div>
    </>
  );
};
