import React from 'react';

interface BrandLogoProps {
  className?: string;
  /** Accessible clinic name (rendered as <title> for screen readers). */
  title: string;
}

/**
 * Compact brand logo: boutique tooth emblem with warm gold sparkle + refined typography wordmark.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', title }) => (
  <svg
    className={className}
    viewBox="0 0 175 40"
    role="img"
    aria-label={title}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{title}</title>
    {/* Deep Emerald Emblem */}
    <rect width="38" height="38" y="1" rx="12" fill="var(--color-primary)" />
    {/* Refined Stylized Tooth Silhouette */}
    <path
      d="M19 10c-5-2.8-10.5 0-9.2 6.5 1 4.2 2 12.5 5.2 14 1.8.8 2.8-4.5 4-4.5s2.2 5.3 4 4.5c3.2-1.5 4.2-9.8 5.2-14 1.3-6.5-4.2-9.3-9.2-6.5z"
      fill="none"
      stroke="#FBF9F5"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Warm Gold Sparkle */}
    <circle cx="27" cy="10" r="1.5" fill="var(--color-accent)" />
    
    <text
      x="48"
      y="18"
      fontFamily="var(--font-heading)"
      fontSize="16"
      fontWeight="700"
      letterSpacing="-0.02em"
      fill="var(--color-text)"
    >
      Klinik Gigi
    </text>
    <text
      x="48"
      y="32"
      fontFamily="var(--font-body)"
      fontSize="12"
      fontWeight="600"
      letterSpacing="0.02em"
      fill="var(--color-accent)"
    >
      Senyum Sehat
    </text>
  </svg>
);
