import React, { useState } from "react";
import "animate.css";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { deleteWeightConfig } from "./Queries";
import { WeightConfigModal } from "./WeightConfigModal";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const WeightConfigListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (config) => {
        if (!config) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "Delete this weight configuration?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteWeightConfig(config.uid);
                Swal.fire("Deleted!", "Weight configuration deleted successfully.", "success");
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting config:", error);
            Swal.fire("Error!", "Unable to delete weight configuration.", "error");
        }
    };

    const getWeightBar = (value, label, color) => (
        <div className="mb-2">
            <div className="d-flex justify-content-between mb-1">
                <small>{label}</small>
                <small className="fw-bold">{value}%</small>
            </div>
            <div className="progress" style={{ height: '6px' }}>
                <div className={`progress-bar bg-${color}`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );

    return (
        <>
            <BreadCumb pageList={["Recommendations", "Weight Configuration"]} />
            <PaginatedTable
                fetchPath="/unisync360-recommendations/weight-config/"
                title="Weight Configurations"
                columns={[
                    {
                        key: "weights",
                        label: "Weight Distribution",
                        style: { width: "300px" },
                        render: (row) => (
                            <div className="small" style={{ width: '250px' }}>
                                {getWeightBar(row.budget_weight, 'Budget', 'success')}
                                {getWeightBar(row.academic_weight, 'Academic', 'primary')}
                                {getWeightBar(row.country_preference_weight, 'Country', 'info')}
                                {getWeightBar(row.career_alignment_weight, 'Career', 'warning')}
                                {getWeightBar(row.lifestyle_weight, 'Lifestyle', 'secondary')}
                            </div>
                        ),
                    },
                    {
                        key: "threshold",
                        label: "Threshold",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="badge bg-label-warning fs-6">
                                    {row.minimum_match_threshold}%
                                </span>
                                <small className="text-muted mt-1">Minimum Match</small>
                            </div>
                        ),
                    },
                    {
                        key: "max_recommendations",
                        label: "Max Results",
                        render: (row) => (
                            <span className="badge bg-label-info">
                                <i className="bx bx-list-ol me-1"></i>
                                {row.maximum_recommendations}
                            </span>
                        ),
                    },
                    {
                        key: "options",
                        label: "Options",
                        render: (row) => (
                            <div className="d-flex flex-column gap-1">
                                <span className={`badge bg-label-${row.include_safety_options ? 'success' : 'secondary'}`}>
                                    <i className={`bx bx-${row.include_safety_options ? 'check' : 'x'} me-1`}></i>
                                    Safety Options
                                </span>
                                <span className={`badge bg-label-${row.include_reach_options ? 'success' : 'secondary'}`}>
                                    <i className={`bx bx-${row.include_reach_options ? 'check' : 'x'} me-1`}></i>
                                    Reach Options
                                </span>
                            </div>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => (
                            <span className={`badge bg-label-${row.is_active ? 'success' : 'secondary'}`}>
                                {row.is_active ? 'Active' : 'Inactive'}
                            </span>
                        ),
                    },
                    {
                        key: "created_at",
                        label: "Created",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span>{formatDate(row.created_at)}</span>
                                {row.created_by_details && (
                                    <small className="text-muted">
                                        {row.created_by_details.first_name} {row.created_by_details.last_name}
                                    </small>
                                )}
                            </div>
                        ),
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
                        condition: () => hasAccess(user, ["change_recommendationweightconfig"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_recommendationweightconfig"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                filters={[
                    { label: "All", value: "ALL" },
                ]}
                filterSelected={["ALL"]}
                buttons={[
                    {
                        label: "Add Configuration",
                        render: () => (
                            hasAccess(user, ["add_recommendationweightconfig"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                >
                                    <i className="bx bx-plus me-1"></i> Add Configuration
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <WeightConfigModal
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

export default WeightConfigListPage;
