import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StaticMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  href: string;
  label: string;
  className?: string;
}

export const StaticMap: React.FC<StaticMapProps> = ({
  lat,
  lng,
  zoom = 16,
  href,
  label,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Prevent re-initialization on hot reload
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      }).addTo(map);

      // Custom dental marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <div style="width: 38px; height: 38px; background: #184E3F; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff;">
              <svg style="transform: rotate(45deg); width: 20px; height: 20px; color: #ffffff;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([lat, lng], { icon: customIcon }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size to guarantee tiles render properly without grey tiles
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch {
      setMapError(true);
    }
  }, [lat, lng, zoom]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-bg-alt shadow-sm ${className}`}>
      {mapError ? (
        <div className="flex h-full w-full min-h-[300px] flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-text-muted mb-3 font-medium">
            Peta tidak dapat dimuat saat ini.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <span>Buka di Google Maps</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      ) : (
        <>
          <div
            ref={mapContainerRef}
            className="h-full w-full min-h-[300px] z-0"
            style={{ minHeight: '300px' }}
            aria-label={label}
          />
          {/* Floating Fallback / Direct Link to Google Maps */}
          <div className="absolute top-3 right-3 z-[1000]">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-secondary shadow-md backdrop-blur-sm border border-border hover:bg-white hover:text-primary transition-all"
            >
              <span>Buka di Google Maps</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </>
      )}
    </div>
  );
};
