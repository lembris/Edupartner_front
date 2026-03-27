import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { StudentModal } from "../students/StudentModal.jsx";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";

export const MyStudentsList = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);

    const isLeadLancer = user?.roles?.some(role =>
        role.name === "unisync360_lead_lancer" ||
        role === "unisync360_lead_lancer"
    ) ?? false;

    const getStatusBadge = (status) => {
        const badges = {
            active: { class: "bg-success", text: "Active" },
            inactive: { class: "bg-warning", text: "Inactive" },
            completed: { class: "bg-primary", text: "Completed" },
            withdrawn: { class: "bg-danger", text: "Withdrawn" },
            deferred: { class: "bg-secondary", text: "Deferred" },
            left: { class: "bg-danger", text: "Left" },
        };
        const statusKey = status?.toLowerCase() || "inactive";
        return badges[statusKey] || badges.inactive;
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleDelete = async (student) => {
        if (!student) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to remove ${student.full_name || student.first_name} from your records`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, remove it!",
            });

            if (confirmation.isConfirmed) {
                Swal.fire(
                    "Removed!",
                    "The student has been removed successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting student:", error);
            Swal.fire(
                "Error!",
                "Unable to remove student. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Lead Lancer", "My Students"]} />
            <PaginatedTable
                fetchPath="/unisync360-commission/my-students/"
                title="My Students"
                columns={[
                    {
                        key: "full_name",
                        label: "Name",
                        className: "fw-bold",
                        render: (row) => (
                            <span>
                                {row.full_name || `${row.first_name || ""} ${row.last_name || ""}`}
                            </span>
                        ),
                    },
                    {
                        key: "personal_email",
                        label: "Email",
                        render: (row) => (
                            <span className="text-muted">{row.personal_email || "-"}</span>
                        ),
                    },
                    {
                        key: "personal_phone",
                        label: "Phone",
                        render: (row) => (
                            <span>{row.personal_phone || "-"}</span>
                        ),
                    },
                    {
                        key: "status_name",
                        label: "Status",
                        render: (row) => (
                            <span className={`badge ${getStatusBadge(row.status_name).class}`}>
                                {getStatusBadge(row.status_name).text}
                            </span>
                        ),
                    },
                    {
                        key: "registration_date",
                        label: "Registered",
                        render: (row) => (
                            <span>
                                {new Date(row.registration_date).toLocaleDateString()}
                            </span>
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
                                    aria-label="View"
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary border-0"
                                    onClick={() => navigate(`/unisync360/students/${row.uid}`)}
                                    title="View Details"
                                >
                                    <i className="bx bx-show"></i>
                                </button>
                                <button
                                    aria-label="Edit"
                                    type="button"
                                    className="btn btn-sm btn-outline-primary border-0"
                                    onClick={() => handleEdit(row)}
                                    title="Edit Student"
                                >
                                    <i className="bx bx-edit"></i>
                                </button>
                                <button
                                    aria-label="Delete"
                                    type="button"
                                    className="btn btn-sm btn-outline-danger border-0"
                                    onClick={() => handleDelete(row)}
                                    title="Delete Student"
                                >
                                    <i className="bx bx-trash"></i>
                                </button>
                            </div>
                        ),
                    },
                ]}
                buttons={[
                    {
                        label: "Register Student",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setSelectedStudent(null);
                                    setShowModal(true);
                                }}
                                title="Register new Student"
                            >
                                <i className="bx bx-plus me-1"></i> Register Student
                            </button>
                        ),
                    },
                ]}
                onSelect={(row) => {
                    // Row click handling if needed
                }}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <StudentModal
                    selectedObj={selectedStudent}
                    isLeadLancer={isLeadLancer}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedStudent(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setSelectedStudent(null);
                        setTableRefresh((prev) => prev + 1);
                    }}
                />
            )}
        </>
    );
};

export default MyStudentsList;
