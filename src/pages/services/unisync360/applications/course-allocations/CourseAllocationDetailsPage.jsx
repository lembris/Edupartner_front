import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../../layouts/BreadCumb";
import { getCourseAllocation, updateCourseAllocationStatus, deleteCourseAllocation, getStatusColor, getStatusLabel, ALLOCATION_STATUS_OPTIONS, getCourseComparisonData, getCourseStats } from "./Queries";
import { CourseAllocationModal } from "./CourseAllocationModal";
import { formatDate } from "../../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import showToast from "../../../../../helpers/ToastHelper";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";
import { Formik, Form } from "formik";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";

export const CourseAllocationDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const user = useSelector((state) => state.userReducer?.data);
    
    // Course Comparison State
    const [showComparison, setShowComparison] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [comparisonLoading, setComparisonLoading] = useState(false);
    const [currentCourseStats, setCurrentCourseStats] = useState(null);

    const fetchAllocation = async () => {
        try {
            setLoading(true);
            const response = await getCourseAllocation(id);
            if (response.status === 8000 || response.status === 200) {
                setAllocation(response.data);
            }
        } catch (error) {
            console.error("Error fetching allocation:", error);
            showToast("Failed to load allocation details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllocation();
    }, [id]);

    // Fetch current course stats when comparison is shown
    useEffect(() => {
        if (showComparison && allocation?.university_course?.uid && !currentCourseStats) {
            fetchCurrentCourseStats();
        }
    }, [showComparison, allocation]);

    const fetchCurrentCourseStats = async () => {
        try {
            const response = await getCourseStats(allocation.university_course.uid);
            if (response.status === 8000 || response.status === 200) {
                setCurrentCourseStats(response.data);
            }
        } catch (error) {
            console.error("Error fetching course stats:", error);
        }
    };

    const handleAddCourseToCompare = (course) => {
        if (!course) return;
        if (course.uid === allocation?.university_course?.uid) {
            showToast("This is the current course", "warning");
            return;
        }
        if (selectedCourses.find(c => c.uid === course.uid)) {
            showToast("Course already added to comparison", "warning");
            return;
        }
        if (selectedCourses.length >= 3) {
            showToast("Maximum 3 courses can be compared with current", "warning");
            return;
        }
        setSelectedCourses([...selectedCourses, course]);
    };

    const handleRemoveCourseFromCompare = (courseUid) => {
        setSelectedCourses(selectedCourses.filter(c => c.uid !== courseUid));
        setComparisonData([]);
    };

    const handleCompare = async () => {
        if (selectedCourses.length < 1) {
            showToast("Please select at least 1 course to compare", "warning");
            return;
        }

        try {
            setComparisonLoading(true);
            const courseUids = [allocation.university_course.uid, ...selectedCourses.map(c => c.uid)];
            const response = await getCourseComparisonData(courseUids);
            if (response.status === 8000 || response.status === 200) {
                setComparisonData(response.data || []);
            }
        } catch (error) {
            showToast("Failed to fetch comparison data", "error");
        } finally {
            setComparisonLoading(false);
        }
    };

    const getSuccessRateColor = (rate) => {
        if (rate >= 80) return 'success';
        if (rate >= 60) return 'info';
        if (rate >= 40) return 'warning';
        return 'danger';
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const confirmation = await Swal.fire({
                title: "Update Status?",
                text: `Change status to "${getStatusLabel(newStatus)}"?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#696cff",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, update it!",
            });

            if (confirmation.isConfirmed) {
                await updateCourseAllocationStatus(id, newStatus);
                showToast("Status updated successfully!", "success");
                fetchAllocation();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showToast("Failed to update status", "error");
        }
    };

    const handleDelete = async () => {
        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteCourseAllocation(id);
                Swal.fire("Deleted!", "The allocation has been deleted.", "success");
                navigate("/unisync360/applications/course-allocations");
            }
        } catch (error) {
            console.error("Error deleting allocation:", error);
            Swal.fire("Error!", "Failed to delete allocation.", "error");
        }
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

    if (!allocation) {
        return (
            <div className="alert alert-warning">
                <i className="bx bx-error me-2"></i>
                Course allocation not found
            </div>
        );
    }

    return (
        <>
            <div className="animate__animated animate__fadeIn">
                <BreadCumb pageList={["Applications", "Course Allocations", "Details"]} />

                {/* Header Card */}
                <div className="card mb-4 border-0 shadow-sm overflow-hidden">
                    <div className="card-body p-0">
                        <div className="bg-primary p-4 text-white" style={{ background: 'linear-gradient(45deg, #696cff 0%, #4346d3 100%)' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                <div>
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <h3 className="text-white mb-0 fw-bold">
                                            {allocation.university_course?.course?.name || "Course Allocation"}
                                        </h3>
                                        <span className={`badge bg-${getStatusColor(allocation.status)}`}>
                                            {getStatusLabel(allocation.status)}
                                        </span>
                                    </div>
                                    <p className="mb-0 opacity-75">
                                        <i className="bx bxs-school me-1"></i>
                                        {allocation.university_course?.university?.name || "University"}
                                        <span className="mx-2">•</span>
                                        <i className="bx bx-calendar me-1"></i>
                                        {allocation.intake_period || "N/A"}
                                    </p>
                                </div>

                                <div className="d-flex gap-2 mt-3 mt-md-0">
                                    <button
                                        className="btn btn-outline-light"
                                        onClick={() => navigate("/unisync360/applications/course-allocations")}
                                    >
                                        <i className="bx bx-arrow-back me-1"></i> Back
                                    </button>
                                    {hasAccess(user, [["change_courseallocation"]]) && (
                                        <button
                                            className="btn fw-semibold shadow-sm"
                                            style={{ backgroundColor: '#fff', color: '#696cff' }}
                                            onClick={() => setShowModal(true)}
                                        >
                                            <i className="bx bx-edit me-1"></i> Edit
                                        </button>
                                    )}
                                    {hasAccess(user, [["delete_courseallocation"]]) && (
                                        <button
                                            className="btn btn-danger"
                                            onClick={handleDelete}
                                        >
                                            <i className="bx bx-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Left Column */}
                    <div className="col-xl-4 col-lg-5 mb-4">
                        {/* Student Info Card */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h5 className="mb-0">
                                    <i className="bx bx-user me-2 text-primary"></i> Student
                                </h5>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/unisync360/students/${allocation.student?.uid}`)}
                                >
                                    View Profile
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="avatar me-3">
                                        {allocation.student?.profile_picture ? (
                                            <img
                                                src={allocation.student.profile_picture}
                                                alt="Avatar"
                                                className="rounded-circle"
                                                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <span className="avatar-initial rounded-circle bg-label-primary fs-4" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {allocation.student?.first_name?.[0]}{allocation.student?.last_name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">{allocation.student?.full_name}</h6>
                                        <small className="text-muted">{allocation.student?.personal_email}</small>
                                        <br />
                                        <small className="text-muted">{allocation.student?.personal_phone}</small>
                                    </div>
                                </div>
                                <hr />
                                <div className="row g-2">
                                    <div className="col-6">
                                        <small className="text-muted d-block">Nationality</small>
                                        <span className="fw-medium">{allocation.student?.nationality?.name || "N/A"}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Status</small>
                                        <span className={`badge bg-label-${allocation.student?.status?.is_active_status ? 'success' : 'secondary'}`}>
                                            {allocation.student?.status?.name || "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Update Card */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bx bx-refresh me-2 text-info"></i> Update Status
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    {ALLOCATION_STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            className={`btn btn-${allocation.status === option.value ? option.color : `outline-${option.color}`} btn-sm`}
                                            onClick={() => handleStatusChange(option.value)}
                                            disabled={allocation.status === option.value}
                                        >
                                            {option.label}
                                            {allocation.status === option.value && <i className="bx bx-check ms-2"></i>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Application Fee & Status */}
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bx bx-money me-2 text-success"></i> Application Info
                                </h5>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    <li className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Tuition Fee</span>
                                        <span className="fw-bold text-success">
                                            {allocation.university_course?.currency || '$'}
                                            {Number(allocation.university_course?.tuition_fee || 0).toLocaleString()}
                                        </span>
                                    </li>
                                    <li className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Application Fee</span>
                                        <span className={`fw-bold ${allocation.application_fee_paid ? 'text-success' : 'text-warning'}`}>
                                            {allocation.application_fee_paid 
                                                ? `Paid - $${Number(allocation.application_fee_amount || 0).toLocaleString()}`
                                                : "Not Paid"
                                            }
                                        </span>
                                    </li>
                                    <li className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Application Ref</span>
                                        <span className="fw-bold">
                                            {allocation.application_reference || "N/A"}
                                        </span>
                                    </li>
                                    {allocation.decision_date && (
                                        <li className="d-flex justify-content-between">
                                            <span className="text-muted">Decision Date</span>
                                            <span className="fw-bold">
                                                {formatDate(allocation.decision_date)}
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-xl-8 col-lg-7 mb-4">
                        {/* Course Details Card */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h5 className="mb-0">
                                    <i className="bx bx-book me-2 text-primary"></i> Course Details
                                </h5>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/unisync360/academics/university-courses/${allocation.university_course?.uid}`)}
                                >
                                    View Course
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-start">
                                            <div className="avatar avatar-sm bg-label-primary rounded me-3 d-flex align-items-center justify-content-center">
                                                <i className="bx bx-book-content"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Course Name</small>
                                                <span className="fw-semibold">{allocation.university_course?.course?.name || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-start">
                                            <div className="avatar avatar-sm bg-label-info rounded me-3 d-flex align-items-center justify-content-center">
                                                <i className="bx bxs-school"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">University</small>
                                                <span className="fw-semibold">{allocation.university_course?.university?.name || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-start">
                                            <div className="avatar avatar-sm bg-label-success rounded me-3 d-flex align-items-center justify-content-center">
                                                <i className="bx bx-map"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Country</small>
                                                <span className="fw-semibold">{allocation.university_course?.university?.country?.name || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-start">
                                            <div className="avatar avatar-sm bg-label-warning rounded me-3 d-flex align-items-center justify-content-center">
                                                <i className="bx bx-time"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Duration</small>
                                                <span className="fw-semibold">{allocation.university_course?.duration || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Application Details Card */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bx bx-detail me-2 text-info"></i> Application Details
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-4">
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Priority</small>
                                        <span className="badge bg-label-primary fs-6">#{allocation.priority}</span>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Intake Period</small>
                                        <span className="fw-semibold">{allocation.intake_period || "N/A"}</span>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Application Date</small>
                                        <span className="fw-semibold">{formatDate(allocation.application_date)}</span>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Estimated Start</small>
                                        <span className="fw-semibold">{allocation.estimated_start_date ? formatDate(allocation.estimated_start_date) : "Not Set"}</span>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Created</small>
                                        <span className="fw-semibold">{formatDate(allocation.created_at)}</span>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Last Updated</small>
                                        <span className="fw-semibold">{formatDate(allocation.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decision Notes */}
                        {allocation.decision_notes && (
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="bx bx-comment-detail me-2 text-info"></i> Decision Notes
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="bg-light p-3 rounded">
                                        <p className="mb-0">{allocation.decision_notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Offer Letter */}
                        {allocation.offer_letter && (
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="bx bx-file me-2 text-success"></i> Offer Letter
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <a 
                                        href={allocation.offer_letter} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-success"
                                    >
                                        <i className="bx bx-download me-2"></i>
                                        Download Offer Letter
                                    </a>
                                </div>
                            </div>
                        )}

                        
                    </div>
                </div>

                {/* Course Comparison Section */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-header bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h5 className="mb-0 text-white">
                                    <i className="bx bx-git-compare me-2"></i>
                                    Course Comparison
                                </h5>
                                <small className="text-white opacity-75">Compare this course with other options</small>
                            </div>
                            <button 
                                className="btn btn-light btn-sm"
                                onClick={() => setShowComparison(!showComparison)}
                            >
                                {showComparison ? (
                                    <><i className="bx bx-chevron-up me-1"></i> Hide</>
                                ) : (
                                    <><i className="bx bx-chevron-down me-1"></i> Show</>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {showComparison && (
                        <div className="card-body">
                            {/* Current Course Stats */}
                            {currentCourseStats && (
                                <div className="row g-3 mb-4">
                                    <div className="col-12">
                                        <h6 className="text-muted mb-3">
                                            <i className="bx bx-stats me-2"></i>
                                            Current Course Statistics
                                        </h6>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center p-3 bg-label-primary rounded">
                                            <h4 className="mb-1 text-primary">{currentCourseStats.total_applications || 0}</h4>
                                            <small className="text-muted">Total Applications</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center p-3 bg-label-success rounded">
                                            <h4 className="mb-1 text-success">{currentCourseStats.success_rate || 0}%</h4>
                                            <small className="text-muted">Success Rate</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center p-3 bg-label-warning rounded">
                                            <h4 className="mb-1 text-warning">{currentCourseStats.pending_applications || 0}</h4>
                                            <small className="text-muted">Pending</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center p-3 bg-label-danger rounded">
                                            <h4 className="mb-1 text-danger">{currentCourseStats.rejection_rate || 0}%</h4>
                                            <small className="text-muted">Rejection Rate</small>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Course Selection */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-8">
                                    <Formik initialValues={{ compareCourse: '' }} onSubmit={() => {}}>
                                        {({ setFieldValue }) => (
                                            <Form>
                                                <FormikSelect
                                                    name="compareCourse"
                                                    label="Add courses to compare"
                                                    url="/unisync360-academic/university-courses/"
                                                    placeholder="Search for courses to compare..."
                                                    containerClass="mb-0"
                                                    mapOption={(item) => ({
                                                        value: item.uid,
                                                        label: `${item.course_name || item.course?.name || ''} - ${item.university_name || item.university?.name || ''}`,
                                                        uid: item.uid,
                                                        course_name: item.course_name || item.course?.name,
                                                        university_name: item.university_name || item.university?.name,
                                                        country_name: item.country_name || item.university?.country?.name,
                                                        tuition_fee: item.tuition_fee,
                                                        currency: item.currency,
                                                    })}
                                                    formatOptionLabel={(option) => (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <span className="fw-medium">{option.course_name || option.label}</span>
                                                                <small className="d-block text-muted">
                                                                    {option.university_name} • {option.country_name}
                                                                </small>
                                                            </div>
                                                            <span className="badge bg-label-success">
                                                                {option.currency || '$'}{Number(option.tuition_fee || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    onSelectObject={(obj) => {
                                                        if (obj) {
                                                            handleAddCourseToCompare(obj);
                                                            setFieldValue('compareCourse', '');
                                                        }
                                                    }}
                                                />
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                                <div className="col-md-4 d-flex align-items-end">
                                    <button 
                                        className="btn btn-primary w-100"
                                        onClick={handleCompare}
                                        disabled={comparisonLoading || selectedCourses.length < 1}
                                    >
                                        {comparisonLoading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : (
                                            <i className="bx bx-analyse me-2"></i>
                                        )}
                                        Compare ({selectedCourses.length + 1} courses)
                                    </button>
                                </div>
                            </div>

                            {/* Selected Courses Tags */}
                            {selectedCourses.length > 0 && (
                                <div className="mb-4">
                                    <small className="text-muted d-block mb-2">Courses to compare with current:</small>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedCourses.map((course) => (
                                            <div 
                                                key={course.uid}
                                                className="badge bg-label-info d-flex align-items-center gap-2 py-2 px-3"
                                            >
                                                <span>{course.course_name || course.label}</span>
                                                <small className="opacity-75">({course.university_name})</small>
                                                <button 
                                                    type="button"
                                                    className="btn-close btn-close-sm"
                                                    onClick={() => handleRemoveCourseFromCompare(course.uid)}
                                                    style={{ fontSize: '0.5rem' }}
                                                ></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comparison Results Table */}
                            {comparisonData.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-hover table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ minWidth: '150px' }}>Attribute</th>
                                                {comparisonData.map((course, idx) => (
                                                    <th key={course.uid} className="text-center" style={{ minWidth: '180px' }}>
                                                        <div className="d-flex flex-column align-items-center">
                                                            {idx === 0 && (
                                                                <span className="badge bg-primary mb-1">Current</span>
                                                            )}
                                                            <span className="fw-semibold">{course.course_name}</span>
                                                            <small className="text-muted">{course.university_name}</small>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-map me-2 text-info"></i>Country
                                                </td>
                                                {comparisonData.map(course => (
                                                    <td key={course.uid} className="text-center">
                                                        <span className="badge bg-label-info">{course.country_name}</span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-dollar me-2 text-success"></i>Tuition Fee
                                                </td>
                                                {comparisonData.map((course, idx) => {
                                                    const lowestFee = Math.min(...comparisonData.map(c => c.tuition_fee || 0));
                                                    const isLowest = course.tuition_fee === lowestFee;
                                                    return (
                                                        <td key={course.uid} className={`text-center ${isLowest ? 'bg-label-success' : ''}`}>
                                                            <span className={`fs-6 fw-bold ${isLowest ? 'text-success' : ''}`}>
                                                                {course.currency || '$'}{Number(course.tuition_fee || 0).toLocaleString()}
                                                            </span>
                                                            {isLowest && <small className="d-block text-success">Lowest</small>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-time me-2 text-warning"></i>Duration
                                                </td>
                                                {comparisonData.map(course => (
                                                    <td key={course.uid} className="text-center">
                                                        {course.duration || 'N/A'}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-user-check me-2 text-primary"></i>Total Applications
                                                </td>
                                                {comparisonData.map(course => (
                                                    <td key={course.uid} className="text-center">
                                                        <span className="badge bg-label-primary fs-6">
                                                            {course.total_applications || 0}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-check-circle me-2 text-success"></i>Success Rate
                                                </td>
                                                {comparisonData.map((course) => {
                                                    const highestRate = Math.max(...comparisonData.map(c => c.success_rate || 0));
                                                    const isHighest = course.success_rate === highestRate && highestRate > 0;
                                                    return (
                                                        <td key={course.uid} className={`text-center ${isHighest ? 'bg-label-success' : ''}`}>
                                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                                <div className="progress" style={{ width: '50px', height: '6px' }}>
                                                                    <div 
                                                                        className={`progress-bar bg-${getSuccessRateColor(course.success_rate || 0)}`}
                                                                        style={{ width: `${course.success_rate || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`badge bg-${getSuccessRateColor(course.success_rate || 0)}`}>
                                                                    {course.success_rate || 0}%
                                                                </span>
                                                            </div>
                                                            {isHighest && <small className="d-block text-success">Best</small>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-trending-up me-2 text-info"></i>Popularity Rank
                                                </td>
                                                {comparisonData.map(course => (
                                                    <td key={course.uid} className="text-center">
                                                        <span className="badge bg-label-warning">
                                                            #{course.popularity_rank || 'N/A'}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-calendar me-2 text-danger"></i>Intake Months
                                                </td>
                                                {comparisonData.map(course => (
                                                    <td key={course.uid} className="text-center">
                                                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                            {(course.intake_months || []).slice(0, 3).map((month, idx) => (
                                                                <span key={idx} className="badge bg-label-secondary">{month}</span>
                                                            ))}
                                                            {(course.intake_months || []).length > 3 && (
                                                                <span className="badge bg-label-dark">+{course.intake_months.length - 3}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold bg-light">
                                                    <i className="bx bx-hourglass me-2 text-secondary"></i>Avg. Processing
                                                </td>
                                                {comparisonData.map(course => (
                                                    <td key={course.uid} className="text-center">
                                                        {course.avg_processing_days ? `${course.avg_processing_days} days` : 'N/A'}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Empty State */}
                            {selectedCourses.length === 0 && comparisonData.length === 0 && (
                                <div className="text-center py-4">
                                    <i className="bx bx-search-alt text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-2 mb-0">
                                        Search and add courses above to compare with the current allocation
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <CourseAllocationModal
                    selectedObj={allocation}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchAllocation();
                    }}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};
