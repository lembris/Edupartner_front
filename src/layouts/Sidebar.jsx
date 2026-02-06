import React, { useMemo, useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMenuData } from '../hooks/useMenuData';

// Static imports only for immediately needed data
import servicesList from '../data/servicesList.json';

// Menu mapping - UniSync360 menu loaded dynamically via useMenuData hook
const MENU_CONFIG = {
  'unisync360': {
    title: 'UniSync360',
    type: 'nested'
  }
};

// Default namespace when at root or unknown path
const DEFAULT_NAMESPACE = 'e-approval';

const hasPermission = (itemPermissions, itemRoles, userPermissions, userRoles) => {
  const hasRequiredPermission =
    !itemPermissions ||
    itemPermissions.length === 0 ||
    itemPermissions.some((permission) => userPermissions?.includes(permission));
  const hasRequiredRole =
    !itemRoles ||
    itemRoles.length === 0 ||
    itemRoles.some((role) => userRoles?.includes(role));
  return hasRequiredPermission || hasRequiredRole;
};

const hasAnyVisibleItem = (items, userPermissions, userRoles) => {
  return items?.some((item) => {
    const parentVisible = hasPermission(
      item.permission,
      item.role,
      userPermissions,
      userRoles
    );
    if (parentVisible) return true;

    if (item.submenu?.length > 0) {
      return hasAnyVisibleItem(item.submenu, userPermissions, userRoles);
    }
    return false;
  });
};

// Extract namespace from URL path (UniSync360 only)
const getNamespaceFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return DEFAULT_NAMESPACE;

  const firstSegment = segments[0].toLowerCase();

  // Only support UniSync360
  if (firstSegment === 'unisync360') {
    return 'unisync360';
  }

  return DEFAULT_NAMESPACE;
};

const Sidebar = ({ isService = false }) => {
  const user = useSelector((state) => state.userReducer?.data);
  const userPermissions = user?.user_permissions;
  const userRoles = user?.groups;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lazy load UniSync360 menu data only
  const { menuData: unisync360Data } = useMenuData('unisync360');

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleToggleSidebar = (event) => {
      setSidebarOpen(event.detail.open);
    };
    document.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => document.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);

  // Dynamically determine active namespace from URL
  const activeNamespace = useMemo(() => {
    return getNamespaceFromPath(location.pathname);
  }, [location.pathname]);

  // Build menu config with lazy-loaded UniSync360 data
  const menuConfigWithData = useMemo(() => ({
    ...MENU_CONFIG,
    'unisync360': {
      ...MENU_CONFIG['unisync360'],
      // unisync360Data is an array with one element containing the items
      data: (Array.isArray(unisync360Data) && unisync360Data[0]?.items) || unisync360Data || []
    }
  }), [unisync360Data]);

  // Get menu config for current namespace
  const menuConfig = menuConfigWithData[activeNamespace] || menuConfigWithData[DEFAULT_NAMESPACE];

  // Format namespace for display
  const formattedTitle = menuConfig.title || activeNamespace
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Filter services based on user permissions
  const filteredServices = servicesList.filter(service =>
    hasPermission(service.permission, service.role, userPermissions, userRoles)
  );

  return (
    <aside
      id="layout-menu"
      className={`layout-menu layout-sidenav menu-vertical menu bg-menu-theme ${sidebarOpen ? "show" : ""}`}
      style={{ overflowY: 'auto', maxHeight: '100vh' }}
    >
      <div className="app-brand demo mb-2" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "15px 0" }}>
        <Link
          aria-label="Navigate to sneat homepage"
          to="/"
          className="app-brand-link"
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <span
            className="app-brand-logo"
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <img
              src="/assets/img/logo/edupartner_neo_logo.png"
              alt="sneat-logo"
              style={{
                height: "auto",
                width: "150px",
                objectFit: "contain",
              }}
              aria-label="ERP360 logo image"
            />
          </span>
        </Link>

        <button
          onClick={() => {
            setSidebarOpen(false);
            const event = new CustomEvent('toggleSidebar', { detail: { open: false } });
            document.dispatchEvent(event);
          }}
          className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none bg-transparent border-0"
          type="button"
        >
          <i className="bx bx-chevron-left bx-sm align-middle"></i>
        </button>
      </div>

      <div style={{ alignContent: "center", textAlign: "center" }}>
        <h5 className="text-bold">{formattedTitle}</h5>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {isService ? (
          <ServiceDocsMenu services={filteredServices} activeNamespace={activeNamespace} />
        ) : (
          <DynamicMenu
            menuConfig={menuConfig}
            userPermissions={userPermissions}
            userRoles={userRoles}
          />
        )}
      </ul>
    </aside>
  );
};

