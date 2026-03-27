import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import React from "react";
import "animate.css";
import { dashboardService } from "./DashboardQueries.jsx";
import Swal from "sweetalert2";
import {
    DoughnutChart,
    BarChart,
    ActivityFeed,
} from "../../../../components/dashboard/DashboardCharts";

export const ClinicDashboardPage = () => {
    const user = useSelector((state) => state.userReducer?.data);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await dashboardService.getAllDashboardData();
                setDashboardData(data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err.message || 'Failed to load dashboard data');
                Swal.fire({
                    icon: 'error',
                    title: 'Dashboard Error',
                    text: 'Failed to load dashboard data. Please try again.',
                    confirmButtonText: 'Retry',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetchDashboardData();
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading clinic dashboard...</p>
                </div>
            </div>
        );
    }

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
                    onClick={() => window.location.reload()}
                >
                    <i className="bx bx-refresh me-1"></i>
                    Reload Page
                </button>
            </div>
        );
    }

    const {
        patient_metrics = {},
        visit_metrics = {},
        queue_metrics = {},
        financial_metrics = {},
        insurance_metrics = {},
        clinical_metrics = {},
        recent_activities = [],
        upcoming_appointments = []
    } = dashboardData || {};

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card">
                        <div className="d-flex align-items-end row">
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">
                                        Welcome, {user?.first_name} {user?.last_name}!
                                    </h5>
                                    <p className="mb-4">
                                        Your comprehensive clinic management dashboard. Monitor patients, track visits, and manage clinic operations.
                                    </p>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <a
                                            href="/clinic360/patients"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            <i className="bx bx-user me-1"></i>
                                            View Patients
                                        </a>
                                        <a
                                            href="/clinic360/queue-entries"
                                            className="btn btn-sm btn-primary"
                                        >
                                            <i className="bx bx-list-ol me-1"></i>
                                            Manage Queue
                                        </a>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => window.location.reload()}
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
                                        src="/assets/img/illustrations/man-with-laptop-light.png"
                                        height="140"
                                        alt="Clinic360 Dashboard"
                                        data-app-dark-img="illustrations/man-with-laptop-dark.png"
                                        data-app-light-img="illustrations/man-with-laptop-light.png"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-primary rounded p-2">
                                        <i className="bx bx-user text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Total Patients</span>
                                    <h3 className="card-title mb-0">{patient_metrics.total_patients || 0}</h3>
                                    <small className="text-success">
                                        <i className="bx bx-trending-up me-1"></i>
                                        {patient_metrics.patient_growth || 0}% growth
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-info rounded p-2">
                                        <i className="bx bx-calendar text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Today's Visits</span>
                                    <h3 className="card-title mb-0">{visit_metrics.todays_visits || 0}</h3>
                                    <small className="text-muted">
                                        {visit_metrics.completed_visits || 0} completed
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-warning rounded p-2">
                                        <i className="bx bx-list-ol text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Queue Status</span>
                                    <h3 className="card-title text-warning mb-0">{queue_metrics.currently_waiting || 0}</h3>
                                    <small className="text-muted">waiting</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-success rounded p-2">
                                        <i className="bx bx-dollar text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Today's Revenue</span>
                                    <h3 className="card-title text-success mb-0">
                                        {financial_metrics.today_revenue ? parseFloat(financial_metrics.today_revenue).toLocaleString() : '0'}
                                    </h3>
                                    <small className="text-success">
                                        <i className="bx bx-trending-up me-1"></i>
                                        {financial_metrics.revenue_growth || 0}%
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Patient Status</h5>
                            <span className="badge bg-primary">{patient_metrics.total_patients || 0}</span>
                        </div>
                        <div className="card-body">
                            {patient_metrics.patient_type_breakdown?.length > 0 ? (
                                <DoughnutChart data={patient_metrics.patient_type_breakdown.map(item => ({
                                    status: item.type,
                                    count: item.count,
                                    percentage: item.percentage
                                }))} />
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-pie-chart-alt text-muted display-4"></i>
                                    <p className="text-muted mt-2">No patient data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Visit Overview</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                <span className="fw-medium">
                                    <i className="bx bx-check-circle text-success me-2"></i>
                                    Completed
                                </span>
                                <span className="badge bg-success">{visit_metrics.completed_visits || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                <span className="fw-medium">
                                    <i className="bx bx-time text-warning me-2"></i>
                                    Pending
                                </span>
                                <span className="badge bg-warning">{visit_metrics.pending_visits || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                <span className="fw-medium">
                                    <i className="bx bx-calendar text-info me-2"></i>
                                    This Week
                                </span>
                                <span className="badge bg-info">{visit_metrics.weekly_visits || 0}</span>
                            </div>
                            <div className="mt-3 p-3 bg-primary text-white rounded">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Monthly Visits</span>
                                    <span className="fw-bold">{visit_metrics.monthly_visits || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Queue & Financial</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                <span className="fw-medium">
                                    <i className="bx bx-list-ol text-primary me-2"></i>
                                    Waiting
                                </span>
                                <span className="badge bg-primary">{queue_metrics.currently_waiting || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                <span className="fw-medium">
                                    <i className="bx bx-station text-warning me-2"></i>
                                    Active Stations
                                </span>
                                <span className="badge bg-warning">{queue_metrics.stations_active || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                <span className="fw-medium">
                                    <i className="bx bx-time text-info me-2"></i>
                                    Avg Wait Time
                                </span>
                                <span className="badge bg-info">{queue_metrics.average_wait_time || 0} min</span>
                            </div>
                            <div className="mt-3 p-3 bg-success text-white rounded">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Monthly Revenue</span>
                                    <span className="fw-bold">
                                        {financial_metrics.monthly_revenue ? parseFloat(financial_metrics.monthly_revenue).toLocaleString() : '0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Today's Clinical Summary</h5>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-primary display-6 fw-bold">
                                            {clinical_metrics.consultations_today || 0}
                                        </div>
                                        <small className="text-muted">Consultations</small>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-info display-6 fw-bold">
                                            {clinical_metrics.diagnoses_today || 0}
                                        </div>
                                        <small className="text-muted">Diagnoses</small>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-warning display-6 fw-bold">
                                            {clinical_metrics.lab_orders_today || 0}
                                        </div>
                                        <small className="text-muted">Lab Orders</small>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-success display-6 fw-bold">
                                            {clinical_metrics.prescriptions_today || 0}
                                        </div>
                                        <small className="text-muted">Prescriptions</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Insurance Summary</h5>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-primary display-6 fw-bold">
                                            {insurance_metrics.total_providers || 0}
                                        </div>
                                        <small className="text-muted">Providers</small>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-success display-6 fw-bold">
                                            {insurance_metrics.active_policies || 0}
                                        </div>
                                        <small className="text-muted">Active Policies</small>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-warning display-6 fw-bold">
                                            {insurance_metrics.pending_claims || 0}
                                        </div>
                                        <small className="text-muted">Pending Claims</small>
                                    </div>
                                </div>
                                <div className="col-3">
                                    <div className="border rounded p-2">
                                        <div className="text-info display-6 fw-bold">
                                            {insurance_metrics.approved_claims || 0}
                                        </div>
                                        <small className="text-muted">Approved</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Upcoming Appointments</h5>
                            <span className="badge bg-label-info">{upcoming_appointments.length || 0} Scheduled</span>
                        </div>
                        <div className="card-body p-0">
                            {upcoming_appointments.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {upcoming_appointments.slice(0, 5).map((appointment) => (
                                        <li key={appointment.id} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar avatar-sm me-3 bg-label-primary rounded-circle d-flex align-items-center justify-content-center">
                                                    <i className="bx bx-calendar"></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-medium">{appointment.patient_name}</span>
                                                    <small className="text-muted">{appointment.type}</small>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-primary">{appointment.time}</span>
                                                <br />
                                                <small className={`text-${appointment.status === 'In Progress' ? 'warning' : 'muted'}`}>
                                                    {appointment.status}
                                                </small>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-calendar-check text-muted display-4"></i>
                                    <p className="text-muted mt-2">No upcoming appointments</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Visit Type Breakdown</h5>
                        </div>
                        <div className="card-body">
                            {visit_metrics.visit_type_breakdown?.length > 0 ? (
                                <BarChart data={visit_metrics.visit_type_breakdown.map(item => ({
                                    category: item.visit_type || item.visit_type,
                                    count: item.count
                                }))} />
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-bar-chart-alt text-muted display-4"></i>
                                    <p className="text-muted mt-2">No visit data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Recent Activities</h5>
                            <a href="/clinic360/patients" className="btn btn-sm btn-outline-primary">
                                View All
                            </a>
                        </div>
                        <div className="card-body">
                            {recent_activities.length > 0 ? (
                                <ActivityFeed 
                                    activities={recent_activities.map(a => ({
                                        ...a,
                                        asset_tag: a.patient_name,
                                    }))} 
                                />
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
        </div>
    );
};

export default ClinicDashboardPage;
