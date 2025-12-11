import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, isService = false, activeService = null }) => {
  const [isReady, setIsReady] = useState(false);

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

  return (
    <div className="layout-wrapper layout-content-navbar">
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
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>
    </div>
  );
};

export default Layout;