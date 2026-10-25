import React from 'react';

interface BrandLogoProps {
  className?: string;
  /** Accessible clinic name (rendered as <title> for screen readers). */
  title: string;
}

/**
 * Compact brand logo: heart mark + two-line wordmark in a single SVG.
 * Fixed intrinsic size keeps the navbar width identical in ID and EN.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', title }) => (
  <svg
    className={className}
    viewBox="0 0 165 40"
    role="img"
    aria-label={title}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{title}</title>
    <rect width="38" height="38" y="1" rx="10" fill="var(--color-primary)" />
    <path
      d="M19 28.5c-.4 0-.8-.15-1.1-.4C13.6 24.6 10.5 21.7 10.5 18.2c0-2.6 1.9-4.5 4.3-4.5 1.6 0 3.1.9 4.2 2.4 1.1-1.5 2.6-2.4 4.2-2.4 2.4 0 4.3 1.9 4.3 4.5 0 3.5-3.1 6.4-7.4 9.9-.3.25-.7.4-1.1.4z"
      fill="none"
      stroke="var(--color-bg)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <text
      x="48"
      y="18"
      fontFamily="var(--font-heading)"
      fontSize="15.5"
      fontWeight="700"
      fill="var(--color-text)"
    >
      Klinik Gigi
    </text>
    <text
      x="48"
      y="32"
      fontFamily="var(--font-body)"
      fontSize="11.5"
      fontWeight="500"
      fill="var(--color-text-muted)"
    >
      Senyum Sehat
    </text>
  </svg>
);
