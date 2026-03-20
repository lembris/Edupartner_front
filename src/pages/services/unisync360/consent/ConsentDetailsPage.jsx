import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { fetchConsentRequest, updateConsentRequest, approveConsentRequest, deleteConsentRequest } from "./Queries";
import { formatDate } from "../../../../helpers/DateFormater";
import { hasAccess } from "../../../../hooks/AccessHandler";
import ConsentServiceSelectionModal from "./ConsentServiceSelectionModal";
import { StaffAssignmentModal } from "./StaffAssignmentModal";

export const ConsentDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [consent, setConsent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const user = useSelector((state) => state.userReducer?.data);

    useEffect(() => {
        loadConsent();
    }, [id]);

    const loadConsent = async () => {
        try {
            setLoading(true);
            const data = await fetchConsentRequest(id);
            setConsent(data);
        } catch (error) {
            console.error("Error loading consent:", error);
            Swal.fire("Error!", "Failed to load consent request.", "error");
            navigate("/unisync360/consent");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!consent?.agreed_to_terms) {
            Swal.fire("Error!", "Student must agree to terms before approval.", "error");
            return;
        }

        try {
            const result = await Swal.fire({
                title: "Approve Consent Request?",
                text: `Are you sure you want to approve this consent request from ${consent.full_name}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, approve it!",
            });

            if (result.isConfirmed) {
                const response = await approveConsentRequest(id, {
                    request_status: "approved",
                    agreed_to_terms: true,
                    reviewed_by: user.guid
                });
                Swal.fire("Success!", "Consent request approved.", "success");
                loadConsent();
            }
        } catch (error) {
            console.error("Error approving consent:", error);
            Swal.fire("Error!", "Failed to approve consent request.", "error");
        }
    };

    const handleReject = async () => {
        try {
            const { value: reason } = await Swal.fire({
                title: "Reject Consent Request",
                input: "textarea",
                inputLabel: "Rejection Reason",
                inputPlaceholder: "Please provide a reason for rejection...",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#aaa",
            });

            if (reason !== undefined && reason !== "") {
                const response = await approveConsentRequest(id, {
                    request_status: "rejected",
                    rejection_reason: reason,
                    reviewed_by: user.guid
                });
                Swal.fire("Success!", "Consent request rejected.", "success");
                loadConsent();
            }
        } catch (error) {
            console.error("Error rejecting consent:", error);
            Swal.fire("Error!", "Failed to reject consent request.", "error");
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await updateConsentRequest(id, {
                request_status: newStatus
            });
            Swal.fire("Success!", "Status updated successfully.", "success");
            loadConsent();
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire("Error!", "Failed to update status.", "error");
        }
    };

    const handleSubmit = async () => {
        try {
            const result = await Swal.fire({
                title: "Submit Request?",
                text: "Are you sure you want to submit this consent request for review?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#0d6efd",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, submit it!",
            });
            if (result.isConfirmed) {
                await updateConsentRequest(id, {
                    request_status: "submitted",
                    submission_date: new Date().toISOString()
                });
                Swal.fire("Success!", "Request submitted successfully.", "success");
                loadConsent();
            }
        } catch (error) {
            console.error("Error submitting:", error);
            Swal.fire("Error!", "Failed to submit request.", "error");
        }
    };

    const handleMarkPendingReview = async () => {
        try {
            const result = await Swal.fire({
                title: "Mark as Pending Review?",
                text: "Are you sure you want to mark this as pending review?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ffc107",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, mark it!",
            });
            if (result.isConfirmed) {
                await updateConsentRequest(id, {
                    request_status: "pending_review"
                });
                Swal.fire("Success!", "Status updated to pending review.", "success");
                loadConsent();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire("Error!", "Failed to update status.", "error");
        }
    };

    const handleRevertToDraft = async () => {
        try {
            const result = await Swal.fire({
                title: "Revert to Draft?",
                text: "Are you sure you want to revert this to draft status? All reviews will be cleared.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#6c757d",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, revert it!",
            });
            if (result.isConfirmed) {
                await updateConsentRequest(id, {
                    request_status: "draft",
                    reviewed_by: null,
                    review_date: null,
                    rejection_reason: null
                });
                Swal.fire("Success!", "Reverted to draft status.", "success");
                loadConsent();
            }
        } catch (error) {
            console.error("Error reverting:", error);
            Swal.fire("Error!", "Failed to revert status.", "error");
        }
    };

    const handleReopen = async () => {
        try {
            const result = await Swal.fire({
                title: "Reopen Request?",
                text: "Are you sure you want to reopen this request? It will be marked as submitted.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#17a2b8",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, reopen it!",
            });
            if (result.isConfirmed) {
                await updateConsentRequest(id, {
                    request_status: "submitted"
                });
                Swal.fire("Success!", "Request reopened.", "success");
                loadConsent();
            }
        } catch (error) {
            console.error("Error reopening:", error);
            Swal.fire("Error!", "Failed to reopen request.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: "Delete Request?",
                text: "Are you sure you want to delete this consent request? This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });
            if (result.isConfirmed) {
                await deleteConsentRequest(id);
                Swal.fire("Success!", "Request deleted successfully.", "success");
                navigate("/unisync360/consent");
            }
        } catch (error) {
            console.error("Error deleting:", error);
            Swal.fire("Error!", "Failed to delete request.", "error");
        }
    };

    const handleExport = async () => {
        try {
            const csvContent = [
                ["Consent Request Details"],
                [],
                ["Name", consent.full_name],
                ["Email", consent.email],
                ["Phone", consent.phone],
                ["Status", consent.request_status],
                ["Agreed to Terms", consent.agreed_to_terms ? "Yes" : "No"],
                ["Submitted", consent.submission_date ? formatDate(consent.submission_date) : "-"],
                ["Parent/Guardian", consent.emergency_full_contact],
                ["Guardian Phone", consent.emergency_phone],
                ["Additional Notes", consent.additional_notes || "-"],
            ]
                .map(row => row.map(cell => `"${cell}"`).join(","))
                .join("\n");

            const element = document.createElement("a");
            element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
            element.setAttribute("download", `consent_${id}.csv`);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);

            Swal.fire("Success!", "Consent request exported successfully.", "success");
        } catch (error) {
            console.error("Error exporting:", error);
            Swal.fire("Error!", "Failed to export consent request.", "error");
        }
    };

    if (loading) {
        return <div className="alert alert-info">Loading...</div>;
    }

    if (!consent) {
        return <div className="alert alert-danger">Consent request not found.</div>;
    }

    const getStatusBadge = (status) => {
        const badgeClass = {
            draft: "badge bg-light text-dark",
            submitted: "badge bg-info",
            pending_review: "badge bg-warning",
            approved: "badge bg-success",
            rejected: "badge bg-danger",
            expired: "badge bg-secondary",
            revoked: "badge bg-dark"
        };
        return badgeClass[status] || "badge bg-secondary";
    };

    return (
        <>
            <BreadCumb pageList={["Students", "Consents", consent.full_name]} />

            <div className="row">
                {/* Main Details Card */}
                <div className="col-12 col-lg-8">
                    <div className="card mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Consent Request Details</h5>
                            <span className={getStatusBadge(consent.request_status)}>
                                {consent.request_status}
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Full Name</label>
                                    <p>{consent.full_name}</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Email</label>
                                    <p>{consent.email}</p>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Phone</label>
                                    <p>{consent.phone}</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Date of Birth</label>
                                    <p>{consent.date_of_birth ? formatDate(consent.date_of_birth) : "-"}</p>
                                </div>
                            </div>

                            {consent.student && (
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Registered Student</label>
                                        <p>{consent.student_name || "-"}</p>
                                    </div>
                                </div>
                            )}

                            <hr />
                            <h6 className="fw-bold mb-3">Emergency Contact</h6>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Contact Name</label>
                                    <p>{consent.emergency_full_contact}</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Phone</label>
                                    <p>{consent.emergency_phone}</p>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Email</label>
                                    <p>{consent.emergency_email || "-"}</p>
                                </div>
                            </div>

                            {consent.additional_notes && (
                                <div className="row mb-3">
                                    <div className="col-12">
                                        <label className="form-label fw-bold">Additional Notes</label>
                                        <p className="text-muted">{consent.additional_notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Consent Services Card */}
                    <div className="card mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Services Selected</h5>
                            {hasAccess(user?.roles, user?.permissions, [], ["add_consentserviceselection"]) && (
                                <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => setShowServiceModal(true)}
                                >
                                    <i className="bx bx-plus"></i> Add Service
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {consent.service_selections && consent.service_selections.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Service Name</th>
                                                <th>Category</th>
                                                <th>Agreed</th>
                                                <th>Agreement Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consent.service_selections.map((selection, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <strong>{selection.service_name}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            {selection.consent_service_details?.category || "-"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={selection.agreed ? "badge bg-success" : "badge bg-danger"}>
                                                            {selection.agreed ? "Yes" : "No"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {selection.agreement_date ? formatDate(selection.agreement_date) : "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="alert alert-info mb-0">No services selected yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Agreement Card */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Agreement & Review</h5>
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Agreed to Terms</label>
                                    <p>
                                        <span className={consent.agreed_to_terms ? "badge bg-success" : "badge bg-danger"}>
                                            {consent.agreed_to_terms ? "Yes" : "No"}
                                        </span>
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Agreement Date</label>
                                    <p>{consent.agreement_date ? formatDate(consent.agreement_date) : "-"}</p>
                                </div>
                            </div>

                            {consent.request_status === "pending_review" && (
                                <>
                                    <hr />
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-success"
                                            onClick={handleApprove}
                                            disabled={!hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"])}
                                        >
                                            <i className="bx bx-check"></i> Approve
                                        </button>
                                        <button 
                                            className="btn btn-danger"
                                            onClick={handleReject}
                                            disabled={!hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"])}
                                        >
                                            <i className="bx bx-x"></i> Reject
                                        </button>
                                    </div>
                                </>
                            )}

                            {consent.request_status === "rejected" && consent.rejection_reason && (
                                <div className="alert alert-danger">
                                    <strong>Rejection Reason:</strong>
                                    <p className="mb-0">{consent.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-12 col-lg-4">
                    {/* Metadata Card */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h5 className="mb-0">Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Status</label>
                                <p>{consent.request_status}</p>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Date of Request</label>
                                <p>{consent.created_at ? formatDate(consent.created_at) : "-"}</p>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Submitted</label>
                                <p>{consent.submission_date ? formatDate(consent.submission_date) : "-"}</p>
                            </div>

                            {consent.reviewed_by_details && (
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Reviewed By</label>
                                    <p>{consent.reviewed_by_details.first_name} {consent.reviewed_by_details.last_name}</p>
                                </div>
                            )}

                            {consent.review_date && (
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Review Date</label>
                                    <p>{formatDate(consent.review_date)}</p>
                                </div>
                            )}

                            {consent.assigned_to_details && (
                                <>
                                    <hr />
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Assigned To</label>
                                        <p>{consent.assigned_to_details.first_name} {consent.assigned_to_details.last_name}</p>
                                    </div>
                                    {consent.assigned_at && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Assigned Date</label>
                                            <p>{formatDate(consent.assigned_at)}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-bold">Created</label>
                                <p>{formatDate(consent.created_at)}</p>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Updated</label>
                                <p>{formatDate(consent.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Actions</h5>
                        </div>
                        <div className="card-body d-flex flex-column gap-2">
                            {/* Always Available */}
                            <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => navigate("/unisync360/consent")}
                            >
                                <i className="bx bx-arrow-back"></i> Back to List
                            </button>
                            <button 
                                className="btn btn-info btn-sm"
                                onClick={handleExport}
                            >
                                <i className="bx bx-download"></i> Export
                            </button>
                            <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowAssignmentModal(true)}
                                disabled={!hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"])}
                            >
                                <i className="bx bx-user-plus"></i> {consent?.assigned_to_details ? "Reassign" : "Assign to Staff"}
                            </button>

                            {/* Draft Status Actions */}
                            {consent.request_status === "draft" && hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && (
                                <>
                                    <hr className="my-2" />
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => navigate(`/unisync360/consent/${id}/edit`)}
                                    >
                                        <i className="bx bx-pencil"></i> Edit
                                    </button>
                                    <button 
                                        className="btn btn-info btn-sm"
                                        onClick={handleSubmit}
                                    >
                                        <i className="bx bx-send"></i> Submit
                                    </button>
                                    <button 
                                        className="btn btn-warning btn-sm"
                                        onClick={handleMarkPendingReview}
                                    >
                                        <i className="bx bx-hourglass"></i> Mark Pending Review
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={handleDelete}
                                    >
                                        <i className="bx bx-trash"></i> Delete
                                    </button>
                                </>
                            )}

                            {/* Submitted Status Actions */}
                            {consent.request_status === "submitted" && hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && (
                                <>
                                    <hr className="my-2" />
                                    <button 
                                        className="btn btn-warning btn-sm"
                                        onClick={handleMarkPendingReview}
                                    >
                                        <i className="bx bx-hourglass"></i> Mark Pending Review
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleRevertToDraft}
                                    >
                                        <i className="bx bx-undo"></i> Revert to Draft
                                    </button>
                                </>
                            )}

                            {/* Pending Review Status Actions */}
                            {consent.request_status === "pending_review" && hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && (
                                <>
                                    <hr className="my-2" />
                                    <button 
                                        className="btn btn-success btn-sm"
                                        onClick={handleApprove}
                                    >
                                        <i className="bx bx-check-circle"></i> Approve
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={handleReject}
                                    >
                                        <i className="bx bx-x-circle"></i> Reject
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleRevertToDraft}
                                    >
                                        <i className="bx bx-undo"></i> Revert to Draft
                                    </button>
                                </>
                            )}

                            {/* Approved Status Actions */}
                            {consent.request_status === "approved" && hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && (
                                <>
                                    <hr className="my-2" />
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleRevertToDraft}
                                    >
                                        <i className="bx bx-undo"></i> Revert to Draft
                                    </button>
                                </>
                            )}

                            {/* Rejected Status Actions */}
                            {consent.request_status === "rejected" && hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && (
                                <>
                                    <hr className="my-2" />
                                    <button 
                                        className="btn btn-info btn-sm"
                                        onClick={handleReopen}
                                    >
                                        <i className="bx bx-reset"></i> Reopen
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleRevertToDraft}
                                    >
                                        <i className="bx bx-undo"></i> Revert to Draft
                                    </button>
                                </>
                            )}

                            {/* Expired/Revoked Status Actions */}
                            {(consent.request_status === "expired" || consent.request_status === "revoked") && hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && (
                                <>
                                    <hr className="my-2" />
                                    <button 
                                        className="btn btn-info btn-sm"
                                        onClick={handleReopen}
                                    >
                                        <i className="bx bx-reset"></i> Reopen
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleRevertToDraft}
                                    >
                                        <i className="bx bx-undo"></i> Revert to Draft
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showServiceModal && (
                <ConsentServiceSelectionModal
                    show={showServiceModal}
                    onHide={() => setShowServiceModal(false)}
                    consentRequestId={id}
                    onSuccess={() => {
                        setShowServiceModal(false);
                        loadConsent();
                    }}
                />
            )}

            {showAssignmentModal && (
                <StaffAssignmentModal
                    show={showAssignmentModal}
                    onHide={() => setShowAssignmentModal(false)}
                    consentId={id}
                    currentAssignee={consent?.assigned_to_details}
                    onSuccess={() => {
                        loadConsent();
                    }}
                    title="Assign Consent Request to Staff"
                    description="Select a staff member to process this consent request"
                />
            )}
        </>
    );
};
