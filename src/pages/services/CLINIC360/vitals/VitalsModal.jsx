import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createVital } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

export const VitalsModal = ({ visit, onSuccess, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        temperature: "",
        respiratory_rate: "",
        oxygen_saturation: "",
        weight: "",
        height: "",
        pain_level: "",
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

        const payload = { visit: visit?.uid };
        Object.entries(formData).forEach(([key, value]) => {
            payload[key] = value === "" ? null : value;
        });

        try {
            setIsSubmitting(true);
            const result = await createVital(payload);

            if (result?.status === 8000) {
                showToast("success", "Vital Signs Recorded Successfully");
                if (onSuccess) onSuccess(result.data);
                onClose?.();
            } else if (result?.status === 8002) {
                const errs = result?.data || {};
                const errorMessages = Object.values(errs).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
                setErrors(errs);
            } else {
                showToast("error", result?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Vital signs creation error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while recording vital signs");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const patientName = visit?.patient_name || (visit?.patient ? `${visit.patient.first_name} ${visit.patient.last_name}` : "Unknown");

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
                    width: "900px",
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
                        <i className="bx bx-heart"></i>
                        Record Vital Signs
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
                    <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                        <i className="bx bx-user me-2 fs-5"></i>
                        <div>
                            Recording vitals for <strong>{patientName}</strong>
                            {visit?.visit_number && <span className="ms-2 text-muted small">(Visit: {visit.visit_number})</span>}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Blood Pressure (Systolic)</label>
                                <input
                                    type="number"
                                    name="blood_pressure_systolic"
                                    className={`form-control ${errors.blood_pressure_systolic ? "is-invalid" : ""}`}
                                    value={formData.blood_pressure_systolic}
                                    onChange={handleChange}
                                    placeholder="mmHg"
                                    min={70}
                                    max={250}
                                />
                                {errors.blood_pressure_systolic && <div className="invalid-feedback">{errors.blood_pressure_systolic}</div>}
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Blood Pressure (Diastolic)</label>
                                <input
                                    type="number"
                                    name="blood_pressure_diastolic"
                                    className={`form-control ${errors.blood_pressure_diastolic ? "is-invalid" : ""}`}
                                    value={formData.blood_pressure_diastolic}
                                    onChange={handleChange}
                                    placeholder="mmHg"
                                    min={40}
                                    max={150}
                                />
                                {errors.blood_pressure_diastolic && <div className="invalid-feedback">{errors.blood_pressure_diastolic}</div>}
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Heart Rate</label>
                                <input
                                    type="number"
                                    name="heart_rate"
                                    className={`form-control ${errors.heart_rate ? "is-invalid" : ""}`}
                                    value={formData.heart_rate}
                                    onChange={handleChange}
                                    placeholder="bpm"
                                    min={30}
                                    max={250}
                                />
                                {errors.heart_rate && <div className="invalid-feedback">{errors.heart_rate}</div>}
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Temperature</label>
                                <input
                                    type="number"
                                    name="temperature"
                                    className={`form-control ${errors.temperature ? "is-invalid" : ""}`}
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    placeholder="°C"
                                    step="0.1"
                                />
                                {errors.temperature && <div className="invalid-feedback">{errors.temperature}</div>}
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Respiratory Rate</label>
                                <input
                                    type="number"
                                    name="respiratory_rate"
                                    className={`form-control ${errors.respiratory_rate ? "is-invalid" : ""}`}
                                    value={formData.respiratory_rate}
                                    onChange={handleChange}
                                    placeholder="Breaths/min"
                                    min={8}
                                    max={60}
                                />
                                {errors.respiratory_rate && <div className="invalid-feedback">{errors.respiratory_rate}</div>}
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Oxygen Saturation</label>
                                <input
                                    type="number"
                                    name="oxygen_saturation"
                                    className={`form-control ${errors.oxygen_saturation ? "is-invalid" : ""}`}
                                    value={formData.oxygen_saturation}
                                    onChange={handleChange}
                                    placeholder="SpO2 %"
                                    min={50}
                                    max={100}
                                />
                                {errors.oxygen_saturation && <div className="invalid-feedback">{errors.oxygen_saturation}</div>}
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Weight</label>
                                <input
                                    type="number"
                                    name="weight"
                                    className={`form-control ${errors.weight ? "is-invalid" : ""}`}
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="kg"
                                    step="0.1"
                                />
                                {errors.weight && <div className="invalid-feedback">{errors.weight}</div>}
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Height</label>
                                <input
                                    type="number"
                                    name="height"
                                    className={`form-control ${errors.height ? "is-invalid" : ""}`}
                                    value={formData.height}
                                    onChange={handleChange}
                                    placeholder="cm"
                                    step="0.1"
                                />
                                {errors.height && <div className="invalid-feedback">{errors.height}</div>}
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Pain Level</label>
                                <input
                                    type="number"
                                    name="pain_level"
                                    className={`form-control ${errors.pain_level ? "is-invalid" : ""}`}
                                    value={formData.pain_level}
                                    onChange={handleChange}
                                    placeholder="0-10"
                                    min={0}
                                    max={10}
                                />
                                <small className="text-muted">0 = No pain, 10 = Worst pain</small>
                                {errors.pain_level && <div className="invalid-feedback">{errors.pain_level}</div>}
                            </div>

                            <div className="col-md-8">
                                <label className="form-label">Notes</label>
                                <textarea
                                    name="notes"
                                    className={`form-control ${errors.notes ? "is-invalid" : ""}`}
                                    rows="2"
                                    placeholder="Additional observations (optional)"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                                {errors.notes && <div className="invalid-feedback">{errors.notes}</div>}
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
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-check me-1"></i>
                                        Save Vitals
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default VitalsModal;
