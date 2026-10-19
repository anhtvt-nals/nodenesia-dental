import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '../../i18n';

interface AppHelmetProps {
  title: string;
  description: string;
  path?: string;
  jsonLd?: Record<string, any>;
}

export const AppHelmet: React.FC<AppHelmetProps> = ({
  title,
  description,
  path = '',
  jsonLd,
}) => {
  const { lang, t } = useI18n();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://klinikgigi.id';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Normalized path without /en prefix
  const rawPath = cleanPath.replace(/^\/en/, '') || '/';
  const idUrl = `${baseUrl}${rawPath === '/' ? '' : rawPath}`;
  const enUrl = `${baseUrl}/en${rawPath === '/' ? '' : rawPath}`;

  const currentUrl = lang === 'en' ? enUrl : idUrl;
  const fullTitle = `${title} | ${t.brandName}`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />

      {/* Canonical & Hreflang */}
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hrefLang="id" href={idUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={idUrl} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
