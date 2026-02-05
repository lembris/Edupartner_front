import React from 'react';

/**
 * FormSection - Reusable form section wrapper
 * 
 * Props:
 * - title: Section heading
 * - subtitle: Optional section subtitle
 * - children: Form fields/content
 * - stepNumber: Optional step indicator
 * - icon: Optional icon for section
 */
export const FormSection = ({ title, subtitle, children, stepNumber, icon }) => {
  return (
    <div className="form-section mb-5">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-light border-bottom">
          <div className="d-flex align-items-center">
            {stepNumber && (
              <div className="step-badge me-3">
                <span className="badge bg-primary">{stepNumber}</span>
              </div>
            )}
            {icon && (
              <i className={`bx ${icon} text-primary me-2 fs-5`}></i>
            )}
            <div>
              <h5 className="card-title mb-0 fw-bold">{title}</h5>
              {subtitle && <p className="card-text text-muted small mb-0 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className="card-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormSection;
