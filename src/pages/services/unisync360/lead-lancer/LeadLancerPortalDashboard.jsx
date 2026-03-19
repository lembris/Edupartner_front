// LeadLancerPortalDashboard.jsx - Lead Lancer Portal Dashboard with Commission Tracker
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { commissionPortalService } from "../commission-portal/Queries.jsx";
import { StudentModal } from "../students/StudentModal.jsx";
import { formatCurrency } from "../../../../utils/formatters.js";
import "./LeadLancerPortalDashboard.css";

export const LeadLancerPortalDashboard = () => {
    const user = useSelector((state) => state.userReducer?.data);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [countryStats, setCountryStats] = useState([]);
    const [commissions, setCommissions] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [searchAgent, setSearchAgent] = useState("");
    const [commissionStats, setCommissionStats] = useState({
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
    const [studentStats, setStudentStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        completed: 0,
    });
    const [topCourses, setTopCourses] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await commissionPortalService.getDashboard();
            console.log("Dashboard API Response:", data);
            setDashboardData(data?.data);

            // Parse and organize country statistics
            if (data?.data?.universities_by_country) {
                console.log("Universities by country data:", data.data.universities_by_country);
                const countryData = Object.entries(data.data.universities_by_country).map(
                    ([country, count]) => ({
                        country,
                        count,
                    })
                );
                console.log("Processed country stats:", countryData);
                setCountryStats(countryData.sort((a, b) => b.count - a.count));
            } else {
                console.warn("No universities_by_country data in response");
                setCountryStats([]);
            }

            // Set student statistics
            if (data?.data) {
                setStudentStats({
                    total: data.data.total_students || 0,
                    active: data.data.active_students || 0,
                    inactive: (data.data.total_students || 0) - (data.data.active_students || 0),
                    completed: data.data.completed_students || 0,
                });
            }

            // Set top courses
            if (data?.data?.top_courses_with_applications) {
                setTopCourses(data.data.top_courses_with_applications);
            }
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

    const fetchCommissionData = async () => {
        try {
            const response = await commissionPortalService.getCommissionBoard();

            if (response?.results) {
                setCommissions(response.results);

                const stats = {
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
                    stats.total_amount += amount;

                    if (commission.status === 'pending') {
                        stats.total_pending += amount;
                        stats.count_pending += 1;
                    } else if (commission.status === 'approved') {
                        stats.total_approved += amount;
                        stats.count_approved += 1;
                    } else if (commission.status === 'processing') {
                        stats.total_processing += amount;
                        stats.count_processing += 1;
                    } else if (commission.status === 'paid') {
                        stats.total_paid += amount;
                        stats.count_paid += 1;
                    } else if (commission.status === 'rejected') {
                        stats.total_rejected += amount;
                        stats.count_rejected += 1;
                    }
                });

                setCommissionStats(stats);
            }
        } catch (error) {
            console.error("Error fetching commissions:", error);
        }
    };

    const filteredAndSortedCommissions = useMemo(() => {
        let filtered = commissions;

        if (filterStatus !== "all") {
            filtered = filtered.filter(c => c.status === filterStatus);
        }

        if (searchAgent.trim()) {
            const searchLower = searchAgent.toLowerCase();
            filtered = filtered.filter(c =>
                (c.agent?.first_name || "").toLowerCase().includes(searchLower) ||
                (c.agent?.last_name || "").toLowerCase().includes(searchLower) ||
                ((c.agent?.first_name || "") + " " + (c.agent?.last_name || "")).toLowerCase().includes(searchLower)
            );
        }

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
        fetchDashboardData();
        fetchCommissionData();
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
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    const getRecruitmentMotivation = () => {
        const percentage = studentStats.total > 0 ? (studentStats.active / studentStats.total) * 100 : 0;
        if (percentage < 30) {
            return {
                title: "Get Recruiting!",
                message: "You have significant room to grow your student roster. Start reaching out to prospects!",
                color: "danger",
                icon: "bx-trending-down",
            };
        } else if (percentage < 60) {
            return {
                title: "Keep It Going!",
                message: "Good progress! Continue recruiting to increase your student base and earnings.",
                color: "warning",
                icon: "bx-trending-up",
            };
        } else {
            return {
                title: "Excellent Progress!",
                message: "Your student retention is strong. Focus on maintaining quality and growth.",
                color: "success",
                icon: "bx-trending-up",
            };
        }
    };

    const motivation = getRecruitmentMotivation();

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
        <div className="container-fluid">
            {/* Welcome Card */}
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card">
                        <div className="d-flex align-items-end row">
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">
                                        Welcome to Lead Lancer, {user?.first_name || "Recruiter"}!
                                    </h5>
                                    <p className="mb-4">
                                        Manage your student roster, track commission earnings, and expand your recruitment network across partner universities.
                                    </p>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setShowStudentModal(true)}
                                        >
                                            <i className="bx bx-plus me-1"></i>
                                            Register Student
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-info"
                                            onClick={() => navigate("/unisync360/lead-lancer/my-students")}
                                        >
                                            <i className="bx bx-list-ul me-1"></i>
                                            View My Students
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-warning"
                                            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                        >
                                            <i className="bx bx-money me-1"></i>
                                            View Commissions
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => fetchDashboardData()}
                                        >
                                            <i className="bx bx-refresh me-1"></i>
                                            Refresh Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 text-center text-md-left d-none d-md-block">
                                <div className="card-body pb-0 px-0 px-md-4">
                                    <img
                                        src="/assets/img/illustrations/education-dashboard.png"
                                        height="140"
                                        alt="Lead Lancer Portal"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="row">
                <MetricCard
                    title="Partner Universities"
                    value={dashboardData?.total_universities || 0}
                    icon="bx-building"
                    color="primary"
                    subtitle={`${countryStats.length} countries`}
                />

                <MetricCard
                    title="Available Intakes"
                    value={dashboardData?.total_course_intakes || 0}
                    icon="bx-book"
                    color="info"
                    subtitle="Course programs"
                />

                <MetricCard
                    title="My Students"
                    value={studentStats.total}
                    icon="bx-user"
                    color="success"
                    subtitle={`${studentStats.active} active`}
                />

                <MetricCard
                    title="Active Rate"
                    value={`${studentStats.total > 0 ? Math.round((studentStats.active / studentStats.total) * 100) : 0}%`}
                    icon="bx-trending-up"
                    color="warning"
                    subtitle="Student engagement"
                />
            </div>

            {/* Motivation Card */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className={`card border-start border-${motivation.color} border-4`}>
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                <div>
                                    <h5 className="card-title mb-2">
                                        <i className={`bx ${motivation.icon} me-2 text-${motivation.color}`}></i>
                                        {motivation.title}
                                    </h5>
                                    <p className="card-text text-muted mb-0">
                                        {motivation.message}
                                    </p>
                                </div>
                                <button
                                    className={`btn btn-${motivation.color}`}
                                    onClick={() => setShowStudentModal(true)}
                                >
                                    <i className="bx bx-plus me-1"></i>
                                    Register Student
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Universities by Country, Student Status & Top Courses */}
            <div className="row mb-4">
                {/* Universities by Country */}
                <div className="col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bx bx-world me-2"></i>
                                Universities by Country
                            </h5>
                        </div>
                        <div className="card-body">
                            {countryStats && countryStats.length > 0 ? (
                                <div className="countries-list">
                                    {countryStats.map((item, index) => {
                                        const maxCount = Math.max(...countryStats.map((c) => c.count), 1);
                                        return (
                                            <div key={index} className="d-flex align-items-center mb-3">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="fw-semibold">{item.country || 'Unknown'}</small>
                                                        <small className="text-muted fw-bold">{item.count} uni(s)</small>
                                                    </div>
                                                    <div className="progress" style={{ height: "6px" }}>
                                                        <div
                                                            className="progress-bar bg-primary"
                                                            style={{
                                                                width: `${(item.count / maxCount) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-info-circle text-muted me-2" style={{ fontSize: "2rem" }}></i>
                                    <p className="text-muted mb-0">Loading university data...</p>
                                    {loading && <small className="text-muted">Fetching from server</small>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Student Status Distribution */}
                <div className="col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bx bx-pie-chart-alt me-2"></i>
                                Student Status
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="status-cards">
                                <div className="status-item d-flex align-items-center mb-3">
                                    <div className="status-badge bg-success rounded-circle me-3" style={{ width: "40px", height: "40px" }}>
                                        <i className="bx bx-check-circle text-white d-flex align-items-center justify-content-center h-100"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block">Active</small>
                                        <h5 className="mb-0 text-success">{studentStats.active}</h5>
                                    </div>
                                    <small className="text-success fw-semibold">
                                        {studentStats.total > 0
                                            ? Math.round((studentStats.active / studentStats.total) * 100)
                                            : 0}%
                                    </small>
                                </div>
                                <div className="status-item d-flex align-items-center mb-3">
                                    <div className="status-badge bg-warning rounded-circle me-3" style={{ width: "40px", height: "40px" }}>
                                        <i className="bx bx-time-five text-white d-flex align-items-center justify-content-center h-100"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block">Inactive</small>
                                        <h5 className="mb-0 text-warning">{studentStats.inactive}</h5>
                                    </div>
                                    <small className="text-warning fw-semibold">
                                        {studentStats.total > 0
                                            ? Math.round((studentStats.inactive / studentStats.total) * 100)
                                            : 0}%
                                    </small>
                                </div>
                                <div className="status-item d-flex align-items-center">
                                    <div className="status-badge bg-primary rounded-circle me-3" style={{ width: "40px", height: "40px" }}>
                                        <i className="bx bx-check-double text-white d-flex align-items-center justify-content-center h-100"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block">Completed</small>
                                        <h5 className="mb-0 text-primary">{studentStats.completed}</h5>
                                    </div>
                                    <small className="text-primary fw-semibold">
                                        {studentStats.total > 0
                                            ? Math.round((studentStats.completed / studentStats.total) * 100)
                                            : 0}%
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top 5 Most Applied Courses */}
                <div className="col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bx bx-book me-2"></i>
                                Top 5 Most Applied Courses
                            </h5>
                        </div>
                        <div className="card-body p-2">
                            {topCourses && topCourses.length > 0 ? (
                                <div className="courses-list">
                                    {topCourses.map((course, index) => {
                                        const maxApplications = Math.max(...topCourses.map((c) => c.application_count), 1);
                                        return (
                                            <div key={course.uid} className="mb-2">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <div className="flex-grow-1">
                                                        <small className="fw-semibold d-block text-truncate" style={{ fontSize: "0.85rem" }}>{index + 1}. {course.name}</small>
                                                    </div>
                                                    <small className="text-primary ms-2" style={{ whiteSpace: "nowrap" }}>{course.application_count}</small>
                                                </div>
                                                <div className="progress" style={{ height: "5px" }}>
                                                    <div
                                                        className="progress-bar bg-info"
                                                        style={{
                                                            width: `${(course.application_count / maxApplications) * 100}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-2">
                                    <small className="text-muted">No applications yet</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Cards */}
            <div className="row mb-4">
                <QuickActionCard
                    icon="bx-plus"
                    title="Register Student"
                    description="Add a new student"
                    color="primary"
                    onClick={() => setShowStudentModal(true)}
                />
                <QuickActionCard
                    icon="bx-list-ul"
                    title="My Students"
                    description="View all students"
                    color="info"
                    onClick={() => navigate("/unisync360/lead-lancer/my-students")}
                />
                <QuickActionCard
                    icon="bx-money"
                    title="Commissions"
                    description="Track earnings"
                    color="warning"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                />
                <QuickActionCard
                    icon="bx-book"
                    title="View Courses"
                    description="Browse programs"
                    color="success"
                    onClick={() => navigate("/unisync360/lead-lancer/courses")}
                />
            </div>

            {/* COMMISSION BOARD SECTION */}
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
                                            {formatCurrency(commissionStats.total_amount || 0)}
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
                                            {formatCurrency(commissionStats.total_pending || 0)}
                                        </h3>
                                        <small className="text-white-50">{commissionStats.count_pending} commission(s)</small>
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
                                            {formatCurrency(commissionStats.total_approved || 0)}
                                        </h3>
                                        <small className="text-white-50">{commissionStats.count_approved} commission(s)</small>
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
                                            {formatCurrency(commissionStats.total_processing || 0)}
                                        </h3>
                                        <small className="text-white-50">{commissionStats.count_processing} commission(s)</small>
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
                                            {formatCurrency(commissionStats.total_paid || 0)}
                                        </h3>
                                        <small className="text-white-50">{commissionStats.count_paid} commission(s)</small>
                                    </div>
                                    <i className="bx bx-check-double" style={{ fontSize: "2.5rem", opacity: 0.7 }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rejected Card */}
                {commissionStats.total_rejected > 0 && (
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card bg-danger text-white h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-white-50 mb-2">Rejected</h6>
                                            <h3 className="text-white mb-0">
                                                {formatCurrency(commissionStats.total_rejected || 0)}
                                            </h3>
                                            <small className="text-white-50">{commissionStats.count_rejected} commission(s)</small>
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

            {/* Student Registration Modal */}
            {showStudentModal && (
                <StudentModal
                    show={showStudentModal}
                    selectedObj={null}
                    onClose={() => setShowStudentModal(false)}
                    onSuccess={handleStudentRegistered}
                />
            )}
        </div>
    );
};

// Commission Packages Table Component
const CommissionPackagesTableView = () => {
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

    if (loading) return <div className="text-center py-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>;

    return (
        <div className="card">
            <div className="card-header">
                <h6 className="mb-0"><i className="bx bx-package me-2"></i>Commission Packages</h6>
            </div>
            <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Package</th>
                            <th>Scope</th>
                            <th>Rate Type</th>
                            <th>Default Rate</th>
                            <th>Valid Period</th>
                            <th width="60">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.length > 0 ? packages.map((pkg) => (
                            <tr key={pkg.uid}>
                                <td><strong>{pkg.name}</strong></td>
                                <td><span className="badge bg-info">{pkg.scope}</span></td>
                                <td>{pkg.rate_type}</td>
                                <td><strong className="text-primary">{pkg.default_rate}%</strong></td>
                                <td className="small">{pkg.valid_from} - {pkg.valid_to || "∞"}</td>
                                <td><button className="btn btn-sm btn-icon btn-label-primary"><i className="bx bx-show"></i></button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center text-muted py-3">No packages</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Commission Payments Table Component
const CommissionPaymentsTableView = () => {
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

    if (loading) return <div className="text-center py-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>;

    return (
        <div className="card">
            <div className="card-header">
                <h6 className="mb-0"><i className="bx bx-credit-card me-2"></i>Recent Payments</h6>
            </div>
            <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Reference</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th width="60">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? payments.map((payment) => (
                            <tr key={payment.uid}>
                                <td>{payment.payment_reference}</td>
                                <td><strong>${payment.amount?.toFixed(2) || "0.00"}</strong></td>
                                <td><span className={`badge bg-${getPaymentStatusColor(payment.status)}`}>{payment.status}</span></td>
                                <td className="small">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                <td><button className="btn btn-sm btn-icon btn-label-primary"><i className="bx bx-show"></i></button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center text-muted py-3">No payments</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Commission Predictions Table Component
const CommissionPredictionsTableView = () => {
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

    if (loading) return <div className="text-center py-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>;

    return (
        <div className="card">
            <div className="card-header">
                <h6 className="mb-0"><i className="bx bx-trending-up me-2"></i>Commission Predictions</h6>
            </div>
            <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Period</th>
                            <th>Date</th>
                            <th>Predicted Commission</th>
                            <th>Confidence</th>
                            <th width="60">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {predictions.length > 0 ? predictions.map((pred) => (
                            <tr key={pred.uid}>
                                <td><span className="badge bg-info">{pred.prediction_period}</span></td>
                                <td className="small">{new Date(pred.prediction_date).toLocaleDateString()}</td>
                                <td><strong className="text-info">${pred.predicted_commission?.toFixed(2) || "0.00"}</strong></td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="progress" style={{ width: "60px", height: "5px" }}>
                                            <div className="progress-bar bg-info" style={{ width: `${pred.confidence_level || 0}%` }}></div>
                                        </div>
                                        <span className="small fw-semibold">{pred.confidence_level || 0}%</span>
                                    </div>
                                </td>
                                <td><button className="btn btn-sm btn-icon btn-label-primary"><i className="bx bx-show"></i></button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center text-muted py-3">No predictions</td></tr>
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

// Metric Card Component
const MetricCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <div className="col-sm-6 col-lg-3 mb-4">
        <div
            className={`card h-100 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            style={onClick ? { cursor: 'pointer', transition: 'transform 0.2s' } : {}}
            onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="avatar flex-shrink-0">
                        <div className={`bg-${color} rounded p-2`}>
                            <i className={`bx ${icon} text-white`}></i>
                        </div>
                    </div>
                    <div className="ms-3">
                        <span className="fw-medium d-block mb-1">{title}</span>
                        <h3 className={`card-title mb-0 ${color ? `text-${color}` : ''}`}>{value}</h3>
                        {subtitle && (
                            <small className="text-muted d-block">{subtitle}</small>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Quick Action Card Component
const QuickActionCard = ({ icon, title, description, color, onClick }) => (
    <div className="col-lg-2 col-md-4 col-6 mb-3">
        <div
            className="card h-100 text-center border-0 shadow-sm"
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={onClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
        >
            <div className="card-body p-3">
                <div className={`avatar avatar-md bg-label-${color} rounded-circle mx-auto mb-2`}>
                    <i className={`bx ${icon} fs-4`}></i>
                </div>
                <h6 className="card-title mb-1">{title}</h6>
                <small className="text-muted">{description}</small>
            </div>
        </div>
    </div>
);

export default LeadLancerPortalDashboard;
