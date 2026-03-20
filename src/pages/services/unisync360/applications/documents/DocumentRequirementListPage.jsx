import React, { useState } from "react";
import "animate.css";
import BreadCumb from "../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { DocumentRequirementModal } from "./DocumentRequirementModal";
import { deleteDocumentRequirement, DOCUMENT_TYPE_OPTIONS, getDocumentTypeColor } from "./Queries";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const DocumentRequirementListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (document) => {
        if (!document) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete "${document.name}"`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteDocumentRequirement(document.uid);
                Swal.fire(
                    "Deleted!",
                    "The document requirement has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting document requirement:", error);
            Swal.fire(
                "Error!",
                "Unable to delete document requirement. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Applications", "Document Requirements"]} />
            <PaginatedTable
                fetchPath="/unisync360-applications/document-requirements/"
                title="Document Requirements"
                columns={[
                    {
                        key: "name",
                        label: "Document Name",
                        className: "fw-bold",
                        style: { width: "250px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar avatar-sm me-2 bg-label-primary">
                                    <span className="avatar-initial rounded">
                                        <i className="bx bx-file"></i>
                                    </span>
                                </div>
                                <div>
                                    <span className="fw-semibold">{row.name || "N/A"}</span>
                                    {row.description && (
                                        <small className="d-block text-muted text-truncate" style={{ maxWidth: "200px" }}>
                                            {row.description}
                                        </small>
                                    )}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "document_type",
                        label: "Type",
                        style: { width: "130px" },
                        render: (row) => (
                            <span className={`badge bg-label-${getDocumentTypeColor(row.document_type)}`}>
                                {row.document_type_display || row.document_type}
                            </span>
                        ),
                    },
                    {
                        key: "is_required",
                        label: "Required",
                        style: { width: "100px" },
                        render: (row) => (
                            <span className={`badge bg-label-${row.is_required ? 'danger' : 'secondary'}`}>
                                {row.is_required ? "Required" : "Optional"}
                            </span>
                        ),
                    },
                    {
                        key: "countries",
                        label: "Countries",
                        style: { width: "200px" },
                        render: (row) => {
                            const countries = row.countries || [];
                            if (countries.length === 0) {
                                return <span className="text-muted">All Countries</span>;
                            }
                            return (
                                <div className="d-flex flex-wrap gap-1">
                                    {countries.slice(0, 3).map((country) => (
                                        <span key={country.uid} className="badge bg-label-info">
                                            {country.name}
                                        </span>
                                    ))}
                                    {countries.length > 3 && (
                                        <span className="badge bg-label-secondary">
                                            +{countries.length - 3} more
                                        </span>
                                    )}
                                </div>
                            );
                        },
                    },
                    {
                        key: "is_active",
                        label: "Status",
                        style: { width: "100px" },
                        render: (row) => (
                            <span className={`badge bg-label-${row.is_active ? 'success' : 'secondary'}`}>
                                {row.is_active ? "Active" : "Inactive"}
                            </span>
                        ),
                    },
                    {
                        key: "created_at",
                        label: "Created",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span>{row.created_at ? formatDate(row.created_at) : "N/A"}</span>
                                {row.created_by_details && (
                                    <small className="text-muted">
                                        {row.created_by_details.first_name} {row.created_by_details.last_name}
                                    </small>
                                )}
                            </div>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: () => hasAccess(user, ["change_documentrequirement"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_documentrequirement"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                filters={[
                    { label: "All", value: "ALL" },
                    { label: "Academic", value: "academic" },
                    { label: "Identity", value: "identity" },
                    { label: "Financial", value: "financial" },
                    { label: "Other", value: "other" },
                ]}
                filterKey="type"
                filterSelected={["ALL"]}
                buttons={[
                    {
                        label: "Add Document Requirement",
                        render: () => (
                            hasAccess(user, ["add_documentrequirement"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Document Requirement"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Document
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <DocumentRequirementModal
                    selectedObj={selectedObj}
                    onSuccess={() => {
                        setTableRefresh(prev => prev + 1);
                        setSelectedObj(null);
                        setShowModal(false);
                    }}
                    onClose={() => {
                        setSelectedObj(null);
                        setShowModal(false);
                    }}
                />
            )}
        </>
    );
};
