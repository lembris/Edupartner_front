import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../../../layouts/PublicLayout";
import "../../../../styles/public-consent-form.css";

const Swal = lazy(() => import("sweetalert2").then(mod => ({ default: mod.default })));
import { createConsentRequest, fetchConsentServices } from "./Queries";

// Memoized service card component
const ServiceCard = React.memo(({ service, isSelected, onToggle }) => (
  <div className="col-md-6">
    <div
      className={`service-card card h-100 border-2 cursor-pointer ${isSelected ? "border-primary" : "border-light"
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

const showSwal = async (options) => {
  const SwalModule = await import("sweetalert2");
  return SwalModule.default.fire(options);
};

const SkeletonLoader = () => (
  <div className="skeleton-loader p-4">
    <div className="skeleton-text skeleton-animate" style={{ width: "60%", height: "20px", marginBottom: "12px" }}></div>
    <div className="skeleton-text skeleton-animate" style={{ width: "100%", height: "40px" }}></div>
  </div>
);

const MemoizedInput = React.memo(({ label, name, type = "text", required = false, placeholder = "", options = [], value, onChange, error, className = "" }) => {
  const inputId = `${name}-${React.useId()}`;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="form-label fw-medium">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {type === "select" ? (
        <select
          className={`form-select ${error ? "is-invalid" : ""}`}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="">-- Select a relationship --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          className="form-control"
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows="3"
        />
      ) : (
        <input
          type={type}
          className={`form-control ${error ? "is-invalid" : ""}`}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
});

MemoizedInput.displayName = "MemoizedInput";

export const PublicConsentRequestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
      setInitialLoading(true);
      const response = await fetchConsentServices();
      const serviceList = response.data || response.results || response || [];
      setServices(serviceList);
      const initialServices = {};
      serviceList.forEach(service => {
        initialServices[service.uid] = false;
      });
      setSelectedServices(initialServices);
    } catch (error) {
      console.error("Error loading services:", error);
      const SwalModule = await import("sweetalert2");
      SwalModule.default.fire(
        "Error",
        "Failed to load consent services. Please ensure the API server is running.",
        "error"
      );
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Memoized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, []);

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
      const SwalModule = await import("sweetalert2");
      SwalModule.default.fire("Validation Error", "Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await createConsentRequest({
        ...formData,
        request_status: "submitted"
      });

      setSubmitSuccess(true);
      const SwalModule = await import("sweetalert2");
      SwalModule.default.fire({
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
      const SwalModule = await import("sweetalert2");
      SwalModule.default.fire(
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
    <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
      <PublicLayout>
        {/* Enhanced Top Bar with Two Logos */}
        <div className="top-bar">
          <div className="container-fluid px-4 px-lg-5">
            <div className="d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center">
                <img
                  src="/assets/ielts_oficial_partners.png"
                  alt="Organization Logo"
                  className="top-logo me-3"
                  style={{ height: "100px" }}
                  loading="lazy"
                  width="140"
                  height="100"
                />
                <div className="vr mx-3" style={{ height: "85px", opacity: "0.3" }}></div>
                <img
                  src="/assets/img/logo/edupartner_neo_logo.png"
                  alt="System Logo"
                  className="top-logo"
                  style={{ height: "100px" }}
                  loading="lazy"
                  width="240"
                  height="100"
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
                      <MemoizedInput
                        label="First Name"
                        name="first_name"
                        required
                        placeholder="Enter your first name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        error={errors.first_name}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Middle Name"
                        name="middle_name"
                        placeholder="Enter your middle name (optional)"
                        value={formData.middle_name}
                        onChange={handleInputChange}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Last Name"
                        name="last_name"
                        required
                        placeholder="Enter your last name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        error={errors.last_name}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Email Address"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        required
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        error={errors.phone}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Date of Birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Additional Notes"
                        name="additional_notes"
                        type="textarea"
                        placeholder="Any additional information you'd like to share"
                        value={formData.additional_notes}
                        onChange={handleInputChange}
                        className="col-12"
                      />
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
                      <MemoizedInput
                        label="Full Name"
                        name="emergency_full_name"
                        required
                        placeholder="Enter full name"
                        value={formData.emergency_full_name}
                        onChange={handleInputChange}
                        error={errors.emergency_full_name}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Relationship"
                        name="emergency_relationship"
                        type="select"
                        required
                        value={formData.emergency_relationship}
                        onChange={handleInputChange}
                        error={errors.emergency_relationship}
                        options={["Parent", "Guardian", "Spouse", "Sibling", "Friend", "Other"]}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Email Address"
                        name="emergency_email"
                        type="email"
                        placeholder="Enter email address (optional)"
                        value={formData.emergency_email}
                        onChange={handleInputChange}
                        className="col-md-6"
                      />

                      <MemoizedInput
                        label="Phone Number"
                        name="emergency_phone"
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={formData.emergency_phone}
                        onChange={handleInputChange}
                        error={errors.emergency_phone}
                        className="col-md-6"
                      />
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
                    {initialLoading ? (
                      <div className="row g-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div className="col-md-6" key={i}>
                            <SkeletonLoader />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="row g-3">{serviceCards}</div>
                    )}
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
                        className={`form-check-input ${errors.agreed_to_terms ? "is-invalid" : ""
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
    </Suspense>
  );
};

export default PublicConsentRequestPage;
