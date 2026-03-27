import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createConsultation, updateConsultation, getConsultations } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

export const ConsultationModal = ({ visitUid, selectedObj, onSuccess, onClose, onAddDiagnosis, onAddLabOrder, onAddPrescription, patient, visit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [consultationData, setConsultationData] = useState(selectedObj);
    const [savedConsultation, setSavedConsultation] = useState(null);

    const isEditMode = !!selectedObj?.uid;

    useEffect(() => {
        if (selectedObj?.uid) {
            setLoadingData(true);
            getConsultations({ search: selectedObj.uid })
                .then((res) => {
                    if (res?.status === 8000 && res?.data) {
                        const results = res.data.results || res.data;
                        const found = results.find(c => c.uid === selectedObj.uid);
                        if (found) setConsultationData(found);
                    }
                })
                .catch((err) => console.error("Failed to fetch consultation:", err))
                .finally(() => setLoadingData(false));
        }
    }, [selectedObj?.uid]);

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

    const initialValues = {
        visit: consultationData?.visit || visitUid || "",
        symptoms: consultationData?.symptoms || "",
        history_of_presenting_illness: consultationData?.history_of_presenting_illness || "",
        physical_examination: consultationData?.physical_examination || "",
        assessment: consultationData?.assessment || "",
        diagnosis: consultationData?.diagnosis || "",
        treatment_plan: consultationData?.treatment_plan || "",
        notes: consultationData?.notes || "",
        follow_up_required: consultationData?.follow_up_required || false,
        follow_up_date: consultationData?.follow_up_date || "",
        follow_up_instructions: consultationData?.follow_up_instructions || "",
        icd_codes: consultationData?.icd_codes || "",
        referral_notes: consultationData?.referral_notes || "",
        consultation_start: consultationData?.consultation_start || new Date().toISOString().slice(0, 16),
        consultation_end: consultationData?.consultation_end || "",
    };

    const validationSchema = Yup.object().shape({
        visit: Yup.string().required("Visit is required"),
        symptoms: Yup.string().required("Symptoms are required"),
        consultation_start: Yup.string().required("Consultation start time is required"),
    });

    const handleFormSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setIsSubmitting(true);
            const submitValues = { ...values };
            Object.keys(submitValues).forEach((key) => {
                if (submitValues[key] === "") submitValues[key] = null;
            });

            let result;
            if (selectedObj?.uid) {
                result = await updateConsultation(selectedObj.uid, submitValues);
            } else {
                result = await createConsultation(submitValues);
            }

            if (result?.status === 8000) {
                showToast("success", `Consultation ${selectedObj?.uid ? "Updated" : "Created"} Successfully`);
                onSuccess?.(result.data);
                if (isEditMode) {
                    resetForm();
                    onClose?.();
                } else {
                    setSavedConsultation(result.data);
                }
            } else if (result?.status === 8002) {
                const errors = result?.data || {};
                const errorMessages = Object.values(errors).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
                setErrors(errors);
            } else {
                showToast("error", result?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Consultation submission error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while saving consultation");
            }
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

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
                    width: "800px",
                    maxWidth: "95vw",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                    <h5 style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="bx bx-message-square"></i>
                        {isEditMode ? "Update Consultation" : "New Consultation"}
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
                    {patient && (
                        <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                            <i className="bx bx-user me-2 fs-5"></i>
                            <div>
                                Consultation for <strong>{patient.patient_name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Unknown"}</strong>
                                {patient.patient_id && <span className="ms-2 text-muted small">({patient.patient_id})</span>}
                                {visit?.visit_number && <span className="ms-2 text-muted small">Visit: {visit.visit_number}</span>}
                            </div>
                        </div>
                    )}
                    {savedConsultation ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5">
                            <div className="bg-success bg-opacity-10 rounded-circle p-4 mb-4">
                                <i className="bx bx-check-circle text-success" style={{ fontSize: "3rem" }}></i>
                            </div>
                            <h4 className="fw-bold mb-2">Consultation Saved!</h4>
                            <p className="text-muted mb-4">What would the doctor like to do next?</p>
                            <div className="d-flex flex-wrap gap-3 justify-content-center">
                                {onAddDiagnosis && (
                                    <button
                                        type="button"
                                        className="btn btn-warning btn-lg"
                                        onClick={() => onAddDiagnosis(savedConsultation.uid)}
                                    >
                                        <i className="bx bx-clipboard me-2"></i>
                                        Add Diagnosis
                                    </button>
                                )}
                                {onAddLabOrder && (
                                    <button
                                        type="button"
                                        className="btn btn-success btn-lg"
                                        onClick={() => onAddLabOrder(savedConsultation.uid)}
                                    >
                                        <i className="bx bx-test-tube me-2"></i>
                                        Order Lab Test
                                    </button>
                                )}
                                {onAddPrescription && (
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg"
                                        onClick={() => onAddPrescription(savedConsultation.uid)}
                                    >
                                        <i className="bx bx-capsule me-2"></i>
                                        Write Prescription
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-secondary mt-3"
                                onClick={onClose}
                            >
                                <i className="bx bx-x me-1"></i>
                                Close
                            </button>
                        </div>
                    ) : loadingData ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <Formik
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleFormSubmit}
                        >
                            {() => (
                                <Form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Consultation Start *</label>
                                            <Field type="datetime-local" name="consultation_start" className="form-control" />
                                            <ErrorMessage name="consultation_start" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Consultation End</label>
                                            <Field type="datetime-local" name="consultation_end" className="form-control" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Symptoms *</label>
                                            <Field as="textarea" name="symptoms" className="form-control" rows="3" placeholder="Patient-reported symptoms" />
                                            <ErrorMessage name="symptoms" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">History of Presenting Illness</label>
                                            <Field as="textarea" name="history_of_presenting_illness" className="form-control" rows="2" placeholder="History of the current illness" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Physical Examination</label>
                                            <Field as="textarea" name="physical_examination" className="form-control" rows="2" placeholder="Physical examination findings" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Assessment</label>
                                            <Field as="textarea" name="assessment" className="form-control" rows="2" placeholder="Clinical assessment" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Diagnosis</label>
                                            <Field as="textarea" name="diagnosis" className="form-control" rows="2" placeholder="Diagnosis" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Treatment Plan</label>
                                            <Field as="textarea" name="treatment_plan" className="form-control" rows="2" placeholder="Proposed treatment plan" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Notes</label>
                                            <Field as="textarea" name="notes" className="form-control" rows="2" placeholder="Additional notes" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="form-check">
                                                <Field type="checkbox" name="follow_up_required" className="form-check-input" id="follow_up_required" />
                                                <label className="form-check-label" htmlFor="follow_up_required">Follow-up Required</label>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Follow-up Date</label>
                                            <Field type="date" name="follow_up_date" className="form-control" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">ICD Codes</label>
                                            <Field type="text" name="icd_codes" className="form-control" placeholder="e.g., J06.9, K25.0" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Follow-up Instructions</label>
                                            <Field as="textarea" name="follow_up_instructions" className="form-control" rows="2" placeholder="Instructions for follow-up visit" />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Referral Notes</label>
                                            <Field as="textarea" name="referral_notes" className="form-control" rows="2" placeholder="Notes for insurance referrals" />
                                        </div>
                                    </div>

                                    {isEditMode && (onAddDiagnosis || onAddLabOrder || onAddPrescription) && (
                                        <div className="border-top pt-3 mt-3">
                                            <h6 className="mb-3">Quick Actions</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {onAddDiagnosis && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => onAddDiagnosis(selectedObj.uid)}
                                                    >
                                                        <i className="bx bx-clipboard me-1"></i> Add Diagnosis
                                                    </button>
                                                )}
                                                {onAddLabOrder && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => onAddLabOrder(selectedObj.uid)}
                                                    >
                                                        <i className="bx bx-test-tube me-1"></i> Lab Order
                                                    </button>
                                                )}
                                                {onAddPrescription && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-warning"
                                                        onClick={() => onAddPrescription(selectedObj.uid)}
                                                    >
                                                        <i className="bx bx-capsule me-1"></i> Prescription
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
                                                    <i className="bx bx-save me-1"></i>
                                                    {isEditMode ? "Update" : "Save"}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConsultationModal;
