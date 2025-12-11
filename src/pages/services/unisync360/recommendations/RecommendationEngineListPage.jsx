import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { deleteRecommendationEngine, getScoreColor, getScoreLabel } from "./Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const RecommendationEngineListPage = () => {
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (engine) => {
        if (!engine) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `Delete recommendation engine for "${engine.student_name}"?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteRecommendationEngine(engine.uid);
                Swal.fire("Deleted!", "Recommendation engine deleted successfully.", "success");
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting engine:", error);
            Swal.fire("Error!", "Unable to delete recommendation engine.", "error");
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

    return (
        <>
            <BreadCumb pageList={["Recommendations", "Engines"]} />
            <PaginatedTable
                fetchPath="/unisync360-recommendations/engines/"
                title="Recommendation Engines"
                columns={[
                    {
                        key: "student",
                        label: "Student",
                        className: "fw-bold",
                        style: { width: "200px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar avatar-sm me-2 bg-label-primary">
                                    <span className="avatar-initial rounded">
                                        {row.student_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                    </span>
                                </div>
                                <div>
                                    <span 
                                        className="fw-semibold text-primary cursor-pointer"
                                        onClick={() => navigate(`/unisync360/students/${row.student}`)}
                                    >
                                        {row.student_name || "N/A"}
                                    </span>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "budget",
                        label: "Budget Range",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="fw-medium">
                                    {formatCurrency(row.budget_range_min)} - {formatCurrency(row.budget_range_max)}
                                </span>
                                {row.preferred_currencies?.length > 0 && (
                                    <small className="text-muted">
                                        {row.preferred_currencies.join(', ')}
                                    </small>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "qualification",
                        label: "Qualification",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="badge bg-label-info">{row.qualification_level || 'N/A'}</span>
                                {row.gpa && <small className="text-muted mt-1">GPA: {row.gpa}</small>}
                            </div>
                        ),
                    },
                    {
                        key: "preferences",
                        label: "Preferences",
                        render: (row) => (
                            <div className="d-flex flex-wrap gap-1">
                                {row.course_interests?.slice(0, 2).map((interest, idx) => (
                                    <span key={idx} className="badge bg-label-primary">{interest}</span>
                                ))}
                                {row.course_interests?.length > 2 && (
                                    <span className="badge bg-label-secondary">+{row.course_interests.length - 2}</span>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "confidence",
                        label: "Confidence",
                        style: { width: "120px" },
                        render: (row) => {
                            const confidence = parseFloat(row.recommendation_confidence) || 0;
                            return (
                                <div className="d-flex align-items-center">
                                    <div className="progress flex-grow-1" style={{ height: '8px', width: '60px' }}>
                                        <div
                                            className={`progress-bar bg-${getScoreColor(confidence)}`}
                                            style={{ width: `${confidence}%` }}
                                        ></div>
                                    </div>
                                    <span className="ms-2 small fw-bold">{confidence.toFixed(0)}%</span>
                                </div>
                            );
                        },
                    },
                    {
                        key: "recommendations",
                        label: "Results",
                        render: (row) => (
                            <span className="badge bg-label-success">
                                <i className="bx bx-list-check me-1"></i>
                                {row.recommendation_count || 0} courses
                            </span>
                        ),
                    },
                    {
                        key: "created_at",
                        label: "Generated",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span>{row.recommendation_date ? formatDate(row.recommendation_date) : formatDate(row.created_at)}</span>
                                <small className="text-muted">v{row.model_version || '1.0'}</small>
                            </div>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        style: { width: "100px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                <button
                                    className="btn btn-sm btn-outline-primary border-0"
                                    onClick={() => navigate(`/unisync360/recommendations/recommended-courses?engine=${row.uid}`)}
                                    title="View Recommendations"
                                >
                                    <i className="bx bx-show"></i>
                                </button>
                                {hasAccess(user, ["delete_courserecommendationengine"]) && (
                                    <button
                                        className="btn btn-sm btn-outline-danger border-0"
                                        onClick={() => handleDelete(row)}
                                        title="Delete"
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                )}
                            </div>
                        ),
                    },
                ]}
                filters={[
                    { label: "All", value: "ALL" },
                ]}
                filterSelected={["ALL"]}
                buttons={[
                    {
                        label: "Generate Recommendations",
                        render: () => (
                            hasAccess(user, ["add_courserecommendationengine"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate('/unisync360/recommendations/generate-recommendations')}
                                >
                                    <i className="bx bx-brain me-1"></i> Generate New
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />
        </>
    );
};

export default RecommendationEngineListPage;
