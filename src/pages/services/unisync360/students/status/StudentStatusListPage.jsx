import React, { useState } from "react";
import "animate.css";
import BreadCumb from "../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../components/ui-templates/PaginatedTable";
import Swal from "sweetalert2";
import { StudentStatusModal } from "./StudentStatusModal";
import { deleteStudentStatus } from "./Queries";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const StudentStatusListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (status) => {
        if (!status) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete status: ${status.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteStudentStatus(status.uid);
                Swal.fire(
                    "Deleted!",
                    "The Status has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting status:", error);
            Swal.fire(
                "Error!",
                "Unable to delete status. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Students", "Configurations", "Statuses"]} />
            <PaginatedTable
                fetchPath="/unisync360-students/statuses/"
                title="Student Statuses"
                isFullPath={false}
                columns={[
                    {
                        key: "name",
                        label: "Name",
                        className: "fw-bold",
                        render: (row) => (
                            <span>{row.name}</span>
                        ),
                    },
                    {
                        key: "code",
                        label: "Code",
                        render: (row) => (
                            <span className="badge bg-label-secondary">{row.code}</span>
                        )
                    },
                    {
                        key: "description",
                        label: "Description",
                        render: (row) => (
                            <span className="text-muted">{row.description || "-"}</span>
                        )
                    },
                    {
                        key: "order",
                        label: "Order",
                        render: (row) => (
                            <span>{row.order}</span>
                        )
                    },
                    {
                        key: "is_active_status",
                        label: "Active",
                        render: (row) => (
                            <span className={`badge bg-${row.is_active_status ? "success" : "danger"}`}>
                                {row.is_active_status ? "Active" : "Inactive"}
                            </span>
                        )
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
                        condition: () => hasAccess(user, ["change_studentstatus"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_studentstatus"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Status",
                        render: () => (
                            hasAccess(user, ["add_studentstatus"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Status"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Status
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <StudentStatusModal
                    show={showModal}
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
