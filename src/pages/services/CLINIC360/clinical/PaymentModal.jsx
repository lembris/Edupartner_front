import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createPayment } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

export const PaymentModal = ({ visitUid, selectedObj, onSuccess, onClose, patient, visit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        visit: visitUid || "",
        payment_method: "CASH",
        amount: "",
        reference_number: "",
        description: "",
        payment_date: new Date().toISOString().slice(0, 16),
    };

    const validationSchema = Yup.object().shape({
        visit: Yup.string().required("Visit is required"),
        payment_method: Yup.string().required("Payment method is required"),
        amount: Yup.number().min(1, "Amount must be greater than 0").required("Amount is required"),
    });

    const handleFormSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setIsSubmitting(true);
            const submitValues = { ...values };
            Object.keys(submitValues).forEach((key) => {
                if (submitValues[key] === "") submitValues[key] = null;
            });

            const result = await createPayment(submitValues);

            if (result?.status === 8000) {
                showToast("success", "Payment Recorded Successfully");
                onSuccess?.(result.data);
                resetForm();
                onClose?.();
            } else if (result?.status === 8002) {
                const errors = result?.data || {};
                const errorMessages = Object.values(errors).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
                setErrors(errors);
            } else {
                showToast("error", result?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Payment submission error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while recording payment");
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
                        <i className="bx bx-money"></i>
                        Record Payment
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
                                Payment for <strong>{patient.patient_name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Unknown"}</strong>
                                {patient.patient_id && <span className="ms-2 text-muted small">({patient.patient_id})</span>}
                                {visit?.visit_number && <span className="ms-2 text-muted small">Visit: {visit.visit_number}</span>}
                            </div>
                        </div>
                    )}

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
                                        <label className="form-label">Payment Method *</label>
                                        <Field as="select" name="payment_method" className="form-select">
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Card</option>
                                            <option value="MOBILE_MONEY">Mobile Money</option>
                                            <option value="INSURANCE">Insurance</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                        </Field>
                                        <ErrorMessage name="payment_method" component="div" className="text-danger small" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Amount *</label>
                                        <Field type="number" name="amount" className="form-control" placeholder="0.00" min="0" step="0.01" />
                                        <ErrorMessage name="amount" component="div" className="text-danger small" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Reference Number</label>
                                        <Field type="text" name="reference_number" className="form-control" placeholder="Transaction reference" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Payment Date</label>
                                        <Field type="datetime-local" name="payment_date" className="form-control" />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label">Description</label>
                                        <Field as="textarea" name="description" className="form-control" rows="2" placeholder="Payment description (optional)" />
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
                                                Record Payment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PaymentModal;
