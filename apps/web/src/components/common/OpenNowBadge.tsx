import React, { useEffect, useState } from 'react';
import { getClinicOpenStatus } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface OpenNowBadgeProps {
  className?: string;
  showDetail?: boolean;
  variant?: 'light' | 'dark';
}

export const OpenNowBadge: React.FC<OpenNowBadgeProps> = ({
  className = '',
  showDetail = true,
  variant = 'light',
}) => {
  const { lang } = useI18n();
  const [status, setStatus] = useState(getClinicOpenStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getClinicOpenStatus());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const text = lang === 'en' ? status.statusTextEn : status.statusTextId;
  const detail = lang === 'en' ? status.nextOpenEn : status.nextOpenId;

  const badgeStyles =
    variant === 'dark'
      ? status.isOpen
        ? 'bg-success/20 text-white border border-success/40'
        : 'bg-white/10 text-white border border-white/20'
      : status.isOpen
      ? 'bg-success/12 text-success-dark border border-success/30'
      : 'bg-warning/15 text-text border border-warning/40';

  return (
    <div
      className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${badgeStyles} ${className}`}
      aria-label={`Status klinik: ${text}`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          status.isOpen ? 'bg-success' : 'bg-warning'
        }`}
        aria-hidden="true"
      />
      <span className="tracking-wide">{text}</span>
      {showDetail && (
        <>
          <span className={variant === 'dark' ? 'text-white/40 select-none' : 'text-text-muted/50 select-none'} aria-hidden="true">
            ·
          </span>
          <span className={variant === 'dark' ? 'text-white/85 font-normal' : 'text-text-muted font-normal'}>
            {detail}
          </span>
        </>
      )}
    </div>
  );
};
