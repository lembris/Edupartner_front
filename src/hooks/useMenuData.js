import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook to lazy-load menu data only after authentication
 * Defers loading of all menu JSON files until user is authenticated
 * 
 * @param {string} menuType - Type of menu to load ('unisync360', 'eApproval', 'ictAssets', 'bi', 'leadLancer', 'externalCounselor')
 * @returns {Object|null} Menu data or null while loading
 */
export const useMenuData = (menuType) => {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get auth state from Redux - check both possible state structures
  const authUser = useSelector(state => state.userReducer?.data || state.userReducer?.user);
  const isAuthenticated = !!authUser;

  useEffect(() => {
    // Only load menu data if user is authenticated
    if (!isAuthenticated) {
      setMenuData(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Dynamic import based on menu type
    const menuMap = {
      unisync360: () => import('../data/unisync360Menu.json'),
      eApproval: () => import('../data/eApprovalMenu.json'),
      ictAssets: () => import('../data/ictAssetsMenu.json'),
      bi: () => import('../data/biMenu.json'),
      leadLancer: () => import('../data/leadLancerMenu.json'),
      externalCounselor: () => import('../data/externalCounselorMenu.json'),
      clinic360: () => import('../data/clinic360Menu.json'),
    };

    if (!menuMap[menuType]) {
      setError(`Unknown menu type: ${menuType}`);
      setLoading(false);
      return;
    }

    menuMap[menuType]()
      .then(module => {
        setMenuData(module.default || module);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to load ${menuType} menu:`, err);
        setError(err);
        setLoading(false);
      });
  }, [menuType, isAuthenticated]);

  return { menuData, loading, error };
};

/**
 * Hook to preload all menu data in background (after initial auth)
 * Useful for faster navigation between modules
 */
export const usePreloadMenuData = () => {
  const authUser = useSelector(state => state.userReducer?.user);
  const isAuthenticated = !!authUser;

  useEffect(() => {
    if (!isAuthenticated) return;

    // Preload all menus in the background
    const menus = ['unisync360', 'eApproval', 'ictAssets', 'bi', 'leadLancer', 'externalCounselor', 'clinic360'];
    
    menus.forEach(menu => {
      // Dynamic import to trigger loading
      import(`../data/${menu}Menu.json`).catch(() => {
        // Silently fail - menu may not exist for all types
      });
    });
  }, [isAuthenticated]);
};
