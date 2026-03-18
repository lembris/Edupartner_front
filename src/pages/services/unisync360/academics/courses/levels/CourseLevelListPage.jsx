import React, { useState, useEffect } from "react";
import "animate.css";
import BreadCumb from "../../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../../components/ui-templates/PaginatedTable";
import Swal from "sweetalert2";
import { CourseLevelModal } from "./CourseLevelModal";
import { deleteCourseLevel } from "./Queries";
import { hasAccess } from "../../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const CourseLevelListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [tableData, setTableData] = useState([]);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (level) => {
        if (!level) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete level: ${level.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteCourseLevel(level.uid);
                Swal.fire(
                    "Deleted!",
                    "The Level has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting level:", error);
            Swal.fire(
                "Error!",
                "Unable to delete level. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Academics", "Course Levels", "List"]} />
            <PaginatedTable
                fetchPath="/unisync360-academic/course-levels/" // Relative to API_BASE_URL/api/
                title="Course Levels"
                onDataFetched={(data) => setTableData(data)}
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
                            <span className="badge bg-label-primary">{row.code}</span>
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
                ]}
                actions={[
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => setSelectedObj(row),
                        condition: () => hasAccess(user, ["change_courselevel"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_courselevel"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Level",
                        render: () => (
                            hasAccess(user, ["add_courselevel"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedObj(null)}
                                    data-bs-toggle="modal"
                                    data-bs-target="#courseLevelModal"
                                    title="Add new Level"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Level
                                </button>
                            )
                        ),
                    },
                ]}
                onSelect={(row) => {
                    // This usually handles row click
                }}
                isRefresh={tableRefresh}
            />

            <CourseLevelModal
                selectedObj={selectedObj}
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedObj(null);
                }}
                onClose={() => setSelectedObj(null)}
            />
        </>
    );
};
