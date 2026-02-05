import React, { useEffect } from 'react';
import Footer from './Footer';

/**
 * PublicLayout - Layout wrapper for public pages with no sidebar
 * Used for public landing pages, consent forms, etc.
 * Follows the Sneat Bootstrap HTML template pattern
 */
export const PublicLayout = ({ children }) => {
  useEffect(() => {
    // Reset scrollbar position on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="public-layout">
      <div className="layout-page">
        <div className="content-wrapper">
          <main className="flex-grow-1" role="main">
            {children}
          </main>
          <footer className="footer">
            <Footer />
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
