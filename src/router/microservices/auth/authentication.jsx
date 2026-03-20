import { lazy, Suspense } from 'react';
import RouteLoadingSpinner from '../../../components/loaders/RouteLoadingSpinner';

// Lazy load authentication pages
const LoginPage = lazy(() => import("../../../pages/authentication/LoginPage.jsx"));
const ExternalCounselorLoginPage = lazy(() => import("../../../pages/authentication/ExternalCounselorLoginPage.jsx"));
const LeadLancerLoginPage = lazy(() => import("../../../pages/authentication/LeadLancerLoginPage.jsx"));
const RegisterPage = lazy(() => import("../../../pages/authentication/RegisterPage.jsx"));
const ForgotPasswordPage = lazy(() => import("../../../pages/authentication/ForgotPasswordPage.jsx"));
const NewUserPage = lazy(() => import("../../../pages/authentication/NewUserPage.jsx"));

// Wrapper for lazy loaded components
const LazyComponent = ({ Component }) => (
  <Suspense fallback={<RouteLoadingSpinner />}>
    <Component />
  </Suspense>
);

function RegisterAndLogout() {
    localStorage.clear();
    return (
      <Suspense fallback={<RouteLoadingSpinner />}>
        <RegisterPage />
      </Suspense>
    );
}

export const authenticationRoutes = [
    { 
      path: "/auth/login", 
      element: (
        <Suspense fallback={<RouteLoadingSpinner />}>
          <LoginPage />
        </Suspense>
      ), 
      isPublic: true 
    },
    { 
      path: "/unisync360/external-counselor-login", 
      element: (
        <Suspense fallback={<RouteLoadingSpinner />}>
          <ExternalCounselorLoginPage />
        </Suspense>
      ), 
      isPublic: true 
    },
    { 
      path: "/unisync360/lead-lancer-login", 
      element: (
        <Suspense fallback={<RouteLoadingSpinner />}>
          <LeadLancerLoginPage />
        </Suspense>
      ), 
      isPublic: true 
    },
    {
        path: "/auth/new-user-0InEm7BVGIrZafX2riM8DQFgQG2L06ImZlP3oJF",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <NewUserPage />
          </Suspense>
        ),
        isPublic: true
    },
    { 
      path: "/auth/register", 
      element: <RegisterAndLogout />, 
      isPublic: true 
    },
    { 
      path: "/auth/forgot-password", 
      element: (
        <Suspense fallback={<RouteLoadingSpinner />}>
          <ForgotPasswordPage />
        </Suspense>
      ), 
      isPublic: true 
    },
];