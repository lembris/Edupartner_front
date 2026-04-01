import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { createDiagnosis, updateDiagnosis, getDiagnoses } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

export const DiagnosisModal = ({ consultationUid, selectedObj, onSuccess, onClose, patient, visit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [diagnosisData, setDiagnosisData] = useState(selectedObj);

    // Multi-diagnosis list
    const [diagnosisList, setDiagnosisList] = useState([]);
    const [savedDiagnoses, setSavedDiagnoses] = useState([]);
    const [isSavingAll, setIsSavingAll] = useState(false);

    // Current form values
    const [formValues, setFormValues] = useState({
        code: "",
        icd_version: "ICD10",
        description: "",
        is_primary: false,
        is_chronic: false,
        is_covered_by_insurance: true,
        exclusion_reason: "",
        notes: "",
    });
    const [formErrors, setFormErrors] = useState({});

    // Catalogue search
    const [catalogSearch, setCatalogSearch] = useState("");
    const [catalogResults, setCatalogResults] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    const isEditMode = !!selectedObj?.uid;

    useEffect(() => {
        if (selectedObj?.uid) {
            setLoadingData(true);
            getDiagnoses({ search: selectedObj.uid })
                .then((res) => {
                    if (res?.status === 8000 && res?.data) {
                        const results = res.data.results || res.data;
                        const found = results.find(d => d.uid === selectedObj.uid);
                        if (found) {
                            setDiagnosisData(found);
                            setFormValues({
                                code: found.code || "",
                                icd_version: found.icd_version || "ICD10",
                                description: found.description || "",
                                is_primary: found.is_primary || false,
                                is_chronic: found.is_chronic || false,
                                is_covered_by_insurance: found.is_covered_by_insurance ?? true,
                                exclusion_reason: found.exclusion_reason || "",
                                notes: found.notes || "",
                            });
                        }
                    }
                })
                .catch((err) => console.error("Failed to fetch diagnosis:", err))
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
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCatalogSearch = useCallback(async (term) => {
        if (!term || term.length < 2) {
            setCatalogResults([]);
            setShowDropdown(false);
            return;
        }
        setShowDropdown(true);
        setLoadingCatalog(true);
        try {
            const result = await getDiagnoses({ search: term, pagination: { page_size: 20 } });
            if (result?.status === 8000) {
                const diagnoses = result.data?.results || result.data || [];
                const seen = new Set();
                const unique = [];
                for (const d of (Array.isArray(diagnoses) ? diagnoses : [])) {
                    const key = `${d.code || ""}|${d.description || ""}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push(d);
                    }
                }
                setCatalogResults(unique);
            }
        } catch (err) {
            console.error("Catalog search error:", err);
        } finally {
            setLoadingCatalog(false);
        }
    }, []);

    const selectFromCatalog = (diagnosis) => {
        setFormValues((prev) => ({
            ...prev,
            code: diagnosis.code || "",
            icd_version: diagnosis.icd_version || "ICD10",
            description: diagnosis.description || "",
            is_chronic: diagnosis.is_chronic || false,
            is_covered_by_insurance: diagnosis.is_covered_by_insurance ?? true,
        }));
        setCatalogSearch("");
        setCatalogResults([]);
        setShowDropdown(false);
    };

    const handleFieldChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: null }));
    };

    const addToList = () => {
        if (!formValues.description.trim()) {
            setFormErrors({ description: "Description is required" });
            return;
        }
        const alreadyAdded = diagnosisList.some(
            (d) => d.description === formValues.description && d.code === formValues.code
        );
        if (alreadyAdded) {
            showToast("warning", "This diagnosis is already in the list");
            return;
        }
        setDiagnosisList((prev) => [...prev, { ...formValues, _id: Date.now() }]);
        setFormValues({
            code: "",
            icd_version: "ICD10",
            description: "",
            is_primary: false,
            is_chronic: false,
            is_covered_by_insurance: true,
            exclusion_reason: "",
            notes: "",
        });
        setFormErrors({});
    };

    const removeFromList = (id) => {
        setDiagnosisList((prev) => prev.filter((d) => d._id !== id));
    };

    // Edit mode: single save
    const handleEditSave = async () => {
        if (!formValues.description.trim()) {
            setFormErrors({ description: "Description is required" });
            return;
        }
        try {
            setIsSubmitting(true);
            const submitValues = {
                consultation: consultationUid,
                ...formValues,
            };
            Object.keys(submitValues).forEach((key) => {
                if (submitValues[key] === "") submitValues[key] = null;
            });
            const result = await updateDiagnosis(selectedObj.uid, submitValues);
            if (result?.status === 8000) {
                showToast("success", "Diagnosis Updated Successfully");
                onSuccess?.();
                onClose?.();
            } else if (result?.status === 8002) {
                const errors = result?.data || {};
                showToast("warning", Object.values(errors).flat().join(". ") || "Validation Failed");
                setFormErrors(errors);
            } else {
                showToast("error", result?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Diagnosis update error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setFormErrors(errorData);
                showToast("warning", Object.values(errorData).flat().join(". ") || "Validation Failed");
            } else {
                showToast("error", "Something went wrong while updating diagnosis");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Create mode: save all at once
    const handleSaveAll = async () => {
        if (diagnosisList.length === 0) {
            showToast("warning", "Add at least one diagnosis to the list");
            return;
        }
        try {
            setIsSavingAll(true);
            let successCount = 0;
            const saved = [];
            for (const diag of diagnosisList) {
                const submitValues = {
                    consultation: consultationUid,
                    code: diag.code || null,
                    icd_version: diag.icd_version || null,
                    description: diag.description,
                    is_primary: diag.is_primary,
                    is_chronic: diag.is_chronic,
                    is_covered_by_insurance: diag.is_covered_by_insurance,
                    exclusion_reason: diag.exclusion_reason || null,
                    notes: diag.notes || null,
                };
                try {
                    const result = await createDiagnosis(submitValues);
                    if (result?.status === 8000) {
                        successCount++;
                        saved.push(result.data);
                    }
                } catch (err) {
                    console.error("Failed to save diagnosis:", diag.description, err);
                }
            }
            setSavedDiagnoses(saved);
            if (successCount > 0) {
                showToast("success", `${successCount} diagnosis(es) saved successfully`);
                onSuccess?.();
            }
            if (successCount < diagnosisList.length) {
                showToast("warning", `${diagnosisList.length - successCount} diagnosis(es) failed to save`);
            }
        } catch (error) {
            console.error("Save all error:", error);
            showToast("error", "Something went wrong while saving diagnoses");
        } finally {
            setIsSavingAll(false);
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
                        <i className="bx bx-clipboard"></i>
                        {isEditMode ? "Update Diagnosis" : "Add Diagnoses"}
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
                                Diagnosis for <strong>{patient.patient_name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Unknown"}</strong>
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
                    ) : savedDiagnoses.length > 0 ? (
                        /* Success summary */
                        <div>
                            <div className="alert alert-success d-flex align-items-center mb-3">
                                <i className="bx bx-check-circle me-2 fs-5"></i>
                                <div>
                                    <strong>{savedDiagnoses.length} Diagnosis(es) Saved Successfully!</strong>
                                </div>
                            </div>
                            <table className="table table-sm table-bordered mb-4">
                                <thead className="table-light">
                                    <tr>
                                        <th>Code</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Chronic</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedDiagnoses.map((d, idx) => (
                                        <tr key={idx}>
                                            <td><small>{d.code || "—"}</small></td>
                                            <td className="fw-medium">{d.description}</td>
                                            <td>
                                                {d.is_primary ? (
                                                    <span className="badge bg-primary bg-opacity-10 text-primary">Primary</span>
                                                ) : (
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary">Secondary</span>
                                                )}
                                            </td>
                                            <td>{d.is_chronic ? <span className="text-warning">Yes</span> : "No"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-end">
                                <button type="button" className="btn btn-primary" onClick={onClose}>
                                    <i className="bx bx-check me-1"></i> Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Catalogue Search */}
                            <div className="border rounded p-3 mb-3" style={{ background: "#f8fafc" }}>
                                <label className="form-label fw-bold mb-2">
                                    <i className="bx bx-search me-1 text-primary"></i>
                                    Search Diagnosis Catalogue
                                </label>
                                <div className="position-relative" ref={dropdownRef}>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">
                                            {loadingCatalog ? (
                                                <span className="spinner-border spinner-border-sm text-primary"></span>
                                            ) : (
                                                <i className="bx bx-search text-muted"></i>
                                            )}
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by ICD code or description (e.g., J06.9, Malaria, HTN)..."
                                            value={catalogSearch}
                                            onFocus={() => { if (catalogResults.length > 0) setShowDropdown(true); }}
                                            onChange={(e) => {
                                                const term = e.target.value;
                                                setCatalogSearch(term);
                                                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                                                searchTimeoutRef.current = setTimeout(() => handleCatalogSearch(term), 400);
                                            }}
                                        />
                                    </div>
                                    {showDropdown && catalogResults.length > 0 && (
                                        <div
                                            className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                                            style={{ zIndex: 10, maxHeight: "200px", overflowY: "auto" }}
                                        >
                                            {catalogResults.map((d, idx) => (
                                                <button
                                                    key={`${d.uid}-${idx}`}
                                                    type="button"
                                                    className="dropdown-item d-flex align-items-center justify-content-between py-2 px-3"
                                                    onClick={() => selectFromCatalog(d)}
                                                >
                                                    <div>
                                                        <div className="fw-medium">{d.description}</div>
                                                        <small className="text-muted">
                                                            {d.code && <span className="me-2">{d.code}</span>}
                                                            {d.icd_version && <span>({d.icd_version})</span>}
                                                        </small>
                                                    </div>
                                                    {d.is_chronic && (
                                                        <span className="badge bg-warning bg-opacity-10 text-warning ms-2">Chronic</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showDropdown && !loadingCatalog && catalogSearch.length >= 2 && catalogResults.length === 0 && (
                                        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-3 text-center text-muted">
                                            <small>No matching diagnoses found. Enter details manually below.</small>
                                        </div>
                                    )}
                                </div>
                                <small className="text-muted mt-1 d-block">Select from previous diagnoses to auto-fill, or enter manually below.</small>
                            </div>

                            {/* Diagnosis Form */}
                            <div className="row">
                                <div className="col-md-4 mb-2">
                                    <label className="form-label">ICD Version *</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={formValues.icd_version}
                                        onChange={(e) => handleFieldChange("icd_version", e.target.value)}
                                    >
                                        <option value="ICD10">ICD-10</option>
                                        <option value="ICD11">ICD-11</option>
                                    </select>
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label className="form-label">ICD Code</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={formValues.code}
                                        onChange={(e) => handleFieldChange("code", e.target.value)}
                                        placeholder="e.g., J06.9"
                                    />
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label className="form-label">Description *</label>
                                    <input
                                        type="text"
                                        className={`form-control form-control-sm ${formErrors.description ? "is-invalid" : ""}`}
                                        value={formValues.description}
                                        onChange={(e) => handleFieldChange("description", e.target.value)}
                                        placeholder="e.g., Malaria, UTI, Hypertension"
                                    />
                                    {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
                                </div>
                                <div className="col-md-3 mb-2">
                                    <div className="form-check mt-4">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_primary"
                                            checked={formValues.is_primary}
                                            onChange={(e) => handleFieldChange("is_primary", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="is_primary">Primary</label>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-2">
                                    <div className="form-check mt-4">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_chronic"
                                            checked={formValues.is_chronic}
                                            onChange={(e) => handleFieldChange("is_chronic", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="is_chronic">Chronic</label>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-2">
                                    <div className="form-check mt-4">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_covered_ins"
                                            checked={formValues.is_covered_by_insurance}
                                            onChange={(e) => handleFieldChange("is_covered_by_insurance", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="is_covered_ins">Insured</label>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-2 d-flex align-items-end">
                                    {isEditMode ? (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm w-100"
                                            onClick={handleEditSave}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                            ) : (
                                                <i className="bx bx-save me-1"></i>
                                            )}
                                            Update
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm w-100"
                                            onClick={addToList}
                                        >
                                            <i className="bx bx-plus me-1"></i>
                                            Add to List
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notes row (collapsed for multi-add) */}
                            {isEditMode && (
                                <div className="row mt-2">
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">Exclusion Reason</label>
                                        <textarea
                                            className="form-control form-control-sm"
                                            rows="2"
                                            value={formValues.exclusion_reason}
                                            onChange={(e) => handleFieldChange("exclusion_reason", e.target.value)}
                                            placeholder="Reason if not covered by insurance"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">Notes</label>
                                        <textarea
                                            className="form-control form-control-sm"
                                            rows="2"
                                            value={formValues.notes}
                                            onChange={(e) => handleFieldChange("notes", e.target.value)}
                                            placeholder="Additional notes"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Diagnosis List (create mode) */}
                            {!isEditMode && diagnosisList.length > 0 && (
                                <div className="mt-3">
                                    <h6 className="fw-bold mb-2">
                                        <i className="bx bx-list-check me-1 text-success"></i>
                                        Diagnoses to Save ({diagnosisList.length})
                                    </h6>
                                    <table className="table table-sm table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Code</th>
                                                <th>Description</th>
                                                <th>Type</th>
                                                <th>Chronic</th>
                                                <th>Insured</th>
                                                <th style={{ width: "40px" }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {diagnosisList.map((d) => (
                                                <tr key={d._id}>
                                                    <td><small>{d.code || "—"}</small></td>
                                                    <td className="fw-medium">{d.description}</td>
                                                    <td>
                                                        {d.is_primary ? (
                                                            <span className="badge bg-primary bg-opacity-10 text-primary">Primary</span>
                                                        ) : (
                                                            <span className="badge bg-secondary bg-opacity-10 text-secondary">Secondary</span>
                                                        )}
                                                    </td>
                                                    <td>{d.is_chronic ? <span className="text-warning">Yes</span> : "No"}</td>
                                                    <td>{d.is_covered_by_insurance ? "Yes" : "No"}</td>
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger p-0 px-1"
                                                            onClick={() => removeFromList(d._id)}
                                                        >
                                                            <i className="bx bx-x"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Footer */}
                            {!isEditMode && (
                                <div className="d-flex justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
                                    <small className="text-muted">
                                        {diagnosisList.length === 0
                                            ? "Search or enter diagnoses above and click \"Add to List\""
                                            : `${diagnosisList.length} diagnosis(es) ready to save`}
                                    </small>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={onClose}
                                            disabled={isSavingAll}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleSaveAll}
                                            disabled={isSavingAll || diagnosisList.length === 0}
                                        >
                                            {isSavingAll ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-check me-1"></i>
                                                    Save All ({diagnosisList.length})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isEditMode && (
                                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DiagnosisModal;
