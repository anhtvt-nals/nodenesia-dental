import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBar } from './MobileBar';
import { FloatingWhatsApp } from '../common/FloatingWhatsApp';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text font-body">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama / Skip to main content
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
