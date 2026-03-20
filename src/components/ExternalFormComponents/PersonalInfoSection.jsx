import React from 'react';
import FormSection from './FormSection';

/**
 * PersonalInfoSection - Reusable personal information form section
 * 
 * Props:
 * - formData: Object with form data
 * - errors: Object with error messages
 * - handleInputChange: Change handler function
 * - showMiddleName: Boolean to show middle name (default: true)
 * - showDOB: Boolean to show date of birth (default: true)
 */
export const PersonalInfoSection = ({
  formData,
  errors,
  handleInputChange,
  showMiddleName = true,
  showDOB = true
}) => {
  return (
    <FormSection
      stepNumber={1}
      icon="bx-user"
      title="Personal Information"
      subtitle="Please provide your basic details"
    >
      <div className="row g-3">
        {/* First Name */}
        <div className="col-md-6">
          <label htmlFor="first_name" className="form-label fw-medium">
            First Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="Enter your first name"
          />
          {errors.first_name && (
            <div className="invalid-feedback">{errors.first_name}</div>
          )}
        </div>

        {/* Middle Name */}
        {showMiddleName && (
          <div className="col-md-6">
            <label htmlFor="middle_name" className="form-label fw-medium">
              Middle Name
            </label>
            <input
              type="text"
              className="form-control"
              id="middle_name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleInputChange}
              placeholder="Enter your middle name (optional)"
            />
          </div>
        )}

        {/* Last Name */}
        <div className={showMiddleName ? 'col-md-6' : 'col-md-6'}>
          <label htmlFor="last_name" className="form-label fw-medium">
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Enter your last name"
          />
          {errors.last_name && (
            <div className="invalid-feedback">{errors.last_name}</div>
          )}
        </div>

        {/* Email */}
        <div className="col-md-6">
          <label htmlFor="email" className="form-label fw-medium">
            Email Address <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label htmlFor="phone" className="form-label fw-medium">
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <div className="invalid-feedback">{errors.phone}</div>
          )}
        </div>

        {/* Date of Birth */}
        {showDOB && (
          <div className="col-md-6">
            <label htmlFor="date_of_birth" className="form-label fw-medium">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Additional Notes */}
        <div className="col-12">
          <label htmlFor="additional_notes" className="form-label fw-medium">
            Additional Notes
          </label>
          <textarea
            className="form-control"
            id="additional_notes"
            name="additional_notes"
            value={formData.additional_notes}
            onChange={handleInputChange}
            placeholder="Any additional information you'd like to share"
            rows="3"
          ></textarea>
        </div>
      </div>
    </FormSection>
  );
};

export default PersonalInfoSection;
