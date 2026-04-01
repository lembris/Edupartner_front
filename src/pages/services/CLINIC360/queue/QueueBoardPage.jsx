import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
    getQueueStations,
    getQueueEntries,
    createQueueEntry,
    updateQueueEntry,
    getVisits,
} from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

const ACTIVE_STATUSES = ["WAITING", "CALLED", "IN_SERVICE"];

const PRIORITY_MAP = {
    1: { label: "Emergency", color: "#dc3545" },
    2: { label: "Very High", color: "#e85d04" },
    3: { label: "High", color: "#fd7e14" },
    4: { label: "Normal", color: "#0d6efd" },
    5: { label: "Low", color: "#6c757d" },
};

const STATUS_BADGE = {
    WAITING: { label: "Waiting", bg: "#ffc107", text: "#000" },
    CALLED: { label: "Called", bg: "#17a2b8", text: "#fff" },
    IN_SERVICE: { label: "In Service", bg: "#28a745", text: "#fff" },
    COMPLETED: { label: "Completed", bg: "#6c757d", text: "#fff" },
    TRANSFERRED: { label: "Transferred", bg: "#6610f2", text: "#fff" },
    SKIPPED: { label: "Skipped", bg: "#fd7e14", text: "#fff" },
    CANCELLED: { label: "Cancelled", bg: "#dc3545", text: "#fff" },
    NO_SHOW: { label: "No Show", bg: "#343a40", text: "#fff" },
};

const REFRESH_INTERVAL = 30000;

