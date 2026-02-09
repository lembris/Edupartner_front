import React, { useState, useRef, useEffect } from 'react';
import './TabsContainer.css';

/**
 * Reusable Tabs Container Component
 * Provides horizontal tab navigation with scroll arrows support
 * 
 * @param {Array} tabs - Array of tab objects with keys: { id, label, icon }
 * @param {String} activeTab - Currently active tab ID
 * @param {Function} onTabChange - Callback when tab is clicked
 * @param {String} className - Additional CSS classes
 */
const TabsContainer = ({ tabs = [], activeTab, onTabChange, className = '' }) => {
  const [showScrollArrows, setShowScrollArrows] = useState(false);
  const tabsRef = useRef(null);

  // Check if scroll arrows are needed
  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollWidth, clientWidth } = tabsRef.current;
      setShowScrollArrows(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    // Check scroll immediately and after a small delay to ensure DOM is ready
    checkScroll();
    
    // Add MutationObserver to detect when tabs change
    const observer = new MutationObserver(checkScroll);
    if (tabsRef.current) {
      observer.observe(tabsRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
    
    // Check on window resize
    window.addEventListener('resize', checkScroll);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [tabs]);

  const scrollTabs = (direction) => {
    if (!tabsRef.current) return;

    const scrollAmount = 200;
    if (direction === 'left') {
      tabsRef.current.scrollLeft -= scrollAmount;
    } else {
      tabsRef.current.scrollLeft += scrollAmount;
    }
  };

  return (
    <div className={`tabs-container-wrapper ${className}`} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '0.375rem', boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)', margin: '1.5rem 0' }}>
      {showScrollArrows && (
        <button
          type="button"
          className="btn btn-sm btn-icon btn-link text-secondary rounded-0 shadow-none"
          onClick={() => scrollTabs('left')}
          title="Scroll Left"
          style={{ minWidth: '44px', flexShrink: 0 }}
        >
          <i className="bx bx-chevrons-left fs-4"></i>
        </button>
      )}

      <div
        style={{
          flex: '1 1 0',
          overflow: 'hidden',
          position: 'relative',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          minWidth: '0',
        }}
        ref={tabsRef}
      >
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <ul
            className="nav nav-tabs nav-fill flex-nowrap hide-scrollbar mb-0 border-bottom-0"
            role="tablist"
            style={{ minWidth: '100%' }}
          >
            {tabs.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  type="button"
                  className={`nav-link border-0 rounded-0 ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  onClick={() => onTabChange(tab.id)}
                  style={{ whiteSpace: 'nowrap' }}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tab-content-${tab.id}`}
                >
                  {tab.icon && <i className={`${tab.icon} me-1`}></i>}
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

      {showScrollArrows && (
        <button
          type="button"
          className="btn btn-sm btn-icon btn-link text-secondary rounded-0 shadow-none"
          onClick={() => scrollTabs('right')}
          title="Scroll Right"
          style={{ minWidth: '44px', flexShrink: 0 }}
        >
          <i className="bx bx-chevrons-right fs-4"></i>
        </button>
      )}
    </div>
  );
};

export default TabsContainer;
