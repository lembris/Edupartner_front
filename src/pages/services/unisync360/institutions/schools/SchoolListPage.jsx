import React, { useState, useEffect } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { SchoolModal } from "./SchoolModal";
import { deleteSchool } from "./Queries";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";
import { EntityBulkImportModal } from "../../../../../components/EntityBulkImportModal";

export const SchoolListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (school) => {
        if (!school) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete school: ${school.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteSchool(school.uid);
                Swal.fire(
                    "Deleted!",
                    "The School has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting school:", error);
            Swal.fire(
                "Error!",
                "Unable to delete school. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Schools", "List"]} />
            <PaginatedTable
                fetchPath="/unisync360-institutions/schools/"
                title="Schools"
                onDataFetched={(data) => setTableData(data)}
                columns={[
                    {
                        key: "name",
                        label: "School Details",
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
                                        onClick={() => navigate(`/unisync360/institutions/school/${row.uid}`)}
                                    >
                                        {row.name}
                                    </span>
                                    <small className="d-block text-muted fs-11">Reg: {row.registration_number || "-"}</small>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "type",
                        label: "Type & Level",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="badge bg-label-info mb-1 w-auto">{row.ownership ? row.ownership.charAt(0).toUpperCase() + row.ownership.slice(1) : "Public"}</span>
                                <small className="text-muted text-capitalize">{row.level || "-"}</small>
                            </div>
                        )
                    },
                    {
                        key: "location",
                        label: "Location",
                        render: (row) => (
                            <div>
                                {row.district && (
                                    <div className="mb-1">
                                        <i className="bx bx-map-pin me-1 text-muted small"></i>
                                        <span className="fw-medium small">
                                            {typeof row.district === 'object' ? row.district.name : (row.district_name || "-")}
                                        </span>
                                    </div>
                                )}
                                {row.region && (
                                    <small className="text-muted d-block">
                                        {typeof row.region === 'object' ? row.region.name : (row.region_name || "-")}
                                        {row.country_name ? `, ${row.country_name}` : ""}
                                    </small>
                                )}
                            </div>
                        )
                    },
                    {
                        key: "students",
                        label: "Students",
                        render: (row) => (
                            <div>
                                <span className="fw-semibold">{row.total_students ? row.total_students.toLocaleString() : "0"}</span>
                                <small className="text-muted d-block fs-11">Enrolled</small>
                            </div>
                        )
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => (
                            <span className={`badge bg-${row.is_active ? "success" : "danger"}`}>
                                {row.is_active ? "Active" : "Inactive"}
                            </span>
                        )
                    },
                    {
                        key: "created_by",
                        label: "Created By",
                        style: { width: "180px" },
                        render: (row) => (
                            <div>
                                {row.created_by_details ? (
                                    <div className="d-flex align-items-center">
                                        <div className="ms-2">
                                            <span className="text-dark fs-13">
                                                {row.created_by_details.first_name}{" "}
                                                {row.created_by_details.last_name}
                                            </span>
                                            <small className="text-muted d-block fs-12">
                                                @{row.created_by_details.username}
                                            </small>
                                            {row.created_at && (
                                                <small className="text-muted d-block fs-11">
                                                    {formatDate(row.created_at, "DD/MM/YYYY")}
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
                    {
                        key: "actions",
                        label: "Actions",
                        style: { width: "120px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                <button
                                    className="btn btn-sm btn-outline-secondary border-0"
                                    onClick={() => navigate(`/unisync360/institutions/school/${row.uid}`)}
                                    title="View Details"
                                >
                                    <i className="bx bx-show"></i>
                                </button>
                                {hasAccess(user, [["change_school"]]) && (
                                    <button
                                        aria-label="Edit"
                                        type="button"
                                        className="btn btn-sm btn-outline-primary border-0"
                                        onClick={() => setSelectedObj(row)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#schoolModal"
                                        title="Edit School"
                                    >
                                        <i className="bx bx-edit"></i>
                                    </button>
                                )}

                                {hasAccess(user, [["delete_school"]]) && (
                                    <button
                                        aria-label="Delete"
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0"
                                        onClick={() => handleDelete(row)}
                                        title="Delete School"
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                )}
                            </div>
                        ),
                    },
                ]}
                buttons={[
                    {
                        label: "Bulk Import",
                        render: () => (
                            hasAccess(user, [["add_school"]]) && (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() => setShowBulkImportModal(true)}
                                    title="Bulk Import Schools"
                                >
                                    <i className="bx bx-import me-1"></i> Bulk Import
                                </button>
                            )
                        ),
                    },
                    {
                        label: "Add School",
                        render: () => (
                            hasAccess(user, [["add_school"]]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedObj(null)}
                                    data-bs-toggle="modal"
                                    data-bs-target="#schoolModal"
                                    title="Add new School"
                                >
                                    <i className="bx bx-plus me-1"></i> Add School
                                </button>
                            )
                        ),
                    },
                ]}
                onSelect={(row) => {
                    // Handle row selection if needed
                }}
                isRefresh={tableRefresh}
            />

            <SchoolModal
                selectedObj={selectedObj}
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedObj(null);
                }}
                onClose={() => setSelectedObj(null)}
            />

            {showBulkImportModal && (
                <EntityBulkImportModal
                    importType="school"
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
