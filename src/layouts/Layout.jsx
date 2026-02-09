import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, isService = false, activeService = null }) => {
  const [isReady, setIsReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Wait for DOM and stylesheets to be fully loaded before initializing Main
    const initMain = () => {
      if (typeof Main === 'function') {
        // Use requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            Main();
            setIsReady(true);
          });
        });
      } else {
        setIsReady(true);
      }
    };

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      initMain();
    } else {
      window.addEventListener('load', initMain);
      return () => window.removeEventListener('load', initMain);
    }
  }, []);

  useEffect(() => {
    // Listen for sidebar toggle events
    const handleToggleSidebar = (event) => {
      setSidebarOpen(event.detail.open);
    };
    document.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => document.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);



  return (
    <div className="layout-wrapper layout-content-navbar">
      <style>
        {`
          @media (max-width: 1199.98px) {
            .layout-sidenav.show {
              transform: translateX(0) !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              bottom: 0 !important;
              width: 250px !important;
              z-index: 1051 !important;
            }
            
            #layout-navbar {
              z-index: 1049 !important;
            }
            
            .layout-overlay {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              opacity: 0;
              pointer-events: none;
              z-index: 1050;
              transition: opacity 0.3s ease;
            }
            
            .layout-overlay.show {
              display: block !important;
              opacity: 1 !important;
              pointer-events: auto !important;
            }
          }
        `}
      </style>
      <div 
        className={`layout-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => {
          setSidebarOpen(false);
          const event = new CustomEvent('toggleSidebar', { detail: { open: false } });
          document.dispatchEvent(event);
        }}
      />
      <div className="layout-container">
        <Sidebar isService={isService} activeService={activeService} />
        <div className="layout-page">
          <Navbar isService={isService} activeService={activeService} />
          <div className="content-wrapper">
            <div className="flex-grow-1 container-p-y container-fluid">
              {children}
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;