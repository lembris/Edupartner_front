// UnisyncDashboardPage.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "animate.css";
import { dashboardService } from "./DashboardQueries.jsx";
import Swal from "sweetalert2";
import { StudentModal } from "../students/StudentModal.jsx";
import { useActiveTab } from "../../../../hooks/usePersistedState";

// Chart components
import {
    DoughnutChart,
    BarChart,
    ActivityFeed,
} from "../../../../components/dashboard/DashboardCharts";

export const UnisyncDashboardPage = () => {
    const user = useSelector((state) => state.userReducer?.data);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);

    // Check if user has a specific role
    const hasRole = (rolePattern) => {
        return user?.groups?.some(group => group.includes(rolePattern)) || 
               user?.role === rolePattern;
    };

    // Determine if user is super admin (should see overview) or staff (see role-specific dashboard)
    const isSuperAdmin = user?.is_superuser || hasRole('super_admin');
    const isCounselor = hasRole('counselor');
    const isManager = hasRole('manager');

    // Auto-det tab based on user roleect appropriate
    // - Super Admin: sees overview by default
    // - Counselor: sees their dashboard by default
    // - Manager: sees management dashboard by default
    const getDefaultTab = () => {
        if (isSuperAdmin) return 'overview';
        if (isCounselor) return 'counselor';
        if (isManager) return 'manager';
        return 'overview';
    };

    // Use persisted tab, but override with role-appropriate default if needed
    const [activeTab, setActiveTab] = useActiveTab('unisync360-dashboard', getDefaultTab());

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            let data = {};

            // Fetch based on active tab
            if (activeTab === 'counselor' && hasRole('counselor')) {
                try {
                    data = await dashboardService.getCounselorDashboard();
                } catch (dashboardErr) {
                    console.error('Counselor dashboard error:', dashboardErr);
                    // Use empty counselor data
                    data = getEmptyCounselorData();
                }
            } else if (activeTab === 'manager' && hasRole('manager')) {
                try {
                    data = await dashboardService.getManagerDashboard();
                } catch (managerErr) {
                    console.error('Manager dashboard error:', managerErr);
                    data = {};
                }
            } else {
                // Overview - for non-admins, this is also filtered
                try {
                    data = await dashboardService.getAllDashboardData();
                } catch (overviewErr) {
                    console.error('Overview dashboard error:', overviewErr);
                    data = {};
                }
            }

            setDashboardData(data);

        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.message || 'Failed to load dashboard data');
            // Set empty data to prevent undefined errors
            setDashboardData({});
        } finally {
            setLoading(false);
        }
    };

    // Helper function for empty counselor data
    const getEmptyCounselorData = () => ({
        my_students_count: 0,
        active_applications: 0,
        my_conversion_rate: 0,
        pipeline_stages: {},
        recent_student_updates: [],
        urgent_actions_required: [],
        pending_tasks: 0,
        upcoming_appointments: 0,
        student_metrics: {},
        application_metrics: {},
    });

    // Auto-switch to role-appropriate tab when user data is available
    useEffect(() => {
        if (!user) return;

        // Auto-switch to counselor tab if user is a counselor and currently on overview
        if (isCounselor && activeTab === 'overview') {
            setActiveTab('counselor');
        }
        // Auto-switch to manager tab if user is a manager and currently on overview
        else if (isManager && activeTab === 'overview') {
            setActiveTab('manager');
        }
    }, [user, isCounselor, isManager]);

    // Fetch dashboard data when tab changes
    useEffect(() => {
        // Only fetch if user data is available
        if (!user) return;
        fetchDashboardData();
    }, [activeTab, user?.role, user?.groups]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setDashboardData({});
    };

    // Handle student modal success
    const handleStudentCreated = () => {
        setShowStudentModal(false);
        fetchDashboardData();
        Swal.fire({
            icon: 'success',
            title: 'Student Created',
            text: 'New student has been added successfully!',
            timer: 2000,
            showConfirmButton: false
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="alert alert-danger mx-3 mt-3" role="alert">
                <div className="d-flex align-items-center">
                    <i className="bx bx-error-circle me-2"></i>
                    <div>
                        <h6 className="alert-heading mb-1">Failed to load dashboard</h6>
                        <p className="mb-0">{error}</p>
                    </div>
                </div>
                <button
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={() => fetchDashboardData()}
                >
                    <i className="bx bx-refresh me-1"></i>
                    Retry
                </button>
            </div>
        );
    }

    // Extract data with fallbacks
    const {
        student_metrics = {},
        application_metrics = {},
        financial_metrics = {},
        university_metrics = {},
        performance_metrics = {},
        ai_metrics = {},
        student_growth_chart = {},
        revenue_chart = {},
        application_status_chart = {},
        geographic_distribution_chart = {},
        recent_activities = [],
        pending_tasks = [],
        upcoming_deadlines = [],
        // Counselor specific data (from counselor dashboard OR filtered overview)
        my_students_count = dashboardData?.my_students_count || 0,
        active_applications = dashboardData?.active_applications || dashboardData?.application_metrics?.applications_pending || 0,
        my_conversion_rate = dashboardData?.my_conversion_rate || 0,
        pipeline_stages = dashboardData?.pipeline_stages || {},
        // Manager specific data
        team_performance = {},
        kpi_tracking = {}
    } = dashboardData || {};

    // Calculate additional metrics
    const admissionSuccessRate = application_metrics.admission_success_rate || 0;

    // Render different dashboard based on active tab and user role
    const renderDashboardContent = () => {
        // If counselor tries to access overview, redirect to counselor dashboard
        if (!isSuperAdmin && !isManager && activeTab === 'overview') {
            return renderCounselorDashboard();
        }
        // Counselor dashboard
        if (activeTab === 'counselor' && hasRole('counselor')) {
            return renderCounselorDashboard();
        }
        // Manager dashboard
        if (activeTab === 'manager' && hasRole('manager')) {
            return renderManagerDashboard();
        }
        // Admin overview
        if (activeTab === 'overview' && isSuperAdmin) {
            return renderOverviewDashboard();
        }
        // Default to counselor dashboard
        return renderCounselorDashboard();
    };

    // Overview Dashboard (Default - for Admins only)
    const renderOverviewDashboard = () => (
        <>
            {/* Welcome Card */}
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card">
                        <div className="d-flex align-items-end row">
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">
                                        Welcome to Unisync360, {user?.first_name} {user?.last_name}!
                                    </h5>
                                    <p className="mb-4">
                                        {isSuperAdmin 
                                            ? "Your comprehensive education management dashboard. Monitor all students, track applications, and manage your counseling operations."
                                            : "Your comprehensive education management dashboard. Monitor student progress, track applications, and optimize your counseling operations."
                                        }
                                    </p>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setShowStudentModal(true)}
                                        >
                                            <i className="bx bx-plus me-1"></i>
                                            Add Student
                                        </button>
                                        <Link
                                            to="/unisync360/students"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            <i className="bx bx-user me-1"></i>
                                            View Students
                                        </Link>
                                        <Link
                                            to="/unisync360/applications/course-allocations"
                                            className="btn btn-sm btn-outline-info"
                                        >
                                            <i className="bx bx-file me-1"></i>
                                            Manage Applications
                                        </Link>
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
                                        alt="Education Management Dashboard"
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
                {/* Total Students */}
                <MetricCard
                    title="Total Students"
                    value={student_metrics.total_students || 0}
                    icon="bx-user"
                    color="primary"
                    percentage={student_metrics.new_students_this_month || 0}
                    subtitle="This month"
                    onClick={() => navigate('/unisync360/students')}
                />

                {/* Active Applications */}
                <MetricCard
                    title="Active Applications"
                    value={application_metrics.applications_pending || 0}
                    icon="bx-file"
                    color="info"
                    subtitle="Pending review"
                    onClick={() => navigate('/unisync360/applications/course-allocations')}
                />

                {/* Admission Success Rate */}
                <MetricCard
                    title="Success Rate"
                    value={`${admissionSuccessRate}%`}
                    icon="bx-check-circle"
                    color="success"
                    subtitle="Admission approval"
                />

                {/* Total Revenue */}
                <MetricCard
                    title="Total Revenue"
                    value={`$${financial_metrics.total_revenue ? (financial_metrics.total_revenue / 1000).toFixed(1) + 'K' : '0'}`}
                    icon="bx-dollar"
                    color="warning"
                    percentage={financial_metrics.revenue_growth || 0}
                    subtitle="This year"
                    onClick={() => navigate('/unisync360/accounts/reports')}
                />
            </div>

            {/* Second Row - Charts & Analytics */}
            <div className="row">
                {/* Student Status Distribution */}
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Student Status</h5>
                            <span className="badge bg-primary">{student_metrics.total_students || 0}</span>
                        </div>
                        <div className="card-body">
                            {student_metrics.status_breakdown && Object.keys(student_metrics.status_breakdown).length > 0 ? (
                                <DoughnutChart
                                    data={Object.entries(student_metrics.status_breakdown).map(([key, value]) => {
                                        const total = Object.values(student_metrics.status_breakdown).reduce((a, b) => a + b, 0);
                                        return {
                                            status: key || 'Unknown',
                                            count: value,
                                            percentage: total ? Math.round((value / total) * 100) : 0
                                        };
                                    })}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-pie-chart-alt text-muted display-4"></i>
                                    <p className="text-muted mt-2">No student data available</p>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => setShowStudentModal(true)}
                                    >
                                        <i className="bx bx-plus me-1"></i>
                                        Add First Student
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Application Status */}
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Application Status</h5>
                            <Link to="/unisync360/applications/course-allocations" className="btn btn-sm btn-outline-primary">
                                View All
                            </Link>
                        </div>
                        <div className="card-body">
                            {application_status_chart.datasets ? (
                                <BarChart
                                    data={Object.entries(application_status_chart.datasets.Applications || {}).map(([label, value], index) => ({
                                        category: application_status_chart.labels?.[index] || label,
                                        count: value
                                    }))}
                                />
                            ) : (
                                <div className="application-metrics">
                                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                        <span className="fw-medium">
                                            <i className="bx bx-time text-warning me-2"></i>
                                            Pending
                                        </span>
                                        <span className="badge bg-warning">{application_metrics.applications_pending || 0}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                        <span className="fw-medium">
                                            <i className="bx bx-check-circle text-success me-2"></i>
                                            Approved
                                        </span>
                                        <span className="badge bg-success">{application_metrics.applications_approved || 0}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                        <span className="fw-medium">
                                            <i className="bx bx-x-circle text-danger me-2"></i>
                                            Rejected
                                        </span>
                                        <span className="badge bg-danger">{application_metrics.applications_rejected || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="col-lg-4 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Performance Overview</h5>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-success d-flex align-items-center mb-3">
                                <i className="bx bx-trending-up me-2 fs-5"></i>
                                <div className="flex-grow-1">
                                    <span className="fw-medium">Admission Success</span>
                                    <br />
                                    <span className="fs-6">{admissionSuccessRate}% rate</span>
                                </div>
                            </div>

                            <div className="alert alert-info d-flex align-items-center mb-3">
                                <i className="bx bx-time me-2 fs-5"></i>
                                <div className="flex-grow-1">
                                    <span className="fw-medium">Avg. Processing</span>
                                    <br />
                                    <span className="fs-6">{application_metrics.average_processing_time || 0} days</span>
                                </div>
                            </div>

                            <div className="alert alert-warning d-flex align-items-center">
                                <i className="bx bx-user-voice me-2 fs-5"></i>
                                <div className="flex-grow-1">
                                    <span className="fw-medium">Student Satisfaction</span>
                                    <br />
                                    <span className="fs-6">{performance_metrics.student_satisfaction_score || 0}/5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Third Row - Detailed Analytics */}
            <div className="row">
                {/* Student Growth Chart */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Student Growth</h5>
                        </div>
                        <div className="card-body">
                            {student_growth_chart.datasets && student_growth_chart.labels?.length > 0 ? (
                                <BarChart
                                    data={student_growth_chart.labels?.map((label, index) => ({
                                        category: label,
                                        count: student_growth_chart.datasets['Student Growth']?.[index] || 0
                                    }))}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-bar-chart-alt text-muted display-4"></i>
                                    <p className="text-muted mt-2">No growth data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">AI Insights</h5>
                            <Link to="/unisync360/recommendations/generate-recommendations" className="btn btn-sm btn-outline-primary">
                                Generate
                            </Link>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-4 mb-3">
                                    <div className="border rounded p-2">
                                        <div className="text-primary display-6 fw-bold">
                                            {ai_metrics.total_recommendations_generated || 0}
                                        </div>
                                        <small className="text-muted">Recommendations</small>
                                    </div>
                                </div>
                                <div className="col-4 mb-3">
                                    <div className="border rounded p-2">
                                        <div className="text-success display-6 fw-bold">
                                            {ai_metrics.recommendation_accuracy || 0}%
                                        </div>
                                        <small className="text-muted">Accuracy</small>
                                    </div>
                                </div>
                                <div className="col-4 mb-3">
                                    <div className="border rounded p-2">
                                        <div className="text-info display-6 fw-bold">
                                            {Math.round(ai_metrics.average_match_score || 0)}%
                                        </div>
                                        <small className="text-muted">Match Score</small>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted">High Confidence</span>
                                    <span className="fw-bold text-success">
                                        {ai_metrics.high_confidence_recommendations || 0}
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        style={{
                                            width: `${((ai_metrics.high_confidence_recommendations || 0) / (ai_metrics.total_recommendations_generated || 1)) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links Row */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <QuickActionCard
                                    icon="bx-user-plus"
                                    title="Add Student"
                                    description="Register a new student"
                                    color="primary"
                                    onClick={() => setShowStudentModal(true)}
                                />
                                <QuickActionCard
                                    icon="bx-building"
                                    title="Universities"
                                    description="Manage partner universities"
                                    color="info"
                                    onClick={() => navigate('/unisync360/institutions/universities/')}
                                />
                                <QuickActionCard
                                    icon="bx-book"
                                    title="Courses"
                                    description="Browse available courses"
                                    color="success"
                                    onClick={() => navigate('/unisync360/academics/courses')}
                                />
                                <QuickActionCard
                                    icon="bx-receipt"
                                    title="Invoices"
                                    description="Manage invoices"
                                    color="warning"
                                    onClick={() => navigate('/unisync360/accounts/invoices')}
                                />
                                <QuickActionCard
                                    icon="bx-bar-chart-alt-2"
                                    title="Reports"
                                    description="View financial reports"
                                    color="danger"
                                    onClick={() => navigate('/unisync360/accounts/reports')}
                                />
                                <QuickActionCard
                                    icon="bx-brain"
                                    title="AI Recommendations"
                                    description="Generate course recommendations"
                                    color="secondary"
                                    onClick={() => navigate('/unisync360/recommendations/generate-recommendations')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Items Row */}
            <div className="row mb-4">
                {/* Upcoming Deadlines */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Upcoming Deadlines</h5>
                            <span className="badge bg-label-danger">{upcoming_deadlines.length} Urgent</span>
                        </div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {upcoming_deadlines.length > 0 ? (
                                    upcoming_deadlines.map((deadline, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                                            <div className="d-flex flex-column">
                                                <span className="fw-medium text-primary">{deadline.course}</span>
                                                <small className="text-muted">
                                                    {deadline.student_name} • {deadline.university}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <span className={`badge bg-label-${new Date(deadline.deadline) < new Date() ? 'danger' : 'warning'}`}>
                                                    {new Date(deadline.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item text-center py-4">
                                        <i className="bx bx-calendar-check text-muted display-6"></i>
                                        <p className="text-muted mt-2 mb-0">No upcoming deadlines</p>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Pending Tasks */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Pending Tasks</h5>
                            <span className="badge bg-label-info">{pending_tasks.length} Tasks</span>
                        </div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {pending_tasks.length > 0 ? (
                                    pending_tasks.map((task, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className={`avatar avatar-sm me-3 bg-label-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'} rounded-circle d-flex align-items-center justify-content-center`}>
                                                    <i className="bx bx-check"></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-medium">{task.title}</span>
                                                    <small className="text-muted">Due: {new Date(task.due_date).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                            <span className={`badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                                                {task.priority}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item text-center py-4">
                                        <i className="bx bx-check-circle text-success display-6"></i>
                                        <p className="text-muted mt-2 mb-0">All caught up! No pending tasks</p>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Recent Activities</h5>
                        </div>
                        <div className="card-body">
                            {recent_activities.length > 0 ? (
                                <ActivityFeed activities={recent_activities} />
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-history text-muted display-4"></i>
                                    <p className="text-muted mt-2">No recent activities</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Counselor Dashboard
    const renderCounselorDashboard = () => (
        <>
            {/* Counselor Welcome Card */}
                <div className="row">
                    <div className="col-12 mb-4">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h5 className="card-title text-white">
                                            Counselor Dashboard - {user?.first_name} {user?.last_name}
                                        </h5>
                                        <p className="mb-0">
                                            Track your students' progress and manage applications efficiently.
                                        </p>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <div className="display-6 fw-bold">{my_conversion_rate}%</div>
                                        <small>Your Conversion Rate</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Counselor Metrics */}
            <div className="row">
                <MetricCard
                    title="My Students"
                    value={my_students_count}
                    icon="bx-user"
                    color="primary"
                    subtitle="Assigned to you"
                    onClick={() => navigate('/unisync360/students')}
                />

                <MetricCard
                    title="Active Applications"
                    value={active_applications}
                    icon="bx-file"
                    color="info"
                    subtitle="Require attention"
                    onClick={() => navigate('/unisync360/applications/course-allocations')}
                />

                <MetricCard
                    title="Conversion Rate"
                    value={`${my_conversion_rate}%`}
                    icon="bx-trending-up"
                    color="success"
                    subtitle="Successful applications"
                />

                <MetricCard
                    title="Pipeline Health"
                    value="Good"
                    icon="bx-pulse"
                    color="warning"
                    subtitle="Based on current flow"
                />
            </div>

            {/* Pipeline Stages */}
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Student Pipeline</h5>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                {Object.entries(pipeline_stages).length > 0 ? (
                                    Object.entries(pipeline_stages).map(([stage, count], index) => (
                                        <div key={stage} className="col-md-2 col-4 mb-3">
                                            <div className="border rounded p-3">
                                                <div className={`display-6 fw-bold text-${['primary', 'info', 'warning', 'success', 'secondary'][index % 5]}`}>
                                                    {count}
                                                </div>
                                                <small className="text-muted text-capitalize">
                                                    {stage.replace(/_/g, ' ')}
                                                </small>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-4">
                                        <p className="text-muted">No pipeline data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Manager Dashboard
    const renderManagerDashboard = () => (
        <>
            {/* Manager Welcome Card */}
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h5 className="card-title text-white">
                                Management Dashboard - {user?.first_name} {user?.last_name}
                            </h5>
                            <p className="mb-0">
                                Monitor team performance and business metrics.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Tracking */}
            <div className="row">
                {kpi_tracking && Object.entries(kpi_tracking).map(([kpi, data]) => (
                    <div key={kpi} className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="text-center">
                                    <h6 className="text-capitalize mb-3">{kpi.replace(/_/g, ' ')}</h6>
                                    <div className="display-4 fw-bold text-primary mb-2">
                                        {data.actual}
                                    </div>
                                    <div className={`fw-medium ${data.variance?.includes('+') ? 'text-success' : 'text-danger'}`}>
                                        {data.variance} vs target
                                    </div>
                                    <small className="text-muted">Target: {data.target}</small>
                                </div>
                            </div>
                        </div>
                            </div>
                        ))}
                    </div>
        </>
    );

    return (
        <div className="container-fluid">
            {/* Dashboard Tabs */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <ul className="nav nav-pills">
                                {/* Overview tab - ONLY for admins */}
                                {isSuperAdmin && (
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('overview')}
                                        >
                                            <i className="bx bx-home me-1"></i>
                                            Overview
                                        </button>
                                    </li>
                                )}
                                {/* Counselor Dashboard - for counselors */}
                                {hasRole('counselor') && (
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'counselor' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('counselor')}
                                        >
                                            <i className="bx bx-user-circle me-1"></i>
                                            My Dashboard
                                        </button>
                                    </li>
                                )}
                                {/* Management tab - for managers */}
                                {hasRole('manager') && (
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'manager' ? 'active' : ''}`}
                                            onClick={() => handleTabChange('manager')}
                                        >
                                            <i className="bx bx-bar-chart-alt-2 me-1"></i>
                                            Management
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            {renderDashboardContent()}

            {/* Student Modal */}
            {showStudentModal && (
                <StudentModal
                    selectedObj={null}
                    onSuccess={handleStudentCreated}
                    onClose={() => setShowStudentModal(false)}
                />
            )}
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, color, percentage, subtitle, onClick }) => (
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
                        {percentage !== undefined && percentage > 0 && (
                            <small className="text-success fw-medium">
                                <i className="bx bx-up-arrow-alt"></i> +{percentage}
                            </small>
                        )}
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
