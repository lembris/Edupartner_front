import React, { useState, useEffect } from "react";
import "animate.css";
import BreadCumb from "../../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../../components/ui-templates/PaginatedTable";
import Swal from "sweetalert2";
import { CourseCategoryModal } from "./CourseCategoryModal";
import { deleteCourseCategory } from "./Queries";
import { hasAccess } from "../../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const CourseCategoryListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [tableData, setTableData] = useState([]);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (category) => {
        if (!category) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete category: ${category.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteCourseCategory(category.uid);
                Swal.fire(
                    "Deleted!",
                    "The Category has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            Swal.fire(
                "Error!",
                "Unable to delete category. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Academics", "Course Categories", "List"]} />
            <PaginatedTable
                fetchPath="/unisync360-academic/course-categories/" // Relative to API_BASE_URL/api/
                title="Course Categories"
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
                        key: "description",
                        label: "Description",
                        render: (row) => (
                            <span className="text-muted">{row.description || "-"}</span>
                        )
                    },
                    {
                        key: "parent",
                        label: "Parent Category",
                        render: (row) => (
                            <span className="badge bg-label-info">
                                {row.parent?.name || row.parent_name || "-"}
                            </span>
                        )
                    },
                ]}
                actions={[
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => setSelectedObj(row),
                        condition: () => hasAccess(user, ["change_coursecategory"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_coursecategory"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Category",
                        render: () => (
                            hasAccess(user, ["add_coursecategory"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedObj(null)}
                                    data-bs-toggle="modal"
                                    data-bs-target="#courseCategoryModal"
                                    title="Add new Category"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Category
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

            <CourseCategoryModal
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
