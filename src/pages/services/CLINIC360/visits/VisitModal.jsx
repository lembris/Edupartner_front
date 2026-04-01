import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createVisit } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

const VISIT_TYPE_OPTIONS = [
    { value: "NEW", label: "New Patient" },
    { value: "FOLLOW_UP", label: "Follow Up" },
    { value: "EMERGENCY", label: "Emergency" },
    { value: "CHECK_UP", label: "Routine Check-up" },
    { value: "SPECIALIST", label: "Specialist Consultation" },
];

const PAYMENT_TYPE_OPTIONS = [
    { value: "CASH", label: "Cash" },
    { value: "INSURANCE", label: "Insurance" },
    { value: "BOTH", label: "Cash & Insurance" },
    { value: "CORPORATE", label: "Corporate Billing" },
    { value: "FREE", label: "Free Service" },
];

export const VisitModal = ({ patient, onSuccess, onClose, onRecordVitals }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedVisit, setSavedVisit] = useState(null);
    const [formData, setFormData] = useState({
        patient: patient?.uid || "",
        visit_type: "NEW",
        payment_type: "CASH",
        visit_date: new Date().toISOString().split("T")[0],
        chief_complaint: "",
        notes: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.visit_type) newErrors.visit_type = "Visit type is required";
        if (!formData.visit_date) newErrors.visit_date = "Visit date is required";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await createVisit(formData);

            if (result?.status === 8000) {
                showToast("success", "Visit Created Successfully");
                if (onSuccess) onSuccess(result.data);
                if (onRecordVitals) {
                    setSavedVisit({ ...result.data, patient_name: patientName });
                } else {
                    onClose?.();
                }
            } else if (result?.status === 8002) {
                const errs = result?.data || {};
                const errorMessages = Object.values(errs).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
                setErrors(errs);
            } else {
                showToast("error", result?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Visit creation error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while creating visit");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "Unknown";

    return createPortal(
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
            }}
        >
            <div
                className="modal-content"
                style={{
                    width: "600px",
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                    <h5 style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="bx bx-calendar-plus"></i>
                        Create Visit
                    </h5>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        style={{ border: "none", background: "#6b7280", color: "#fff", borderRadius: "50%", width: "1.75rem", height: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.1rem", padding: 0, lineHeight: 1 }}
                    >
                        <i className="bx bx-x"></i>
                    </button>
                </div>
                <div className="modal-body" style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>
                    {savedVisit ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5">
                            <div className="bg-success bg-opacity-10 rounded-circle p-4 mb-4">
                                <i className="bx bx-check-circle text-success" style={{ fontSize: "3rem" }}></i>
                            </div>
                            <h4 className="fw-bold mb-2">Visit Created Successfully!</h4>
                            <p className="text-muted mb-1">
                                <strong>{savedVisit.patient_name}</strong>
                            </p>
                            {savedVisit.visit_number && (
                                <p className="text-muted small mb-4">
                                    Visit #: <strong>{savedVisit.visit_number}</strong>
                                </p>
                            )}
                            <p className="text-muted mb-4">What would you like to do next?</p>
                            <div className="d-flex flex-wrap gap-3 justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg"
                                    onClick={() => {
                                        onRecordVitals(savedVisit);
                                        onClose?.();
                                    }}
                                >
                                    <i className="bx bx-heart me-2"></i>
                                    Record Vitals
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-lg"
                                    onClick={onClose}
                                >
                                    <i className="bx bx-x me-2"></i>
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : <>
                    <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                        <i className="bx bx-user me-2 fs-5"></i>
                        <div>
                            Creating visit for <strong>{patientName}</strong>
                            {patient?.patient_id && <span className="ms-2 text-muted small">(ID: {patient.patient_id})</span>}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Visit Type *</label>
                                <select
                                    name="visit_type"
                                    className={`form-select ${errors.visit_type ? "is-invalid" : ""}`}
                                    value={formData.visit_type}
                                    onChange={handleChange}
                                >
                                    {VISIT_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.visit_type && <div className="invalid-feedback">{errors.visit_type}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Payment Type *</label>
                                <select
                                    name="payment_type"
                                    className={`form-select ${errors.payment_type ? "is-invalid" : ""}`}
                                    value={formData.payment_type}
                                    onChange={handleChange}
                                >
                                    {PAYMENT_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.payment_type && <div className="invalid-feedback">{errors.payment_type}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Visit Date *</label>
                                <input
                                    type="date"
                                    name="visit_date"
                                    className={`form-control ${errors.visit_date ? "is-invalid" : ""}`}
                                    value={formData.visit_date}
                                    onChange={handleChange}
                                />
                                {errors.visit_date && <div className="invalid-feedback">{errors.visit_date}</div>}
                            </div>

                            <div className="col-12">
                                <label className="form-label">Chief Complaint / Reason for Visit</label>
                                <textarea
                                    name="chief_complaint"
                                    className="form-control"
                                    rows="2"
                                    placeholder="Main reason for the visit"
                                    value={formData.chief_complaint}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">Notes</label>
                                <textarea
                                    name="notes"
                                    className="form-control"
                                    rows="2"
                                    placeholder="Additional notes (optional)"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-check me-1"></i>
                                        Create Visit
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    </>}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default VisitModal;
