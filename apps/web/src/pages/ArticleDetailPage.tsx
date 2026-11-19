import { PageHeader } from '../components/common/PageHeader';
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-text-muted">{t.common.loading}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-card">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-secondary mb-4">
            {lang === 'en' ? 'Article Not Found' : 'Artikel Tidak Ditemukan'}
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

      <PageHeader title={title} description={lang === 'en' ? article.summaryEn : article.summary} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
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

          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-10 shadow-card">
            <header className="mb-8 pb-6 border-b border-border">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-text-muted mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {categoryName}
                </span>
                <span aria-hidden="true">·</span>
                <span>{article.readTime}</span>
                <span aria-hidden="true">·</span>
                <span>{article.publishedAt}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-4 border-t border-border">
                <div>
                  <span className="text-text-muted block text-[11px]">Ditinjau oleh medis:</span>
                  <span className="font-bold text-secondary text-sm">{article.authorName} ({article.authorTitle})</span>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-secondary text-xs sm:text-sm py-2.5 px-4 cursor-pointer min-h-[44px] active:scale-95"
                >
                  {copied ? t.articles.copiedAlert : t.articles.shareArticle}
                </button>
              </div>
            </header>

            {/* Article Content */}
            {content.some((block) => /<[a-z][\s\S]*>/i.test(block)) ? (
              <div
                className="prose max-w-none text-text text-base sm:text-lg leading-relaxed space-y-6 [&_img]:rounded-xl [&_img]:max-w-full [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-secondary [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-secondary [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                dangerouslySetInnerHTML={{ __html: content.join('\n') }}
              />
            ) : (
              <div className="prose max-w-none text-text text-base sm:text-lg leading-relaxed space-y-6">
                {content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* In-Article Consultation CTA */}
            <div className="mt-12 p-5 sm:p-8 rounded-2xl bg-bg-alt/70 border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary">
                  {lang === 'en'
                    ? 'Have specific questions about your dental health?'
                    : 'Ingin berkonsultasi mengenai keluhan gigi Anda?'}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted">
                  {lang === 'en'
                    ? 'Schedule a digital exam and consultation with our dental team.'
                    : 'Jadwalkan pemeriksaan klinis bersama dokter kami'}
                </p>
              </div>
              <Link
                to={localePath('/booking')}
                className="btn-primary text-sm py-3.5 px-7 whitespace-nowrap justify-center cursor-pointer shadow-soft shrink-0 w-full sm:w-auto min-h-[48px] active:scale-[0.98] flex items-center"
              >
                <span>{lang === 'en' ? 'Book Appointment' : 'Buat Janji Temu'}</span>
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};
