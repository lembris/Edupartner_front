// LeadLancerDashboard.jsx - Lead Lancer Portal Dashboard
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { commissionPortalService } from "./Queries.jsx";
import { StudentRegistrationModal } from "./StudentRegistrationModal.jsx";
import { CommissionBoard } from "./CommissionBoard.jsx";
import { TargetProgress } from "./TargetProgress.jsx";
import { formatCurrency } from "../../../../utils/formatters.js";

export const LeadLancerDashboard = () => {
    const user = useSelector((state) => state.userReducer?.data);
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState("students");
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Parse URL query parameters
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        const action = searchParams.get('action');

        // Set active tab from URL
        if (tab) {
            const validTabs = ['students', 'commissions', 'packages', 'payments', 'targets', 'predictions'];
            if (validTabs.includes(tab)) {
                setActiveTab(tab);
            }
        }

        // Handle action from URL
        if (action === 'register') {
            setShowStudentModal(true);
        }
    }, [location.search]);

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/unisync360/lead-lancer?tab=${tab}`, { replace: true });
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await commissionPortalService.getDashboard();
            setDashboardData(data?.data);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load dashboard data",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleStudentRegistered = () => {
        setShowStudentModal(false);
        fetchDashboardData();
        Swal.fire({
            icon: "success",
            title: "Success",
            text: "Student registered successfully!",
            timer: 2000,
            showConfirmButton: false,
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid flex-grow-1 container-p-y">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h4 className="mb-1">Welcome, {user?.first_name || "Recruiter"}!</h4>
                            <p className="text-muted mb-0">Lead Lancer Dashboard</p>
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => setShowStudentModal(true)}
                        >
                            <i className="bx bx-plus me-2"></i>
                            Register New Student
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="row g-4 mb-4">
                <div className="col-sm-6 col-xl-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between">
                                <div className="content-left">
                                    <span className="text-muted">Total Students</span>
                                    <div className="d-flex align-items-center mt-2">
                                        <h3 className="mb-0 me-2">{dashboardData?.total_students || 0}</h3>
                                    </div>
                                </div>
                                <div className="avatar">
                                    <span className="avatar-initial rounded bg-label-primary">
                                        <i className="bx bx-user bx-sm"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between">
                                <div className="content-left">
                                    <span className="text-muted">Active Students</span>
                                    <div className="d-flex align-items-center mt-2">
                                        <h3 className="mb-0 me-2">{dashboardData?.active_students || 0}</h3>
                                    </div>
                                </div>
                                <div className="avatar">
                                    <span className="avatar-initial rounded bg-label-success">
                                        <i className="bx bx-check-circle bx-sm"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between">
                                <div className="content-left">
                                    <span className="text-muted">Projected Commission</span>
                                    <div className="d-flex align-items-center mt-2">
                                        <h3 className="mb-0 me-2">
                                            {formatCurrency(dashboardData?.this_month_projected_commission || 0)}
                                        </h3>
                                    </div>
                                    <small className="text-muted">This Month</small>
                                </div>
                                <div className="avatar">
                                    <span className="avatar-initial rounded bg-label-warning">
                                        <i className="bx bx-money bx-sm"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between">
                                <div className="content-left">
                                    <span className="text-muted">Target Progress</span>
                                    <div className="d-flex align-items-center mt-2">
                                        <h3 className="mb-0 me-2">
                                            {dashboardData?.target_progress_percentage || 0}%
                                        </h3>
                                    </div>
                                    <div className="progress mt-2" style={{ height: "6px" }}>
                                        <div
                                            className="progress-bar bg-primary"
                                            style={{ width: `${dashboardData?.target_progress_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="avatar">
                                    <span className="avatar-initial rounded bg-label-info">
                                        <i className="bx bx-target-lock bx-sm"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commission Summary */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card border-start border-primary border-4 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-2">Pending Commission</h6>
                                    <h4 className="mb-0 text-primary">
                                        {formatCurrency(dashboardData?.pending_commissions || 0)}
                                    </h4>
                                </div>
                                <i className="bx bx-time-five text-primary" style={{ fontSize: "2rem" }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-start border-warning border-4 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-2">Approved Commission</h6>
                                    <h4 className="mb-0 text-warning">
                                        {formatCurrency(dashboardData?.approved_commissions || 0)}
                                    </h4>
                                </div>
                                <i className="bx bx-check text-warning" style={{ fontSize: "2rem" }}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-start border-success border-4 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-2">Paid Commission</h6>
                                    <h4 className="mb-0 text-success">
                                        {formatCurrency(dashboardData?.paid_commissions || 0)}
                                    </h4>
                                </div>
                                <i className="bx bx-check-double text-success" style={{ fontSize: "2rem" }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="nav-align-top mb-4">
                <ul className="nav nav-tabs" role="tablist">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "students" ? "active" : ""}`}
                            onClick={() => handleTabChange("students")}
                        >
                            <i className="bx bx-user me-2"></i> My Students
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "commissions" ? "active" : ""}`}
                            onClick={() => handleTabChange("commissions")}
                        >
                            <i className="bx bx-money me-2"></i> Commission Board
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "packages" ? "active" : ""}`}
                            onClick={() => handleTabChange("packages")}
                        >
                            <i className="bx bx-package me-2"></i> Packages
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "payments" ? "active" : ""}`}
                            onClick={() => handleTabChange("payments")}
                        >
                            <i className="bx bx-credit-card me-2"></i> Payments
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "targets" ? "active" : ""}`}
                            onClick={() => handleTabChange("targets")}
                        >
                            <i className="bx bx-target-lock me-2"></i> Targets
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "predictions" ? "active" : ""}`}
                            onClick={() => handleTabChange("predictions")}
                        >
                            <i className="bx bx-trending-up me-2"></i> Predictions
                        </button>
                    </li>
                </ul>
                <div className="tab-content p-0">
                    {activeTab === "students" && (
                        <MyStudentsList onRefresh={fetchDashboardData} />
                    )}
                    {activeTab === "commissions" && <CommissionBoard />}
                    {activeTab === "packages" && <CommissionPackagesView />}
                    {activeTab === "payments" && <CommissionPaymentsView />}
                    {activeTab === "targets" && <TargetProgress />}
                    {activeTab === "predictions" && <CommissionPredictionsView />}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Activity</h5>
                        </div>
                        <div className="card-body">
                            {dashboardData?.recent_activities?.length > 0 ? (
                                <ul className="timeline">
                                    {dashboardData.recent_activities.slice(0, 5).map((activity, index) => (
                                        <li key={index} className="timeline-item">
                                            <span className={`timeline-indicator timeline-indicator-${getActivityColor(activity.activity_type)}`}>
                                                <i className={`bx ${getActivityIcon(activity.activity_type)}`}></i>
                                            </span>
                                            <div className="timeline-event">
                                                <div className="timeline-header mb-1">
                                                    <h6 className="mb-0">{activity.description}</h6>
                                                    <small className="text-muted">
                                                        {new Date(activity.created_at).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted text-center mb-0">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Registration Modal */}
            <StudentRegistrationModal
                show={showStudentModal}
                onHide={() => setShowStudentModal(false)}
                onSuccess={handleStudentRegistered}
            />
        </div>
    );
};

// Helper component for My Students List
const MyStudentsList = ({ onRefresh }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;
            const response = await commissionPortalService.getMyStudents(params);
            setStudents(response?.data?.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [searchQuery, statusFilter]);

    const getStatusBadge = (status) => {
        const badges = {
            active: "bg-label-success",
            left: "bg-label-warning",
            completed: "bg-label-primary",
            withdrawn: "bg-label-danger",
            deferred: "bg-label-secondary",
        };
        return badges[status] || "bg-label-secondary";
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="card mt-4">
            <div className="card-header">
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text"><i className="bx bx-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="left">Left</option>
                            <option value="completed">Completed</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Registered</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((item) => (
                                <tr key={item.uid}>
                                    <td>
                                        <strong>{item.student_details?.full_name}</strong>
                                    </td>
                                    <td>{item.student_details?.personal_phone}</td>
                                    <td>{item.student_details?.personal_email || "-"}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(item.student_details?.status?.toLowerCase())}`}>
                                            {item.student_details?.status || "N/A"}
                                        </span>
                                    </td>
                                    <td>{new Date(item.registration_date).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-sm btn-icon btn-label-primary me-1" title="View">
                                            <i className="bx bx-show"></i>
                                        </button>
                                        <button className="btn btn-sm btn-icon btn-label-warning" title="Update Status">
                                            <i className="bx bx-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    <p className="mb-0 text-muted">No students found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Helper functions
const getActivityIcon = (type) => {
    const icons = {
        student_registered: "bx-user-plus",
        status_updated: "bx-refresh",
        commission_earned: "bx-dollar",
        payment_received: "bx-check-circle",
        badge_earned: "bx-medal",
        target_set: "bx-target-lock",
    };
    return icons[type] || "bx-info-circle";
};

const getActivityColor = (type) => {
    const colors = {
        student_registered: "primary",
        status_updated: "info",
        commission_earned: "warning",
        payment_received: "success",
        badge_earned: "danger",
        target_set: "secondary",
    };
    return colors[type] || "secondary";
};

// Commission Packages Component
const CommissionPackagesView = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                // TODO: Implement API call to fetch commission packages
                // const response = await commissionPortalService.getCommissionPackages();
                setPackages([]);
            } catch (error) {
                console.error("Error fetching packages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="card mt-4">
            <div className="card-header">
                <h5 className="mb-0">Commission Packages</h5>
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Package Name</th>
                            <th>Description</th>
                            <th>Scope</th>
                            <th>Rate Type</th>
                            <th>Default Rate</th>
                            <th>Valid Period</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.length > 0 ? (
                            packages.map((pkg) => (
                                <tr key={pkg.uid}>
                                    <td><strong>{pkg.name}</strong></td>
                                    <td>{pkg.description || "-"}</td>
                                    <td><span className="badge bg-info">{pkg.scope}</span></td>
                                    <td>{pkg.rate_type}</td>
                                    <td><strong className="text-primary">{pkg.default_rate}%</strong></td>
                                    <td>{pkg.valid_from} to {pkg.valid_to || "No Limit"}</td>
                                    <td>
                                        <button className="btn btn-sm btn-icon btn-label-primary">
                                            <i className="bx bx-show"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    <p className="mb-0 text-muted">No commission packages available</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Commission Payments Component
const CommissionPaymentsView = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                // TODO: Implement API call to fetch commission payments
                // const response = await commissionPortalService.getCommissionPayments();
                setPayments([]);
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="card mt-4">
            <div className="card-header">
                <h5 className="mb-0">Commission Payments</h5>
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Reference</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? (
                            payments.map((payment) => (
                                <tr key={payment.uid}>
                                    <td>{payment.payment_reference}</td>
                                    <td>{formatCurrency(payment.amount)}</td>
                                    <td><span className={`badge bg-${getPaymentStatusColor(payment.status)}`}>{payment.status}</span></td>
                                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-sm btn-icon btn-label-primary">
                                            <i className="bx bx-show"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    <p className="mb-0 text-muted">No payments found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Commission Predictions Component
const CommissionPredictionsView = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                setLoading(true);
                // TODO: Implement API call to fetch commission predictions
                // const response = await commissionPortalService.getCommissionPredictions();
                setPredictions([]);
            } catch (error) {
                console.error("Error fetching predictions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPredictions();
    }, []);

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="card mt-4">
            <div className="card-header">
                <h5 className="mb-0">Commission Predictions</h5>
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Prediction Period</th>
                            <th>Prediction Date</th>
                            <th>Predicted Commission</th>
                            <th>Confidence Level</th>
                            <th>Methodology</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {predictions.length > 0 ? (
                            predictions.map((pred) => (
                                <tr key={pred.uid}>
                                    <td><span className="badge bg-info">{pred.prediction_period}</span></td>
                                    <td>{new Date(pred.prediction_date).toLocaleDateString()}</td>
                                    <td><strong className="text-info">{formatCurrency(pred.predicted_commission)}</strong></td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="progress" style={{ width: "100px", height: "6px" }}>
                                                <div 
                                                    className="progress-bar bg-info" 
                                                    style={{ width: `${pred.confidence_level}%` }}
                                                ></div>
                                            </div>
                                            <span className="ms-2 fw-semibold">{pred.confidence_level}%</span>
                                        </div>
                                    </td>
                                    <td>{pred.methodology || "Standard"}</td>
                                    <td>
                                        <button className="btn btn-sm btn-icon btn-label-primary">
                                            <i className="bx bx-show"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    <p className="mb-0 text-muted">No predictions available</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Helper function for payment status color
const getPaymentStatusColor = (status) => {
    const colors = {
        pending: "warning",
        processing: "info",
        completed: "success",
        failed: "danger",
        reversed: "secondary",
    };
    return colors[status] || "secondary";
};

export default LeadLancerDashboard;
