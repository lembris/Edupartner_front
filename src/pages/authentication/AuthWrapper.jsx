import React from 'react'
import { Link } from 'react-router-dom'
import './page-auth.css'
export const AuthWrapper = ({ children, maxWidth, disableLogo }) => {
  maxWidth = maxWidth || "400px";
  
  const LogoWrapper = disableLogo 
    ? ({ children }) => <div className="app-brand justify-content-center">{children}</div>
    : Link;
  
  const logoProps = disableLogo
    ? { className: "app-brand-link gap-2" }
    : { aria_label: "Go to Home Page", to: "/", className: "app-brand-link gap-2" };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundImage: `linear-gradient(rgba(20, 1, 1, 0.59), rgba(32, 2, 2, 0.65)), url('/assets/img/auth_bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >

      <div className="container-xxl">
        <div className="authentication-wrapper authentication-basic container-p-y">
          <div
            className="authentication-inner"
            style={{ maxWidth: maxWidth }}
          >
            <div className="card">
              <div className="card-body">
                <div className="app-brand justify-content-center">
                  {disableLogo ? (
                    <div className="app-brand-link gap-2" style={{ cursor: "default", pointerEvents: "none" }}>
                      <span className="app-brand-logo demo">
                        <img
                          src="/assets/img/logo/edupartner_neo_logo.png"
                          alt="erp-360-logo"
                          height={"80px"}
                        />
                      </span>
                    </div>
                  ) : (
                    <Link
                      aria-label="Go to Home Page"
                      to="/"
                      className="app-brand-link gap-2"
                    >
                      <span className="app-brand-logo demo">
                        <img
                          src="/assets/img/logo/edupartner_neo_logo.png"
                          alt="erp-360-logo"
                          height={"80px"}
                        />
                      </span>
                    </Link>
                  )}
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
