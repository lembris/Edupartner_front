import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    createLabOrder,
    createLabOrderItem,
    getLabOrders,
    getLabTests,
    LabOrderAPI,
    LabOrderItemAPI,
} from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

const SPECIMEN_TYPES = [
    "Blood", "Serum", "Plasma", "Urine", "Stool", "Sputum",
    "CSF", "Swab", "Tissue", "Saliva", "Other",
];

export const LabOrderModal = ({ consultationUid, selectedObj, onSuccess, onClose, patient, visit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [labOrderData, setLabOrderData] = useState(selectedObj);
    const [labOrderUid, setLabOrderUid] = useState(null);
    const [showItemForm, setShowItemForm] = useState(false);
    const [items, setItems] = useState([]);
    const [isAddingItem, setIsAddingItem] = useState(false);

    // Performance / results stage (nurse/lab staff)
    const [performSelectedUids, setPerformSelectedUids] = useState([]);
    const [sampleCollected, setSampleCollected] = useState(false);
    // Draft results keyed by LabOrderItem uid
    const [resultDraftByItemUid, setResultDraftByItemUid] = useState({});

    // Lab test catalog
    const [labTestCatalog, setLabTestCatalog] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [filteredTests, setFilteredTests] = useState([]);
    const [showTestDropdown, setShowTestDropdown] = useState(false);
    const [selectedTests, setSelectedTests] = useState([]);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    const isEditMode = !!selectedObj?.uid;

    useEffect(() => {
        if (selectedObj?.uid) {
            setLoadingData(true);
            getLabOrders({ search: selectedObj.uid })
                .then((res) => {
                    if (res?.status === 8000 && res?.data) {
                        const results = res.data.results || res.data;
                        const found = results.find(o => o.uid === selectedObj.uid);
                        if (found) setLabOrderData(found);
                    }
                })
                .catch((err) => console.error("Failed to fetch lab order:", err))
                .finally(() => setLoadingData(false));
        }
    }, [selectedObj?.uid]);

    // Load lab test catalog on mount and when modal opens
    useEffect(() => {
        loadLabTestCatalog();
    }, []);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowTestDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadLabTestCatalog = async () => {
        setLoadingCatalog(true);
        try {
            const result = await getLabTests({ pagination: { page_size: 100 } });
            if (result?.status === 8000) {
                const tests = result.data?.results || result.data || [];
                setLabTestCatalog(tests);
                setFilteredTests(tests);
            } else {
                console.warn("Unexpected response:", result);
                setLabTestCatalog([]);
                setFilteredTests([]);
            }
        } catch (err) {
            console.error("Failed to load lab test catalog:", err);
            setLabTestCatalog([]);
            setFilteredTests([]);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const handleTestSearch = useCallback(async (term) => {
        setShowTestDropdown(true);
        
        if (!term) {
            setFilteredTests(labTestCatalog);
            return;
        }

        // Server-side search for better results
        try {
            setLoadingCatalog(true);
            const result = await getLabTests({ search: term });
            if (result?.status === 8000) {
                const tests = result.data?.results || result.data || [];
                setFilteredTests(Array.isArray(tests) ? tests : []);
            }
        } catch (err) {
            console.error("Search error:", err);
            // Fallback to client-side filtering
            const lower = term.toLowerCase();
            setFilteredTests(
                labTestCatalog.filter(
                    (t) =>
                        t.test_name?.toLowerCase().includes(lower) ||
                        t.test_code?.toLowerCase().includes(lower)
                )
            );
        } finally {
            setLoadingCatalog(false);
        }
    }, [labTestCatalog]);

    const addTestFromCatalog = (test, formSetFieldValue) => {
        if (selectedTests.find((t) => t.uid === test.uid)) {
            showToast("warning", "This test is already added");
            return;
        }
        setSelectedTests((prev) => [...prev, test]);
        setShowTestDropdown(false);
        if (formSetFieldValue) formSetFieldValue("catalog_search", "");
        // Reset dropdown results after selection.
        setFilteredTests(labTestCatalog);
    };

    const removeSelectedTest = (uid) => {
        setSelectedTests((prev) => prev.filter((t) => t.uid !== uid));
    };

    const orderInitialValues = {
        consultation: labOrderData?.consultation || consultationUid || "",
        priority: labOrderData?.priority || "ROUTINE",
        clinical_notes: labOrderData?.clinical_notes || "",
        is_covered_by_insurance: labOrderData?.is_covered_by_insurance ?? true,
        authorization_required: labOrderData?.authorization_required || false,
        authorization_status: labOrderData?.authorization_status || "NOT_REQUIRED",
        authorization_number: labOrderData?.authorization_number || "",
        // UI-only field for filtering the catalog dropdown.
        catalog_search: "",
    };

    const orderValidationSchema = Yup.object().shape({
        consultation: Yup.string().required("Consultation is required"),
        priority: Yup.string().required("Priority is required"),
    });

    const handleOrderSubmit = async (values, { setSubmitting, setErrors }) => {
        if (selectedTests.length === 0) {
            showToast("warning", "Please select at least one lab test");
            setSubmitting(false);
            return;
        }

        try {
            setIsSubmitting(true);
            const submitValues = { ...values };
            // UI-only field; backend doesn't need it.
            delete submitValues.catalog_search;
            Object.keys(submitValues).forEach((key) => {
                if (submitValues[key] === "") submitValues[key] = null;
            });

            let result;
            if (selectedObj?.uid) {
                result = { status: 8000, data: { uid: selectedObj.uid } };
            } else {
                result = await createLabOrder(submitValues);
            }

            if (result?.status === 8000) {
                const orderUid = result.data?.uid || selectedObj?.uid;
                setLabOrderUid(orderUid);

                // Auto-add all selected tests as items
                let successCount = 0;
                const addedItems = [];
                for (const test of selectedTests) {
                    try {
                        const itemData = {
                            lab_order: orderUid,
                            lab_test: test.uid,
                            test_name: test.test_name || test.service_name,
                            test_code: test.test_code || test.service_code || null,
                            specimen_type: test.specimen_type || test.description || null,
                            charge: parseFloat(test.base_price) || 0,
                            is_covered: test.default_insurance_coverage ?? true,
                        };
                        const itemResult = await createLabOrderItem(itemData);
                        if (itemResult?.status === 8000) {
                            addedItems.push(itemResult.data);
                            successCount++;
                        }
                    } catch (err) {
                        console.error("Failed to add test item:", err);
                    }
                }
                setItems(addedItems);
                setShowItemForm(true);
                initPerformanceDrafts(addedItems);

                if (successCount > 0) {
                    showToast("success", `Lab Order created with ${successCount} test(s)`);
                } else {
                    showToast("warning", "Lab Order created but no tests could be added");
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
            console.error("Lab order submission error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while saving lab order");
            }
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    const initPerformanceDrafts = (orderedItems) => {
        const uids = orderedItems.map((i) => i.uid).filter(Boolean);
        setPerformSelectedUids(uids);
        setSampleCollected(false);
        const drafts = {};
        for (const item of orderedItems) {
            if (!item?.uid) continue;
            drafts[item.uid] = {
                result_value: item.result_value || "",
                result_text: item.result_text || "",
                reference_range: item.reference_range || "",
                unit: item.unit || "",
                is_abnormal: !!item.is_abnormal,
                flag: item.flag || "",
                technician_notes: item.technician_notes || "",
                // Doctor_notes can be filled later (optional)
                doctor_notes: item.doctor_notes || "",
                status: "COMPLETED",
            };
        }
        setResultDraftByItemUid(drafts);
    };

    const handlePerformanceSave = async () => {
        if (!labOrderUid) return;

        if (!sampleCollected) {
            showToast("warning", "Mark sample collected before saving results");
            return;
        }

        if (!performSelectedUids.length) {
            showToast("warning", "Select at least one test to perform");
            return;
        }

        try {
            setIsSubmitting(true);

            // Update order timestamps/status first
            const allItemStatuses = performSelectedUids.map((uid) => {
                const draft = resultDraftByItemUid[uid];
                return draft?.status || "COMPLETED";
            });
            const allCompleted = allItemStatuses.every((s) => s === "COMPLETED");

            if (sampleCollected) {
                await LabOrderAPI.update(labOrderUid, {
                    status: allCompleted ? "COMPLETED" : "IN_PROGRESS",
                    sample_collected_at: new Date().toISOString(),
                    completed_at: allCompleted ? new Date().toISOString() : null,
                });
            }

            // Update each selected item with results
            await Promise.all(
                performSelectedUids.map(async (uid) => {
                    const draft = resultDraftByItemUid[uid] || {};
                    const payload = {
                        status: draft.status || "COMPLETED",
                        result_value: draft.result_value || null,
                        result_text: draft.result_text || null,
                        reference_range: draft.reference_range || null,
                        unit: draft.unit || null,
                        is_abnormal: !!draft.is_abnormal,
                        flag: draft.flag || null,
                        technician_notes: draft.technician_notes || null,
                        doctor_notes: draft.doctor_notes || null,
                    };
                    await LabOrderItemAPI.update(uid, payload);
                })
            );

            showToast("success", "Lab results saved successfully");
            onClose?.();
        } catch (err) {
            console.error("Lab performance save error:", err);
            showToast("error", err?.message || "Failed to save results");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = () => {
        onSuccess?.();
        onClose?.();
    };

    const totalCharge = [...selectedTests].reduce((sum, t) => sum + (parseFloat(t.base_price) || 0), 0)
        + items.reduce((sum, i) => sum + (parseFloat(i.charge) || 0), 0);

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
                        <i className="bx bx-test-tube"></i>
                        {isEditMode ? "Update Lab Order" : "New Lab Order"}
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
                                Ordering lab tests for <strong>{patient.patient_name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Unknown"}</strong>
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
                    ) : !showItemForm ? (
                        <Formik
                            enableReinitialize
                            initialValues={orderInitialValues}
                            validationSchema={orderValidationSchema}
                            onSubmit={handleOrderSubmit}
                        >
                            {({ values, setFieldValue }) => (
                                <Form>
                                    {/* Order Details */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Priority *</label>
                                            <Field as="select" name="priority" className="form-select">
                                                <option value="ROUTINE">Routine</option>
                                                <option value="URGENT">Urgent</option>
                                                <option value="STAT">STAT</option>
                                            </Field>
                                            <ErrorMessage name="priority" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex gap-3 mt-4 pt-1">
                                                <div className="form-check">
                                                    <Field type="checkbox" name="is_covered_by_insurance" className="form-check-input" id="is_covered_by_insurance" />
                                                    <label className="form-check-label" htmlFor="is_covered_by_insurance">Insurance Covered</label>
                                                </div>
                                                <div className="form-check">
                                                    <Field type="checkbox" name="authorization_required" className="form-check-input" id="authorization_required" />
                                                    <label className="form-check-label" htmlFor="authorization_required">Auth Required</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Clinical Notes</label>
                                            <Field as="textarea" name="clinical_notes" className="form-control" rows="2" placeholder="Clinical information for the lab" />
                                        </div>
                                    </div>

                                    {/* Lab Test Selection */}
                                    <div className="border-top pt-3 mt-2">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="mb-0 fw-bold">
                                                <i className="bx bx-test-tube me-2 text-success"></i>
                                                Select Lab Tests *
                                            </h6>
                                            {loadingCatalog && (
                                                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                            )}
                                        </div>

                                        {/* Search from catalog */}
                                        <div className="position-relative mb-3" ref={dropdownRef}>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white">
                                                    <i className="bx bx-search text-muted"></i>
                                                </span>
                                                <Field name="catalog_search">
                                                    {({ field }) => (
                                                        <input
                                                            type="text"
                                                            {...field}
                                                            className="form-control"
                                                            placeholder="Search available lab tests (e.g., CBC, Urinalysis, Blood Sugar)..."
                                                            onFocus={() => {
                                                                setShowTestDropdown(true);
                                                                // Load all tests if catalog is empty
                                                                if (labTestCatalog.length === 0) {
                                                                    loadLabTestCatalog();
                                                                } else if (filteredTests.length === 0) {
                                                                    setFilteredTests(labTestCatalog);
                                                                }
                                                            }}
                                                            onChange={(e) => {
                                                                const term = e.target.value;
                                                                setFieldValue("catalog_search", term);
                                                                // Debounced search
                                                                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                                                                searchTimeoutRef.current = setTimeout(() => {
                                                                    handleTestSearch(term);
                                                                }, 300);
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                            </div>
                                            {showTestDropdown && filteredTests.length > 0 && (
                                                <div
                                                    className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                                                    style={{ zIndex: 10, maxHeight: "200px", overflowY: "auto" }}
                                                >
                                                    {filteredTests.map((test) => {
                                                        const alreadyAdded = selectedTests.find((t) => t.uid === test.uid);
                                                        return (
                                                            <button
                                                                key={test.uid}
                                                                type="button"
                                                                className={`dropdown-item d-flex align-items-center justify-content-between py-2 px-3 ${alreadyAdded ? "bg-light" : ""}`}
                                                                onClick={() => addTestFromCatalog(test, setFieldValue)}
                                                                disabled={!!alreadyAdded}
                                                            >
                                                                <div>
                                                                    <div className="fw-medium">{test.test_name}</div>
                                                                    <small className="text-muted">
                                                                        {test.test_code && <span className="me-2">{test.test_code}</span>}
                                                                        {test.specimen_type && <span>{test.specimen_type}</span>}
                                                                    </small>
                                                                </div>
                                                                <div className="text-end">
                                                                    <span className="badge bg-success bg-opacity-10 text-success">
                                                                        {parseFloat(test.base_price || 0).toLocaleString()} TZS
                                                                    </span>
                                                                    {alreadyAdded && (
                                                                        <small className="d-block text-muted">Added</small>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {showTestDropdown && !loadingCatalog && filteredTests.length === 0 && (
                                                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-3 text-center text-muted">
                                                    <small>{values.catalog_search ? "No tests found" : "No lab tests available"}</small>
                                                </div>
                                            )}
                                            {loadingCatalog && (
                                                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 p-3 text-center">
                                                    <small className="text-muted">
                                                        <span className="spinner-border spinner-border-sm me-1"></span> Loading...
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Tests */}
                                        {selectedTests.length > 0 ? (
                                            <div className="mb-3">
                                                <small className="text-muted d-block mb-2">
                                                    {selectedTests.length} test(s) selected
                                                </small>
                                                <table className="table table-sm table-bordered mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Test Name</th>
                                                            <th>Code</th>
                                                            <th>Specimen</th>
                                                            <th>Charge</th>
                                                            <th style={{ width: "40px" }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedTests.map((test) => (
                                                            <tr key={test.uid}>
                                                                <td className="fw-medium">{test.test_name}</td>
                                                                <td><small>{test.test_code || "—"}</small></td>
                                                                <td><small>{test.specimen_type || "—"}</small></td>
                                                                <td>
                                                                    <small>{parseFloat(test.base_price || 0).toLocaleString()}</small>
                                                                </td>
                                                                <td className="text-center">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger p-0 px-1"
                                                                        onClick={() => removeSelectedTest(test.uid)}
                                                                    >
                                                                        <i className="bx bx-x"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="table-light">
                                                        <tr>
                                                            <td colSpan="3" className="fw-bold text-end">Total:</td>
                                                            <td colSpan="2" className="fw-bold">
                                                                {selectedTests.reduce((sum, t) => sum + (parseFloat(t.base_price) || 0), 0).toLocaleString()} TZS
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="alert alert-warning d-flex align-items-center py-2 small mb-3">
                                                <i className="bx bx-info-circle me-2"></i>
                                                Search and select lab tests above. At least one test is required.
                                            </div>
                                        )}
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
                                            disabled={isSubmitting || selectedTests.length === 0}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Creating Order...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-check me-1"></i>
                                                    Create Order ({selectedTests.length} test{selectedTests.length !== 1 ? "s" : ""})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    ) : (
                        /* Success / Item Review */
                        <div>
                            <div className="alert alert-success d-flex align-items-center mb-3">
                                <i className="bx bx-check-circle me-2 fs-5"></i>
                                <div>
                                    <strong>Lab Order Created Successfully!</strong>
                                    <span className="ms-1">{items.length} test(s) ordered.</span>
                                </div>
                            </div>

                            {items.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-2">
                                        <i className="bx bx-list-check me-1 text-success"></i>
                                        Ordered Tests
                                    </h6>
                                    <table className="table table-sm table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Test Name</th>
                                                <th>Code</th>
                                                <th>Specimen</th>
                                                <th>Charge</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-medium">{item.test_name}</td>
                                                    <td><small>{item.test_code || "—"}</small></td>
                                                    <td><small>{item.specimen_type || "—"}</small></td>
                                                    <td><small>{parseFloat(item.charge || 0).toLocaleString()}</small></td>
                                                    <td>
                                                        <span className="badge bg-warning bg-opacity-10 text-warning">
                                                            {item.status || "PENDING"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Performance / Results stage */}
                            <div className="border rounded p-3 mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <h6 className="fw-bold mb-0">
                                        <i className="bx bx-walk me-2 text-primary"></i>
                                        Perform Ordered Tests
                                    </h6>
                                    <small className="text-muted">Select tests and enter results</small>
                                </div>

                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="sample_collected"
                                        checked={sampleCollected}
                                        onChange={(e) => setSampleCollected(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="sample_collected">
                                        Sample collected
                                    </label>
                                </div>

                                <label className="form-label small text-muted mb-2">Pre-created tests (Lab Order Items)</label>
                                <div className="list-group mb-3" style={{ maxHeight: "220px", overflowY: "auto" }}>
                                    {items.map((item) => {
                                        const checked = performSelectedUids.includes(item.uid);
                                        return (
                                            <button
                                                key={item.uid}
                                                type="button"
                                                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-2 ${checked ? "active" : ""}`}
                                                onClick={() => {
                                                    setPerformSelectedUids((prev) => {
                                                        if (prev.includes(item.uid)) {
                                                            return prev.filter((u) => u !== item.uid);
                                                        }
                                                        return [...prev, item.uid];
                                                    });
                                                }}
                                            >
                                                <input type="checkbox" checked={checked} readOnly />
                                                <div className="min-w-0 flex-grow-1">
                                                    <div className="fw-medium text-truncate">
                                                        {item.test_name}
                                                    </div>
                                                    <small className={checked ? "text-white-50" : "text-muted"}>
                                                        {item.status || "PENDING"}
                                                    </small>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {performSelectedUids.map((uid) => {
                                    const item = items.find((i) => i.uid === uid);
                                    if (!item) return null;
                                    const draft = resultDraftByItemUid[uid] || {};
                                    return (
                                        <div key={uid} className="border rounded p-3 mb-3" style={{ background: "#fafbfc" }}>
                                            <div className="d-flex align-items-start justify-content-between mb-2">
                                                <div>
                                                    <div className="fw-bold">{item.test_name}</div>
                                                    <small className="text-muted">
                                                        {item.test_code || "—"} • {item.specimen_type || "—"}
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <label className="form-label small mb-1">Result Value</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={draft.result_value ?? ""}
                                                        onChange={(e) =>
                                                            setResultDraftByItemUid((prev) => ({
                                                                ...prev,
                                                                [uid]: { ...(prev[uid] || {}), result_value: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small mb-1">Unit</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={draft.unit ?? ""}
                                                        onChange={(e) =>
                                                            setResultDraftByItemUid((prev) => ({
                                                                ...prev,
                                                                [uid]: { ...(prev[uid] || {}), unit: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small mb-1">Reference Range</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={draft.reference_range ?? ""}
                                                        onChange={(e) =>
                                                            setResultDraftByItemUid((prev) => ({
                                                                ...prev,
                                                                [uid]: { ...(prev[uid] || {}), reference_range: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small mb-1">Abnormal</label>
                                                    <div className="form-check mt-2">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={!!draft.is_abnormal}
                                                            onChange={(e) =>
                                                                setResultDraftByItemUid((prev) => ({
                                                                    ...prev,
                                                                    [uid]: { ...(prev[uid] || {}), is_abnormal: e.target.checked },
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small mb-1">Flag</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={draft.flag ?? ""}
                                                        onChange={(e) =>
                                                            setResultDraftByItemUid((prev) => ({
                                                                ...prev,
                                                                [uid]: { ...(prev[uid] || {}), flag: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label small mb-1">Technician Notes</label>
                                                    <textarea
                                                        className="form-control form-control-sm"
                                                        rows="2"
                                                        value={draft.technician_notes ?? ""}
                                                        onChange={(e) =>
                                                            setResultDraftByItemUid((prev) => ({
                                                                ...prev,
                                                                [uid]: { ...(prev[uid] || {}), technician_notes: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handlePerformanceSave}
                                        disabled={isSubmitting || performSelectedUids.length === 0}
                                    >
                                        <i className="bx bx-check me-1"></i>
                                        Save Results
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LabOrderModal;
