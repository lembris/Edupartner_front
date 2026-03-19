import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { CourseAllocationModal } from "./CourseAllocationModal";
import { deleteCourseAllocation, updateCourseAllocationStatus, getStatusColor, getStatusLabel, ALLOCATION_STATUS_OPTIONS } from "./Queries";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const CourseAllocationListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (allocation) => {
        if (!allocation) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete this course allocation for ${allocation.student_name || 'this student'}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteCourseAllocation(allocation.uid);
                Swal.fire(
                    "Deleted!",
                    "The course allocation has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting course allocation:", error);
            Swal.fire(
                "Error!",
                "Unable to delete course allocation. Please try again or contact support.",
                "error"
            );
        }
    };

    const handleStatusChange = async (allocation, newStatus) => {
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
                await updateCourseAllocationStatus(allocation.uid, newStatus);
                Swal.fire(
                    "Updated!",
                    "Status has been updated successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire(
                "Error!",
                "Unable to update status. Please try again.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Applications", "Course Allocations"]} />
            <PaginatedTable
                fetchPath="/unisync360-applications/course-allocations/"
                title="Course Allocations"
                columns={[
                    {
                        key: "student",
                        label: "Student",
                        className: "fw-bold",
                        style: { width: "220px" },
                        render: (row) => {
                            const studentUid = typeof row.student === 'object' ? row.student?.uid : row.student;
                            const studentName = typeof row.student === 'object' 
                                ? (row.student?.full_name || `${row.student?.first_name || ''} ${row.student?.last_name || ''}`)
                                : row.student_name;
                            const initials = studentName ? studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
                            const email = typeof row.student === 'object' ? row.student?.personal_email : null;
                            const profilePic = typeof row.student === 'object' ? row.student?.profile_picture : null;

                            return (
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-sm me-2">
                                        {profilePic ? (
                                            <img src={profilePic} alt="Avatar" className="rounded-circle" />
                                        ) : (
                                            <span className="avatar-initial rounded-circle bg-label-primary">
                                                {initials}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span
                                            className="text-primary cursor-pointer fw-semibold"
                                            onClick={() => navigate(`/unisync360/students/${studentUid}`)}
                                        >
                                            {studentName || "N/A"}
                                        </span>
                                        {email && <small className="d-block text-muted fs-11">{email}</small>}
                                    </div>
                                </div>
                            );
                        },
                    },
                    {
                        key: "course",
                        label: "Course / University",
                        style: { width: "280px" },
                        render: (row) => {
                            const courseUid = typeof row.university_course === 'object' ? row.university_course?.uid : row.university_course;
                            const courseName = typeof row.university_course === 'object' 
                                ? row.university_course?.course?.name 
                                : row.course_name;
                            const universityName = typeof row.university_course === 'object'
                                ? row.university_course?.university?.name
                                : row.university_name;
                            const countryName = typeof row.university_course === 'object'
                                ? row.university_course?.university?.country?.name
                                : row.country_name;

                            return (
                                <div className="d-flex flex-column">
                                    <span 
                                        className="fw-semibold text-primary cursor-pointer"
                                        onClick={() => navigate(`/unisync360/academics/university-courses/${courseUid}`)}
                                    >
                                        {courseName || "N/A"}
                                    </span>
                                    <small className="text-muted">
                                        <i className="bx bxs-school me-1"></i>
                                        {universityName || "N/A"}
                                    </small>
                                    <small className="text-muted">
                                        <i className="bx bx-map me-1"></i>
                                        {countryName || "N/A"}
                                    </small>
                                </div>
                            );
                        },
                    },
                    {
                        key: "intake",
                        label: "Intake",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="fw-medium">{row.intake_month || "N/A"} {row.intake_year || ""}</span>
                                <small className="text-muted">
                                    Applied: {row.application_date ? formatDate(row.application_date) : "N/A"}
                                </small>
                            </div>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        style: { width: "150px" },
                        render: (row) => (
                            <div className="dropdown">
                                <span 
                                    className={`badge bg-label-${getStatusColor(row.status)} dropdown-toggle cursor-pointer`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {getStatusLabel(row.status)}
                                </span>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {ALLOCATION_STATUS_OPTIONS.map((option) => (
                                        <li key={option.value}>
                                            <a 
                                                className={`dropdown-item ${row.status === option.value ? 'active' : ''}`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (row.status !== option.value) {
                                                        handleStatusChange(row, option.value);
                                                    }
                                                }}
                                            >
                                                <span className={`badge bg-label-${option.color} me-2`}></span>
                                                {option.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ),
                    },
                    {
                        key: "priority",
                        label: "Priority",
                        render: (row) => {
                            const priorityColors = {
                                1: 'danger',
                                2: 'warning', 
                                3: 'info',
                                4: 'secondary',
                                5: 'light'
                            };
                            return (
                                <span className={`badge bg-label-${priorityColors[row.priority] || 'secondary'}`}>
                                    {row.priority ? `#${row.priority}` : "N/A"}
                                </span>
                            );
                        },
                    },
                    {
                         key: "fees",
                         label: "Fee Details",
                         style: { width: "300px" },
                         render: (row) => {
                             const course = row.university_course;
                             const currency = course?.currency || 'USD';
                             const tuitionFee = course?.tuition_fee ? Number(course.tuition_fee) : null;
                             const hasScholarship = course?.scholarship_available;
                             const feeAfterScholarship = course?.fee_after_scholarship;
                             const studentScholarshipApplied = row.scholarship_applied;
                             const studentScholarshipAmount = row.scholarship_amount;

                             return (
                                 <div className="d-flex flex-column gap-1" style={{ fontSize: '0.85rem' }}>
                                     {/* Tuition Fee */}
                                     {tuitionFee ? (
                                         <>
                                             <div>
                                                 <small className="text-muted">Tuition:</small>
                                                 <span className={`ms-2 fw-medium ${hasScholarship ? 'text-decoration-line-through text-muted' : 'text-primary'}`}>
                                                     {currency} {tuitionFee.toLocaleString()}
                                                 </span>
                                             </div>
                                             
                                             {/* Course Scholarship */}
                                             {hasScholarship && (
                                                 <div>
                                                     <small className="text-muted">Course Scholarship:</small>
                                                     <span className="ms-2 fw-semibold text-success">
                                                         {course?.scholarship_type === 'percentage'
                                                             ? `${course?.scholarship_amount}%`
                                                             : course?.scholarship_type === 'fixed'
                                                             ? `${currency} ${Number(course?.scholarship_amount || 0).toLocaleString()}`
                                                             : 'Full'}
                                                         <i className="bx bx-gift ms-1" style={{ fontSize: '0.9rem' }}></i>
                                                     </span>
                                                 </div>
                                             )}
                                             
                                             {/* Final Fee After Course Scholarship */}
                                             {hasScholarship && feeAfterScholarship !== null && course?.scholarship_type !== 'full' && (
                                                 <div>
                                                     <small className="text-muted">Final Fee:</small>
                                                     <span className="ms-2 fw-semibold text-info">
                                                         {currency} {Number(feeAfterScholarship).toLocaleString()}
                                                     </span>
                                                 </div>
                                             )}
                                             
                                             {/* Full Scholarship Badge */}
                                             {hasScholarship && course?.scholarship_type === 'full' && (
                                                 <div>
                                                     <span className="badge bg-label-success">Full Scholarship</span>
                                                 </div>
                                             )}
                                             
                                             {/* Student Applied Scholarship */}
                                             {studentScholarshipApplied && (
                                                 <div className="pt-1 border-top">
                                                     <small className="text-muted">Student Scholarship:</small>
                                                     <span className="ms-2 fw-semibold text-success">
                                                         {studentScholarshipAmount 
                                                             ? `${currency} ${Number(studentScholarshipAmount).toLocaleString()}`
                                                             : 'Applied'}
                                                         <i className="bx bx-check-circle ms-1" style={{ fontSize: '0.9rem' }}></i>
                                                     </span>
                                                 </div>
                                             )}
                                         </>
                                     ) : (
                                         <span className="text-muted">N/A</span>
                                     )}
                                 </div>
                             );
                         },
                     },
                    {
                        key: "created",
                        label: "Created",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span>{row.created_at ? formatDate(row.created_at) : "N/A"}</span>
                                <small className="text-muted">
                                    {row.created_by_details?.first_name} {row.created_by_details?.last_name}
                                </small>
                            </div>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/unisync360/applications/course-allocations/${row.uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: () => hasAccess(user, ["change_courseallocation"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_courseallocation"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                filters={[
                    { label: "All", value: "ALL" },
                    { label: "Pending", value: "pending" },
                    { label: "Submitted", value: "submitted" },
                    { label: "Under Review", value: "under_review" },
                    { label: "Approved", value: "approved" },
                    { label: "Offer Received", value: "offer_received" },
                    { label: "Enrolled", value: "enrolled" },
                    { label: "Rejected", value: "rejected" },
                ]}
                filterSelected={["ALL"]}
                buttons={[
                    {
                        label: "Add Allocation",
                        render: () => (
                            hasAccess(user, ["add_courseallocation"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Course Allocation"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Allocation
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <CourseAllocationModal
                    show={showModal}
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
