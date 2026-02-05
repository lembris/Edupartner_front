import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { deleteConsentRequest, updateConsentRequest, approveConsentRequest } from "./Queries";
import ConsentRequestModal from "./ConsentRequestModal";
import { hasAccess } from "../../../../hooks/AccessHandler";

export const ConsentListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (consent) => {
        if (!consent) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete consent request from ${consent.full_name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteConsentRequest(consent.uid);
                Swal.fire(
                    "Deleted!",
                    "The consent request has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting consent:", error);
            Swal.fire(
                "Error!",
                "Unable to delete consent request. Please try again or contact support.",
                "error"
            );
        }
    };

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

    const handleAddNew = () => {
        setSelectedObj(null);
        setShowModal(true);
    };

    const handleApprove = async (consent) => {
        if (!consent) return;

        try {
            const confirmation = await Swal.fire({
                title: "Approve Consent Request?",
                text: `Are you sure you want to approve this consent request from ${consent.full_name}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, approve it!",
            });

            if (confirmation.isConfirmed) {
                await approveConsentRequest(consent.uid);
                Swal.fire(
                    "Approved!",
                    "The consent request has been approved successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error approving consent:", error);
            Swal.fire(
                "Error!",
                "Unable to approve consent request. Please try again or contact support.",
                "error"
            );
        }
    };

    const handleReject = async (consent) => {
        if (!consent) return;

        try {
            const { value: reason } = await Swal.fire({
                title: "Reject Consent Request?",
                input: "textarea",
                inputLabel: "Rejection Reason (optional)",
                inputPlaceholder: "Enter reason for rejection...",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, reject it!",
            });

            if (reason !== undefined) {
                await updateConsentRequest(consent.uid, {
                    request_status: "rejected",
                    rejection_reason: reason || ""
                });
                Swal.fire(
                    "Rejected!",
                    "The consent request has been rejected successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error rejecting consent:", error);
            Swal.fire(
                "Error!",
                "Unable to reject consent request. Please try again or contact support.",
                "error"
            );
        }
    };

    const handleUpdateStatus = async (consent) => {
        if (!consent) return;

        try {
            const { value: newStatus } = await Swal.fire({
                title: "Update Consent Status",
                input: "select",
                inputOptions: {
                    "draft": "Draft",
                    "submitted": "Submitted",
                    "pending_review": "Pending Review",
                    "approved": "Approved",
                    "rejected": "Rejected",
                    "expired": "Expired",
                    "revoked": "Revoked"
                },
                inputValue: consent.request_status,
                showCancelButton: true,
                confirmButtonColor: "#0d6efd",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Update Status",
                inputValidator: (value) => {
                    if (!value) {
                        return "Please select a status";
                    }
                }
            });

            if (newStatus && newStatus !== consent.request_status) {
                await updateConsentRequest(consent.uid, {
                    request_status: newStatus
                });
                Swal.fire(
                    "Updated!",
                    `The consent request status has been updated to ${newStatus}.`,
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error updating consent status:", error);
            Swal.fire(
                "Error!",
                "Unable to update consent request status. Please try again or contact support.",
                "error"
            );
        }
    };

    const handleExport = async (consent) => {
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
                ["Parent/Guardian", consent.emergency_full_name],
                ["Guardian Relationship", consent.emergency_relationship],
                ["Guardian Phone", consent.emergency_phone],
                ["Additional Notes", consent.additional_notes || "-"],
            ]
                .map(row => row.map(cell => `"${cell}"`).join(","))
                .join("\n");

            const element = document.createElement("a");
            element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
            element.setAttribute("download", `consent_${consent.uid}.csv`);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);

            Swal.fire("Success!", "Consent request exported successfully.", "success");
        } catch (error) {
            console.error("Error exporting consent:", error);
            Swal.fire(
                "Error!",
                "Unable to export consent request. Please try again.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Students", "Consents"]} />
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Consent Requests</h4>
                {hasAccess(user?.roles, user?.permissions, [], ["add_consentrequest"]) && (
                    <button 
                        className="btn btn-primary" 
                        onClick={handleAddNew}
                    >
                        <i className="bx bx-plus"></i> New Consent Request
                    </button>
                )}
            </div>

            <PaginatedTable
                fetchPath="/unisync360-consent-requests/"
                title="Consent Requests"
                refreshTrigger={tableRefresh}
                columns={[
                    {
                        key: "name",
                        label: "Requestor Details",
                        className: "fw-bold",
                        style: { width: "300px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar me-2">
                                    <span className="avatar-initial rounded-circle bg-label-primary">
                                        {row.first_name?.[0]}{row.last_name?.[0]}
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className="text-primary cursor-pointer fw-semibold"
                                        onClick={() => navigate(`/unisync360/consent/${row.uid}`)}
                                    >
                                        {row.full_name}
                                    </span>
                                    <small className="d-block text-muted fs-11">{row.email}</small>
                                    <small className="d-block text-muted fs-11">{row.phone}</small>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => (
                            <span className={getStatusBadge(row.request_status)}>
                                {row.request_status}
                            </span>
                        ),
                    },
                    {
                        key: "submission_date",
                        label: "Submitted",
                        render: (row) =>
                            row.submission_date ? formatDate(row.submission_date) : "-",
                    },
                    {
                        key: "agreed",
                        label: "Agreed",
                        render: (row) => (
                            <span className={row.agreed_to_terms ? "badge bg-success" : "badge bg-danger"}>
                                {row.agreed_to_terms ? "Yes" : "No"}
                            </span>
                        ),
                    },
                    {
                        key: "services",
                        label: "Services",
                        render: (row) => (
                            <span className="badge bg-light text-dark">
                                {row.service_count || 0} service(s)
                            </span>
                        ),
                    },
                    {
                        key: "reviewer",
                        label: "Reviewed By",
                        render: (row) =>
                            row.reviewed_by_details?.first_name
                                ? `${row.reviewed_by_details.first_name} ${row.reviewed_by_details.last_name}`
                                : "-",
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-eye",
                        onClick: (row) => navigate(`/unisync360/consent/${row.uid}`),
                        condition: () => true,
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-pencil",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: (row) => hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && 
                                           (row.request_status === "draft" || row.request_status === "pending_review"),
                    },
                    {
                        label: "Update Status",
                        icon: "bx bx-refresh",
                        onClick: (row) => handleUpdateStatus(row),
                        condition: (row) => hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]),
                        className: "text-info",
                    },
                    {
                        label: "Approve",
                        icon: "bx bx-check-circle",
                        onClick: (row) => handleApprove(row),
                        condition: (row) => hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && 
                                           row.request_status === "pending_review",
                        className: "text-success",
                    },
                    {
                        label: "Reject",
                        icon: "bx bx-x-circle",
                        onClick: (row) => handleReject(row),
                        condition: (row) => hasAccess(user?.roles, user?.permissions, [], ["change_consentrequest"]) && 
                                           row.request_status === "pending_review",
                        className: "text-warning",
                    },
                    {
                        label: "Export",
                        icon: "bx bx-download",
                        onClick: (row) => handleExport(row),
                        condition: () => true,
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: (row) => hasAccess(user?.roles, user?.permissions, [], ["delete_consentrequest"]) && 
                                           row.request_status === "draft",
                        className: "text-danger",
                    },
                ]}
            />

            {showModal && (
                <ConsentRequestModal
                    show={showModal}
                    onHide={() => {
                        setShowModal(false);
                        setSelectedObj(null);
                    }}
                    onSuccess={() => {
                        setTableRefresh((prev) => prev + 1);
                        setShowModal(false);
                        setSelectedObj(null);
                    }}
                    initialData={selectedObj}
                />
            )}
        </>
    );
};
