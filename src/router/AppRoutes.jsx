import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

import { authenticationRoutes } from "./microservices/auth/authentication.jsx";
import { accountRoutes } from "./microservices/auth/account.jsx";

import { ErrorPage } from "../pages/misc/ErrorPage";
import { DashboardPage } from "../pages/DashboardPage";
import { Services } from "../pages/Services";

// Lazy load module-specific routes (loaded only when accessed)
const LazyEApprovalRoutes = lazy(() =>
  import("./microservices/e_approval/settings.jsx").then((m) => ({
    default: () => m.settingsRoutes,
  }))
);
const LazyUsersRoutes = lazy(() =>
  import("./microservices/e_approval/users.jsx").then((m) => ({
    default: () => m.usersRoutes,
  }))
);
const LazyEApprovalOperations = lazy(() =>
  import("./microservices/e_approval/operations.jsx").then((m) => ({
    default: () => m.eApprovalRoutes,
  }))
);
const LazyICTAssetsRoutes = lazy(() =>
  import("./microservices/ict_assets/ict-assets.jsx").then((m) => ({
    default: () => m.ictAssetsRoutes,
  }))
);
const LazyUniSync360Routes = lazy(() =>
  import("./microservices/unisync360/unisync360.jsx").then((m) => ({
    default: () => m.unisync360Routes,
  }))
);
const LazyBusinessIntelligenceRoutes = lazy(() =>
  import("./microservices/business_intelligence/business-intelligence.jsx").then(
    (m) => ({
      default: () => m.businessIntelligenceRoutes,
    })
  )
);

const LoadingFallback = () => <div>Loading...</div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes (loaded immediately) */}
      {authenticationRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Core Routes */}
      <Route path="/e-approval" element={<DashboardPage />} />
      <Route path="/" element={<Services />} />

      {/* Account Routes */}
      {accountRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Lazy-loaded Module Routes */}
      <Route
        path="/e-approval/settings/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LazyEApprovalRoutes />
          </Suspense>
        }
      />
      <Route
        path="/e-approval/users/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LazyUsersRoutes />
          </Suspense>
        }
      />
      <Route
        path="/e-approval/operations/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LazyEApprovalOperations />
          </Suspense>
        }
      />
      <Route
        path="/ict-assets/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LazyICTAssetsRoutes />
          </Suspense>
        }
      />
      <Route
        path="/unisync360/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LazyUniSync360Routes />
          </Suspense>
        }
      />
      <Route
        path="/business-intelligence/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LazyBusinessIntelligenceRoutes />
          </Suspense>
        }
      />

      {/* Error Page (catch-all) */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AppRoutes;
