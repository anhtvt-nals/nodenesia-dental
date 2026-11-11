import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getArticles } from '../lib/api';
import { Article } from '../types';
import { ArticleCard } from '../components/common/ArticleCard';
import { AppHelmet } from '../components/common/AppHelmet';
import { Link } from 'react-router-dom';

export const ArticlesPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getArticles();
      setArticles(data);
      setLoading(false);
    }
    load();
  }, []);

  const categories = [
    { key: 'all', label: t.articles.allCategory },
    { key: 'kesehatan-gigi', label: 'Kesehatan Gigi' },
    { key: 'ortodonti', label: 'Ortodonti' },
    { key: 'estetik', label: 'Estetik' },
    { key: 'anak', label: 'Gigi Anak' },
  ];

  const filtered = selectedCat === 'all'
    ? articles
    : articles.filter((a) => a.category === selectedCat);

  const featured = articles[0];

  return (
    <>
      <AppHelmet
        title={t.articles.pageTitle}
        description={t.articles.pageDesc}
        path="/artikel"
      />

      <PageHeader title={t.articles.pageTitle} description={t.articles.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Featured Clinical Journal Highlight */}
          {!loading && selectedCat === 'all' && featured && (
            <div className="mb-12 p-6 sm:p-8 lg:p-10 rounded-2xl bg-secondary text-surface shadow-floating relative overflow-hidden">
              <div className="max-w-3xl space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface/10 text-accent border border-surface/15">
                    {lang === 'en' ? 'Clinical Journal' : 'Jurnal Edukasi Pilihan'}
                  </span>
                  <span className="text-xs text-surface/60 font-medium">
                    {featured.readTime}
                  </span>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-surface">
                  <Link to={localePath(`/artikel/${featured.slug}`)} className="hover:text-accent transition-colors">
                    {lang === 'en' ? featured.titleEn : featured.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-surface/80 leading-relaxed max-w-2xl line-clamp-2">
                  {lang === 'en' ? featured.summaryEn : featured.summary}
                </p>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <span className="text-xs text-surface/70">
                    Oleh <strong className="text-surface font-semibold">{featured.authorName}</strong> ({featured.authorTitle})
                  </span>
                  <Link
                    to={localePath(`/artikel/${featured.slug}`)}
                    className="btn-whatsapp text-xs py-2 px-4 cursor-pointer shrink-0"
                  >
                    <span>{lang === 'en' ? 'Read Article' : 'Baca Selengkapnya'}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-border scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCat(cat.key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCat === cat.key
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface text-secondary border-border hover:border-primary/40 hover:bg-bg-alt'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-20 text-center text-sm font-medium text-text-muted flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <span>{t.common.loading}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};
