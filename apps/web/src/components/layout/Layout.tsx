import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBar } from './MobileBar';
import { FloatingWhatsApp } from '../common/FloatingWhatsApp';
import { useI18n } from '../../i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { lang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text font-body">
      {/* Skip to main content for accessibility (hidden until focused with Tab) */}
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        {lang === 'en' ? 'Skip to main content' : 'Lewati ke konten utama'}
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 focus:outline-none pb-20 min-[800px]:pb-0">
        {children}
      </main>

      <Footer />
      <FloatingWhatsApp />
      <MobileBar />
    </div>
  );
};
