import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getLabOrders, getLabOrderItems, LabOrderItemAPI } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

export const LabResultsModal = ({ visitUid, onClose, patient, visit }) => {
    const [loading, setLoading] = useState(true);
    const [labOrders, setLabOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [loadingItems, setLoadingItems] = useState({});
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [resultDrafts, setResultDrafts] = useState({});
    const [savingItems, setSavingItems] = useState({});

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
        if (visitUid) loadLabOrders();
    }, [visitUid]);

    const loadLabOrders = async () => {
        try {
            setLoading(true);
            const result = await getLabOrders({ search: visitUid });
            if (result?.status === 8000) {
                const orders = result.data?.results || result.data || [];
                const safeOrders = Array.isArray(orders) ? orders : [];
                setLabOrders(safeOrders);
                // Auto-expand and load items for the first order
                if (safeOrders.length > 0) {
                    const firstUid = safeOrders[0].uid;
                    setExpandedOrder(firstUid);
                    loadOrderItems(firstUid);
                }
            }
        } catch (err) {
            console.error("Failed to load lab orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadOrderItems = async (orderUid) => {
        if (orderItems[orderUid]) return; // Already loaded
        setLoadingItems((prev) => ({ ...prev, [orderUid]: true }));
        try {
            const result = await getLabOrderItems({ search: orderUid });
            if (result?.status === 8000) {
                const items = result.data?.results || result.data || [];
                setOrderItems((prev) => ({
                    ...prev,
                    [orderUid]: Array.isArray(items) ? items : [],
                }));
            }
        } catch (err) {
            console.error("Failed to load order items:", err);
        } finally {
            setLoadingItems((prev) => ({ ...prev, [orderUid]: false }));
        }
    };

    const toggleOrder = (orderUid) => {
        if (expandedOrder === orderUid) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderUid);
            loadOrderItems(orderUid);
        }
    };

    const updateDraft = (itemUid, field, value) => {
        setResultDrafts((prev) => ({
            ...prev,
            [itemUid]: { ...(prev[itemUid] || {}), [field]: value },
        }));
    };

    const handleSaveResult = async (item) => {
        const draft = resultDrafts[item.uid] || {};
        if (!draft.result_value) {
            showToast("warning", "Please enter a result value");
            return;
        }

        try {
            setSavingItems((prev) => ({ ...prev, [item.uid]: true }));
            const payload = {
                status: "COMPLETED",
                result_value: draft.result_value || null,
                unit: draft.unit || null,
                reference_range: draft.reference_range || null,
                is_abnormal: !!draft.is_abnormal,
                flag: draft.flag || null,
                technician_notes: draft.technician_notes || null,
            };
            await LabOrderItemAPI.update(item.uid, payload);
            showToast("success", `Result saved for ${item.test_name}`);
            // Refresh items for this order
            const orderUid = item.lab_order_uid || item.lab_order;
            if (orderUid) {
                setOrderItems((prev) => ({ ...prev, [orderUid]: undefined }));
                loadOrderItems(orderUid);
            }
        } catch (err) {
            console.error("Save result error:", err);
            showToast("error", err?.message || "Failed to save result");
        } finally {
            setSavingItems((prev) => ({ ...prev, [item.uid]: false }));
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
                    width: "900px",
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
                        <i className="bx bx-file-find"></i>
                        Lab Results
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
                                Lab results for <strong>{patient.patient_name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Unknown"}</strong>
                                {patient.patient_id && <span className="ms-2 text-muted small">({patient.patient_id})</span>}
                                {visit?.visit_number && <span className="ms-2 text-muted small">Visit: {visit.visit_number}</span>}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : labOrders.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bx bx-test-tube fs-1 d-block mb-2"></i>
                            <p className="mb-1">No lab orders found for this visit.</p>
                            <small>Create a lab order from the consultation first.</small>
                        </div>
                    ) : (
                        <div>
                            {labOrders.map((order) => {
                                const items = orderItems[order.uid] || [];
                                const isLoadingItems = loadingItems[order.uid];
                                const isExpanded = expandedOrder === order.uid;

                                return (
                                    <div key={order.uid} className="card border mb-3">
                                        <div
                                            className="card-header bg-light d-flex align-items-center justify-content-between py-2"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => toggleOrder(order.uid)}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <i className={`bx ${isExpanded ? "bx-chevron-down" : "bx-chevron-right"}`}></i>
                                                <span className="fw-medium">
                                                    {order.order_number || "Lab Order"}
                                                    <span className={`badge ms-2 ${order.status === "COMPLETED" ? "bg-success" : order.status === "IN_PROGRESS" ? "bg-warning" : "bg-secondary"} bg-opacity-10 ${order.status === "COMPLETED" ? "text-success" : order.status === "IN_PROGRESS" ? "text-warning" : "text-secondary"}`}>
                                                        {order.status || "ORDERED"}
                                                    </span>
                                                    {order.items_count != null && (
                                                        <span className="badge bg-primary bg-opacity-10 text-primary ms-1">
                                                            {order.items_count} test(s)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <small className="text-muted">
                                                {order.priority && (
                                                    <span className={`badge me-2 ${order.priority === "STAT" ? "bg-danger" : order.priority === "URGENT" ? "bg-warning text-dark" : "bg-info"} bg-opacity-10 ${order.priority === "STAT" ? "text-danger" : order.priority === "URGENT" ? "text-warning" : "text-info"}`}>
                                                        {order.priority}
                                                    </span>
                                                )}
                                                {order.created_at && new Date(order.created_at).toLocaleDateString()}
                                            </small>
                                        </div>

                                        {isExpanded && (
                                            <div className="card-body pt-2">
                                                {order.clinical_notes && (
                                                    <div className="alert alert-light py-2 small mb-3">
                                                        <strong>Clinical Notes:</strong> {order.clinical_notes}
                                                    </div>
                                                )}

                                                {isLoadingItems ? (
                                                    <div className="text-center py-3">
                                                        <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                                        <small className="ms-2 text-muted">Loading test items...</small>
                                                    </div>
                                                ) : items.length === 0 ? (
                                                    <p className="text-muted small">No test items in this order.</p>
                                                ) : (
                                                    <div>
                                                        {items.map((item) => {
                                                            const draft = resultDrafts[item.uid] || {};
                                                            const isCompleted = item.status === "COMPLETED";
                                                            const isSaving = savingItems[item.uid];
                                                            return (
                                                                <div key={item.uid} className="border rounded p-3 mb-2" style={{ background: isCompleted ? "#f0fdf4" : "#fafbfc" }}>
                                                                    <div className="d-flex align-items-start justify-content-between mb-2">
                                                                        <div>
                                                                            <div className="fw-bold">{item.test_name}</div>
                                                                            <small className="text-muted">
                                                                                {item.test_code && <span className="me-2">{item.test_code}</span>}
                                                                                {item.specimen_type && <span>• {item.specimen_type}</span>}
                                                                            </small>
                                                                        </div>
                                                                        <span className={`badge ${isCompleted ? "bg-success" : "bg-warning"} bg-opacity-10 ${isCompleted ? "text-success" : "text-warning"}`}>
                                                                            {item.status || "PENDING"}
                                                                        </span>
                                                                    </div>

                                                                    {isCompleted && item.result_value ? (
                                                                        <div className="row g-2">
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">Result:</small>{" "}
                                                                                <strong>{item.result_value}</strong> {item.unit}
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">Range:</small> {item.reference_range || "—"}
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">Abnormal:</small>{" "}
                                                                                {item.is_abnormal ? <span className="text-danger">Yes</span> : "No"}
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">Flag:</small> {item.flag || "—"}
                                                                            </div>
                                                                            {item.technician_notes && (
                                                                                <div className="col-12">
                                                                                    <small className="text-muted">Notes:</small> {item.technician_notes}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="row g-2">
                                                                            <div className="col-md-4">
                                                                                <label className="form-label small mb-1">Result Value *</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    value={draft.result_value ?? item.result_value ?? ""}
                                                                                    onChange={(e) => updateDraft(item.uid, "result_value", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-2">
                                                                                <label className="form-label small mb-1">Unit</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    value={draft.unit ?? item.unit ?? ""}
                                                                                    onChange={(e) => updateDraft(item.uid, "unit", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <label className="form-label small mb-1">Ref Range</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    value={draft.reference_range ?? item.reference_range ?? ""}
                                                                                    onChange={(e) => updateDraft(item.uid, "reference_range", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-1">
                                                                                <label className="form-label small mb-1">Abn</label>
                                                                                <div className="form-check mt-1">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="form-check-input"
                                                                                        checked={!!(draft.is_abnormal ?? item.is_abnormal)}
                                                                                        onChange={(e) => updateDraft(item.uid, "is_abnormal", e.target.checked)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-2">
                                                                                <label className="form-label small mb-1">Flag</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    value={draft.flag ?? item.flag ?? ""}
                                                                                    onChange={(e) => updateDraft(item.uid, "flag", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-12">
                                                                                <label className="form-label small mb-1">Technician Notes</label>
                                                                                <textarea
                                                                                    className="form-control form-control-sm"
                                                                                    rows="1"
                                                                                    value={draft.technician_notes ?? item.technician_notes ?? ""}
                                                                                    onChange={(e) => updateDraft(item.uid, "technician_notes", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-12 text-end mt-1">
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-primary btn-sm"
                                                                                    onClick={() => handleSaveResult(item)}
                                                                                    disabled={isSaving}
                                                                                >
                                                                                    {isSaving ? (
                                                                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                                                                    ) : (
                                                                                        <i className="bx bx-check me-1"></i>
                                                                                    )}
                                                                                    Save Result
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                setOrderItems({});
                                loadLabOrders();
                            }}
                            disabled={loading}
                        >
                            <i className="bx bx-refresh me-1"></i>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LabResultsModal;
