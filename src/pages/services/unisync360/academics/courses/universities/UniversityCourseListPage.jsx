import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { UniversityCourseModal } from "./UniversityCourseModal";
import { deleteUniversityCourse } from "./Queries";
import { hasAccess } from "../../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const UniversityCourseListPage = () => {
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
                text: `You're about to delete course: ${course.university_course_name || course.course?.name || course.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteUniversityCourse(course.uid);
                Swal.fire(
                    "Deleted!",
                    "The University Course has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting university course:", error);
            Swal.fire(
                "Error!",
                "Unable to delete university course. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Academics", "University Courses", "List"]} />
            <PaginatedTable
                fetchPath="/unisync360-academic/university-courses/" // Relative to API_BASE_URL/api/
                title="University Courses"
                onDataFetched={(data) => setTableData(data)}
                columns={[
                    {
                        key: "university",
                        label: "University",
                        className: "fw-bold",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span>{row.university?.name || row.university_name || "-"}</span>
                                <small className="text-muted"><i className="bx bx-map me-1"></i>{row.country_name || "-"}</small>
                            </div>
                        ),
                    },
                    {
                        key: "course",
                        label: "Course",
                        render: (row) => (
                            <div>
                                <span
                                    className="text-primary cursor-pointer fw-semibold"
                                    onClick={() => navigate(`/unisync360/academics/university-courses/${row.uid}`)}
                                >
                                    {row.course?.name || row.course_name}
                                </span>
                                <small className="d-block text-muted">{row.course?.code || row.course_code}</small>
                            </div>
                        ),
                    },
                    {
                        key: "tuition_fee",
                        label: "Tuition & Scholarship",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className={row.scholarship_available ? "text-decoration-line-through text-muted small" : "fw-semibold"}>
                                    {row.currency} {Number(row.tuition_fee).toLocaleString()}
                                </span>
                                {row.scholarship_available && (
                                    <>
                                        <span className="fw-bold text-primary">
                                            {row.currency} {Number(row.fee_after_scholarship).toLocaleString()}
                                        </span>
                                        <small className="text-success">
                                            <i className="bx bxs-offer me-1"></i>
                                            {row.scholarship_type === 'percentage' 
                                                ? `${row.scholarship_amount}% Off` 
                                                : row.scholarship_type === 'full'
                                                    ? 'Full Scholarship'
                                                    : `-${row.currency} ${Number(row.scholarship_amount).toLocaleString()}`}
                                        </small>
                                    </>
                                )}
                            </div>
                        )
                    },
                    {
                        key: "duration",
                        label: "Duration",
                        render: (row) => (
                            <span>{row.duration_months} Months</span>
                        )
                    },
                    {
                        key: "intakes",
                        label: "Intakes & Deadline",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <div className="mb-1">
                                    {Array.isArray(row.intakes) && row.intakes.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-1">
                                            {row.intakes.map((intake, idx) => (
                                                <span key={idx} className="badge bg-label-info" style={{fontSize: '0.7rem'}}>{intake.substring(0, 3)}</span>
                                            ))}
                                        </div>
                                    ) : <span className="text-muted small">-</span>}
                                </div>
                                {row.application_deadline && (
                                    <div className="mt-1 p-1 rounded bg-label-danger w-100 text-center text-danger">
                                        <i className="bx bx-time-five me-1"></i>
                                        <small className="fw-bold">{formatDate(row.application_deadline, "DD MMM YYYY")}</small>
                                    </div>
                                )}
                            </div>
                        )
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/unisync360/academics/university-courses/${row.uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => { setSelectedObj(row); setShowModal(true); },
                        condition: () => hasAccess(user, ["change_universitycourse"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_universitycourse"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add University Course",
                        render: () => (
                            hasAccess(user, ["add_universitycourse"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => { setSelectedObj(null); setShowModal(true); }}
                                    title="Add new University Course"
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

            <UniversityCourseModal
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
