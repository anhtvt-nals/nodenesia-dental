export function AdminBrandLogo({ label }: { label: string }) {
  return (
    <div className="admin-brand" aria-label={label}>
      <svg className="admin-brand__mark" viewBox="0 0 36 36" role="img" aria-hidden="true">
        <rect width="36" height="36" rx="10" fill="#184E3F" />
        <path
          d="M18 9c-3.5-3.8-8-1.5-7 3.5.7 3.2 1.4 9.5 3.5 10.5 1.4.5 1.8-4 3.5-4s2.2 4.5 3.5 4c2.2-1 2.9-7.3 3.5-10.5 1-5-3.5-7.3-7-3.5z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="25" cy="11" r="1.5" fill="#C48B46" />
      </svg>
      <span className="admin-brand__wordmark" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Senyum Sehat
      </span>
    </div>
  );
}
