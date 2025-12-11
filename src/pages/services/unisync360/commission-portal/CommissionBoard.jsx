// CommissionBoard.jsx - Commission Board with Payment Tracker
import React, { useEffect, useState } from "react";
import { commissionPortalService } from "./Queries.jsx";
import { formatCurrency } from "../../../../utils/formatters.js";

export const CommissionBoard = () => {
    const [loading, setLoading] = useState(true);
    const [boardData, setBoardData] = useState(null);

    const fetchBoardData = async () => {
        try {
            setLoading(true);
            const response = await commissionPortalService.getCommissionBoard();
            setBoardData(response?.data);
        } catch (error) {
            console.error("Error fetching commission board:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardData();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: "bg-label-secondary", icon: "bx-time" },
            projected: { class: "bg-label-info", icon: "bx-trending-up" },
            approved: { class: "bg-label-warning", icon: "bx-check" },
            processing: { class: "bg-label-primary", icon: "bx-loader" },
            paid: { class: "bg-label-success", icon: "bx-check-double" },
            rejected: { class: "bg-label-danger", icon: "bx-x" },
        };
        return badges[status] || { class: "bg-label-secondary", icon: "bx-question-mark" };
    };

    return (
        <div className="mt-4">
            {/* Commission Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-2">Projected</h6>
                                    <h3 className="text-white mb-0">
                                        {formatCurrency(boardData?.total_projected || 0)}
                                    </h3>
                                </div>
                                <i className="bx bx-trending-up" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-2">Approved</h6>
                                    <h3 className="text-white mb-0">
                                        {formatCurrency(boardData?.total_approved || 0)}
                                    </h3>
                                </div>
                                <i className="bx bx-check" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-2">Processing</h6>
                                    <h3 className="text-white mb-0">
                                        {formatCurrency(boardData?.total_processing || 0)}
                                    </h3>
                                </div>
                                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-2">Paid</h6>
                                    <h3 className="text-white mb-0">
                                        {formatCurrency(boardData?.total_paid || 0)}
                                    </h3>
                                </div>
                                <i className="bx bx-check-double" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Flow Visualization */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Commission Status Flow</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <StatusStep status="active" label="Student Active" icon="bx-user-check" color="info" />
                        <i className="bx bx-right-arrow-alt text-muted" style={{ fontSize: "1.5rem" }}></i>
                        <StatusStep status="left" label="Left/Completed" icon="bx-log-out" color="warning" />
                        <i className="bx bx-right-arrow-alt text-muted" style={{ fontSize: "1.5rem" }}></i>
                        <StatusStep status="approved" label="Commission Calculated" icon="bx-calculator" color="primary" />
                        <i className="bx bx-right-arrow-alt text-muted" style={{ fontSize: "1.5rem" }}></i>
                        <StatusStep status="paid" label="Payment Processed" icon="bx-check-double" color="success" />
                    </div>
                </div>
            </div>

            {/* Commission List */}
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Commission Records</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Course</th>
                                        <th>Program Fee</th>
                                        <th>Commission</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boardData?.commissions?.length > 0 ? (
                                        boardData.commissions.map((commission) => {
                                            const statusInfo = getStatusBadge(commission.status);
                                            return (
                                                <tr key={commission.uid}>
                                                    <td>
                                                        <strong>{commission.student_name}</strong>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {commission.course_name || "N/A"}
                                                        </small>
                                                    </td>
                                                    <td>{formatCurrency(commission.program_fee)}</td>
                                                    <td>
                                                        <strong className="text-primary">
                                                            {formatCurrency(commission.commission_amount)}
                                                        </strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            ({commission.commission_rate}%)
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${statusInfo.class}`}>
                                                            <i className={`bx ${statusInfo.icon} me-1`}></i>
                                                            {commission.status}
                                                        </span>
                                                        {commission.is_projected && (
                                                            <span className="badge bg-label-secondary ms-1">
                                                                Projected
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <small>
                                                            {new Date(commission.calculation_date).toLocaleDateString()}
                                                        </small>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <i className="bx bx-info-circle text-muted me-2"></i>
                                                No commission records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Payment History</h5>
                        </div>
                        <div className="card-body">
                            {boardData?.payment_history?.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {boardData.payment_history.map((payment) => (
                                        <li key={payment.uid} className="list-group-item px-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">
                                                        {formatCurrency(payment.amount)}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {payment.payment_reference}
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <span className={`badge ${
                                                        payment.status === 'completed' 
                                                            ? 'bg-label-success' 
                                                            : payment.status === 'processing'
                                                            ? 'bg-label-warning'
                                                            : 'bg-label-secondary'
                                                    }`}>
                                                        {payment.status}
                                                    </span>
                                                    <br />
                                                    <small className="text-muted">
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-wallet text-muted" style={{ fontSize: "3rem" }}></i>
                                    <p className="text-muted mb-0 mt-2">No payments yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Status Step Component
const StatusStep = ({ label, icon, color }) => {
    return (
        <div className="text-center">
            <div
                className={`rounded-circle d-inline-flex align-items-center justify-content-center bg-label-${color}`}
                style={{ width: "60px", height: "60px" }}
            >
                <i className={`bx ${icon}`} style={{ fontSize: "1.5rem" }}></i>
            </div>
            <p className="mt-2 mb-0 small">{label}</p>
        </div>
    );
};

export default CommissionBoard;
