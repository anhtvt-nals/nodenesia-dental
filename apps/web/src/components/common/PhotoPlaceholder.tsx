import React from 'react';

interface PhotoPlaceholderProps {
  label?: string;
  sublabel?: string;
  aspect?: '16:9' | '4:3' | '1:1' | '3:4' | '2:1';
  className?: string;
}

export const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  label = '[FOTO]',
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
      className={`w-full ${aspectClass} bg-[#E9E4D8] hairline-border flex flex-col items-center justify-center p-4 text-center select-none text-[#14201C]/50 ${className}`}
      role="img"
      aria-label={label}
    >
      <span className="font-mono text-xs tracking-widest uppercase font-medium">
        {label}
      </span>
      {sublabel && (
        <span className="text-[11px] font-sans mt-1 text-[#14201C]/40">
          {sublabel}
        </span>
      )}
    </div>
  );
};
