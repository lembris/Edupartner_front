import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { CourseModal } from "./CourseModal";
import { deleteCourse } from "./Queries";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const CourseListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [tableData, setTableData] = useState([]);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (course) => {
        if (!course) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete course: ${course.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteCourse(course.uid);
                Swal.fire(
                    "Deleted!",
                    "The Course has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            Swal.fire(
                "Error!",
                "Unable to delete course. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Academics", "Courses", "List"]} />
            <PaginatedTable
                fetchPath="/unisync360-academic/courses/" // Relative to API_BASE_URL/api/
                title="Courses"
                onDataFetched={(data) => setTableData(data)}
                columns={[
                    {
                        key: "name",
                        label: "Course Name",
                        className: "fw-bold",
                        render: (row) => (
                            <div>
                                <span
                                    className="text-primary cursor-pointer fw-semibold"
                                    onClick={() => navigate(`/unisync360/academics/courses/${row.uid}`)}
                                >
                                    {row.name}
                                </span>
                                <small className="d-block text-muted">{row.code}</small>
                            </div>
                        ),
                    },
                    {
                        key: "category",
                        label: "Category",
                        render: (row) => (
                            <span>{row.category?.name || row.category_name || "-"}</span>
                        )
                    },
                    {
                        key: "level",
                        label: "Level",
                        render: (row) => (
                            <span className="badge bg-label-info">
                                {row.level?.name || row.level_name || "-"}
                            </span>
                        )
                    },
                    {
                        key: "duration",
                        label: "Duration",
                        render: (row) => (
                            <span>{row.duration_years} Years</span>
                        )
                    },
                    {
                        key: "credits",
                        label: "Credits",
                        render: (row) => (
                            <span>{row.total_credits || "-"}</span>
                        )
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/unisync360/academics/courses/${row.uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => { setSelectedObj(row); setShowModal(true); },
                        condition: () => hasAccess(user, ["change_course"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_course"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Course",
                        render: () => (
                            hasAccess(user, ["add_course"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => { setSelectedObj(null); setShowModal(true); }}
                                    title="Add new Course"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Course
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

            <CourseModal
                show={showModal}
                selectedObj={selectedObj}
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedObj(null);
                    setShowModal(false);
                }}
                onClose={() => { setSelectedObj(null); setShowModal(false); }}
            />
        </>
    );
};
