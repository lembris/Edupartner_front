import React from 'react';

/**
 * FormTopBar - Top bar for external forms with logos and badges
 * 
 * Props:
 * - leftLogo: Path to left logo image
 * - rightLogo: Path to right logo image
 * - leftLogoAlt: Alt text for left logo
 * - rightLogoAlt: Alt text for right logo
 * - badges: Array of badge objects {icon, label, color}
 * - showLogosOnMobile: Boolean to show logos on mobile (default: false)
 */
export const FormTopBar = ({
  leftLogo,
  rightLogo,
  leftLogoAlt = 'Logo',
  rightLogoAlt = 'Logo',
  badges = [],
  showLogosOnMobile = false
}) => {
  return (
    <div className="form-top-bar">
      <div className="container-fluid px-4 px-lg-5">
        <div className="d-flex justify-content-between align-items-center py-3">
          {/* Left Logos */}
          <div className="d-flex align-items-center">
            {leftLogo && (
              <>
                <img
                  src={leftLogo}
                  alt={leftLogoAlt}
                  className="form-logo me-3"
                  style={{ height: '45px' }}
                />
                {rightLogo && (
                  <div className="vr mx-3" style={{ height: '35px', opacity: '0.3' }}></div>
                )}
              </>
            )}
            {rightLogo && (
              <img
                src={rightLogo}
                alt={rightLogoAlt}
                className="form-logo"
                style={{ height: '45px' }}
              />
            )}
          </div>

          {/* Right Badges */}
          {badges.length > 0 && (
            <div className="d-flex align-items-center gap-3">
              <div className={`d-${showLogosOnMobile ? 'flex' : 'none'} d-md-flex align-items-center gap-2`}>
                {badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`badge bg-${badge.color || 'primary'} bg-opacity-10 text-${badge.textColor || 'primary'} px-3 py-2`}
                  >
                    <i className={`bx ${badge.icon} me-1`}></i>
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormTopBar;
