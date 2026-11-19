import type { ReactNode } from 'react';

type Props = { title: ReactNode; description?: ReactNode };

export function PageHeader({ title, description }: Props) {
  return (
    <header className="hero-pattern py-7 sm:py-9 md:py-10 border-b border-border/70 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-secondary tracking-tight leading-tight text-balance">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm md:text-base text-text-muted leading-relaxed max-w-2xl mt-2.5 text-balance">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
