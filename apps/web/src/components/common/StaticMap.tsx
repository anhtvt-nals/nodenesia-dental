import React from 'react';

interface StaticMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  href: string;
  label: string;
  className?: string;
}

const TILE = 256;

/**
 * Raster OpenStreetMap tiles rendered as plain <img> elements: no iframe, no API key, no WebGL,
 * so there is no blank embed box or spinner. The whole map links out to the full map.
 */
export const StaticMap: React.FC<StaticMapProps> = ({
  lat,
  lng,
  zoom = 16,
  href,
  label,
  className = '',
}) => {
  const scale = TILE * 2 ** zoom;
  const px = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const py = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;

  const tileX = Math.floor(px / TILE);
  const tileY = Math.floor(py / TILE);
  const offsetX = px - tileX * TILE;
  const offsetY = py - tileY * TILE;

  const tiles: { key: string; src: string; left: number; top: number }[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      tiles.push({
        key: `${dx}:${dy}`,
        src: `https://tile.openstreetmap.org/${zoom}/${tileX + dx}/${tileY + dy}.png`,
        left: dx * TILE,
        top: dy * TILE,
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`relative block overflow-hidden bg-bg-alt ${className}`}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: 0, height: 0, transform: `translate(${-offsetX}px, ${-offsetY}px)` }}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            width={TILE}
            height={TILE}
            loading="lazy"
            draggable={false}
            className="absolute max-w-none select-none"
            style={{ left: tile.left, top: tile.top, width: TILE, height: TILE }}
          />
        ))}
      </div>

      <svg
        className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-full text-primary drop-shadow"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"
        />
      </svg>

      <span className="absolute bottom-1 right-1 bg-bg/90 text-text-muted text-xs px-1.5 py-0.5 rounded-[4px]">
        © OpenStreetMap
      </span>
    </a>
  );
};
