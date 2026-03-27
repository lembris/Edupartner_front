import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { createPrescription, createPrescriptionItem, getPrescriptions, getPharmacyProducts } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

export const PrescriptionModal = ({ consultationUid, selectedObj, onSuccess, onClose, patient, visit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [prescriptionData, setPrescriptionData] = useState(selectedObj);

    // Medication inventory search
    const [medSearch, setMedSearch] = useState("");
    const [medResults, setMedResults] = useState([]);
    const [loadingMeds, setLoadingMeds] = useState(false);
    const [showMedDropdown, setShowMedDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    const isEditMode = !!selectedObj?.uid;

    useEffect(() => {
        if (selectedObj?.uid) {
            setLoadingData(true);
            getPrescriptions({ search: selectedObj.uid })
                .then((res) => {
                    if (res?.status === 8000 && res?.data) {
                        const results = res.data.results || res.data;
                        const found = results.find(p => p.uid === selectedObj.uid);
                        if (found) setPrescriptionData(found);
                    }
                })
                .catch((err) => console.error("Failed to fetch prescription:", err))
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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowMedDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMedSearch = useCallback(async (term) => {
        setMedSearch(term);
        if (!term || term.length < 2) {
            setMedResults([]);
            setShowMedDropdown(false);
            return;
        }
        setShowMedDropdown(true);
        setLoadingMeds(true);
        try {
            const result = await getPharmacyProducts({ search: term, pagination: { page_size: 100 } });
            if (result?.status === 8000) {
                const products = result.data?.results || result.data || [];
                const normalizedTerm = term.toLowerCase();
                const filtered = (Array.isArray(products) ? products : []).filter((p) => {
                    const name = (p.name || "").toLowerCase();
                    const generic = (p.generic_name || "").toLowerCase();
                    const strength = (p.strength || "").toLowerCase();
                    const form = (p.dosage_form || "").toLowerCase();
                    return (
                        name.includes(normalizedTerm) ||
                        generic.includes(normalizedTerm) ||
                        strength.includes(normalizedTerm) ||
                        form.includes(normalizedTerm)
                    );
                });
                setMedResults(filtered);
            }
        } catch (err) {
            console.error("Medication inventory search error:", err);
        } finally {
            setLoadingMeds(false);
        }
    }, []);

    const initialValues = {
        consultation: prescriptionData?.consultation || consultationUid || "",
        is_refillable: prescriptionData?.is_refillable || false,
        refills_authorized: prescriptionData?.refills_authorized || 0,
        expires_on: prescriptionData?.expires_on || "",
        is_covered_by_insurance: prescriptionData?.is_covered_by_insurance ?? true,
        authorization_required: prescriptionData?.authorization_required || false,
        authorization_status: prescriptionData?.authorization_status || "NOT_REQUIRED",
        authorization_number: prescriptionData?.authorization_number || "",
        notes: prescriptionData?.notes || "",
        medicines: [],
    };

    const validationSchema = Yup.object().shape({
        consultation: Yup.string().required("Consultation is required"),
        medicines: Yup.array()
            .of(
                Yup.object().shape({
                    drug_name: Yup.string().required("Drug name is required"),
                    strength: Yup.string().required("Strength is required"),
                    dosage: Yup.string().required("Dosage is required"),
                    frequency: Yup.string().required("Frequency is required"),
                    duration: Yup.string().required("Duration is required"),
                    quantity_prescribed: Yup.number()
                        .min(1, "Quantity must be at least 1")
                        .required("Quantity is required"),
                    unit_price: Yup.number().min(0, "Unit price cannot be negative"),
                })
            )
            .min(1, "Add at least one medicine from inventory"),
    });

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            setIsSubmitting(true);
            const prescriptionPayload = {
                consultation: values.consultation,
                is_refillable: values.is_refillable,
                refills_authorized: values.refills_authorized || 0,
                expires_on: values.expires_on || null,
                is_covered_by_insurance: values.is_covered_by_insurance,
                authorization_required: values.authorization_required,
                authorization_status: values.authorization_status || "NOT_REQUIRED",
                authorization_number: values.authorization_number || null,
                notes: values.notes || null,
            };

            let prescriptionResult;
            if (selectedObj?.uid) {
                prescriptionResult = { status: 8000, data: { uid: selectedObj.uid } };
            } else {
                prescriptionResult = await createPrescription(prescriptionPayload);
            }

            if (prescriptionResult?.status !== 8000) {
                const errors = prescriptionResult?.data || {};
                const errorMessages = Object.values(errors).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
                setErrors(errors);
                return;
            }

            const prescriptionUid = prescriptionResult.data?.uid || selectedObj?.uid;
            const itemResponses = await Promise.all(
                (values.medicines || []).map((med) =>
                    createPrescriptionItem({
                        prescription: prescriptionUid,
                        drug_name: med.drug_name,
                        drug_code: med.drug_code || null,
                        strength: med.strength,
                        form: med.form || null,
                        dosage: med.dosage,
                        frequency: med.frequency,
                        duration: med.duration,
                        route: med.route || "Oral",
                        quantity_prescribed: parseFloat(med.quantity_prescribed) || 1,
                        unit_price: parseFloat(med.unit_price) || 0,
                        is_covered: true,
                        instructions: med.instructions || null,
                    })
                )
            );

            const failed = itemResponses.filter((res) => res?.status !== 8000);
            if (failed.length > 0) {
                const firstError = failed[0]?.data || {};
                const errorMessages =
                    Object.values(firstError).flat().join(". ") ||
                    `${failed.length} medicine row(s) failed to save`;
                showToast("warning", errorMessages);
                setErrors({ medicines: "Some medicine rows failed to save" });
                return;
            }

            showToast("success", "Prescription and medicines saved successfully.");
            onSuccess?.(prescriptionResult.data);
            onClose?.();
        } catch (error) {
            console.error("Prescription + medicine submission error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while saving prescription");
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
                    width: "1100px",
                    maxWidth: "98vw",
                    maxHeight: "94vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                    <h5 style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="bx bx-capsule"></i>
                        {isEditMode ? "Update Prescription" : "New Prescription"}
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
                                Prescription for <strong>{patient.patient_name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Unknown"}</strong>
                                {patient.patient_id && <span className="ms-2 text-muted small">({patient.patient_id})</span>}
                                {visit?.visit_number && <span className="ms-2 text-muted small">Visit: {visit.visit_number}</span>}
                            </div>
                        </div>
                    )}
                    {loadingData ? (
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
                            onSubmit={handleSubmit}
                        >
                            {({ values, setFieldValue }) => {
                                return (
                                    <Form>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <div className="form-check me-4">
                                                <Field type="checkbox" name="is_refillable" className="form-check-input" id="is_refillable" />
                                                <label className="form-check-label" htmlFor="is_refillable">Refillable</label>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Refills Authorized</label>
                                            <Field type="number" name="refills_authorized" className="form-control" min="0" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Expires On</label>
                                            <Field type="date" name="expires_on" className="form-control" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="form-check">
                                                <Field type="checkbox" name="authorization_required" className="form-check-input" id="auth_required" />
                                                <label className="form-check-label" htmlFor="auth_required">Authorization Required</label>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="form-check">
                                                <Field type="checkbox" name="is_covered_by_insurance" className="form-check-input" id="is_covered" />
                                                <label className="form-check-label" htmlFor="is_covered">Covered by Insurance</label>
                                            </div>
                                        </div>
                                        <div className="col-12 mb-3">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label className="form-label">Authorization Status</label>
                                                    <Field as="select" name="authorization_status" className="form-select">
                                                        <option value="NOT_REQUIRED">Not Required</option>
                                                        <option value="PENDING">Pending</option>
                                                        <option value="APPROVED">Approved</option>
                                                        <option value="DENIED">Denied</option>
                                                    </Field>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Authorization Number</label>
                                                    <Field type="text" name="authorization_number" className="form-control" placeholder="Enter authorization number" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Prescription Notes</label>
                                            <Field as="textarea" name="notes" className="form-control" rows="2" placeholder="Additional notes" />
                                        </div>
                                    </div>

                                    <hr className="my-3" />
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <h6 className="fw-bold mb-0">Medicine Details</h6>
                                        <small className="text-muted">Fields with * are required</small>
                                    </div>

                                    <div className="border rounded-3 p-3 mb-3" style={{ background: "#f8fafc" }}>
                                        <label className="form-label fw-semibold mb-2">
                                            <i className="bx bx-search me-1 text-primary"></i>
                                            Pick from Inventory
                                        </label>
                                        <div className="position-relative" ref={dropdownRef}>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white">
                                                    {loadingMeds ? (
                                                        <span className="spinner-border spinner-border-sm text-primary"></span>
                                                    ) : (
                                                        <i className="bx bx-search text-muted"></i>
                                                    )}
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search by name, generic, strength..."
                                                    value={medSearch}
                                                    onFocus={() => { if (medResults.length > 0) setShowMedDropdown(true); }}
                                                    onChange={(e) => {
                                                        const term = e.target.value;
                                                        setMedSearch(term);
                                                        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                                                        searchTimeoutRef.current = setTimeout(() => handleMedSearch(term), 400);
                                                    }}
                                                />
                                            </div>
                                            {showMedDropdown && medResults.length > 0 && (
                                                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
                                                    {medResults.map((med, idx) => (
                                                        <button
                                                            key={`${med.uid}-${idx}`}
                                                            type="button"
                                                            className="dropdown-item d-flex align-items-center justify-content-between py-2 px-3"
                                                            onClick={() => {
                                                                const nextMedicine = {
                                                                    drug_name: med.name || "",
                                                                    drug_code: med.uid || "",
                                                                    strength: med.strength || "",
                                                                    form: med.dosage_form || "",
                                                                    route: "Oral",
                                                                    quantity_prescribed: 1,
                                                                    dosage: "",
                                                                    frequency: "",
                                                                    duration: "",
                                                                    unit_price: 0,
                                                                    instructions: "",
                                                                };
                                                                setFieldValue("medicines", [
                                                                    ...(values.medicines || []),
                                                                    nextMedicine,
                                                                ]);
                                                                setMedSearch("");
                                                                setMedResults([]);
                                                                setShowMedDropdown(false);
                                                            }}
                                                        >
                                                            <div>
                                                                <div className="fw-medium">{med.name} {med.strength}</div>
                                                                <small className="text-muted">
                                                                    {med.dosage_form && <span className="me-2">{med.dosage_form}</span>}
                                                                    {typeof med.quantity_in_stock !== "undefined" && <span>Stock: {med.quantity_in_stock}</span>}
                                                                </small>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            Click a medicine to add a row below, then fill Qty, Dosage, Frequency, Duration, Unit Price.
                                        </small>
                                    </div>

                                    <FieldArray name="medicines">
                                        {({ remove, push }) => (
                                            <div className="mb-2">
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-bordered align-middle">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th style={{ minWidth: "220px" }}>Medicine</th>
                                                                <th style={{ minWidth: "90px" }}>Qty *</th>
                                                                <th style={{ minWidth: "160px" }}>Dosage *</th>
                                                                <th style={{ minWidth: "160px" }}>Frequency *</th>
                                                                <th style={{ minWidth: "160px" }}>Duration *</th>
                                                                <th style={{ minWidth: "120px" }}>Unit Price</th>
                                                                <th style={{ width: "70px" }}></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(values.medicines || []).length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={7} className="text-center text-muted py-3">
                                                                        No medicine rows yet. Search inventory above to add.
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                (values.medicines || []).map((med, idx) => (
                                                                    <tr key={`${med.drug_code || med.drug_name || "med"}-${idx}`}>
                                                                        <td>
                                                                            <div className="fw-semibold">{med.drug_name || "-"}</div>
                                                                            <small className="text-muted">
                                                                                {med.strength || "-"} {med.form ? `| ${med.form}` : ""} {med.route ? `| ${med.route}` : ""}
                                                                            </small>
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                type="number"
                                                                                name={`medicines.${idx}.quantity_prescribed`}
                                                                                className="form-control form-control-sm"
                                                                                min="1"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                type="text"
                                                                                name={`medicines.${idx}.dosage`}
                                                                                className="form-control form-control-sm"
                                                                                placeholder="1 tablet"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                type="text"
                                                                                name={`medicines.${idx}.frequency`}
                                                                                className="form-control form-control-sm"
                                                                                placeholder="Twice daily"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                type="text"
                                                                                name={`medicines.${idx}.duration`}
                                                                                className="form-control form-control-sm"
                                                                                placeholder="5 days"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                type="number"
                                                                                name={`medicines.${idx}.unit_price`}
                                                                                className="form-control form-control-sm"
                                                                                min="0"
                                                                                step="0.01"
                                                                            />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => remove(idx)}
                                                                                title="Remove medicine"
                                                                            >
                                                                                <i className="bx bx-trash"></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </FieldArray>

                                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={isSubmitting}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-save me-1"></i>
                                                    Save Prescription
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Form>
                                );
                            }}
                        </Formik>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PrescriptionModal;
