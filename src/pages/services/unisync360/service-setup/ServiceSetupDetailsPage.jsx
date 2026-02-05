import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import { getConsentService, updateConsentService } from "./Queries";
import Swal from "sweetalert2";
import { formatDate } from "../../../../helpers/DateFormater";

const SERVICE_CATEGORIES = [
  { value: 'academic', label: 'Academic Services' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'counseling', label: 'Counseling Services' },
  { value: 'career', label: 'Career Services' },
  { value: 'housing', label: 'Housing Services' },
  { value: 'health', label: 'Health Services' },
  { value: 'immigration', label: 'Immigration Services' },
  { value: 'other', label: 'Other Services' },
];

export const ServiceSetupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchService();
  }, [id]);

const fetchService = async () => {
    try {
      setLoading(true);
      const data = await getConsentService(id);
      setService(data);
      setFormData({
        name: data.name || "",
        code: data.code || "",
        description: data.description || "",
        category: data.category || "other",
        requires_consent: data.requires_consent !== false,
        consent_text: data.consent_text || "",
        summary: data.summary || "",
        legal_reference: data.legal_reference || "",
        min_age_requirement: data.min_age_requirement !== undefined && data.min_age_requirement !== null 
          ? data.min_age_requirement 
          : 18,
        requires_parental_consent: data.requires_parental_consent !== false,
        version: data.version || "1.0.0",
        effective_date: data.effective_date 
          ? (data.effective_date.includes('T') ? data.effective_date.split("T")[0] : data.effective_date)
          : new Date().toISOString().split("T")[0],
        expiry_date: data.expiry_date 
          ? (data.expiry_date.includes('T') ? data.expiry_date.split("T")[0] : data.expiry_date)
          : null,
        display_order: data.display_order || 0,
        is_active: data.is_active !== false,
      });
    } catch (error) {
      console.error("Error fetching service:", error);
      Swal.fire(
        "Error!",
        "Unable to load service details. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Service name is required";
    }
    if (!formData.consent_text?.trim()) {
      newErrors.consent_text = "Consent text is required";
    }
    if (!formData.effective_date) {
      newErrors.effective_date = "Effective date is required";
    }
    if (formData.min_age_requirement !== undefined && formData.min_age_requirement !== null && parseInt(formData.min_age_requirement) < 0) {
      newErrors.min_age_requirement = "Age requirement must be 0 or greater";
    }
    if (
      formData.expiry_date &&
      formData.effective_date &&
      formData.expiry_date < formData.effective_date
    ) {
      newErrors.expiry_date = "Expiry date must be after effective date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data with proper type conversions
      const submitData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        category: formData.category,
        requires_consent: formData.requires_consent,
        consent_text: formData.consent_text,
        summary: formData.summary,
        legal_reference: formData.legal_reference,
        min_age_requirement: parseInt(formData.min_age_requirement, 10) || 18,
        requires_parental_consent: formData.requires_parental_consent,
        version: formData.version,
        effective_date: formData.effective_date || null,
        expiry_date: formData.expiry_date || null,
        display_order: parseInt(formData.display_order, 10) || 0,
        is_active: formData.is_active,
      };
      
      await updateConsentService(id, submitData);
      Swal.fire("Success!", "Service updated successfully.", "success");
      setEditing(false);
      fetchService();
    } catch (error) {
      console.error("Error saving service:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.detail || "Failed to save service",
        "error"
      );
    }
  };

  const getCategoryLabel = (categoryValue) => {
    return SERVICE_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Service not found</h4>
        <p>The requested service could not be found.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/unisync360/service-setup")}
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <>
      <BreadCumb pageList={["Services", "Service Setup", service.name]} />

      <div className="container-xxl">
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{service.name}</h5>
                <div>
                  {!editing && (
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => setEditing(true)}
                    >
                      <i className="bx bx-edit-alt"></i> Edit
                    </button>
                  )}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate("/unisync360/service-setup")}
                  >
                    <i className="bx bx-arrow-back"></i> Back
                  </button>
                </div>
              </div>

              <div className="card-body">
                {!editing ? (
                  <div>
                    {/* Basic Information */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Service Code
                        </h6>
                        <p className="mb-0">
                          <code className="bg-light px-2 py-1 rounded">
                            {service.code}
                          </code>
                        </p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Category
                        </h6>
                        <p className="mb-0">
                          <span className="badge bg-info text-dark">
                            {getCategoryLabel(service.category)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="text-muted text-uppercase fs-12 mb-2">
                            Description
                          </h6>
                          <p className="mb-0">{service.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {service.summary && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="text-muted text-uppercase fs-12 mb-2">
                            Summary
                          </h6>
                          <p className="mb-0">{service.summary}</p>
                        </div>
                      </div>
                    )}

                    {/* Consent Text */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Consent Agreement
                        </h6>
                        <p className="mb-0 text-justify">{service.consent_text}</p>
                      </div>
                    </div>

                    {/* Legal & Requirements */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Min Age Requirement
                        </h6>
                        <p className="mb-0">{service.min_age_requirement} years</p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Parental Consent
                        </h6>
                        <p className="mb-0">
                          <span className={`badge bg-${service.requires_parental_consent ? 'warning' : 'success'}`}>
                            {service.requires_parental_consent ? 'Required' : 'Not Required'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Legal Reference */}
                    {service.legal_reference && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="text-muted text-uppercase fs-12 mb-2">
                            Legal Reference
                          </h6>
                          <p className="mb-0">{service.legal_reference}</p>
                        </div>
                      </div>
                    )}

                    {/* Version & Dates */}
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Version
                        </h6>
                        <p className="mb-0">{service.version}</p>
                      </div>
                      <div className="col-md-3">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Effective Date
                        </h6>
                        <p className="mb-0">{formatDate(service.effective_date)}</p>
                      </div>
                      <div className="col-md-3">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Expiry Date
                        </h6>
                        <p className="mb-0">
                          {service.expiry_date ? formatDate(service.expiry_date) : '-'}
                        </p>
                      </div>
                      <div className="col-md-3">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Status
                        </h6>
                        <p className="mb-0">
                          <span className={`badge bg-${service.is_active ? 'success' : 'secondary'}`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Consent Requirement */}
                    <div className="row">
                      <div className="col-12">
                        <h6 className="text-muted text-uppercase fs-12 mb-2">
                          Consent Requirement
                        </h6>
                        <p className="mb-0">
                          <span className={`badge bg-${service.requires_consent ? 'danger' : 'info'}`}>
                            {service.requires_consent ? 'Consent Required' : 'Consent Optional'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Form */
                  <form onSubmit={handleSave}>
                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label">
                          Service Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? "is-invalid" : ""}`}
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                      </div>

                      {/* Code (readonly) */}
                      <div className="col-md-6">
                        <label htmlFor="code" className="form-label">
                          Service Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="code"
                          value={formData.code}
                          disabled
                        />
                      </div>

                      {/* Category */}
                      <div className="col-md-6">
                        <label htmlFor="category" className="form-label">
                          Category
                        </label>
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                        >
                          {SERVICE_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Version */}
                      <div className="col-md-6">
                        <label htmlFor="version" className="form-label">
                          Version
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="version"
                          name="version"
                          value={formData.version}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Description */}
                      <div className="col-12">
                        <label htmlFor="description" className="form-label">
                          Description
                        </label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="2"
                        ></textarea>
                      </div>

                      {/* Summary */}
                      <div className="col-12">
                        <label htmlFor="summary" className="form-label">
                          Brief Summary
                        </label>
                        <textarea
                          className="form-control"
                          id="summary"
                          name="summary"
                          value={formData.summary}
                          onChange={handleInputChange}
                          rows="2"
                        ></textarea>
                      </div>

                      {/* Consent Text */}
                      <div className="col-12">
                        <label htmlFor="consent_text" className="form-label">
                          Consent Agreement Text <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className={`form-control ${
                            errors.consent_text ? "is-invalid" : ""
                          }`}
                          id="consent_text"
                          name="consent_text"
                          value={formData.consent_text}
                          onChange={handleInputChange}
                          rows="4"
                        ></textarea>
                        {errors.consent_text && (
                          <div className="invalid-feedback">{errors.consent_text}</div>
                        )}
                      </div>

                      {/* Legal Reference */}
                      <div className="col-md-6">
                        <label htmlFor="legal_reference" className="form-label">
                          Legal Reference
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="legal_reference"
                          name="legal_reference"
                          value={formData.legal_reference}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Min Age Requirement */}
                      <div className="col-md-6">
                        <label htmlFor="min_age_requirement" className="form-label">
                          Minimum Age Requirement
                        </label>
                        <input
                          type="number"
                          className={`form-control ${
                            errors.min_age_requirement ? "is-invalid" : ""
                          }`}
                          id="min_age_requirement"
                          name="min_age_requirement"
                          value={formData.min_age_requirement}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>

                      {/* Effective Date */}
                      <div className="col-md-6">
                        <label htmlFor="effective_date" className="form-label">
                          Effective Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${
                            errors.effective_date ? "is-invalid" : ""
                          }`}
                          id="effective_date"
                          name="effective_date"
                          value={formData.effective_date}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Expiry Date */}
                      <div className="col-md-6">
                        <label htmlFor="expiry_date" className="form-label">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          className={`form-control ${
                            errors.expiry_date ? "is-invalid" : ""
                          }`}
                          id="expiry_date"
                          name="expiry_date"
                          value={formData.expiry_date}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Display Order */}
                      <div className="col-md-6">
                        <label htmlFor="display_order" className="form-label">
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
                          <label
                            className="form-check-label"
                            htmlFor="requires_parental_consent"
                          >
                            Requires Parental Consent
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        <i className="bx bx-save me-2"></i>Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setEditing(false);
                          setErrors({});
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Service Information</h5>
              </div>
              <div className="card-body">
                <dl className="row mb-0">
                  <dt className="col-sm-6 text-muted fs-12">Status</dt>
                  <dd className="col-sm-6">
                    <span className={`badge bg-${service.is_active ? 'success' : 'secondary'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </dd>

                  <dt className="col-sm-6 text-muted fs-12">Created</dt>
                  <dd className="col-sm-6 fs-12">{formatDate(service.created_at)}</dd>

                  <dt className="col-sm-6 text-muted fs-12">Updated</dt>
                  <dd className="col-sm-6 fs-12">{formatDate(service.updated_at)}</dd>

                  <dt className="col-sm-6 text-muted fs-12">UID</dt>
                  <dd className="col-sm-6 fs-10">
                    <code>{service.uid}</code>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceSetupDetailsPage;
