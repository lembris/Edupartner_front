import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createConsentRequest, fetchConsentServices } from "./Queries";
import PublicLayout from "../../../../layouts/PublicLayout";
import "../../../../styles/public-consent-form.css";

// Memoized service card component
const ServiceCard = React.memo(({ service, isSelected, onToggle }) => (
  <div className="col-md-6">
    <div
      className={`service-card card h-100 border-2 cursor-pointer ${
        isSelected ? "border-primary" : "border-light"
      }`}
      onClick={() => onToggle(service.uid)}
      role="button"
      tabIndex="0"
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onToggle(service.uid);
        }
      }}
    >
      <div className="card-body">
        <div className="d-flex align-items-start">
          <input
            type="checkbox"
            className="form-check-input me-3 mt-1"
            id={`service-${service.uid}`}
            checked={isSelected || false}
            onChange={() => onToggle(service.uid)}
          />
          <label
            htmlFor={`service-${service.uid}`}
            className="form-check-label flex-grow-1"
          >
            <h6 className="card-title mb-2 fw-bold">{service.name}</h6>
            {service.description && (
              <p className="card-text text-muted small">{service.description}</p>
            )}
          </label>
        </div>
      </div>
    </div>
  </div>
));

ServiceCard.displayName = "ServiceCard";

