import React, { Suspense, useEffect, useRef, useState } from 'react';
import type { Service, ToothZone } from '../../types';

// Three.js is by far the heaviest dependency, so the 3D scene is loaded lazily
// once the explorer enters the viewport or on user interaction.
const TeethScene = React.lazy(() =>
  import('./TeethScene').then((module) => ({ default: module.TeethScene })),
);

interface LazyTeethSceneProps {
  services: Service[];
  className?: string;
  fill?: boolean;
  onZoneSelect?: (zone: ToothZone) => void;
}

export const LazyTeethScene: React.FC<LazyTeethSceneProps> = (props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) return;
    const node = containerRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    const mountWhenReady = () => {
      const trigger = () => {
        timer = setTimeout(() => setShouldMount(true), isDesktop ? 150 : 50);
      };
      if (document.readyState === 'complete') {
        trigger();
      } else {
        window.addEventListener('load', trigger, { once: true });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (isDesktop || window.scrollY > 40) {
            mountWhenReady();
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px', threshold: 0.15 },
    );

    const onScroll = () => {
      if (window.scrollY > 40) {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          mountWhenReady();
          observer.disconnect();
          window.removeEventListener('scroll', onScroll);
        }
      }
    };

    observer.observe(node);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [shouldMount]);

  const fallbackBox = (
    <div
      ref={containerRef}
      onClick={() => setShouldMount(true)}
      className={`w-full ${props.fill ? 'h-full min-h-[280px] sm:min-h-[340px]' : 'h-[280px] sm:h-[340px] md:h-[460px]'} rounded-2xl border border-border bg-bg-alt flex flex-col items-center justify-center p-6 text-center cursor-pointer`}
    >
      <span className="badge badge-primary mb-2 text-xs">
        Model 3D Interaktif
      </span>
      <span className="font-heading font-bold text-base text-text mb-1">
        Anatomi Gigi & Lengkung Rahang Interaktif
      </span>
      <span className="text-xs font-medium text-text-muted">
        Memuat model 3D…
      </span>
    </div>
  );

  if (!shouldMount) {
    return fallbackBox;
  }

  return (
    <Suspense fallback={fallbackBox}>
      <TeethScene {...props} />
    </Suspense>
  );
};

