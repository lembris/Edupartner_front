import React from 'react';

/**
 * FormHeader - Generic header component for external forms
 * 
 * Props:
 * - title: Main heading text
 * - subtitle: Subtitle/description text
 * - badge: Badge text and icon
 * - stats: Array of stat objects {icon, label}
 */
export const FormHeader = ({ title, subtitle, badge, stats = [] }) => {
  return (
    <div className="form-header text-center mb-5">
      {/* Badge */}
      {badge && (
        <div className="mb-4">
          <span className="badge bg-primary bg-gradient px-4 py-3 rounded-pill fs-6">
            <i className={`bx ${badge.icon} me-2`}></i>
            {badge.label}
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="display-5 fw-bold text-dark mb-3">
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <p className="text-muted fs-5 mb-4">
              {subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div className="row justify-content-center mb-5">
          <div className="col-md-10 col-lg-8">
            <div className="d-flex justify-content-center flex-wrap gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="bg-light rounded-circle p-3 d-inline-block mb-2 shadow-sm">
                    <i className={`bx ${stat.icon} text-${stat.color || 'primary'} fs-3`}></i>
                  </div>
                  <div className="small fw-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormHeader;