// Service Documentation Menu
const ServiceDocsMenu = ({ services }) => {
  // Extract namespace from service link (e.g., "/unisync360/dashboard" -> "unisync360")
  const getNamespace = (link) => {
    const segments = link.split('/').filter(Boolean);
    return segments[0] || '';
  };

  // Filter to show only UniSync360 services
  const unisync360Services = services.filter(
    service => service.id === 'unisync360' || service.id === 'external-counselor-portal' || service.id === 'lead-lancer-portal'
  );

  return (
    <>
      <li className="menu-header small text-uppercase">
        <span className="menu-header-text">Documentation</span>
      </li>
      {unisync360Services.map((service, idx) => {
        const namespace = getNamespace(service.link);
        return (
          <li className="menu-item" key={`docs_${service.id}_${idx}`}>
            <NavLink
              className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
              to={`/${namespace}/user-manual`}
            >
              <i className={`menu-icon tf-icons ${service.icon || 'bx bx-book-open'}`}></i>
              <div>{service.text} Manual</div>
            </NavLink>
          </li>
        );
      })}
    </>
  );
};

// Dynamic Menu Renderer
const DynamicMenu = ({ menuConfig, userPermissions, userRoles }) => {
  const { data, type } = menuConfig;

  if (type === 'sections') {
    // E-Approval style: array of sections with header + items
    return data.map((section, sectionIndex) => (
      <React.Fragment key={`section-${sectionIndex}`}>
        {section.header && hasAnyVisibleItem(section.items, userPermissions, userRoles) && (
          <li className="menu-header small text-uppercase">
            <span className="menu-header-text">{section.header}</span>
          </li>
        )}
        {section.items
          ?.filter((item) => hasPermission(item.permission, item.role, userPermissions, userRoles))
          .map((item, itemIndex) => (
            <MenuItem
              key={item.id || `item-${sectionIndex}-${itemIndex}`}
              {...item}
              userPermissions={userPermissions}
              userRoles={userRoles}
            />
          ))}
      </React.Fragment>
    ));
  }

  if (type === 'nested') {
    // ICT Assets / UniSync360 style: array of items with header + submenu
    return data.map((section, sectionIndex) => (
      <React.Fragment key={`nested-${sectionIndex}`}>
        {section.header && hasAnyVisibleItem([section], userPermissions, userRoles) && (
          <li className="menu-header small text-uppercase">
            <span className="menu-header-text">{section.header}</span>
          </li>
        )}
        {section.submenu
          ?.filter((item) => hasPermission(item.permission, item.role, userPermissions, userRoles))
          .map((item, itemIndex) => (
            <MenuItem
              key={item.id || `nested-item-${sectionIndex}-${itemIndex}`}
              {...item}
              userPermissions={userPermissions}
              userRoles={userRoles}
            />
          ))}
      </React.Fragment>
    ));
  }

  return null;
};

// Menu Item Component
const MenuItem = ({ userPermissions, userRoles, submenu, ...item }) => {
  const location = useLocation();

  // Filter submenu items
  const filteredSubmenu = submenu
    ? submenu.filter((subitem) =>
      hasPermission(subitem.permission, subitem.role, userPermissions, userRoles)
    )
    : [];

  // Don't render if submenu existed but all items filtered out
  if (submenu && filteredSubmenu.length === 0) {
    return null;
  }

  // Extract pathname and search from item.link (handles links with query params)
  const getPathname = (link) => {
    if (!link) return '';
    const [pathname] = link.split('?');
    return pathname;
  };

  const itemPathname = getPathname(item.link);
  const currentFullUrl = location.pathname + location.search;

  // Check if active - compare both pathname and full URL with query params
  const isActive =
    (item.link && currentFullUrl === item.link) ||
    (itemPathname && location.pathname === itemPathname && !item.link?.includes('?')) ||
    (itemPathname && location.pathname.startsWith(itemPathname + '/') && !item.link?.includes('?'));

  const hasSubmenu = filteredSubmenu.length > 0;

  const isSubmenuActive =
    hasSubmenu &&
    filteredSubmenu.some((subitem) => {
      const subitemPathname = getPathname(subitem.link);
      const subitemFullUrl = subitem.link;
      return (
        currentFullUrl === subitemFullUrl ||
        (subitemPathname && location.pathname === subitemPathname && !subitem.link?.includes('?')) ||
        (subitemPathname && location.pathname.startsWith(subitemPathname + '/') && !subitem.link?.includes('?'))
      );
    });

  return (
    <li
      className={`menu-item ${isActive || isSubmenuActive ? 'active' : ''} ${hasSubmenu && isSubmenuActive ? 'open' : ''
        }`}
    >
      <NavLink
        aria-label={`Navigate to ${item.text}${!item.available ? ' Pro' : ''}`}
        to={item.link}
        className={`menu-link ${hasSubmenu ? 'menu-toggle' : ''}`}
        target={item.link?.includes('http') ? '_blank' : undefined}
        onClick={() => {
          // Close sidebar on mobile after clicking a link
          const event = new CustomEvent('toggleSidebar', { detail: { open: false } });
          document.dispatchEvent(event);
        }}
      >
        <i className={`menu-icon tf-icons ${item.icon}`}></i>
        <div>{item.text}</div>
        {item.available === false && (
          <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
            Pro
          </div>
        )}
      </NavLink>

      {hasSubmenu && (
        <ul className="menu-sub">
          {filteredSubmenu.map((subitem, subitemIndex) => (
            <MenuItem
              key={subitem.id || `${item.id || item.text}-sub-${subitemIndex}`}
              {...subitem}
              userPermissions={userPermissions}
              userRoles={userRoles}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default Sidebar;
