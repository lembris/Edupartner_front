import React from "react";
import { useLocation } from "react-router-dom";
import { Suspense } from "react";
import Layout from "./layouts/Layout";
import AppRoutes from "./router/AppRoutes";
import { Blank } from "./layouts/Blank";
import ProtectedRoute from "./components/wrapper/ProtectedRoute";
import RouteLoadingSpinner from "./components/loaders/RouteLoadingSpinner";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const location = useLocation();
  const isAuthPath =
    location.pathname.includes("auth") ||
    location.pathname.includes("error") ||
    location.pathname.includes("under-maintenance") ||
    location.pathname.includes("blank") ||
    location.pathname === "/unisync360/external-counselor-login" ||
    location.pathname === "/unisync360/lead-lancer-login" ||
    location.pathname === "/unisync360/service-consent" ||
    location.pathname === "/clinic360/operations";

  const isService = location.pathname === "/";

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Suspense fallback={<RouteLoadingSpinner />}>
            {isAuthPath ? (
              <AppRoutes>
                <Blank />
              </AppRoutes>
            ) : (
              <ProtectedRoute>
                <Layout isService={isService}>
                  <AppRoutes />
                </Layout>
              </ProtectedRoute>
            )}
          </Suspense>
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
