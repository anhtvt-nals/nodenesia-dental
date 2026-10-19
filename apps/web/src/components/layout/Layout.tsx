import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBar } from './MobileBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#14201C]">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono"
      >
        Lewati ke konten utama / Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 focus:outline-none pb-20 lg:pb-0">
        {children}
      </main>

      <Footer />
      <MobileBar />
    </div>
  );
};
