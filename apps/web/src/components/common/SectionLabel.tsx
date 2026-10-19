import React from 'react';

interface SectionLabelProps {
  number: string;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ number, className = '' }) => {
  return (
    <div className={`font-mono text-xs tracking-wider uppercase text-[#14201C]/60 mb-3 select-none ${className}`}>
      {number}
    </div>
  );
};
