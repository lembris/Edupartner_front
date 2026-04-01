import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { searchService, exportService } from "../LcQueries";

const LeadResults = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [searchInfo, setSearchInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [selectedLead, setSelectedLead] = useState(null);

    useEffect(() => {
        const fetchSearchInfo = async () => {
            try {
                const res = await searchService.getOne(uid);
                setSearchInfo(res?.data || res);
            } catch (err) {
                console.error("Search info fetch error:", err);
                Swal.fire({ icon: "error", title: "Error", text: "Failed to load search info." });
            } finally {
                setLoading(false);
            }
        };
        fetchSearchInfo();
    }, [uid]);

    const handleExport = async (format) => {
        try {
            setExporting(format);
            await exportService.create({ search_uid: uid, format });
            Swal.fire({
                icon: "success",
                title: "Export Ready",
                text: `${format.toUpperCase()} file exported successfully.`,
                timer: 2000,
            });
        } catch (err) {
            console.error("Export error:", err);
            Swal.fire({ icon: "error", title: "Error", text: "Failed to create export." });
        } finally {
            setExporting(null);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: "bg-warning",
            in_progress: "bg-info",
            completed: "bg-success",
            failed: "bg-danger",
        };
        return map[status] || "bg-secondary";
    };

    const handleViewDetail = (row) => {
        setSelectedLead(row);
    };

    const handleCloseDetail = () => {
        setSelectedLead(null);
    };

    const handleCopyField = (value, label) => {
        navigator.clipboard.writeText(value).then(() => {
            Swal.fire({
                icon: "success",
                title: "Copied!",
                text: `${label} copied to clipboard.`,
                timer: 1200,
                showConfirmButton: false,
            });
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading results...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <div>
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2 mb-2"
                                        onClick={() => navigate("/lead-cloner/dashboard")}
                                    >
                                        <i className="bx bx-arrow-back me-1"></i>
                                        Back to Dashboard
                                    </button>
                                    <h4 className="mb-1">{searchInfo?.query || "Search Results"}</h4>
                                    <div className="d-flex gap-2 align-items-center flex-wrap">
                                        {searchInfo?.location && (
                                            <span className="text-muted">
                                                <i className="bx bx-map me-1"></i>
                                                {searchInfo.location}
                                            </span>
                                        )}
                                        <span className={`badge ${getStatusBadge(searchInfo?.status)}`}>
                                            {searchInfo?.status}
                                        </span>
                                        <span className="text-muted">
                                            {searchInfo?.result_count || 0} total results
                                        </span>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => handleExport("json")}
                                        disabled={exporting !== null}
                                    >
                                        {exporting === "json" ? (
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                        ) : (
                                            <i className="bx bx-code-alt me-1"></i>
                                        )}
                                        Export JSON
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleExport("excel")}
                                        disabled={exporting !== null}
                                    >
                                        {exporting === "excel" ? (
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                        ) : (
                                            <i className="bx bx-spreadsheet me-1"></i>
                                        )}
                                        Export Excel
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => handleExport("csv")}
                                        disabled={exporting !== null}
                                    >
                                        {exporting === "csv" ? (
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                        ) : (
                                            <i className="bx bx-file me-1"></i>
                                        )}
                                        Export CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <PaginatedTable
                fetchPath={`/lc-searches/${uid}/results`}
                title="Lead Results"
                isRefresh={tableRefresh}
                fixedActions={true}
                columns={[
                    {
                        key: "business_name",
                        label: "Business",
                        style: { minWidth: "220px" },
                        render: (row) => (
                            <div>
                                <strong>{row.business_name || "—"}</strong>
                                {row.business_type && (
                                    <div>
                                        <span className="badge bg-light text-dark border mt-1" style={{ fontSize: "0.7rem" }}>
                                            {row.business_type}
                                        </span>
                                    </div>
                                )}
                                {row.years_in_business && (
                                    <div>
                                        <small className="text-muted">
                                            <i className="bx bx-briefcase me-1"></i>
                                            {row.years_in_business}
                                        </small>
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "rating",
                        label: "Rating",
                        style: { width: "110px" },
                        className: "text-center",
                        render: (row) =>
                            row.rating ? (
                                <div>
                                    <span>
                                        <i className="bx bxs-star text-warning me-1"></i>
                                        <strong>{row.rating}</strong>
                                    </span>
                                    {row.review_count > 0 && (
                                        <div>
                                            <small className="text-muted">({row.review_count} reviews)</small>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-muted">—</span>
                            ),
                    },
                    {
                        key: "contact",
                        label: "Contact",
                        style: { minWidth: "180px" },
                        render: (row) => (
                            <div>
                                {row.phone ? (
                                    <div>
                                        <a href={`tel:${row.phone}`} className="text-dark text-decoration-none">
                                            <i className="bx bx-phone text-success me-1"></i>
                                            {row.phone}
                                        </a>
                                    </div>
                                ) : null}
                                {row.email ? (
                                    <div>
                                        <a href={`mailto:${row.email}`} className="text-dark text-decoration-none">
                                            <i className="bx bx-envelope text-primary me-1"></i>
                                            <small>{row.email}</small>
                                        </a>
                                    </div>
                                ) : null}
                                {row.website ? (
                                    <div>
                                        <a
                                            href={row.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary text-decoration-none"
                                        >
                                            <i className="bx bx-globe me-1"></i>
                                            <small>Website</small>
                                        </a>
                                    </div>
                                ) : null}
                                {!row.phone && !row.email && !row.website && (
                                    <span className="text-muted">—</span>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "address",
                        label: "Location",
                        style: { minWidth: "200px" },
                        render: (row) => (
                            <div>
                                <small>{row.address || "—"}</small>
                                {(row.city || row.state || row.country) && (
                                    <div>
                                        <small className="text-muted">
                                            {[row.city, row.state, row.country].filter(Boolean).join(", ")}
                                        </small>
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "opening_hours",
                        label: "Hours",
                        style: { width: "140px" },
                        render: (row) => {
                            if (!row.opening_hours || Object.keys(row.opening_hours).length === 0) {
                                return <span className="text-muted">—</span>;
                            }
                            const status = row.opening_hours.status || JSON.stringify(row.opening_hours);
                            const isOpen = /open/i.test(status);
                            return (
                                <span className={`badge ${isOpen ? "bg-success" : "bg-secondary"} bg-opacity-10 ${isOpen ? "text-success" : "text-secondary"}`}>
                                    <i className={`bx ${isOpen ? "bx-time-five" : "bx-lock"} me-1`}></i>
                                    {status}
                                </span>
                            );
                        },
                    },
                    {
                        key: "service_options",
                        label: "Services",
                        style: { minWidth: "160px" },
                        render: (row) => {
                            const services = row.service_options;
                            if (!services || !Array.isArray(services) || services.length === 0) {
                                return <span className="text-muted">—</span>;
                            }
                            return (
                                <div className="d-flex flex-wrap gap-1">
                                    {services.map((svc, idx) => (
                                        <span key={idx} className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: "0.65rem" }}>
                                            {svc}
                                        </span>
                                    ))}
                                </div>
                            );
                        },
                    },
                ]}
                actions={[
                    {
                        label: "View Details",
                        icon: "bx-show",
                        className: "btn-outline-primary",
                        onClick: (row) => handleViewDetail(row),
                    },
                    {
                        label: "Call",
                        icon: "bx-phone-call",
                        className: "btn-outline-success",
                        condition: (row) => !!row.phone,
                        onClick: (row) => window.open(`tel:${row.phone}`, "_self"),
                    },
                    {
                        label: "Email",
                        icon: "bx-envelope",
                        className: "btn-outline-info",
                        condition: (row) => !!row.email,
                        onClick: (row) => window.open(`mailto:${row.email}`, "_self"),
                    },
                    {
                        label: "Website",
                        icon: "bx-link-external",
                        className: "btn-outline-warning",
                        condition: (row) => !!row.website,
                        onClick: (row) => window.open(row.website, "_blank"),
                    },
                    {
                        label: "Directions",
                        icon: "bx-map",
                        className: "btn-outline-secondary",
                        condition: (row) => !!(row.google_maps_url || row.directions_url),
                        onClick: (row) => window.open(row.google_maps_url || row.directions_url, "_blank"),
                    },
                ]}
                buttons={[
                    {
                        label: "Refresh",
                        render: () => (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setTableRefresh((prev) => prev + 1)}
                            >
                                <i className="bx bx-refresh me-1"></i>
                                Refresh
                            </button>
                        ),
                    },
                ]}
            />

            {/* Detail Modal */}
            {selectedLead && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={handleCloseDetail}
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bx bx-building me-2"></i>
                                    {selectedLead.business_name}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseDetail}></button>
                            </div>
                            <div className="modal-body">
                                {/* Top summary */}
                                <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                                    {selectedLead.rating && (
                                        <span className="badge bg-warning text-dark px-3 py-2">
                                            <i className="bx bxs-star me-1"></i>
                                            {selectedLead.rating}
                                            {selectedLead.review_count > 0 && (
                                                <span className="ms-1">({selectedLead.review_count})</span>
                                            )}
                                        </span>
                                    )}
                                    {selectedLead.business_type && (
                                        <span className="badge bg-light text-dark border px-3 py-2">
                                            {selectedLead.business_type}
                                        </span>
                                    )}
                                    {selectedLead.years_in_business && (
                                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                                            <i className="bx bx-briefcase me-1"></i>
                                            {selectedLead.years_in_business}
                                        </span>
                                    )}
                                </div>

                                {/* Contact info */}
                                <div className="card bg-light border-0 mb-3">
                                    <div className="card-body py-3">
                                        <h6 className="card-title mb-3">
                                            <i className="bx bx-id-card me-2"></i>
                                            Contact Information
                                        </h6>
                                        <div className="row g-2">
                                            {selectedLead.phone && (
                                                <div className="col-sm-6">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <small className="text-muted d-block">Phone</small>
                                                            <a href={`tel:${selectedLead.phone}`} className="text-dark fw-medium">
                                                                <i className="bx bx-phone text-success me-1"></i>
                                                                {selectedLead.phone}
                                                            </a>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary border-0"
                                                            onClick={() => handleCopyField(selectedLead.phone, "Phone")}
                                                            title="Copy phone"
                                                        >
                                                            <i className="bx bx-copy"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedLead.email && (
                                                <div className="col-sm-6">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <small className="text-muted d-block">Email</small>
                                                            <a href={`mailto:${selectedLead.email}`} className="text-dark fw-medium">
                                                                <i className="bx bx-envelope text-primary me-1"></i>
                                                                {selectedLead.email}
                                                            </a>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary border-0"
                                                            onClick={() => handleCopyField(selectedLead.email, "Email")}
                                                            title="Copy email"
                                                        >
                                                            <i className="bx bx-copy"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedLead.website && (
                                                <div className="col-sm-6">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <small className="text-muted d-block">Website</small>
                                                            <a
                                                                href={selectedLead.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary fw-medium"
                                                            >
                                                                <i className="bx bx-globe me-1"></i>
                                                                {(() => {
                                                                    try {
                                                                        return new URL(selectedLead.website).hostname;
                                                                    } catch {
                                                                        return "Visit";
                                                                    }
                                                                })()}
                                                            </a>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary border-0"
                                                            onClick={() => handleCopyField(selectedLead.website, "Website")}
                                                            title="Copy website"
                                                        >
                                                            <i className="bx bx-copy"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {!selectedLead.phone && !selectedLead.email && !selectedLead.website && (
                                                <div className="col-12">
                                                    <span className="text-muted">No contact information available</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                {(selectedLead.address || selectedLead.city) && (
                                    <div className="card bg-light border-0 mb-3">
                                        <div className="card-body py-3">
                                            <h6 className="card-title mb-2">
                                                <i className="bx bx-map me-2"></i>
                                                Address
                                            </h6>
                                            <p className="mb-1">{selectedLead.address}</p>
                                            {(selectedLead.city || selectedLead.state || selectedLead.country) && (
                                                <small className="text-muted">
                                                    {[selectedLead.city, selectedLead.state, selectedLead.country]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                    {selectedLead.postal_code && ` - ${selectedLead.postal_code}`}
                                                </small>
                                            )}
                                            {(selectedLead.google_maps_url || selectedLead.directions_url) && (
                                                <div className="mt-2">
                                                    <a
                                                        href={selectedLead.google_maps_url || selectedLead.directions_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        <i className="bx bx-directions me-1"></i>
                                                        Get Directions
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Hours & Services */}
                                <div className="row g-3 mb-3">
                                    {selectedLead.opening_hours && Object.keys(selectedLead.opening_hours).length > 0 && (
                                        <div className="col-sm-6">
                                            <div className="card bg-light border-0 h-100">
                                                <div className="card-body py-3">
                                                    <h6 className="card-title mb-2">
                                                        <i className="bx bx-time-five me-2"></i>
                                                        Opening Hours
                                                    </h6>
                                                    <span
                                                        className={`badge ${
                                                            /open/i.test(selectedLead.opening_hours.status || "")
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {selectedLead.opening_hours.status ||
                                                            JSON.stringify(selectedLead.opening_hours)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedLead.service_options &&
                                        Array.isArray(selectedLead.service_options) &&
                                        selectedLead.service_options.length > 0 && (
                                            <div className="col-sm-6">
                                                <div className="card bg-light border-0 h-100">
                                                    <div className="card-body py-3">
                                                        <h6 className="card-title mb-2">
                                                            <i className="bx bx-check-shield me-2"></i>
                                                            Service Options
                                                        </h6>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {selectedLead.service_options.map((svc, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="badge bg-info bg-opacity-10 text-info"
                                                                >
                                                                    {svc}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </div>

                                {/* Description */}
                                {selectedLead.description && (
                                    <div className="card bg-light border-0 mb-3">
                                        <div className="card-body py-3">
                                            <h6 className="card-title mb-2">
                                                <i className="bx bx-info-circle me-2"></i>
                                                Description
                                            </h6>
                                            <p className="mb-0 text-muted">{selectedLead.description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <div className="d-flex gap-2 flex-wrap">
                                    {selectedLead.phone && (
                                        <a href={`tel:${selectedLead.phone}`} className="btn btn-success btn-sm">
                                            <i className="bx bx-phone-call me-1"></i> Call
                                        </a>
                                    )}
                                    {selectedLead.email && (
                                        <a href={`mailto:${selectedLead.email}`} className="btn btn-primary btn-sm">
                                            <i className="bx bx-envelope me-1"></i> Email
                                        </a>
                                    )}
                                    {selectedLead.website && (
                                        <a
                                            href={selectedLead.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-warning btn-sm"
                                        >
                                            <i className="bx bx-link-external me-1"></i> Website
                                        </a>
                                    )}
                                    {(selectedLead.google_maps_url || selectedLead.directions_url) && (
                                        <a
                                            href={selectedLead.google_maps_url || selectedLead.directions_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-secondary btn-sm"
                                        >
                                            <i className="bx bx-map me-1"></i> Directions
                                        </a>
                                    )}
                                </div>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LeadResults;
