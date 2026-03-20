import React, { useEffect } from 'react';
import Footer from './Footer';
import '../styles/external-form-page.css';

/**
 * ExternalFormPage - Reusable layout for external-facing forms (no sidebar)
 * Used for public forms, surveys, registration pages, etc.
 * 
 * Props:
 * - children: Form content to render
 * - topBarContent: Optional content for top bar (logos, badges, etc)
 * - fullWidth: Boolean to control max-width (default: false)
 */
export const ExternalFormPage = ({ children, topBarContent, fullWidth = false }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="external-form-page">
      <div className="layout-page">
        <div className="content-wrapper">
          {/* Top Bar */}
          {topBarContent && (
            <div className="external-top-bar">
              {topBarContent}
            </div>
          )}

          {/* Main Content */}
          <main className="external-form-main" role="main">
            <div className={`external-form-container ${fullWidth ? 'full-width' : ''}`}>
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="footer">
            <Footer />
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ExternalFormPage;
