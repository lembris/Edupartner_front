import React, { useEffect } from 'react';
import Footer from './Footer';

/**
 * PublicLayout - Truly isolated layout for external public pages
 * NO sidebar container, NO main layout inheritance
 * 100% full-width, completely separate from dashboard layout
 * Used for public landing pages, consent forms, registration, etc.
 */
export const PublicLayout = ({ children }) => {
  useEffect(() => {
    // Reset scrollbar position on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="public-layout-isolated">
      <main className="public-layout-main" role="main">
        {children}
      </main>
      <footer className="public-layout-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default PublicLayout;
