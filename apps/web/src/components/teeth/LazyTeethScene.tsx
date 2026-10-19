import React, { Suspense } from 'react';
import type { Service, ToothZone } from '../../types';

// Three.js is by far the heaviest dependency, so the 3D scene is loaded lazily
// to keep it out of the initial bundle (it renders below the fold).
const TeethScene = React.lazy(() =>
  import('./TeethScene').then((module) => ({ default: module.TeethScene })),
);

interface LazyTeethSceneProps {
  services: Service[];
  className?: string;
  fill?: boolean;
  onZoneSelect?: (zone: ToothZone) => void;
}

export const LazyTeethScene: React.FC<LazyTeethSceneProps> = (props) => (
  <Suspense
    fallback={
      <div className="w-full aspect-[16/10] rounded-2xl border border-border bg-bg-alt flex items-center justify-center font-heading font-semibold text-sm text-text-muted">
        Memuat model 3D…
      </div>
    }
  >
    <TeethScene {...props} />
  </Suspense>
);
