import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { StudentModal } from "./StudentModal";
import { EntityBulkImportModal } from "../../../../components/EntityBulkImportModal";
import { deleteStudent } from "./Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const StudentListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    // Check if user is admin
    const isAdmin = user?.is_superuser || user?.groups?.some(g =>
        g.includes('admin') || g.includes('super_admin')
    );

    // For non-admin users (counselors), backend auto-filters by assigned_counselor
    // No need to pass additional filters from frontend

    const handleDelete = async (student) => {
        if (!student) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete student: ${student.first_name} ${student.last_name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteStudent(student.uid);
                Swal.fire(
                    "Deleted!",
                    "The Student has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting student:", error);
            Swal.fire(
                "Error!",
                "Unable to delete student. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Students", "List"]} />
            <PaginatedTable
                fetchPath="/unisync360-students/"
                title="Students"
                fixedActions={true}
                columns={[
                    {
                        key: "name",
                        label: "Student Details",
                        className: "fw-bold",
                        style: { width: "300px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar me-2">
                                    {row.profile_picture ? (
                                        <img src={row.profile_picture} alt="Avatar" className="rounded-circle" />
                                    ) : (
                                        <span className="avatar-initial rounded-circle bg-label-primary">
                                            {row.first_name?.[0]}{row.last_name?.[0]}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span
                                        className="text-primary cursor-pointer fw-semibold"
                                        onClick={() => navigate(`/unisync360/students/${row.uid}`)}
                                    >
                                        {row.full_name || `${row.first_name} ${row.last_name}`}
                                    </span>
                                    <small className="d-block text-muted fs-11">{row.personal_email}</small>
                                    <small className="d-block text-muted fs-11">{row.personal_phone}</small>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "info",
                        label: "Personal Info",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="text-capitalize">{row.gender}</span>
                                <small className="text-muted">{row.date_of_birth ? formatDate(row.date_of_birth) : "-"}</small>
                            </div>
                        )
                    },
                    {
                        key: "source",
                        label: "Source",
                        render: (row) => (
                            <span>{row.source?.name || "-"}</span>
                        )
                    },
                    {
                        key: "nationality",
                        label: "Nationality",
                        render: (row) => (
                            <span>{row.nationality?.name || "-"}</span>
                        )
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => (
                            <span className={`badge bg-label-${row.status?.is_active_status ? "success" : "secondary"}`}>
                                {row.status?.name || "N/A"}
                            </span>
                        )
                    },
                    {
                        key: "counselor",
                        label: "Counselor",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="fw-semibold">
                                    {row.assigned_counselor_name || "-"}
                                </span>
                                {row.assigned_counselor_email && (
                                    <small className="text-muted">{row.assigned_counselor_email}</small>
                                )}
                            </div>
                        )
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx-show",
                        onClick: (row) => navigate(`/unisync360/students/${row.uid}`),
                        condition: () => true,
                    },
                    {
                        label: "Edit",
                        icon: "bx-edit",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: () => hasAccess(user, [["change_student"]]),
                    },
                    {
                        label: "Delete",
                        icon: "bxs-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, [["delete_student"]]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                buttons={[
                    {
                        label: "Add Student",
                        render: () => (
                            hasAccess(user, [["add_student"]]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Student"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Student
                                </button>
                            )
                        ),
                    },
                    {
                        label: "Bulk Import",
                        render: () => (
                            hasAccess(user, [["add_student"]]) && (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm ms-2"
                                    onClick={() => setShowBulkImportModal(true)}
                                    title="Import students from CSV/Excel"
                                >
                                    <i className="bx bx-upload me-1"></i> Bulk Import
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <StudentModal
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

            {showBulkImportModal && (
                <EntityBulkImportModal
                    importType="student"
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


