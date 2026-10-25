import React from 'react';

interface PhotoPlaceholderProps {
  label?: string;
  sublabel?: string;
  aspect?: '16:9' | '4:3' | '1:1' | '3:4' | '2:1';
  className?: string;
}

export const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  label = 'Dokumentasi Klinik',
  sublabel,
  aspect = '4:3',
  className = '',
}) => {
  const aspectClass = {
    '16:9': 'aspect-[16/9]',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
    '2:1': 'aspect-[2/1]',
  }[aspect];

  return (
    <div
      className={`w-full ${aspectClass} bg-bg-alt border border-border rounded-xl flex flex-col items-center justify-center p-5 text-center select-none text-text-muted ${className}`}
      role="img"
      aria-label={label}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3" aria-hidden="true">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span className="font-mono text-xs tracking-wider uppercase font-semibold text-text">
        {label}
      </span>
      {sublabel && (
        <span className="text-xs font-body mt-1 text-text-muted">
          {sublabel}
        </span>
      )}
    </div>
  );
};
