import { useEffect } from 'react';
import { lazyLoadCSS, unloadCSS } from '../utils/lazyLoadCSS';

/**
 * Hook to dynamically load CSS for specific routes
 * Usage: useRouteCSS('/assets/vendor/libs/apex-charts/apex-charts.css', 'charts-css')
 */
export const useRouteCSS = (cssPath, cssId) => {
  useEffect(() => {
    lazyLoadCSS(cssPath, cssId);

    return () => {
      unloadCSS(cssId);
    };
  }, [cssPath, cssId]);
};
