import React, { useState } from "react";
import "animate.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { deleteRecommendedCourse, getScoreColor, getScoreLabel } from "./Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const RecommendedCourseListPage = () => {
    const [tableRefresh, setTableRefresh] = useState(0);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const engineFilter = searchParams.get('engine') || '';
    const studentFilter = searchParams.get('student') || '';

    const handleDelete = async (course) => {
        if (!course) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `Remove "${course.course_name}" from recommendations?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, remove it!",
            });

            if (confirmation.isConfirmed) {
                await deleteRecommendedCourse(course.uid);
                Swal.fire("Removed!", "Recommendation removed successfully.", "success");
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting recommendation:", error);
            Swal.fire("Error!", "Unable to remove recommendation.", "error");
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const buildFetchPath = () => {
        let path = "/unisync360-recommendations/recommended-courses/";
        const params = [];
        if (engineFilter) params.push(`engine=${engineFilter}`);
        if (studentFilter) params.push(`student=${studentFilter}`);
        if (params.length > 0) path += `?${params.join('&')}`;
        return path;
    };

    return (
        <>
            <BreadCumb pageList={["Recommendations", "Recommended Courses"]} />
            <PaginatedTable
                fetchPath={buildFetchPath()}
                title="Recommended Courses"
                columns={[
                    {
                        key: "course",
                        label: "Course / University",
                        className: "fw-bold",
                        style: { width: "280px" },
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span
                                    className="fw-semibold text-primary cursor-pointer"
                                    onClick={() => navigate(`/unisync360/academics/university-courses/${row.university_course}`)}
                                >
                                    {row.course_name || "N/A"}
                                </span>
                                <small className="text-muted">
                                    <i className="bx bxs-school me-1"></i>
                                    {row.university_name || "N/A"}
                                </small>
                                <small className="text-muted">
                                    <i className="bx bx-map me-1"></i>
                                    {row.country_name || "N/A"}
                                </small>
                            </div>
                        ),
                    },
                    {
                        key: "overall_score",
                        label: "Match Score",
                        style: { width: "140px" },
                        render: (row) => {
                            const score = parseFloat(row.overall_match_score) || 0;
                            return (
                                <div className="text-center">
                                    <div className={`badge bg-${getScoreColor(score)} fs-6 mb-1`}>
                                        {score.toFixed(0)}%
                                    </div>
                                    <small className={`d-block text-${getScoreColor(score)}`}>
                                        {getScoreLabel(score)}
                                    </small>
                                </div>
                            );
                        },
                    },
                    {
                        key: "scores",
                        label: "Score Breakdown",
                        style: { width: "200px" },
                        render: (row) => (
                            <div className="small">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Budget</span>
                                    <span className="fw-bold">{parseFloat(row.budget_match_score || 0).toFixed(0)}%</span>
                                </div>
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Academic</span>
                                    <span className="fw-bold">{parseFloat(row.academic_match_score || 0).toFixed(0)}%</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Career</span>
                                    <span className="fw-bold">{parseFloat(row.career_alignment_score || 0).toFixed(0)}%</span>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "costs",
                        label: "Estimated Cost",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="fw-medium text-success">
                                    {formatCurrency(row.total_estimated_cost)}
                                </span>
                                <small className="text-muted">
                                    Tuition: {formatCurrency(row.tuition_fee)}
                                </small>
                                <small className="text-muted">
                                    Living: {formatCurrency(row.living_cost_estimate)}
                                </small>
                            </div>
                        ),
                    },
                    {
                        key: "admission",
                        label: "Admission",
                        style: { width: "120px" },
                        render: (row) => {
                            const prob = parseFloat(row.admission_probability) || 0;
                            return (
                                <div className="d-flex align-items-center">
                                    <div className="progress flex-grow-1" style={{ height: '8px', width: '50px' }}>
                                        <div
                                            className={`progress-bar bg-${getScoreColor(prob)}`}
                                            style={{ width: `${prob}%` }}
                                        ></div>
                                    </div>
                                    <span className="ms-2 small fw-bold">{prob.toFixed(0)}%</span>
                                </div>
                            );
                        },
                    },
                    {
                        key: "scholarship",
                        label: "Scholarship",
                        render: (row) => (
                            row.scholarship_opportunity ? (
                                <div className="d-flex flex-column">
                                    <span className="badge bg-label-success">
                                        <i className="bx bx-check-circle me-1"></i>Available
                                    </span>
                                    {row.estimated_scholarship_amount && (
                                        <small className="text-success mt-1">
                                            Up to {formatCurrency(row.estimated_scholarship_amount)}
                                        </small>
                                    )}
                                </div>
                            ) : (
                                <span className="badge bg-label-secondary">Not Available</span>
                            )
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/unisync360/academics/university-courses/${row.university_course_uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_recommendedcourse"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                filters={[
                    { label: "All", value: "ALL" },
                    { label: "80%+", value: "80" },
                    { label: "60%+", value: "60" },
                    { label: "40%+", value: "40" },
                ]}
                filterKey="min_score"
                filterSelected={["ALL"]}
                isRefresh={tableRefresh}
            />
        </>
    );
};

export default RecommendedCourseListPage;
