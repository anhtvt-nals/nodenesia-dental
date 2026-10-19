import React from 'react';

interface SectionLabelProps {
  number: string;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ number, className = '' }) => {
  return (
    <div className={`badge badge-primary mb-4 select-none ${className}`}>
      <span>{number}</span>
    </div>
  );
};
