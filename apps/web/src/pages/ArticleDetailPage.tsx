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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-medium text-text-muted">
        {t.common.loading}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="trust-card p-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-4">
            Artikel Tidak Ditemukan
          </h1>
          <Link
            to={localePath('/artikel')}
            className="btn-primary text-sm cursor-pointer"
          >
            {t.articles.backToArticles}
          </Link>
        </div>
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

      <div className="py-10 md:py-16 bg-bg">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              to={localePath('/artikel')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{t.articles.backToArticles}</span>
            </Link>
          </div>

          <div className="trust-card p-6 sm:p-10 bg-bg-card">
            <header className="mb-8 pb-6 border-b border-border">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-text-muted mb-4">
                <span className="badge badge-primary">{categoryName}</span>
                <span aria-hidden="true">·</span>
                <span>{article.readTime}</span>
                <span aria-hidden="true">·</span>
                <span>{article.publishedAt}</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight leading-tight mb-6 text-balance">
                {title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-4 border-t border-border">
                <div>
                  <span className="text-text-muted block">Ditinjau oleh medis:</span>
                  <span className="font-bold text-text">{article.authorName} ({article.authorTitle})</span>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  {copied ? t.articles.copiedAlert : t.articles.shareArticle}
                </button>
              </div>
            </header>

            {/* Article Body */}
            <div className="prose max-w-none text-text-muted text-base leading-relaxed space-y-5">
              {content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Consultation CTA */}
            <div className="mt-12 p-6 rounded-xl bg-bg-alt border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-text mb-1">
                  Ingin berkonsultasi mengenai keluhan gigi Anda?
                </h3>
                <p className="text-xs sm:text-sm text-text-muted">
                  Jadwalkan pemeriksaan klinis bersama dokter kami
                </p>
              </div>
              <Link
                to={localePath('/booking')}
                className="btn-primary text-sm py-2.5 px-6 whitespace-nowrap justify-center cursor-pointer"
              >
                <span>Buat Janji Temu</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};
