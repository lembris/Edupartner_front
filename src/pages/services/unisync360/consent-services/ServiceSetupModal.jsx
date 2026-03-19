import React, { useState, useEffect } from "react";
import { createConsentService, updateConsentService } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import GlobalModal from "../../../../components/modal/GlobalModal";

const ServiceSetupModal = ({ show, onClose, service, onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "other",
    requires_consent: true,
    consent_text: "",
    summary: "",
    legal_reference: "",
    min_age_requirement: 18,
    requires_parental_consent: false,
    version: "1.0.0",
    effective_date: new Date().toISOString().split("T")[0],
    expiry_date: null,
    display_order: 0,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      if (service) {
        setFormData({
          name: service.name || "",
          code: service.code || "",
          description: service.description || "",
          category: service.category || "other",
          requires_consent: service.requires_consent !== false,
          consent_text: service.consent_text || "",
          summary: service.summary || "",
          legal_reference: service.legal_reference || "",
          min_age_requirement: service.min_age_requirement || 18,
          requires_parental_consent: service.requires_parental_consent || false,
          version: service.version || "1.0.0",
          effective_date: service.effective_date
            ? service.effective_date.includes("T")
              ? service.effective_date.split("T")[0]
              : service.effective_date
            : new Date().toISOString().split("T")[0],
          expiry_date: service.expiry_date
            ? service.expiry_date.includes("T")
              ? service.expiry_date.split("T")[0]
              : service.expiry_date
            : null,
          display_order: service.display_order || 0,
          is_active: service.is_active !== false,
        });
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
          category: "other",
          requires_consent: true,
          consent_text: "",
          summary: "",
          legal_reference: "",
          min_age_requirement: 18,
          requires_parental_consent: false,
          version: "1.0.0",
          effective_date: new Date().toISOString().split("T")[0],
          expiry_date: null,
          display_order: 0,
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [service, show]);

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
    if (!formData.code?.trim()) {
      newErrors.code = "Service code is required";
    }
    if (!formData.consent_text?.trim()) {
      newErrors.consent_text = "Consent text is required";
    }
    if (!formData.effective_date) {
      newErrors.effective_date = "Effective date is required";
    }
    if (formData.min_age_requirement < 0) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        effective_date: formData.effective_date || null,
        expiry_date: formData.expiry_date || null,
        display_order: formData.display_order || 0,
        min_age_requirement: formData.min_age_requirement || 18,
        is_active: formData.is_active,
      };

      if (service) {
        await updateConsentService(service.uid, submitData);
        showToast("success", "Service updated successfully");
      } else {
        await createConsentService(submitData);
        showToast("success", "Service created successfully");
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving service:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        showToast("warning", "Validation Failed");
      } else {
        showToast("error", "Failed to save service");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalModal
      show={show}
      onClose={onClose}
      title={<><i className="bx bx-envelope me-2"></i>{service ? "Edit Service" : "Create New Service"}</>}
      size="lg"
      onSubmit={handleSubmit}
      submitText={service ? "Update" : "Create"}
      loading={loading}
    >
      <div className="row g-3">
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
            placeholder="e.g., Tuition Payment Processing"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="code" className="form-label">
            Service Code <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.code ? "is-invalid" : ""}`}
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., SVC-001"
            disabled={!!service}
          />
          {errors.code && <div className="invalid-feedback">{errors.code}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="version" className="form-label">Version</label>
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

        <div className="col-12">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Service description..."
            rows="2"
          />
        </div>

        <div className="col-12">
          <label htmlFor="summary" className="form-label">Brief Summary</label>
          <textarea
            className="form-control"
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            placeholder="Brief summary of the service..."
            rows="2"
          />
        </div>

        <div className="col-12">
          <label htmlFor="consent_text" className="form-label">
            Consent Agreement Text <span className="text-danger">*</span>
          </label>
          <textarea
            className={`form-control ${errors.consent_text ? "is-invalid" : ""}`}
            id="consent_text"
            name="consent_text"
            value={formData.consent_text}
            onChange={handleInputChange}
            placeholder="The full consent text that users must agree to..."
            rows="4"
          />
          {errors.consent_text && <div className="invalid-feedback">{errors.consent_text}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="legal_reference" className="form-label">Legal Reference</label>
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

        <div className="col-md-6">
          <label htmlFor="min_age_requirement" className="form-label">Minimum Age Requirement</label>
          <input
            type="number"
            className={`form-control ${errors.min_age_requirement ? "is-invalid" : ""}`}
            id="min_age_requirement"
            name="min_age_requirement"
            value={formData.min_age_requirement}
            onChange={handleInputChange}
            min="0"
            max="150"
          />
          {errors.min_age_requirement && <div className="invalid-feedback">{errors.min_age_requirement}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="effective_date" className="form-label">
            Effective Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={`form-control ${errors.effective_date ? "is-invalid" : ""}`}
            id="effective_date"
            name="effective_date"
            value={formData.effective_date}
            onChange={handleInputChange}
          />
          {errors.effective_date && <div className="invalid-feedback">{errors.effective_date}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="expiry_date" className="form-label">Expiry Date</label>
          <input
            type="date"
            className={`form-control ${errors.expiry_date ? "is-invalid" : ""}`}
            id="expiry_date"
            name="expiry_date"
            value={formData.expiry_date || ""}
            onChange={handleInputChange}
          />
          {errors.expiry_date && <div className="invalid-feedback">{errors.expiry_date}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="display_order" className="form-label">Display Order</label>
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
      </div>
    </GlobalModal>
  );
};

export default ServiceSetupModal;
