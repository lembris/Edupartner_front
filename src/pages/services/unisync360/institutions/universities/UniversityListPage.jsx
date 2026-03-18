import React, { useState, useEffect } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { UniversityModal } from "./UniversityModal";
import { deleteUniversity } from "./Queries";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";
import { EntityBulkImportModal } from "../../../../../components/EntityBulkImportModal";

export const UniversityListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (university) => {
        if (!university) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete university: ${university.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteUniversity(university.uid);
                Swal.fire(
                    "Deleted!",
                    "The University has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting university:", error);
            Swal.fire(
                "Error!",
                "Unable to delete university. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Universities", "List"]} />
            <PaginatedTable
                fetchPath="/unisync360-institutions/universities/" // Relative to API_BASE_URL/api/
                title="Universities"
                onDataFetched={(data) => setTableData(data)}
                columns={[
                    {
                        key: "name",
                        label: "University",
                        className: "fw-bold",
                        style: { width: "300px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar me-2">
                                    {row.logo ? (
                                        <img src={row.logo} alt="Logo" className="rounded" />
                                    ) : (
                                        <span className="avatar-initial rounded bg-label-primary">
                                            <i className="bx bxs-school"></i>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span
                                        className="text-primary cursor-pointer fw-semibold"
                                        onClick={() => navigate(`/unisync360/institutions/universities/${row.uid}`)}
                                    >
                                        {row.name}
                                    </span>
                                    {row.website && (
                                        <a 
                                            href={row.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="d-block text-muted fs-12 text-truncate"
                                            style={{ maxWidth: "200px" }}
                                        >
                                            {row.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "location",
                        label: "Location",
                        render: (row) => (
                            <div>
                                <span className="d-block fw-medium">{row.country_name || "Unknown"}</span>
                            </div>
                        )
                    },
                    {
                        key: "ranking",
                        label: "Ranking",
                        render: (row) => (
                            row.ranking ? (
                                <span className="badge bg-label-secondary">
                                    #{row.ranking}
                                </span>
                            ) : <span className="text-muted">-</span>
                        )
                    },
                    {
                        key: "partnership",
                        label: "Partnership",
                        render: (row) => {
                            const statusColors = {
                                active: "success",
                                inactive: "secondary",
                                pending: "warning"
                            };
                            return (
                                <span className={`badge bg-label-${statusColors[row.partnership_status] || "secondary"}`}>
                                    {row.partnership_status ? row.partnership_status.toUpperCase() : "N/A"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => {
                            const statusColors = {
                                active: "success",
                                inactive: "danger",
                                suspended: "warning"
                            };
                            return (
                                <span className={`badge bg-${statusColors[row.status] || "secondary"}`}>
                                    {row.status ? row.status.toUpperCase() : "UNKNOWN"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "created_by",
                        label: "Created By",
                        style: { width: "180px" },
                        render: (row) => (
                            <div>
                                {row.created_by_details ? (
                                    <div className="d-flex align-items-center">
                                        <div className="avatar avatar-xs me-2">
                                            <span className="avatar-initial rounded-circle bg-label-primary">
                                                {row.created_by_details.first_name?.[0]}
                                                {row.created_by_details.last_name?.[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-dark fs-13 fw-medium d-block">
                                                {row.created_by_details.first_name} {row.created_by_details.last_name}
                                            </span>
                                            {row.created_at && (
                                                <small className="text-muted fs-11">
                                                    {formatDate(row.created_at, "DD MMM YYYY")}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-muted">Unknown</span>
                                )}
                            </div>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/unisync360/institutions/universities/${row.uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => setSelectedObj(row),
                        condition: () => hasAccess(user, ["change_university"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_university"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Bulk Import",
                        render: () => (
                            hasAccess(user, ["add_university"]) && (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() => setShowBulkImportModal(true)}
                                    title="Bulk Import Universities"
                                >
                                    <i className="bx bx-import me-1"></i> Bulk Import
                                </button>
                            )
                        ),
                    },
                    {
                        label: "Add University",
                        render: () => (
                            hasAccess(user, ["add_university"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedObj(null)}
                                    data-bs-toggle="modal"
                                    data-bs-target="#universityModal"
                                    title="Add new University"
                                >
                                    <i className="bx bx-plus me-1"></i> Add University
                                </button>
                            )
                        ),
                    },
                ]}
                onSelect={(row) => {
                    // This usually handles row click, but we handle it in column render for navigation
                    // Or we can use it to select for bulk actions if supported
                }}
                isRefresh={tableRefresh}
            />

            <UniversityModal
                selectedObj={selectedObj}
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedObj(null);
                }}
                onClose={() => setSelectedObj(null)}
            />

            {showBulkImportModal && (
                <EntityBulkImportModal
                    importType="university"
                    onSuccess={() => {
                        setTableRefresh(prev => prev + 1);
                        setShowBulkImportModal(false);
                    }}
                    onClose={() => setShowBulkImportModal(false)}
                />
            )}
        </>
    );
};
