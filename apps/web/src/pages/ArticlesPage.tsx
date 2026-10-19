import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getArticles } from '../lib/api';
import { Article } from '../types';
import { ArticleCard } from '../components/common/ArticleCard';
import { AppHelmet } from '../components/common/AppHelmet';

export const ArticlesPage: React.FC = () => {
  const { t } = useI18n();
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

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Jurnal Edukasi Klinis
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.articles.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.articles.pageDesc}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 hairline-b scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCat(cat.key)}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-colors whitespace-nowrap hairline-border ${
                  selectedCat === cat.key
                    ? 'bg-[#14201C] text-[#F4F1EA] border-[#14201C] font-medium'
                    : 'bg-[#F4F1EA] text-[#14201C]/70 hover:bg-[#E9E4D8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
