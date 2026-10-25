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
      ? 'bg-bg/10 text-bg border border-bg/20'
      : 'bg-bg-alt text-text border border-border';

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium px-3 py-1.5 rounded-[6px] max-w-full ${badgeStyles} ${className}`}
      aria-label={`Status klinik: ${text}`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          variant === 'dark' ? 'bg-bg' : 'bg-primary'
        }`}
        aria-hidden="true"
      />
      <span>{text}</span>
      {showDetail && (
        <>
          <span className={variant === 'dark' ? 'text-bg/40 select-none' : 'text-text-muted select-none'} aria-hidden="true">
            ·
          </span>
          <span className={variant === 'dark' ? 'text-bg/85 font-normal' : 'text-text-muted font-normal'}>
            {detail}
          </span>
        </>
      )}
    </div>
  );
};
