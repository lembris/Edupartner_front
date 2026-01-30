// CommissionBoard.jsx - Commission Board with Payment Tracker
import React, { useEffect, useState, useMemo } from "react";
import { commissionPortalService } from "./Queries.jsx";
import { formatCurrency } from "../../../../utils/formatters.js";

export const CommissionBoard = () => {
    const [loading, setLoading] = useState(true);
    const [commissions, setCommissions] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [searchAgent, setSearchAgent] = useState("");
    const [summaryData, setSummaryData] = useState({
        total_pending: 0,
        total_approved: 0,
        total_processing: 0,
        total_paid: 0,
        total_rejected: 0,
        total_amount: 0,
        count_pending: 0,
        count_approved: 0,
        count_processing: 0,
        count_paid: 0,
        count_rejected: 0,
    });

    const fetchCommissionData = async () => {
        try {
            setLoading(true);
            const response = await commissionPortalService.getCommissionBoard();

            // Extract commission data
            if (response?.results) {
                setCommissions(response.results);

                // Calculate summary from commissions
                const summary = {
                    total_pending: 0,
                    total_approved: 0,
                    total_processing: 0,
                    total_paid: 0,
                    total_rejected: 0,
                    total_amount: 0,
                    count_pending: 0,
                    count_approved: 0,
                    count_processing: 0,
                    count_paid: 0,
                    count_rejected: 0,
                };

                response.results.forEach((commission) => {
                    const amount = parseFloat(commission.commission_amount || 0);
                    summary.total_amount += amount;

                    if (commission.status === 'pending') {
                        summary.total_pending += amount;
                        summary.count_pending += 1;
                    } else if (commission.status === 'approved') {
                        summary.total_approved += amount;
                        summary.count_approved += 1;
                    } else if (commission.status === 'processing') {
                        summary.total_processing += amount;
                        summary.count_processing += 1;
                    } else if (commission.status === 'paid') {
                        summary.total_paid += amount;
                        summary.count_paid += 1;
                    } else if (commission.status === 'rejected') {
                        summary.total_rejected += amount;
                        summary.count_rejected += 1;
                    }
                });

                setSummaryData(summary);
            }
        } catch (error) {
            console.error("Error fetching commission board:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedCommissions = useMemo(() => {
        let filtered = commissions;

        // Apply status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter(c => c.status === filterStatus);
        }

        // Apply search filter
        if (searchAgent.trim()) {
            const searchLower = searchAgent.toLowerCase();
            filtered = filtered.filter(c =>
                (c.agent?.first_name || "").toLowerCase().includes(searchLower) ||
                (c.agent?.last_name || "").toLowerCase().includes(searchLower) ||
                ((c.agent?.first_name || "") + " " + (c.agent?.last_name || "")).toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "amount-desc":
                    return (b.commission_amount || 0) - (a.commission_amount || 0);
                case "amount-asc":
                    return (a.commission_amount || 0) - (b.commission_amount || 0);
                case "date-asc":
                    return new Date(a.payment_date || 0) - new Date(b.payment_date || 0);
                case "date-desc":
                default:
                    return new Date(b.payment_date || 0) - new Date(a.payment_date || 0);
            }
        });

        return sorted;
    }, [commissions, filterStatus, sortBy, searchAgent]);

    useEffect(() => {
        fetchCommissionData();
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
            {/* Total Commission Amount Card */}
            <div className="row g-4 mb-4">
                <div className="col-12">
                    <div className="card bg-gradient" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-2">Total Commissions</h6>
                                    <h2 className="text-white mb-0">
                                        {formatCurrency(summaryData.total_amount || 0)}
                                    </h2>
                                </div>
                                <div className="text-white opacity-75">
                                    <i className="bx bx-wallet" style={{ fontSize: "3rem" }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commission Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card bg-secondary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-2">Pending</h6>
                                    <h3 className="text-white mb-0">
                                        {formatCurrency(summaryData.total_pending || 0)}
                                    </h3>
                                    <small className="text-white-50">{summaryData.count_pending} commission(s)</small>
                                </div>
                                <i className="bx bx-time" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
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
                                        {formatCurrency(summaryData.total_approved || 0)}
                                    </h3>
                                    <small className="text-white-50">{summaryData.count_approved} commission(s)</small>
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
                                        {formatCurrency(summaryData.total_processing || 0)}
                                    </h3>
                                    <small className="text-white-50">{summaryData.count_processing} commission(s)</small>
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
                                        {formatCurrency(summaryData.total_paid || 0)}
                                    </h3>
                                    <small className="text-white-50">{summaryData.count_paid} commission(s)</small>
                                </div>
                                <i className="bx bx-check-double" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejected Card */}
            {summaryData.total_rejected > 0 && (
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="card bg-danger text-white h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-white-50 mb-2">Rejected</h6>
                                        <h3 className="text-white mb-0">
                                            {formatCurrency(summaryData.total_rejected || 0)}
                                        </h3>
                                        <small className="text-white-50">{summaryData.count_rejected} commission(s)</small>
                                    </div>
                                    <i className="bx bx-x" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* Commission List */}
            <div className="card">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">My Commission Records</h5>
                        <span className="badge bg-label-primary">{filteredAndSortedCommissions.length} / {commissions.length} Records</span>
                    </div>

                    {/* Filters and Controls */}
                    <div className="row g-3">
                        <div className="col-md-5">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search by agent name..."
                                value={searchAgent}
                                onChange={(e) => setSearchAgent(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="processing">Processing</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="date-desc">Latest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="amount-desc">Highest Amount</option>
                                <option value="amount-asc">Lowest Amount</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Agent Name</th>
                                <th>Status</th>
                                <th>Commission Amount</th>
                                <th>Commission Rate</th>
                                <th>Base Amount</th>
                                <th>Payment Date</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedCommissions?.length > 0 ? (
                                filteredAndSortedCommissions.map((commission) => {
                                    const statusInfo = getStatusBadge(commission.status);
                                    const baseAmount = parseFloat(commission.base_amount || 0);
                                    const commissionAmount = parseFloat(commission.commission_amount || 0);
                                    const commissionRate = parseFloat(commission.commission_rate || 0);

                                    return (
                                        <tr key={commission.uid}>
                                            <td>
                                                <strong>
                                                    {commission.agent?.first_name} {commission.agent?.last_name}
                                                </strong>
                                            </td>
                                            <td>
                                                <span className={`badge ${statusInfo.class}`}>
                                                    <i className={`bx ${statusInfo.icon} me-1`}></i>
                                                    {commission.status}
                                                </span>
                                            </td>
                                            <td>
                                                <strong className="text-primary">
                                                    {formatCurrency(commissionAmount)}
                                                </strong>
                                            </td>
                                            <td>
                                                <span className="badge bg-label-secondary">
                                                    {commissionRate.toFixed(2)}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-muted">
                                                    {formatCurrency(baseAmount)}
                                                </span>
                                            </td>
                                            <td>
                                                <small>
                                                    {commission.payment_date
                                                        ? new Date(commission.payment_date).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric"
                                                        })
                                                        : <span className="text-muted">—</span>}
                                                </small>
                                            </td>
                                            <td>
                                                <small className="text-muted text-truncate d-block" title={commission.notes || "No notes"}>
                                                    {commission.notes || "—"}
                                                </small>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        <i className="bx bx-info-circle text-muted me-2"></i>
                                        {commissions.length === 0 ? "No commission records found" : "No results match your filters"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default CommissionBoard;
