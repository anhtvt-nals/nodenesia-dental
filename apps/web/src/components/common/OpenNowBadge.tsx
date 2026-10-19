import React, { useEffect, useState } from 'react';
import { getClinicOpenStatus } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface OpenNowBadgeProps {
  className?: string;
  showDetail?: boolean;
}

export const OpenNowBadge: React.FC<OpenNowBadgeProps> = ({ className = '', showDetail = true }) => {
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

  return (
    <div
      className={`inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 hairline-border ${
        status.isOpen
          ? 'bg-[#1F3D36]/5 text-[#1F3D36] border-[#1F3D36]/20'
          : 'bg-[#C8553D]/5 text-[#C8553D] border-[#C8553D]/20'
      } ${className}`}
      aria-label={`Status klinik: ${text}`}
    >
      <span className="font-medium tracking-wide">{text}</span>
      {showDetail && (
        <>
          <span className="text-[#14201C]/30 select-none">·</span>
          <span className="text-[#14201C]/70 font-sans">{detail}</span>
        </>
      )}
    </div>
  );
};
