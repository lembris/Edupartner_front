import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createConsentRequest, fetchConsentServices } from "./Queries";
import PublicLayout from "../../../../layouts/PublicLayout";

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

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
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
            Swal.fire("Error", "Failed to load consent services. Please ensure the API server is running.", "error");
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleServiceToggle = (serviceUid) => {
        setSelectedServices(prev => ({
            ...prev,
            [serviceUid]: !prev[serviceUid]
        }));
    };

    const validateForm = () => {
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
    };

    const handleSubmit = async (e) => {
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
            Swal.fire("Error!", error.message || "Failed to submit consent request. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const selectedCount = Object.values(selectedServices).filter(v => v).length;

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
                                style={{ height: '45px' }}
                            />
                            <div className="vr mx-3" style={{ height: '35px', opacity: '0.3' }}></div>
                            <img
                                src="/assets/img/logo/edupartners_nav_logo.png"
                                alt="System Logo"
                                className="top-logo"
                                style={{ height: '45px' }}
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
                                        <i className="bx bx-support text-info fs-3"></i>
                                    </div>
                                    <div className="small fw-medium">24/7 Support</div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-light rounded-circle p-3 d-inline-block mb-2 shadow-sm">
                                        <i className="bx bx-shield-alt text-warning fs-3"></i>
                                    </div>
                                    <div className="small fw-medium">SSL Encrypted</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Container - Full Width */}
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-10">
                        <div className="card shadow-lg border-0">
                            <div className="card-header bg-white border-0 pt-4 pb-3 px-4 px-lg-5">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <h4 className="mb-1 fw-bold">
                                            <i className="bx bx-edit-alt text-primary me-2"></i>
                                            Complete Your Information
                                        </h4>
                                        <p className="text-muted mb-0">
                                            Fill in all required fields to submit your consent request
                                        </p>
                                    </div>
                                    {selectedCount > 0 && (
                                        <span className="badge bg-success px-3 py-2 fs-6">
                                            <i className="bx bx-check me-1"></i>
                                            {selectedCount} services selected
                                        </span>
                                    )}
                                </div>

                                {/* Progress Indicator */}
                                <div className="progress mt-3" style={{ height: '8px' }}>
                                    <div
                                        className="progress-bar bg-primary"
                                        role="progressbar"
                                        style={{
                                            width: `${(Object.keys(formData).filter(key =>
                                                formData[key] && formData[key] !== "" &&
                                                formData[key] !== false
                                            ).length / 13) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="card-body p-4 p-lg-5">
                                {submitSuccess && (
                                    <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                                        <div className="d-flex align-items-center">
                                            <i className="bx bx-check-circle fs-4 me-3"></i>
                                            <div>
                                                <strong>Success!</strong> Your request has been submitted successfully.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Personal Information Section */}
                                    <div className="mb-5">
                                        <div className="section-header mb-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="icon-circle bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-3">
                                                    <i className="bx bx-user fs-5"></i>
                                                </div>
                                                <h5 className="mb-0 fw-semibold">Personal Information</h5>
                                            </div>
                                            <p className="text-muted small mb-0">
                                                Provide your personal details for identification purposes
                                            </p>
                                        </div>

                                        <div className="row g-4">
                                            <div className="col-md-6 col-lg-4">
                                                <label className="form-label fw-medium" htmlFor="first_name">
                                                    First Name <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-user"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id="first_name"
                                                        className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        placeholder="John"
                                                    />
                                                </div>
                                                {errors.first_name && (
                                                    <div className="invalid-feedback d-block">{errors.first_name}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 col-lg-4">
                                                <label className="form-label fw-medium" htmlFor="middle_name">Middle Name</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-user"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id="middle_name"
                                                        className="form-control"
                                                        name="middle_name"
                                                        value={formData.middle_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Michael"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-6 col-lg-4">
                                                <label className="form-label fw-medium" htmlFor="last_name">
                                                    Last Name <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-user"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id="last_name"
                                                        className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                                {errors.last_name && (
                                                    <div className="invalid-feedback d-block">{errors.last_name}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 col-lg-4">
                                                <label className="form-label fw-medium" htmlFor="date_of_birth">Date of Birth</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-calendar"></i>
                                                    </span>
                                                    <input
                                                        type="date"
                                                        id="date_of_birth"
                                                        className="form-control"
                                                        name="date_of_birth"
                                                        value={formData.date_of_birth}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-6 col-lg-4">
                                                <label className="form-label fw-medium" htmlFor="phone">
                                                    Phone <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-phone"></i>
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        id="phone"
                                                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="+1 555-123-4567"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <div className="invalid-feedback d-block">{errors.phone}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 col-lg-4">
                                                <label className="form-label fw-medium" htmlFor="email">
                                                    Email <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-envelope"></i>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="john@example.com"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <div className="invalid-feedback d-block">{errors.email}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent/Guardian Contact Section */}
                                    <div className="mb-5">
                                        <div className="section-header mb-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="icon-circle bg-danger bg-opacity-10 text-danger rounded-circle p-2 me-3">
                                                    <i className="bx bx-phone fs-5"></i>
                                                </div>
                                                <h5 className="mb-0 fw-semibold">Parent/Guardian Contact</h5>
                                            </div>
                                            <p className="text-muted small mb-0">
                                                Provide your parent or guardian's contact information
                                            </p>
                                        </div>

                                        <div className="row g-4">
                                            <div className="col-md-6 col-lg-6">
                                                <label className="form-label fw-medium" htmlFor="emergency_full_name">
                                                    Parent/Guardian Name <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-user"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id="emergency_full_name"
                                                        className={`form-control ${errors.emergency_full_name ? "is-invalid" : ""}`}
                                                        name="emergency_full_name"
                                                        value={formData.emergency_full_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Jane Doe"
                                                    />
                                                </div>
                                                {errors.emergency_full_name && (
                                                    <div className="invalid-feedback d-block">{errors.emergency_full_name}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 col-lg-6">
                                                <label className="form-label fw-medium" htmlFor="emergency_relationship">
                                                    Relationship <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-group"></i>
                                                    </span>
                                                    <select
                                                        id="emergency_relationship"
                                                        className={`form-control ${errors.emergency_relationship ? "is-invalid" : ""}`}
                                                        name="emergency_relationship"
                                                        value={formData.emergency_relationship}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select relationship</option>
                                                        <option value="Father">Father</option>
                                                        <option value="Mother">Mother</option>
                                                        <option value="Guardian">Guardian</option>
                                                        <option value="Grandparent">Grandparent</option>
                                                        <option value="Uncle">Uncle</option>
                                                        <option value="Aunt">Aunt</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                {errors.emergency_relationship && (
                                                    <div className="invalid-feedback d-block">{errors.emergency_relationship}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 col-lg-6">
                                                <label className="form-label fw-medium" htmlFor="emergency_phone">
                                                    Phone <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-phone"></i>
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        id="emergency_phone"
                                                        className={`form-control ${errors.emergency_phone ? "is-invalid" : ""}`}
                                                        name="emergency_phone"
                                                        value={formData.emergency_phone}
                                                        onChange={handleInputChange}
                                                        placeholder="+1 555-123-4567"
                                                    />
                                                </div>
                                                {errors.emergency_phone && (
                                                    <div className="invalid-feedback d-block">{errors.emergency_phone}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 col-lg-6">
                                                <label className="form-label fw-medium" htmlFor="emergency_email">Email</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-envelope"></i>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        id="emergency_email"
                                                        className="form-control"
                                                        name="emergency_email"
                                                        value={formData.emergency_email}
                                                        onChange={handleInputChange}
                                                        placeholder="jane@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services Section */}
                                    <div className="mb-5">
                                        <div className="section-header mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-circle bg-success bg-opacity-10 text-success rounded-circle p-2 me-3">
                                                        <i className="bx bx-list-ul fs-5"></i>
                                                    </div>
                                                    <h5 className="mb-0 fw-semibold">Select Services</h5>
                                                </div>
                                                <div className="text-end">
                                                    <small className="text-muted fw-medium">
                                                        Select all that apply
                                                    </small>
                                                </div>
                                            </div>
                                            <p className="text-muted small mb-0">
                                                Choose the services you need consent for
                                            </p>
                                        </div>

                                        {errors.services && (
                                            <div className="alert alert-danger d-flex align-items-center mb-3">
                                                <i className="bx bx-error-circle me-2"></i>
                                                {errors.services}
                                            </div>
                                        )}

                                        <div className="row g-3">
                                            {services.map((service) => (
                                                <div key={service.uid} className="col-12">
                                                    <div
                                                        className={`service-card border rounded-3 p-3 transition-all ${selectedServices[service.uid]
                                                            ? "border-primary border-2 bg-primary bg-opacity-5"
                                                            : "border-light hover-border-primary"
                                                            }`}
                                                        onClick={() => handleServiceToggle(service.uid)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="d-flex align-items-start">
                                                            <div className="form-check me-3 mt-1">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={selectedServices[service.uid] || false}
                                                                    onChange={() => { }}
                                                                    style={{ width: '20px', height: '20px' }}
                                                                />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <h6 className="mb-0 fw-semibold">{service.name}</h6>
                                                                    <span className="badge bg-light text-dark">
                                                                        <i className="bx bx-category me-1"></i>
                                                                        {service.category}
                                                                    </span>
                                                                </div>
                                                                <p className="text-muted small mb-2">{service.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {services.length === 0 && (
                                            <div className="text-center py-5">
                                                <i className="bx bx-info-circle text-muted" style={{ fontSize: '3rem' }}></i>
                                                <p className="text-muted mt-3 mb-0">No services available at the moment.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Information */}
                                    <div className="mb-5">
                                        <div className="section-header mb-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="icon-circle bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-3">
                                                    <i className="bx bx-note fs-5"></i>
                                                </div>
                                                <h5 className="mb-0 fw-semibold">Additional Information</h5>
                                            </div>
                                            <p className="text-muted small mb-0">
                                                Provide any additional details or notes
                                            </p>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium" htmlFor="parent_name">
                                                    Parent/Guardian Name <span className="text-muted">(if different from above)</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <i className="bx bx-user-plus"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id="parent_name"
                                                        className="form-control"
                                                        name="parent_name"
                                                        value={formData.parent_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Only if different from parent/guardian above"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-medium" htmlFor="additional_notes">Additional Notes</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light align-items-start pt-2">
                                                        <i className="bx bx-comment"></i>
                                                    </span>
                                                    <textarea
                                                        id="additional_notes"
                                                        className="form-control"
                                                        name="additional_notes"
                                                        rows="4"
                                                        value={formData.additional_notes}
                                                        onChange={handleInputChange}
                                                        placeholder="Any additional information you'd like us to know..."
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms Agreement */}
                                    <div className="mb-5">
                                        <div className={`terms-card border rounded-3 p-4 ${errors.agreed_to_terms ? 'border-danger' : 'border-light'}`}>
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    id="agreed_to_terms"
                                                    className={`form-check-input ${errors.agreed_to_terms ? "is-invalid" : ""}`}
                                                    name="agreed_to_terms"
                                                    checked={formData.agreed_to_terms}
                                                    onChange={handleInputChange}
                                                    style={{ width: '20px', height: '20px' }}
                                                />
                                                <label className="form-check-label ms-2 fw-medium" htmlFor="agreed_to_terms">
                                                    I agree to the service terms and conditions <span className="text-danger">*</span>
                                                </label>
                                            </div>
                                            <p className="text-muted small mb-0 ms-4 mt-2">
                                                <i className="bx bx-info-circle me-1"></i>
                                                By checking this box, you confirm that you have read and agree to our service terms and consent policies.
                                            </p>
                                            {errors.agreed_to_terms && (
                                                <div className="text-danger small ms-4 mt-2">
                                                    <i className="bx bx-error-circle me-1"></i>
                                                    {errors.agreed_to_terms}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary px-4"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to clear the form? All entered data will be lost.")) {
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
                                                    setErrors({});
                                                }
                                            }}
                                        >
                                            <i className="bx bx-refresh me-2"></i>
                                            Clear Form
                                        </button>

                                        <div className="d-flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn btn-primary btn-lg px-5 shadow-sm"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bx bx-send me-2"></i>
                                                        Submit Request
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center mt-4 pt-3 border-top">
                                        <p className="text-muted small">
                                            <i className="bx bx-shield-alt me-1"></i>
                                            Your submission is protected by 256-bit SSL encryption.
                                            All fields marked with <span className="text-danger">*</span> are required.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {/* <div className="text-center mt-5 pt-5">
                    <div className="security-notice bg-light rounded-3 p-4 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                        <div className="d-flex align-items-center justify-content-center mb-3">
                            <i className="bx bx-lock-alt text-success fs-3 me-3"></i>
                            <div>
                                <h6 className="mb-1 fw-semibold">Secure & Confidential Submission</h6>
                                <p className="text-muted small mb-0">Your information is encrypted and will never be shared with third parties</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-muted small">
                        Need assistance? Contact our support team at <a href="mailto:support@example.com" className="text-primary fw-medium">support@example.com</a>
                        <br />
                        <small>© {new Date().getFullYear()} All rights reserved.</small>
                    </p>
                </div> */}
            </div>

            <style>
                {`
                /* Full Width Container */
                .container-fluid {
                    max-width: 100%;
                    padding-left: 2rem;
                    padding-right: 2rem;
                }
                
                @media (min-width: 1400px) {
                    .container-fluid {
                        padding-left: 3rem;
                        padding-right: 3rem;
                    }
                }
                
                /* Top Bar Styles */
                .top-bar {
                    background: #ffffff;
                    border-bottom: 1px solid #e9ecef;
                    box-shadow: 0 2px 15px rgba(0,0,0,0.05);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                
                .top-logo {
                    height: 45px;
                    object-fit: contain;
                    transition: transform 0.2s ease;
                }
                
                .top-logo:hover {
                    transform: scale(1.05);
                }
                
                /* Badge Styles */
                .badge {
                    font-weight: 500;
                    letter-spacing: 0.3px;
                }
                
                /* Icon Circles */
                .icon-circle {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Card Enhancements */
                .card {
                    border-radius: 15px;
                    overflow: hidden;
                }
                
                .card-header {
                    border-bottom: 2px solid #f8f9fa;
                }
                
                /* Service Cards */
                .service-card {
                    transition: all 0.2s ease;
                }
                
                .service-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                }
                
                .service-card.border-primary {
                    animation: selectPulse 0.5s ease;
                }
                
                @keyframes selectPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                
                .hover-border-primary:hover {
                    border-color: #0d6efd !important;
                }
                
                /* Terms Card */
                .terms-card {
                    background: #f8f9fa;
                    transition: all 0.2s ease;
                }
                
                .terms-card:hover {
                    background: #ffffff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                
                /* Security Notice */
                .security-notice {
                    border: 1px dashed #dee2e6;
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                }
                
                /* Progress Bar */
                .progress {
                    border-radius: 10px;
                    background-color: #f1f3f5;
                }
                
                .progress-bar {
                    border-radius: 10px;
                    background: linear-gradient(90deg, #0d6efd 0%, #3d8bfd 100%);
                    transition: width 0.5s ease;
                }
                
                /* Input Group Enhancements */
                .input-group-text {
                    border-right: none;
                    background-color: #f8f9fa !important;
                    border-color: #dee2e6;
                    min-width: 45px;
                    justify-content: center;
                }
                
                .form-control:focus {
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
                    border-color: #0d6efd;
                }
                
                .form-control:focus + .input-group-text {
                    border-color: #0d6efd;
                    background-color: #e7f1ff !important;
                }
                
                /* Button Styles */
                .btn-primary {
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                    border: none;
                    transition: all 0.3s ease;
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
                }
                
                .btn-outline-secondary:hover {
                    transform: translateY(-2px);
                }
                
                /* Form Validation */
                .is-invalid {
                    border-color: #dc3545 !important;
                    animation: shake 0.5s ease-in-out;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .invalid-feedback {
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }
                
                /* Responsive Adjustments */
                @media (max-width: 768px) {
                    .container-fluid {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                    
                    .top-bar {
                        padding: 0.5rem 0;
                    }
                    
                    .top-logo {
                        height: 35px;
                    }
                    
                    .display-5 {
                        font-size: 2rem;
                    }
                    
                    .fs-5 {
                        font-size: 1rem;
                    }
                    
                    .btn-lg {
                        padding: 0.75rem 1.5rem;
                        font-size: 1rem;
                    }
                    
                    .d-flex.justify-content-center.flex-wrap.gap-4 {
                        gap: 1.5rem !important;
                    }
                }
                
                @media (max-width: 576px) {
                    .top-bar .d-none.d-md-flex {
                        display: none !important;
                    }
                    
                    .badge.fs-6 {
                        font-size: 0.875rem !important;
                    }
                }
                `}
            </style>
        </PublicLayout>
    );
};