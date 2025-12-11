// ExternalCounselorDashboard.jsx - External Counselor Portal Dashboard
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { commissionPortalService } from "./Queries.jsx";
import { StudentRegistrationModal } from "./StudentRegistrationModal.jsx";
import { DocumentUploadModal } from "./DocumentUploadModal.jsx";
import { CourseApplicationModal } from "./CourseApplicationModal.jsx";
import { CommissionBoard } from "./CommissionBoard.jsx";
import { TargetProgress } from "./TargetProgress.jsx";
import { formatCurrency } from "../../../../utils/formatters.js";

export const ExternalCounselorDashboard = () => {
    const user = useSelector((state) => state.userReducer?.data);
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState("students");
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Parse URL query parameters
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        const action = searchParams.get('action');

        // Set active tab from URL
        if (tab) {
            const validTabs = ['students', 'documents', 'applications', 'commissions', 'targets'];
            if (validTabs.includes(tab)) {
                setActiveTab(tab);
            }
        }

        // Handle action from URL
        if (action === 'register') {
            setShowStudentModal(true);
        } else if (action === 'upload') {
            setShowDocumentModal(true);
        } else if (action === 'apply') {
            setShowCourseModal(true);
        }
    }, [location.search]);

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/unisync360/external-counselor?tab=${tab}`, { replace: true });
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

    const handleDocumentUploaded = () => {
        setShowDocumentModal(false);
        setSelectedStudent(null);
        fetchDashboardData();
        Swal.fire({
            icon: "success",
            title: "Success",
            text: "Document uploaded successfully!",
            timer: 2000,
            showConfirmButton: false,
        });
    };

    const handleCourseApplied = () => {
        setShowCourseModal(false);
        setSelectedStudent(null);
        fetchDashboardData();
        Swal.fire({
            icon: "success",
            title: "Success",
            text: "Course application submitted successfully!",
            timer: 2000,
            showConfirmButton: false,
        });
    };

    const openDocumentModal = (student = null) => {
        setSelectedStudent(student);
        setShowDocumentModal(true);
    };

    const openCourseModal = (student = null) => {
        setSelectedStudent(student);
        setShowCourseModal(true);
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
        <div className="container-xxl flex-grow-1 container-p-y">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h4 className="mb-1">Welcome, {user?.first_name || "Counselor"}!</h4>
                            <p className="text-muted mb-0">
                                <span className="badge bg-label-info me-2">External Counselor</span>
                                Advanced Student Management Portal
                            </p>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => openDocumentModal()}
                            >
                                <i className="bx bx-upload me-2"></i>
                                Upload Document
                            </button>
                            <button
                                className="btn btn-outline-success"
                                onClick={() => openCourseModal()}
                            >
                                <i className="bx bx-book-add me-2"></i>
                                Apply for Course
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowStudentModal(true)}
                            >
                                <i className="bx bx-plus me-2"></i>
                                Register Student
                            </button>
                        </div>
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
                                    <span className="text-muted">Documents Uploaded</span>
                                    <div className="d-flex align-items-center mt-2">
                                        <h3 className="mb-0 me-2">{dashboardData?.documents_uploaded || 0}</h3>
                                    </div>
                                </div>
                                <div className="avatar">
                                    <span className="avatar-initial rounded bg-label-info">
                                        <i className="bx bx-file bx-sm"></i>
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
                                    <span className="text-muted">Course Applications</span>
                                    <div className="d-flex align-items-center mt-2">
                                        <h3 className="mb-0 me-2">{dashboardData?.course_applications || 0}</h3>
                                    </div>
                                </div>
                                <div className="avatar">
                                    <span className="avatar-initial rounded bg-label-success">
                                        <i className="bx bx-book bx-sm"></i>
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
                            <i className="bx bx-user me-2"></i> All Students
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "documents" ? "active" : ""}`}
                            onClick={() => handleTabChange("documents")}
                        >
                            <i className="bx bx-file me-2"></i> Documents
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "applications" ? "active" : ""}`}
                            onClick={() => handleTabChange("applications")}
                        >
                            <i className="bx bx-book me-2"></i> Course Applications
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
                            className={`nav-link ${activeTab === "targets" ? "active" : ""}`}
                            onClick={() => handleTabChange("targets")}
                        >
                            <i className="bx bx-target-lock me-2"></i> Targets
                        </button>
                    </li>
                </ul>
                <div className="tab-content p-0">
                    {activeTab === "students" && (
                        <AllStudentsList 
                            onRefresh={fetchDashboardData} 
                            onUploadDocument={openDocumentModal}
                            onApplyCourse={openCourseModal}
                        />
                    )}
                    {activeTab === "documents" && (
                        <DocumentsTab onUploadDocument={openDocumentModal} />
                    )}
                    {activeTab === "applications" && (
                        <CourseApplicationsTab onApplyCourse={openCourseModal} />
                    )}
                    {activeTab === "commissions" && <CommissionBoard />}
                    {activeTab === "targets" && <TargetProgress />}
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

            {/* Modals */}
            <StudentRegistrationModal
                show={showStudentModal}
                onHide={() => setShowStudentModal(false)}
                onSuccess={handleStudentRegistered}
            />

            <DocumentUploadModal
                show={showDocumentModal}
                onHide={() => {
                    setShowDocumentModal(false);
                    setSelectedStudent(null);
                }}
                onSuccess={handleDocumentUploaded}
                student={selectedStudent}
            />

            <CourseApplicationModal
                show={showCourseModal}
                onHide={() => {
                    setShowCourseModal(false);
                    setSelectedStudent(null);
                }}
                onSuccess={handleCourseApplied}
                student={selectedStudent}
            />
        </div>
    );
};

// All Students List Component with advanced features
const AllStudentsList = ({ onRefresh, onUploadDocument, onApplyCourse }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sourceFilter, setSourceFilter] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;
            if (sourceFilter) params.source = sourceFilter;
            const response = await commissionPortalService.getMyStudents(params);
            setStudents(response?.data?.results || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [searchQuery, statusFilter, sourceFilter]);

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

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(students.map(s => s.uid));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (uid) => {
        if (selectedStudents.includes(uid)) {
            setSelectedStudents(selectedStudents.filter(id => id !== uid));
        } else {
            setSelectedStudents([...selectedStudents, uid]);
        }
    };

    const handleBulkExport = () => {
        Swal.fire({
            icon: "info",
            title: "Export",
            text: `Exporting ${selectedStudents.length} students...`,
            timer: 2000,
            showConfirmButton: false,
        });
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
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
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
                    <div className="col-md-2">
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
                            <option value="deferred">Deferred</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button 
                            className="btn btn-outline-secondary w-100"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <i className="bx bx-filter-alt me-1"></i>
                            More Filters
                        </button>
                    </div>
                    <div className="col-md-4 text-end">
                        {selectedStudents.length > 0 && (
                            <div className="btn-group">
                                <button 
                                    className="btn btn-outline-primary"
                                    onClick={handleBulkExport}
                                >
                                    <i className="bx bx-export me-1"></i>
                                    Export ({selectedStudents.length})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="row g-3 mt-2 p-3 bg-light rounded">
                        <div className="col-md-3">
                            <label className="form-label">Source</label>
                            <select
                                className="form-select"
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                            >
                                <option value="">All Sources</option>
                                <option value="online">Online</option>
                                <option value="referral">Referral</option>
                                <option value="walk_in">Walk-in</option>
                                <option value="event">Event</option>
                                <option value="school">School Visit</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Date From</label>
                            <input type="date" className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Date To</label>
                            <input type="date" className="form-control" />
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button 
                                className="btn btn-primary w-100"
                                onClick={fetchStudents}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    className="form-check-input"
                                    onChange={handleSelectAll}
                                    checked={selectedStudents.length === students.length && students.length > 0}
                                />
                            </th>
                            <th>Student Name</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Documents</th>
                            <th>Applications</th>
                            <th>Registered</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((item) => (
                                <tr key={item.uid}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input"
                                            checked={selectedStudents.includes(item.uid)}
                                            onChange={() => handleSelectStudent(item.uid)}
                                        />
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar avatar-sm me-2">
                                                <span className="avatar-initial rounded-circle bg-label-primary">
                                                    {item.student_details?.full_name?.charAt(0) || "S"}
                                                </span>
                                            </div>
                                            <div>
                                                <strong>{item.student_details?.full_name}</strong>
                                                <br />
                                                <small className="text-muted">{item.student_details?.personal_email || "-"}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <i className="bx bx-phone me-1"></i>{item.student_details?.personal_phone}
                                        </div>
                                        {item.student_details?.whatsapp_number && (
                                            <small className="text-success">
                                                <i className="bx bxl-whatsapp me-1"></i>
                                                {item.student_details?.whatsapp_number}
                                            </small>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(item.student_details?.status?.toLowerCase())}`}>
                                            {item.student_details?.status || "N/A"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge bg-label-info">
                                            {item.student_details?.documents_count || 0} docs
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge bg-label-primary">
                                            {item.student_details?.applications_count || 0} apps
                                        </span>
                                    </td>
                                    <td>{new Date(item.registration_date).toLocaleDateString()}</td>
                                    <td>
                                        <div className="dropdown">
                                            <button 
                                                className="btn btn-sm btn-icon btn-label-secondary dropdown-toggle hide-arrow"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <Link 
                                                        className="dropdown-item" 
                                                        to={`/unisync360/students/${item.student_details?.uid}`}
                                                    >
                                                        <i className="bx bx-show me-2"></i>View Profile
                                                    </Link>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={() => onUploadDocument(item.student_details)}
                                                    >
                                                        <i className="bx bx-upload me-2"></i>Upload Document
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={() => onApplyCourse(item.student_details)}
                                                    >
                                                        <i className="bx bx-book-add me-2"></i>Apply for Course
                                                    </button>
                                                </li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <Link 
                                                        className="dropdown-item"
                                                        to={`/unisync360/students/${item.student_details?.uid}/ai-insights`}
                                                    >
                                                        <i className="bx bx-bot me-2"></i>AI Insights
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
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

// Documents Tab Component
const DocumentsTab = ({ onUploadDocument }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await commissionPortalService.getMyStudentDocuments({
                search: searchQuery,
                document_type: typeFilter
            });
            setDocuments(response?.data?.results || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [searchQuery, typeFilter]);

    const getDocTypeBadge = (type) => {
        const badges = {
            academic: "bg-label-primary",
            identity: "bg-label-info",
            financial: "bg-label-success",
            other: "bg-label-secondary",
        };
        return badges[type] || "bg-label-secondary";
    };

    const getVerificationBadge = (status) => {
        const badges = {
            verified: "bg-success",
            pending: "bg-warning",
            rejected: "bg-danger",
        };
        return badges[status] || "bg-secondary";
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
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text"><i className="bx bx-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search documents or students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="academic">Academic</option>
                            <option value="identity">Identity</option>
                            <option value="financial">Financial</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-4 text-end">
                        <button 
                            className="btn btn-primary"
                            onClick={() => onUploadDocument()}
                        >
                            <i className="bx bx-upload me-2"></i>
                            Upload Document
                        </button>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Document</th>
                            <th>Student</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Uploaded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <tr key={doc.uid}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <i className="bx bx-file text-primary me-2" style={{ fontSize: "1.5rem" }}></i>
                                            <div>
                                                <strong>{doc.document_name || doc.requirement?.name || "Document"}</strong>
                                                <br />
                                                <small className="text-muted">{doc.file_name}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{doc.student?.full_name}</td>
                                    <td>
                                        <span className={`badge ${getDocTypeBadge(doc.document_type)}`}>
                                            {doc.document_type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getVerificationBadge(doc.verification_status)}`}>
                                            {doc.verification_status}
                                        </span>
                                    </td>
                                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <a 
                                            href={doc.file} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-icon btn-label-primary me-1"
                                            title="View"
                                        >
                                            <i className="bx bx-show"></i>
                                        </a>
                                        <a 
                                            href={doc.file} 
                                            download
                                            className="btn btn-sm btn-icon btn-label-success"
                                            title="Download"
                                        >
                                            <i className="bx bx-download"></i>
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    <div className="mb-3">
                                        <i className="bx bx-folder-open text-muted" style={{ fontSize: "3rem" }}></i>
                                    </div>
                                    <p className="mb-2 text-muted">No documents uploaded yet</p>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => onUploadDocument()}
                                    >
                                        <i className="bx bx-upload me-1"></i>Upload First Document
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Course Applications Tab Component
const CourseApplicationsTab = ({ onApplyCourse }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await commissionPortalService.getMyStudentApplications({
                status: statusFilter
            });
            setApplications(response?.data?.results || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-label-warning",
            submitted: "bg-label-info",
            under_review: "bg-label-primary",
            approved: "bg-label-success",
            rejected: "bg-label-danger",
            offer_received: "bg-success",
            offer_accepted: "bg-success",
            enrolled: "bg-success",
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
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="offer_received">Offer Received</option>
                            <option value="enrolled">Enrolled</option>
                        </select>
                    </div>
                    <div className="col-md-8 text-end">
                        <button 
                            className="btn btn-primary"
                            onClick={() => onApplyCourse()}
                        >
                            <i className="bx bx-book-add me-2"></i>
                            New Application
                        </button>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>University</th>
                            <th>Course</th>
                            <th>Intake</th>
                            <th>Status</th>
                            <th>Applied</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? (
                            applications.map((app) => (
                                <tr key={app.uid}>
                                    <td>{app.student?.full_name}</td>
                                    <td>{app.university_course?.university?.name}</td>
                                    <td>{app.university_course?.course?.name}</td>
                                    <td>
                                        {app.intake_month}/{app.intake_year}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(app.status)}`}>
                                            {app.status?.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link 
                                            to={`/unisync360/applications/course-allocations/${app.uid}`}
                                            className="btn btn-sm btn-icon btn-label-primary"
                                            title="View Details"
                                        >
                                            <i className="bx bx-show"></i>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    <div className="mb-3">
                                        <i className="bx bx-book-open text-muted" style={{ fontSize: "3rem" }}></i>
                                    </div>
                                    <p className="mb-2 text-muted">No course applications yet</p>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => onApplyCourse()}
                                    >
                                        <i className="bx bx-book-add me-1"></i>Create First Application
                                    </button>
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
        document_uploaded: "bx-file-plus",
        course_applied: "bx-book-add",
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
        document_uploaded: "info",
        course_applied: "success",
        commission_earned: "warning",
        payment_received: "success",
        badge_earned: "danger",
        target_set: "secondary",
    };
    return colors[type] || "secondary";
};

export default ExternalCounselorDashboard;
