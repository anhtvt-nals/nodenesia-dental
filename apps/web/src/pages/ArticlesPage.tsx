import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getArticles } from '../lib/api';
import { Article } from '../types';
import { ArticleCard } from '../components/common/ArticleCard';
import { AppHelmet } from '../components/common/AppHelmet';

export const ArticlesPage: React.FC = () => {
  const { lang, t } = useI18n();
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

  return (
    <>
      <AppHelmet
        title={t.articles.pageTitle}
        description={t.articles.pageDesc}
        path="/artikel"
      />

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Clinical Education Journal' : 'Jurnal Edukasi Klinis'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.articles.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.articles.pageDesc}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-border scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCat(cat.key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCat === cat.key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-bg-card text-text-muted border-border hover:border-primary/40 hover:text-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
