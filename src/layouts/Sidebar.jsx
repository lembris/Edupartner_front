import React, { useMemo, useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Menu data imports
import eApprovalMenu from '../data/eApprovalMenu.json';
import ictAssetsMenu from '../data/ictAssetsMenu.json';
import unisync360Menu from '../data/unisync360Menu.json';
import leadLancerMenu from '../data/leadLancerMenu.json';
import externalCounselorMenu from '../data/externalCounselorMenu.json';
import biMenu from '../data/biMenu.json';
import servicesList from '../data/servicesList.json';

// Namespace to menu mapping
const MENU_CONFIG = {
  'e-approval': {
    data: eApprovalMenu,
    title: 'E-Approval',
    type: 'sections' // Array of sections with header + items
  },
  'ict-assets': {
    data: ictAssetsMenu[0]?.items || [],
    title: 'ICT Assets',
    type: 'nested' // Array of items with header + submenu
  },
  'unisync360': {
    data: unisync360Menu[0]?.items || [],
    title: 'UniSync360',
    type: 'nested'
  },
  'lead-lancer': {
    data: leadLancerMenu[0]?.items || [],
    title: 'Lead Lancer Portal',
    type: 'nested'
  },
  'external-counselor': {
    data: externalCounselorMenu[0]?.items || [],
    title: 'External Counselor Portal',
    type: 'nested'
  },
  'bi': {
    data: biMenu[0]?.items || [],
    title: 'Business Intelligence',
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

// Extract namespace from URL path
const getNamespaceFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return DEFAULT_NAMESPACE;

  const firstSegment = segments[0].toLowerCase();
  const secondSegment = segments[1]?.toLowerCase() || '';

  // Check for portal-specific paths (e.g., /unisync360/external-counselor or /unisync360/lead-lancer)
  if (firstSegment === 'unisync360') {
    if (secondSegment === 'external-counselor') {
      return 'external-counselor';
    }
    if (secondSegment === 'lead-lancer') {
      return 'lead-lancer';
    }
  }

  // Check if the namespace exists in our config
  if (MENU_CONFIG[firstSegment]) {
    return firstSegment;
  }

  // Check servicesList for matching link patterns
  const matchedService = servicesList.find(service => {
    const serviceSegment = service.link.split('/').filter(Boolean)[0];
    return serviceSegment === firstSegment;
  });

  if (matchedService) {
    const serviceNamespace = matchedService.link.split('/').filter(Boolean)[0];
    return MENU_CONFIG[serviceNamespace] ? serviceNamespace : DEFAULT_NAMESPACE;
  }

  return DEFAULT_NAMESPACE;
};

const Sidebar = ({ isService = false }) => {
  const user = useSelector((state) => state.userReducer?.data);
  const userPermissions = user?.user_permissions;
  const userRoles = user?.groups;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Get menu config for current namespace
  const menuConfig = MENU_CONFIG[activeNamespace] || MENU_CONFIG[DEFAULT_NAMESPACE];

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
              src="/assets/img/logo/edupartners_nav_logo.png"
              alt="sneat-logo"
              style={{
                height: "auto",
                width: "250px",
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