// ============ Add to Queue Modal ============
const AddToQueueModal = ({ stations, onClose, onSuccess }) => {
    const [visitSearch, setVisitSearch] = useState("");
    const [visitResults, setVisitResults] = useState([]);
    const [searchingVisits, setSearchingVisits] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [selectedStation, setSelectedStation] = useState("");
    const [selectedPriority, setSelectedPriority] = useState(4);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchTimerRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleKeyDown);
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [onClose]);

    const handleVisitSearch = useCallback((value) => {
        setVisitSearch(value);
        setSelectedVisit(null);

        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

        if (!value.trim()) {
            setVisitResults([]);
            return;
        }

        searchTimerRef.current = setTimeout(async () => {
            try {
                setSearchingVisits(true);
                const res = await getVisits({ search: value.trim() });
                if (res?.status === 8000) {
                    setVisitResults(res.data?.results || res.data || []);
                }
            } catch (err) {
                console.error("Error searching visits:", err);
            } finally {
                setSearchingVisits(false);
            }
        }, 400);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!selectedVisit) {
            showToast("warning", "Please select a visit");
            return;
        }
        if (!selectedStation) {
            showToast("warning", "Please select a station");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                visit: selectedVisit.uid,
                station: selectedStation,
                priority: Number(selectedPriority),
                queue_number: `Q-${Date.now()}`,
                position: 0,
                status: "WAITING",
            };

            const result = await createQueueEntry(payload);

            if (result?.status === 8000) {
                showToast("success", "Patient added to queue successfully");
                onSuccess?.();
                onClose?.();
            } else if (result?.status === 8002) {
                const errorMessages = Object.values(result?.data || {}).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", result?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Queue entry creation error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while adding to queue");
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedVisit, selectedStation, selectedPriority, onSuccess, onClose]);

    const activeStations = stations.filter((s) => s.is_active);

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
                    width: "550px",
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
                        <i className="bx bx-list-plus"></i>
                        Add to Queue
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
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Search Visit *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by visit number or patient name..."
                                value={visitSearch}
                                onChange={(e) => handleVisitSearch(e.target.value)}
                            />
                            {searchingVisits && (
                                <div className="text-muted small mt-1">
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                    Searching...
                                </div>
                            )}
                            {visitResults.length > 0 && !selectedVisit && (
                                <div className="list-group mt-1" style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "0.375rem" }}>
                                    {visitResults.map((v) => (
                                        <button
                                            key={v.uid}
                                            type="button"
                                            className="list-group-item list-group-item-action py-2"
                                            onClick={() => {
                                                setSelectedVisit(v);
                                                setVisitSearch(v.visit_number || v.uid);
                                                setVisitResults([]);
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">{v.visit_number || v.uid}</span>
                                                <span className="text-muted small">{v.patient_name || ""}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedVisit && (
                                <div className="alert alert-info d-flex align-items-center mt-2 py-2 mb-0" role="alert">
                                    <i className="bx bx-check-circle me-2"></i>
                                    <span>
                                        <strong>{selectedVisit.visit_number || selectedVisit.uid}</strong>
                                        {selectedVisit.patient_name && ` — ${selectedVisit.patient_name}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Station *</label>
                            <select
                                className="form-select"
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                            >
                                <option value="">Select Station</option>
                                {activeStations.map((s) => (
                                    <option key={s.uid} value={s.uid}>
                                        {s.name} {s.code ? `(${s.code})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                            >
                                {Object.entries(PRIORITY_MAP).map(([val, { label }]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
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
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-plus me-1"></i>
                                        Add to Queue
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

// ============ Queue Entry Card ============
const QueueEntryCard = ({ entry, onStatusUpdate }) => {
    const [updating, setUpdating] = useState(false);
    const priority = PRIORITY_MAP[entry.priority] || PRIORITY_MAP[4];
    const statusBadge = STATUS_BADGE[entry.status] || STATUS_BADGE.WAITING;

    const handleAction = useCallback(async (newStatus) => {
        try {
            setUpdating(true);
            const result = await updateQueueEntry(entry.uid, { status: newStatus });
            if (result?.status === 8000) {
                showToast("success", `Status updated to ${STATUS_BADGE[newStatus]?.label || newStatus}`);
                onStatusUpdate?.();
            } else {
                showToast("error", result?.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Status update error:", error);
            showToast("error", "Something went wrong while updating status");
        } finally {
            setUpdating(false);
        }
    }, [entry.uid, onStatusUpdate]);

    const renderActionButton = () => {
        if (updating) {
            return (
                <button className="btn btn-sm btn-outline-secondary w-100" disabled>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Updating...
                </button>
            );
        }

        switch (entry.status) {
            case "WAITING":
                return (
                    <button
                        className="btn btn-sm btn-info w-100"
                        onClick={() => handleAction("CALLED")}
                    >
                        <i className="bx bx-phone-call me-1"></i> Call
                    </button>
                );
            case "CALLED":
                return (
                    <button
                        className="btn btn-sm btn-success w-100"
                        onClick={() => handleAction("IN_SERVICE")}
                    >
                        <i className="bx bx-play me-1"></i> Start Service
                    </button>
                );
            case "IN_SERVICE":
                return (
                    <button
                        className="btn btn-sm btn-secondary w-100"
                        onClick={() => handleAction("COMPLETED")}
                    >
                        <i className="bx bx-check-double me-1"></i> Complete
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="card mb-2 shadow-sm"
            style={{
                borderLeft: `4px solid ${priority.color}`,
                transition: "box-shadow 0.2s ease",
            }}
        >
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                        {entry.queue_number}
                    </span>
                    <span
                        className="badge"
                        style={{
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.text,
                            fontSize: "0.7rem",
                        }}
                    >
                        {statusBadge.label}
                    </span>
                </div>

                <div className="mb-2">
                    <div className="fw-medium text-truncate" title={entry.patient_name}>
                        <i className="bx bx-user me-1 text-muted"></i>
                        {entry.patient_name || "—"}
                    </div>
                    {entry.patient_phone && (
                        <div className="text-muted small">
                            <i className="bx bx-phone me-1"></i>
                            {entry.patient_phone}
                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span
                        className="badge"
                        style={{
                            backgroundColor: `${priority.color}20`,
                            color: priority.color,
                            fontSize: "0.7rem",
                        }}
                    >
                        {priority.label}
                    </span>
                    {entry.waiting_duration && (
                        <span className="text-muted small">
                            <i className="bx bx-time-five me-1"></i>
                            {entry.waiting_duration}
                        </span>
                    )}
                </div>

                {renderActionButton()}
            </div>
        </div>
    );
};

// ============ Station Column ============
const StationColumn = ({ station, entries, onStatusUpdate }) => {
    const stationEntries = entries.filter((e) => e.station === station.uid);
    const displayColor = station.display_color || "#696cff";

    return (
        <div
            className="card h-100"
            style={{
                minWidth: "300px",
                maxWidth: "340px",
                flex: "0 0 auto",
                borderTop: `4px solid ${displayColor}`,
                backgroundColor: "#fafbfc",
            }}
        >
            <div
                className="card-header d-flex justify-content-between align-items-center py-3"
                style={{ backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0" }}
            >
                <div>
                    <h6 className="mb-0 fw-bold">{station.name}</h6>
                    {station.code && (
                        <span className="text-muted small">{station.code}</span>
                    )}
                </div>
                <span
                    className="badge rounded-pill"
                    style={{ backgroundColor: displayColor, color: "#fff", fontSize: "0.8rem" }}
                >
                    {stationEntries.length}
                </span>
            </div>
            <div className="card-body p-2" style={{ overflowY: "auto", maxHeight: "calc(100vh - 260px)" }}>
                {stationEntries.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="bx bx-inbox" style={{ fontSize: "2rem", opacity: 0.4 }}></i>
                        <p className="small mt-2 mb-0">No patients</p>
                    </div>
                ) : (
                    stationEntries.map((entry) => (
                        <QueueEntryCard
                            key={entry.uid}
                            entry={entry}
                            onStatusUpdate={onStatusUpdate}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// ============ Queue Board Page ============
export const QueueBoardPage = () => {
    const [stations, setStations] = useState([]);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const intervalRef = useRef(null);

    const fetchStations = useCallback(async () => {
        try {
            const res = await getQueueStations({ pagination: { page_size: 100 } });
            if (res?.status === 8000) {
                setStations(res.data?.results || res.data || []);
            }
        } catch (err) {
            console.error("Error fetching stations:", err);
        }
    }, []);

    const fetchEntries = useCallback(async () => {
        try {
            const res = await getQueueEntries({
                pagination: { page_size: 200, status__in: ACTIVE_STATUSES.join(",") },
            });
            if (res?.status === 8000) {
                const all = res.data?.results || res.data || [];
                setEntries(all.filter((e) => ACTIVE_STATUSES.includes(e.status)));
            }
        } catch (err) {
            console.error("Error fetching entries:", err);
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchStations(), fetchEntries()]);
        setLoading(false);
    }, [fetchStations, fetchEntries]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        intervalRef.current = setInterval(fetchEntries, REFRESH_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchEntries]);

    const handleStatusUpdate = useCallback(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleAddSuccess = useCallback(() => {
        fetchEntries();
    }, [fetchEntries]);

    const activeStations = stations.filter((s) => s.is_active);
    const totalActive = entries.length;
    const totalWaiting = entries.filter((e) => e.status === "WAITING").length;
    const totalInService = entries.filter((e) => e.status === "IN_SERVICE").length;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading queue board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">
                        <i className="bx bx-grid-alt me-2 text-primary"></i>
                        Queue Board
                    </h4>
                    <div className="d-flex gap-3">
                        <span className="text-muted small">
                            <i className="bx bx-group me-1"></i>
                            {totalActive} active
                        </span>
                        <span className="text-warning small">
                            <i className="bx bx-time-five me-1"></i>
                            {totalWaiting} waiting
                        </span>
                        <span className="text-success small">
                            <i className="bx bx-play-circle me-1"></i>
                            {totalInService} in service
                        </span>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="bx bx-plus me-1"></i>
                    Add to Queue
                </button>
            </div>

            {/* Station Columns */}
            {activeStations.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bx bx-station" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                    <h5 className="text-muted mt-3">No Active Stations</h5>
                    <p className="text-muted">Configure queue stations to get started.</p>
                </div>
            ) : (
                <div
                    className="d-flex gap-3 pb-3"
                    style={{ overflowX: "auto", minHeight: "calc(100vh - 200px)" }}
                >
                    {activeStations.map((station) => (
                        <StationColumn
                            key={station.uid}
                            station={station}
                            entries={entries}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    ))}
                </div>
            )}

            {/* Add to Queue Modal */}
            {showAddModal && (
                <AddToQueueModal
                    stations={stations}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}
        </div>
    );
};

export default QueueBoardPage;
