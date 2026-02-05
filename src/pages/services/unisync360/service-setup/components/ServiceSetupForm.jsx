import React, { useState, useEffect } from 'react';

const ServiceSetupForm = ({ service, categories, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'other',
    requires_consent: true,
    consent_text: '',
    summary: '',
    legal_reference: '',
    min_age_requirement: 18,
    requires_parental_consent: false,
    version: '1.0.0',
    effective_date: new Date().toISOString().split('T')[0],
    expiry_date: null,
    display_order: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  // Load service data when editing
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        code: service.code || '',
        description: service.description || '',
        category: service.category || 'other',
        requires_consent: service.requires_consent !== false,
        consent_text: service.consent_text || '',
        summary: service.summary || '',
        legal_reference: service.legal_reference || '',
        min_age_requirement: service.min_age_requirement || 18,
        requires_parental_consent: service.requires_parental_consent || false,
        version: service.version || '1.0.0',
        effective_date: service.effective_date 
          ? (service.effective_date.includes('T') ? service.effective_date.split('T')[0] : service.effective_date)
          : new Date().toISOString().split('T')[0],
        expiry_date: service.expiry_date 
          ? (service.expiry_date.includes('T') ? service.expiry_date.split('T')[0] : service.expiry_date)
          : null,
        display_order: service.display_order || 0,
        is_active: service.is_active !== false,
      });
    } else {
      // Reset to defaults for new service
      setFormData({
        name: '',
        code: '',
        description: '',
        category: 'other',
        requires_consent: true,
        consent_text: '',
        summary: '',
        legal_reference: '',
        min_age_requirement: 18,
        requires_parental_consent: false,
        version: '1.0.0',
        effective_date: new Date().toISOString().split('T')[0],
        expiry_date: null,
        display_order: 0,
        is_active: true,
      });
    }
  }, [service]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Service name is required';
    }
    if (!formData.code?.trim()) {
      newErrors.code = 'Service code is required';
    }
    if (!formData.consent_text?.trim()) {
      newErrors.consent_text = 'Consent text is required';
    }
    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required';
    }
    if (formData.min_age_requirement < 0) {
      newErrors.min_age_requirement = 'Age requirement must be 0 or greater';
    }
    if (formData.expiry_date && formData.effective_date && formData.expiry_date < formData.effective_date) {
      newErrors.expiry_date = 'Expiry date must be after effective date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data - convert empty strings to null for dates
      const submitData = {
        ...formData,
        effective_date: formData.effective_date || null,
        expiry_date: formData.expiry_date || null,
        display_order: formData.display_order || 0,
        min_age_requirement: formData.min_age_requirement || 18,
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Name */}
        <div className="col-md-6">
          <label htmlFor="name" className="form-label fw-medium">
            Service Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Tuition Payment Processing"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Code */}
        <div className="col-md-6">
          <label htmlFor="code" className="form-label fw-medium">
            Service Code <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.code ? 'is-invalid' : ''}`}
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., SVC-001"
            disabled={!!service}
          />
          {errors.code && <div className="invalid-feedback">{errors.code}</div>}
        </div>

        {/* Category */}
        <div className="col-md-6">
          <label htmlFor="category" className="form-label fw-medium">
            Category
          </label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Requires Consent */}
        <div className="col-md-6">
          <div className="form-check mt-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="requires_consent"
              name="requires_consent"
              checked={formData.requires_consent}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="requires_consent">
              Requires Consent
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="col-12">
          <label htmlFor="description" className="form-label fw-medium">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Service description..."
            rows="3"
          ></textarea>
        </div>

        {/* Summary */}
        <div className="col-12">
          <label htmlFor="summary" className="form-label fw-medium">
            Brief Summary
          </label>
          <textarea
            className="form-control"
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            placeholder="Brief summary of the service..."
            rows="2"
          ></textarea>
        </div>

        {/* Consent Text */}
        <div className="col-12">
          <label htmlFor="consent_text" className="form-label fw-medium">
            Consent Agreement Text <span className="text-danger">*</span>
          </label>
          <textarea
            className={`form-control ${errors.consent_text ? 'is-invalid' : ''}`}
            id="consent_text"
            name="consent_text"
            value={formData.consent_text}
            onChange={handleInputChange}
            placeholder="The full consent text that users must agree to..."
            rows="5"
          ></textarea>
          {errors.consent_text && <div className="invalid-feedback">{errors.consent_text}</div>}
        </div>

        {/* Legal Reference */}
        <div className="col-md-6">
          <label htmlFor="legal_reference" className="form-label fw-medium">
            Legal Reference
          </label>
          <input
            type="text"
            className="form-control"
            id="legal_reference"
            name="legal_reference"
            value={formData.legal_reference}
            onChange={handleInputChange}
            placeholder="e.g., GDPR Article 7"
          />
        </div>

        {/* Min Age Requirement */}
        <div className="col-md-6">
          <label htmlFor="min_age_requirement" className="form-label fw-medium">
            Minimum Age Requirement
          </label>
          <input
            type="number"
            className={`form-control ${errors.min_age_requirement ? 'is-invalid' : ''}`}
            id="min_age_requirement"
            name="min_age_requirement"
            value={formData.min_age_requirement}
            onChange={handleInputChange}
            min="0"
            max="150"
          />
          {errors.min_age_requirement && (
            <div className="invalid-feedback">{errors.min_age_requirement}</div>
          )}
        </div>

        {/* Requires Parental Consent */}
        <div className="col-md-6">
          <div className="form-check mt-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="requires_parental_consent"
              name="requires_parental_consent"
              checked={formData.requires_parental_consent}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="requires_parental_consent">
              Requires Parental Consent
            </label>
          </div>
        </div>

        {/* Version */}
        <div className="col-md-6">
          <label htmlFor="version" className="form-label fw-medium">
            Version
          </label>
          <input
            type="text"
            className="form-control"
            id="version"
            name="version"
            value={formData.version}
            onChange={handleInputChange}
            placeholder="e.g., 1.0.0"
          />
        </div>

        {/* Effective Date */}
        <div className="col-md-6">
          <label htmlFor="effective_date" className="form-label fw-medium">
            Effective Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={`form-control ${errors.effective_date ? 'is-invalid' : ''}`}
            id="effective_date"
            name="effective_date"
            value={formData.effective_date}
            onChange={handleInputChange}
          />
          {errors.effective_date && (
            <div className="invalid-feedback">{errors.effective_date}</div>
          )}
        </div>

        {/* Expiry Date */}
        <div className="col-md-6">
          <label htmlFor="expiry_date" className="form-label fw-medium">
            Expiry Date
          </label>
          <input
            type="date"
            className={`form-control ${errors.expiry_date ? 'is-invalid' : ''}`}
            id="expiry_date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleInputChange}
          />
          {errors.expiry_date && (
            <div className="invalid-feedback">{errors.expiry_date}</div>
          )}
        </div>

        {/* Display Order */}
        <div className="col-md-6">
          <label htmlFor="display_order" className="form-label fw-medium">
            Display Order
          </label>
          <input
            type="number"
            className="form-control"
            id="display_order"
            name="display_order"
            value={formData.display_order}
            onChange={handleInputChange}
            min="0"
          />
        </div>

        {/* Is Active */}
        <div className="col-md-6">
          <div className="form-check mt-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
            />
            <label className="form-check-label" htmlFor="is_active">
              Active (Service is active and available)
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="row g-3 mt-4">
        <div className="col-12 d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bx bx-save me-2"></i>
                {service ? 'Update Service' : 'Create Service'}
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default ServiceSetupForm;
