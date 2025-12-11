import React, { useState } from "react";
import "animate.css";
import BreadCumb from "../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../components/ui-templates/PaginatedTable";
import Swal from "sweetalert2";
import { StudentSourceModal } from "./StudentSourceModal";
import { deleteStudentSource } from "./Queries";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const StudentSourceListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (source) => {
        if (!source) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete source: ${source.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteStudentSource(source.uid);
                Swal.fire(
                    "Deleted!",
                    "The Source has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting source:", error);
            Swal.fire(
                "Error!",
                "Unable to delete source. Please try again or contact support.",
                "error"
            );
        }
    };

    const getCategoryLabel = (categoryValue) => {
        const categories = {
            'online': 'Online',
            'referral': 'Referral',
            'walk_in': 'Walk-in',
            'event': 'Event',
            'school': 'School Visit',
        };
        return categories[categoryValue] || categoryValue;
    };

    return (
        <>
            <BreadCumb pageList={["Students", "Configurations", "Sources"]} />
            <PaginatedTable
                fetchPath="/unisync360-students/sources/"
                title="Student Sources"
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
                        key: "category",
                        label: "Category",
                        render: (row) => (
                            <span className="badge bg-label-info">
                                {getCategoryLabel(row.category)}
                            </span>
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
                        key: "actions",
                        label: "Actions",
                        style: { width: "120px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                {hasAccess(user, [["change_studentsource"]]) && (
                                    <button
                                        aria-label="Edit"
                                        type="button"
                                        className="btn btn-sm btn-outline-primary border-0"
                                        onClick={() => {
                                            setSelectedObj(row);
                                            setShowModal(true);
                                        }}
                                        title="Edit Source"
                                    >
                                        <i className="bx bx-edit"></i>
                                    </button>
                                )}

                                {hasAccess(user, [["delete_studentsource"]]) && (
                                    <button
                                        aria-label="Delete"
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0"
                                        onClick={() => handleDelete(row)}
                                        title="Delete Source"
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
                        label: "Add Source",
                        render: () => (
                            hasAccess(user, [["add_studentsource"]]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Source"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Source
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <StudentSourceModal
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
