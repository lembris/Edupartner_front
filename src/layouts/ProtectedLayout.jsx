import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Footer from './Footer';

/**
 * ProtectedLayout - Layout for internal protected pages without sidebar
 * Used for clinic operations, internal dashboards, etc.
 * NO sidebar, NO main layout inheritance
 * 100% full-width, protected via route-level ProtectedRoute
 */
export const ProtectedLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userReducer?.data);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <div className="protected-layout-isolated">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div className="container-fluid">
          <button 
            className="btn btn-sm btn-outline-secondary me-2" 
            onClick={() => navigate(-1)}
          >
            <i className="bx bx-left-arrow-alt"></i>
          </button>
          <a className="navbar-brand fw-bold" href="/clinic360">
            <i className="bx bx-clinic me-1 text-primary"></i>
            Clinic360
          </a>
          <div className="d-flex align-items-center gap-3">
            {user?.first_name && (
              <span className="text-muted small">
                <i className="bx bx-user me-1"></i>
                {user.first_name} {user.last_name}
              </span>
            )}
            <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={handleLogout}
            >
              <i className="bx bx-log-out"></i>
            </button>
          </div>
        </div>
      </nav>
      <main className="protected-layout-main pt-5" role="main">
        {children}
      </main>
      <footer className="protected-layout-footer py-3">
        <Footer />
      </footer>
    </div>
  );
};

export default ProtectedLayout;