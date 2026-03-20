import React from 'react';
import FormSection from './FormSection';

/**
 * ServicesSection - Reusable service selection form section
 * 
 * Props:
 * - services: Array of service objects {uid, name, description}
 * - selectedServices: Object with selected services
 * - handleServiceToggle: Toggle handler function
 * - errors: Object with error messages
 * - title: Section title (default: "Select Services")
 * - stepNumber: Step indicator number
 */
export const ServicesSection = ({
  services,
  selectedServices,
  handleServiceToggle,
  errors,
  title = 'Select Services',
  stepNumber = 3
}) => {
  const selectedCount = Object.values(selectedServices).filter(v => v).length;

  return (
    <FormSection
      stepNumber={stepNumber}
      icon="bx-list-check"
      title={title}
      subtitle={`Select the services you need (${selectedCount} selected)`}
    >
      {errors.services && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bx bx-exclamation-circle me-2"></i>
          {errors.services}
        </div>
      )}

      <div className="row g-3">
        {services.map((service) => (
          <div key={service.uid} className="col-md-6">
            <div
              className={`service-card card h-100 border-2 cursor-pointer ${
                selectedServices[service.uid] ? 'border-primary' : 'border-light'
              }`}
              onClick={() => handleServiceToggle(service.uid)}
              role="button"
              tabIndex="0"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleServiceToggle(service.uid);
                }
              }}
            >
              <div className="card-body">
                <div className="d-flex align-items-start">
                  <input
                    type="checkbox"
                    className="form-check-input me-3 mt-1"
                    id={`service-${service.uid}`}
                    checked={selectedServices[service.uid] || false}
                    onChange={() => handleServiceToggle(service.uid)}
                  />
                  <label htmlFor={`service-${service.uid}`} className="form-check-label flex-grow-1">
                    <h6 className="card-title mb-2 fw-bold">{service.name}</h6>
                    {service.description && (
                      <p className="card-text text-muted small">{service.description}</p>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
};

export default ServicesSection;
