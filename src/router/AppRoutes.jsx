import { Route, Routes } from "react-router-dom";
import React from "react";
import RouteLoadingSpinner from "../components/loaders/RouteLoadingSpinner";

// Public auth routes - loaded immediately
import { authenticationRoutes } from "./microservices/auth/authentication.jsx";

// Core pages - loaded immediately
import { ErrorPage } from "../pages/misc/ErrorPage";
import { DashboardPage } from "../pages/DashboardPage";
import { Services } from "../pages/Services";

const AppRoutes = () => {
  const [unisync360Routes, setUnisync360Routes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    import("./microservices/unisync360/unisync360.jsx").then((module) => {
      setUnisync360Routes(module.default);
      setLoading(false);
    });
  }, []);

  return (
    <Routes>
      {/* Public Authentication Routes - Loaded Immediately */}
      {authenticationRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Core Routes - Loaded Immediately */}
      <Route path="/e-approval" element={<DashboardPage />} />
      <Route path="/" element={<Services />} />

      {/* UniSync360 Routes - Lazy Loaded (Main Microservice) */}
      {!loading && unisync360Routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {loading && <Route path="/unisync360/*" element={<RouteLoadingSpinner />} />}

      {/* Catch-all 404 route */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AppRoutes;
