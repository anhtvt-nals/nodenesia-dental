import React from 'react';

interface SectionLabelProps {
  number?: string;
}

/**
 * Intentionally renders nothing per anti-AI-slop rules:
 * numbered section labels ("01 / Layanan") and eyebrow labels above headings are removed.
 */
export const SectionLabel: React.FC<SectionLabelProps> = () => null;
