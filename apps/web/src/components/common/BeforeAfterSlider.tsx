import React, { useCallback, useRef, useState } from 'react';
import { useI18n } from '../../i18n';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: '4/3' | '16/9' | 'square';
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel,
  afterLabel,
  aspectRatio = '4/3',
  className = '',
}) => {
  const { lang } = useI18n();
  const effectiveBeforeLabel = beforeLabel ?? (lang === 'en' ? 'Before' : 'Sebelum');
  const effectiveAfterLabel = afterLabel ?? (lang === 'en' ? 'After' : 'Sesudah');

  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'split'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'aspect-[4/3]';

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  if (viewMode === 'split') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>
              {lang === 'en'
                ? '↔ Switch to comparison slider'
                : '↔ Beralih ke slider perbandingan'}
            </span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className={`relative ${aspectClass} rounded-xl overflow-hidden border border-border bg-bg-alt shadow-xs`}>
              <img
                src={beforeUrl}
                alt={effectiveBeforeLabel}
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-0.75rem)] truncate whitespace-nowrap text-[9px] sm:text-[10px] leading-4 font-bold uppercase tracking-wide bg-secondary/85 backdrop-blur-xs text-white px-2 py-0.5 rounded shadow-xs">
                {effectiveBeforeLabel}
              </span>
            </div>
            <div className="text-center text-[11px] font-medium text-text-muted">
              {effectiveBeforeLabel}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className={`relative ${aspectClass} rounded-xl overflow-hidden border border-primary/30 bg-bg-alt shadow-xs`}>
              <img
                src={afterUrl}
                alt={effectiveAfterLabel}
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-0.75rem)] truncate whitespace-nowrap text-[9px] sm:text-[10px] leading-4 font-bold uppercase tracking-wide bg-primary text-white px-2 py-0.5 rounded shadow-xs">
                {effectiveAfterLabel}
              </span>
            </div>
            <div className="text-center text-[11px] font-bold text-primary">
              {effectiveAfterLabel}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs px-1">
        <span className="inline-flex items-center gap-1 font-semibold text-text-muted text-[11px]">
          <span className="w-2 h-2 rounded-full bg-secondary/70 inline-block" />
          {effectiveBeforeLabel}
        </span>
        <button
          type="button"
          onClick={() => setViewMode('split')}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer min-h-[44px] inline-flex items-center px-1"
          title={lang === 'en' ? 'View photos side-by-side' : 'Lihat foto berdampingan'}
        >
          {lang === 'en' ? '↔ Side-by-side' : '↔ Lihat berdampingan'}
        </button>
        <span className="inline-flex items-center gap-1 font-bold text-primary text-[11px]">
          {effectiveAfterLabel}
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
        </span>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden border border-border shadow-card select-none cursor-ew-resize touch-none`}
      >
        {/* Underneath: After Image */}
        <img
          src={afterUrl}
          alt={effectiveAfterLabel}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Overlay: Before Image clipped */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={beforeUrl}
            alt={effectiveBeforeLabel}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transition-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Circular Drag Handle (thumb-friendly 40px with touch target expansion) */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-secondary shadow-lg border border-border flex items-center justify-center font-bold text-xs select-none after:absolute after:-inset-2 after:content-['']">
            <svg className="w-4 h-4 text-secondary/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
            </svg>
          </div>
        </div>

        {/* Floating Badges */}
        <span className="absolute bottom-2 left-2 max-w-[42%] truncate whitespace-nowrap text-[10px] leading-4 font-bold uppercase tracking-wide bg-secondary/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-md pointer-events-none shadow-xs">
          {effectiveBeforeLabel}
        </span>
        <span className="absolute bottom-2 right-2 max-w-[42%] truncate whitespace-nowrap text-[10px] leading-4 font-bold uppercase tracking-wide bg-primary/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-md pointer-events-none shadow-xs">
          {effectiveAfterLabel}
        </span>

        {/* Invisible Range Input for Accessibility */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="sr-only"
          aria-label={
            lang === 'en'
              ? 'Comparison slider for before and after treatment photos'
              : 'Slider perbandingan foto sebelum dan sesudah perawatan'
          }
        />
      </div>
      <div className="text-center text-[11px] text-text-muted/70 italic">
        {lang === 'en'
          ? 'Drag slider to compare results'
          : 'Geser slider untuk membandingkan hasil'}
      </div>
    </div>
  );
};
