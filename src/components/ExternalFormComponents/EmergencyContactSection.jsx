import React from 'react';
import FormSection from './FormSection';

/**
 * EmergencyContactSection - Reusable emergency/parent contact form section
 * 
 * Props:
 * - formData: Object with form data
 * - errors: Object with error messages
 * - handleInputChange: Change handler function
 * - title: Section title (default: "Emergency Contact")
 * - subtitle: Section subtitle
 * - stepNumber: Step indicator number
 */
export const EmergencyContactSection = ({
  formData,
  errors,
  handleInputChange,
  title = 'Emergency Contact / Parent Guardian',
  subtitle = 'Please provide your parent or emergency contact details',
  stepNumber = 2
}) => {
  const relationships = [
    'Parent',
    'Guardian',
    'Spouse',
    'Sibling',
    'Friend',
    'Other'
  ];

  return (
    <FormSection
      stepNumber={stepNumber}
      icon="bx-phone-call"
      title={title}
      subtitle={subtitle}
    >
      <div className="row g-3">
        {/* Full Name */}
        <div className="col-md-6">
          <label htmlFor="emergency_full_name" className="form-label fw-medium">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.emergency_full_name ? 'is-invalid' : ''}`}
            id="emergency_full_name"
            name="emergency_full_name"
            value={formData.emergency_full_name}
            onChange={handleInputChange}
            placeholder="Enter full name"
          />
          {errors.emergency_full_name && (
            <div className="invalid-feedback">{errors.emergency_full_name}</div>
          )}
        </div>

        {/* Relationship */}
        <div className="col-md-6">
          <label htmlFor="emergency_relationship" className="form-label fw-medium">
            Relationship <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.emergency_relationship ? 'is-invalid' : ''}`}
            id="emergency_relationship"
            name="emergency_relationship"
            value={formData.emergency_relationship}
            onChange={handleInputChange}
          >
            <option value="">-- Select a relationship --</option>
            {relationships.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
          {errors.emergency_relationship && (
            <div className="invalid-feedback">{errors.emergency_relationship}</div>
          )}
        </div>

        {/* Email */}
        <div className="col-md-6">
          <label htmlFor="emergency_email" className="form-label fw-medium">
            Email Address
          </label>
          <input
            type="email"
            className="form-control"
            id="emergency_email"
            name="emergency_email"
            value={formData.emergency_email}
            onChange={handleInputChange}
            placeholder="Enter email address (optional)"
          />
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label htmlFor="emergency_phone" className="form-label fw-medium">
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            className={`form-control ${errors.emergency_phone ? 'is-invalid' : ''}`}
            id="emergency_phone"
            name="emergency_phone"
            value={formData.emergency_phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
          />
          {errors.emergency_phone && (
            <div className="invalid-feedback">{errors.emergency_phone}</div>
          )}
        </div>
      </div>
    </FormSection>
  );
};

export default EmergencyContactSection;
