import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import showToast from "../../../../../../helpers/ToastHelper";
import ReactLoading from "react-loading";
import "animate.css";
import { useNavigate, useParams } from "react-router-dom";
import BreadCumb from "../../../../../../layouts/BreadCumb";
import { useSelector } from "react-redux";
import { formatDate } from "../../../../../../helpers/DateFormater";
import { hasAccess } from "../../../../../../hooks/AccessHandler";
import {
    getUniversityCourses,
    deleteUniversityCourse,
    getCourses,
    getUniversities,
} from "./Queries";
import { UniversityCourseModal } from "./UniversityCourseModal";

export const UniversityCourseDetailsPage = () => {
    const [courseData, setCourseData] = useState(null);
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleFetchCourse = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUniversityCourses({ uid: id });
            let data = response;

            if (data && data.data) {
                data = data.data;
            }

            // If data is wrapped in an array
            if (Array.isArray(data) && data.length > 0) {
                data = data[0];
            }

            if (data && data.uid) {
                // Fetch related Course if it's just an ID or incomplete
                if (data.course && (typeof data.course !== 'object' || !data.course.name)) {
                    try {
                        const courseId = typeof data.course === 'object' ? data.course.uid : data.course;
                        if (courseId) {
                            const courseRes = await getCourses({ uid: courseId });
                            let courseDataFull = courseRes;
                            if (courseDataFull.data) courseDataFull = courseDataFull.data;
                            if (Array.isArray(courseDataFull)) courseDataFull = courseDataFull[0];
                            
                            data.course = courseDataFull;
                        }
                    } catch (e) {
                        console.error("Failed to fetch extra course details", e);
                    }
                }

                // Fetch related University if needed
                if (data.university && (typeof data.university !== 'object' || !data.university.name)) {
                    try {
                        const uniId = typeof data.university === 'object' ? data.university.uid : data.university;
                        if (uniId) {
                            const uniRes = await getUniversities({ uid: uniId });
                            let uniDataFull = uniRes;
                            if (uniDataFull.data) uniDataFull = uniDataFull.data;
                            if (Array.isArray(uniDataFull)) uniDataFull = uniDataFull[0];

                            data.university = uniDataFull;
                        }
                    } catch (e) {
                        console.error("Failed to fetch extra university details", e);
                    }
                }

                setCourseData(data);
            } else {
                setError(true);
                showToast("University Course Not Found", "warning");
            }
        } catch (err) {
            console.error("Error fetching university course:", err);
            setError(true);
            showToast("Unable to Fetch University Course Details", "warning");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!courseData) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "You're about to delete this university course. This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteUniversityCourse(courseData.uid);
                Swal.fire(
                    "Deleted!",
                    "The University Course has been deleted.",
                    "success"
                );
                navigate("/unisync360/academics/courses/universities");
            }
        } catch (error) {
            console.error("Error deleting University Course:", error);
            Swal.fire(
                "Error",
                "Unable to delete. Please try again or contact support.",
                "error"
            );
        }
    };

    useEffect(() => {
        handleFetchCourse();
    }, [id, tableRefresh]);

    if (loading) {
        return (
            <>
                <BreadCumb pageList={["Academics", "University Courses", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <center>
                            <ReactLoading type={"cylon"} color={"#696cff"} height={"30px"} width={"50px"} />
                            <h6 className="text-muted mt-2">Loading University Course Details...</h6>
                        </center>
                    </div>
                </div>
            </>
        );
    }

    if (error || !courseData) {
        return (
            <>
                <BreadCumb pageList={["Academics", "University Courses", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <div className="alert alert-danger" role="alert">
                            <div className="alert-body text-center">
                                <p className="mb-0">
                                    Sorry! Unable to get University Course Details. Please Contact System Administrator
                                </p>
                                <button
                                    className="btn btn-primary btn-sm mt-3"
                                    onClick={() => navigate("/unisync360/academics/courses/universities")}
                                >
                                    <i className="bx bx-arrow-back me-1"></i> Back to List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <BreadCumb pageList={["Academics", "University Courses", courseData?.course?.name || "View"]} />

            {/* Header Card */}
            <div className="card mb-4 shadow-sm animate__animated animate__fadeInDown animate__faster">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="d-flex align-items-start">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-xl me-3" style={{ width: "80px", height: "80px" }}>
                                        {courseData.university?.logo ? (
                                            <img 
                                                src={courseData.university.logo} 
                                                alt="University Logo" 
                                                className="rounded" 
                                                style={{ objectFit: "cover", width: "100%", height: "100%" }} 
                                            />
                                        ) : (
                                            <span className="avatar-initial rounded bg-label-primary h-100 w-100 d-flex align-items-center justify-content-center">
                                                <i className="bx bxs-graduation bx-lg"></i>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-1">
                                        <h3 className="mb-0 fw-bold me-2">{courseData.course?.name || courseData.course_name}</h3>
                                        <span className="badge bg-label-primary">{courseData.course?.code}</span>
                                    </div>

                                    <p className="mb-2 text-primary fw-semibold cursor-pointer" onClick={() => navigate(`/unisync360/institutions/universities/${courseData.university?.uid}`)}>
                                        <i className="bx bxs-school me-1"></i>
                                        {courseData.university?.name || courseData.university_name}
                                    </p>

                                    <div className="d-flex gap-2 flex-wrap mt-3">
                                        <div className="d-flex align-items-center border rounded px-2 py-1">
                                            <i className="bx bx-money text-success me-1"></i>
                                            <span className="fw-semibold">{courseData.currency} {Number(courseData.tuition_fee).toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex align-items-center border rounded px-2 py-1">
                                            <i className="bx bx-time text-warning me-1"></i>
                                            <span className="fw-semibold">{courseData.duration_months} Months</span>
                                        </div>
                                        {courseData.scholarship_available && (
                                            <div className="d-flex align-items-center border rounded px-2 py-1 bg-label-info">
                                                <i className="bx bx-gift me-1"></i>
                                                <span className="fw-semibold">Scholarship Available</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-end mb-3">
                                {hasAccess(user, [["change_universitycourse"]]) && (
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#universityCourseModal"
                                        onClick={() => setSelectedObj(courseData)}
                                    >
                                        <i className="bx bx-edit-alt me-1"></i> Edit
                                    </button>
                                )}
                                {hasAccess(user, [["delete_universitycourse"]]) && (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={handleDelete}
                                    >
                                        <i className="bx bx-trash me-1"></i> Delete
                                    </button>
                                )}
                            </div>
                            
                            <div className="card bg-label-secondary border-0">
                                <div className="card-body p-3">
                                    <h6 className="mb-2 fw-semibold">Course Info</h6>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Level:</span>
                                        <span className="small fw-medium">{courseData.course?.level_name || courseData.course?.level?.name || "-"}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Category:</span>
                                        <span className="small fw-medium">{courseData.course?.category_name || courseData.course?.category?.name || "-"}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Intakes:</span>
                                        <span className="small fw-medium">
                                            {Array.isArray(courseData.intakes) ? courseData.intakes.join(", ") : "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Cards */}
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header border-bottom">
                            <h5 className="card-title mb-0">Course Description</h5>
                        </div>
                        <div className="card-body pt-3">
                            {courseData.course?.description ? (
                                <p>{courseData.course.description}</p>
                            ) : (
                                <p className="text-muted">No course description available.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header border-bottom">
                            <h5 className="card-title mb-0">Scholarship & Deadlines</h5>
                        </div>
                        <div className="card-body pt-3">
                            <div className="mb-4">
                                <h6 className="fw-semibold mb-2">Application Deadline</h6>
                                <p className="mb-0">
                                    {courseData.application_deadline ? (
                                        <span className="d-flex align-items-center text-danger">
                                            <i className="bx bx-calendar-exclamation me-2"></i>
                                            {formatDate(courseData.application_deadline, "DD MMMM YYYY")}
                                        </span>
                                    ) : (
                                        <span className="text-muted">No specific deadline set.</span>
                                    )}
                                </p>
                            </div>

                            {courseData.scholarship_available && (
                                <div>
                                    <h6 className="fw-semibold mb-2">Scholarship Details</h6>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span>Type:</span>
                                            <span className="fw-medium text-capitalize">{courseData.scholarship_type}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span>Amount:</span>
                                            <span className="fw-medium">
                                                {courseData.scholarship_type === 'percentage' ? `${courseData.scholarship_amount}%` : `${courseData.currency} ${Number(courseData.scholarship_amount).toLocaleString()}`}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <UniversityCourseModal
                selectedObj={selectedObj}
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedObj(null);
                }}
                onClose={() => setSelectedObj(null)}
            />
        </>
    );
};