export const PublicConsentRequestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    emergency_full_name: "",
    emergency_phone: "",
    emergency_email: "",
    emergency_relationship: "",
    parent_name: "",
    agreed_to_terms: false,
    additional_notes: ""
  });

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = useCallback(async () => {
    try {
      const data = await fetchConsentServices();
      const serviceList = data.results || data || [];
      setServices(serviceList);
      const initialServices = {};
      serviceList.forEach(service => {
        initialServices[service.uid] = false;
      });
      setSelectedServices(initialServices);
    } catch (error) {
      console.error("Error loading services:", error);
      Swal.fire(
        "Error",
        "Failed to load consent services. Please ensure the API server is running.",
        "error"
      );
    }
  }, []);

  // Memoized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Memoized service toggle handler
  const handleServiceToggle = useCallback((serviceUid) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceUid]: !prev[serviceUid]
    }));
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.emergency_full_name?.trim()) {
      newErrors.emergency_full_name = "Parent/Guardian name is required";
    }
    if (!formData.emergency_relationship?.trim()) {
      newErrors.emergency_relationship = "Please select a relationship";
    }
    if (!formData.emergency_phone?.trim()) {
      newErrors.emergency_phone = "Parent/Guardian phone is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.emergency_phone)) {
      newErrors.emergency_phone = "Invalid phone format";
    }

    if (!Object.values(selectedServices).some(v => v)) {
      newErrors.services = "Please select at least one service";
    }

    if (!formData.agreed_to_terms) {
      newErrors.agreed_to_terms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedServices]);

  // Form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire("Validation Error", "Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await createConsentRequest({
        ...formData,
        request_status: "submitted"
      });

      setSubmitSuccess(true);
      Swal.fire({
        title: "Success!",
        html: `<div>
            <p>Your consent request has been submitted successfully.</p>
            <p><strong>Reference ID:</strong> ${response.uid}</p>
            <p>You will receive an email confirmation shortly at <strong>${formData.email}</strong></p>
            <p>We will review your request and contact you within 2-3 business days.</p>
        </div>`,
        icon: "success",
        confirmButtonText: "Close"
      });

      // Reset after delay
      setTimeout(() => {
        setFormData({
          first_name: "",
          middle_name: "",
          last_name: "",
          phone: "",
          email: "",
          date_of_birth: "",
          emergency_full_name: "",
          emergency_phone: "",
          emergency_email: "",
          emergency_relationship: "",
          parent_name: "",
          agreed_to_terms: false,
          additional_notes: ""
        });
        setSelectedServices({});
        loadServices();
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting request:", error);
      Swal.fire(
        "Error!",
        error.message || "Failed to submit consent request. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [formData, selectedServices, validateForm, loadServices]);

  // Memoized selected count
  const selectedCount = useMemo(
    () => Object.values(selectedServices).filter(v => v).length,
    [selectedServices]
  );

  // Memoized service cards
  const serviceCards = useMemo(
    () =>
      services.map((service) => (
        <ServiceCard
          key={service.uid}
          service={service}
          isSelected={selectedServices[service.uid]}
          onToggle={handleServiceToggle}
        />
      )),
    [services, selectedServices, handleServiceToggle]
  );

  return (
    <PublicLayout>
      {/* Enhanced Top Bar with Two Logos */}
      <div className="top-bar">
        <div className="container-fluid px-4 px-lg-5">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <img
                src="/assets/ielets.png"
                alt="Organization Logo"
                className="top-logo me-3"
                style={{ height: "45px" }}
              />
              <div className="vr mx-3" style={{ height: "35px", opacity: "0.3" }}></div>
              <img
                src="/assets/img/logo/edupartners_nav_logo.png"
                alt="System Logo"
                className="top-logo"
                style={{ height: "45px" }}
              />
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-md-flex align-items-center gap-2">
                <span className="badge bg-primary bg-opacity-10 px-3 py-2">
                  <i className="bx bx-time me-1"></i>
                  Quick Process
                </span>
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                  <i className="bx bx-lock-alt me-1"></i>
                  100% Secure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="container-fluid px-4 px-lg-5 py-5">
        {/* Page Header - Centered */}
        <div className="text-center mb-5">
          <div className="mb-4">
            <span className="badge bg-primary bg-gradient px-4 py-3 rounded-pill fs-6">
              <i className="bx bx-file me-2"></i>
              Official Consent Request Form
            </span>
          </div>
          <h1 className="display-5 fw-bold text-dark mb-3">
            Service Consent Request
          </h1>
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <p className="text-muted fs-5 mb-4">
                Complete this secure form to request consent for educational services.
                Your information is encrypted and protected.
              </p>
            </div>
          </div>

          {/* Quick Stats - Centered */}
          <div className="row justify-content-center mb-5">
            <div className="col-md-10 col-lg-8">
              <div className="d-flex justify-content-center flex-wrap gap-4">
                <div className="text-center">
                  <div className="bg-light rounded-circle p-3 d-inline-block mb-2 shadow-sm">
                    <i className="bx bx-check-circle text-success fs-3"></i>
                  </div>
                  <div className="small fw-medium">Secure Submission</div>
                </div>
                <div className="text-center">
                  <div className="bg-light rounded-circle p-3 d-inline-block mb-2 shadow-sm">
                    <i className="bx bx-time text-primary fs-3"></i>
                  </div>
                  <div className="small fw-medium">5-7 Minutes</div>
                </div>
                <div className="text-center">
                  <div className="bg-light rounded-circle p-3 d-inline-block mb-2 shadow-sm">
                    <i className="bx bx-lock-alt text-warning fs-3"></i>
                  </div>
                  <div className="small fw-medium">Data Protected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <form onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="card shadow-sm border-0 mb-5">
                <div className="card-header bg-light border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="step-badge me-3">
                      <span className="badge bg-primary">1</span>
                    </div>
                    <i className="bx bx-user text-primary me-2 fs-5"></i>
                    <div>
                      <h5 className="card-title mb-0 fw-bold">Personal Information</h5>
                      <p className="card-text text-muted small mb-0 mt-1">
                        Please provide your basic details
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {/* First Name */}
                    <div className="col-md-6">
                      <label htmlFor="first_name" className="form-label fw-medium">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
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

                    {/* Last Name */}
                    <div className="col-md-6">
                      <label htmlFor="last_name" className="form-label fw-medium">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
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
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
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
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
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
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="card shadow-sm border-0 mb-5">
                <div className="card-header bg-light border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="step-badge me-3">
                      <span className="badge bg-primary">2</span>
                    </div>
                    <i className="bx bx-phone-call text-primary me-2 fs-5"></i>
                    <div>
                      <h5 className="card-title mb-0 fw-bold">
                        Emergency Contact / Parent Guardian
                      </h5>
                      <p className="card-text text-muted small mb-0 mt-1">
                        Please provide your parent or emergency contact details
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {/* Full Name */}
                    <div className="col-md-6">
                      <label htmlFor="emergency_full_name" className="form-label fw-medium">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.emergency_full_name ? "is-invalid" : ""
                        }`}
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
                        className={`form-select ${
                          errors.emergency_relationship ? "is-invalid" : ""
                        }`}
                        id="emergency_relationship"
                        name="emergency_relationship"
                        value={formData.emergency_relationship}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select a relationship --</option>
                        <option value="Parent">Parent</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.emergency_relationship && (
                        <div className="invalid-feedback">
                          {errors.emergency_relationship}
                        </div>
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
                        className={`form-control ${errors.emergency_phone ? "is-invalid" : ""}`}
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
                </div>
              </div>

              {/* Services Selection Section */}
              <div className="card shadow-sm border-0 mb-5">
                <div className="card-header bg-light border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="step-badge me-3">
                      <span className="badge bg-primary">3</span>
                    </div>
                    <i className="bx bx-list-check text-primary me-2 fs-5"></i>
                    <div>
                      <h5 className="card-title mb-0 fw-bold">Select Services</h5>
                      <p className="card-text text-muted small mb-0 mt-1">
                        Select the services you need ({selectedCount} selected)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {errors.services && (
                    <div className="alert alert-danger mb-4" role="alert">
                      <i className="bx bx-exclamation-circle me-2"></i>
                      {errors.services}
                    </div>
                  )}
                  <div className="row g-3">{serviceCards}</div>
                </div>
              </div>

              {/* Terms & Conditions Section */}
              <div className="card shadow-sm border-0 mb-5">
                <div className="card-header bg-light border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="step-badge me-3">
                      <span className="badge bg-primary">4</span>
                    </div>
                    <i className="bx bx-file-blank text-primary me-2 fs-5"></i>
                    <div>
                      <h5 className="card-title mb-0 fw-bold">Terms & Conditions</h5>
                      <p className="card-text text-muted small mb-0 mt-1">
                        Please review and accept the terms
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="terms-card p-4 rounded mb-4">
                    <h6 className="fw-bold mb-3">Standard Terms & Conditions</h6>
                    <p className="text-muted small mb-0">
                      By submitting this form, you agree to our service terms and
                      acknowledge that your information will be processed securely.
                    </p>
                  </div>

                  <div className="alert alert-info mb-4" role="alert">
                    <div className="d-flex">
                      <i className="bx bx-lock-alt me-2 flex-shrink-0 mt-1"></i>
                      <div>
                        <strong>Secure & Confidential Submission</strong>
                        <p className="text-muted small mb-0 mt-1">
                          Your information is encrypted and protected with 256-bit SSL
                          encryption. We never share your data with third parties.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className={`form-check-input ${
                        errors.agreed_to_terms ? "is-invalid" : ""
                      }`}
                      id="agreed_to_terms"
                      name="agreed_to_terms"
                      checked={formData.agreed_to_terms}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="agreed_to_terms">
                      I agree to the terms and conditions{" "}
                      <span className="text-danger">*</span>
                    </label>
                    {errors.agreed_to_terms && (
                      <div className="invalid-feedback d-block">
                        {errors.agreed_to_terms}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-5 pt-4 border-top">
                <div className="row g-3">
                  <div className="col-12 d-flex gap-2 justify-content-center">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-check-circle me-2"></i>
                          Submit Request
                        </>
                      )}
                    </button>
                    <button
                      type="reset"
                      className="btn btn-outline-secondary btn-lg"
                      disabled={loading}
                    >
                      <i className="bx bx-reset me-2"></i>
                      Clear Form
                    </button>
                  </div>
                </div>

                <div className="text-center mt-4 pt-3">
                  <p className="text-muted small">
                    <i className="bx bx-shield-alt me-1"></i>
                    Your submission is protected by 256-bit SSL encryption.
                    All fields marked with <span className="text-danger">*</span> are
                    required.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicConsentRequestPage;
