import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBar } from './MobileBar';

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

      <main id="main-content" className="flex-1 focus:outline-none pb-24 lg:pb-0">
        {children}
      </main>

      <Footer />
      <MobileBar />
    </div>
  );
};
