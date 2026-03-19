import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import showToast from "../../../../../helpers/ToastHelper";
import ReactLoading from "react-loading";
import "animate.css";
import { useNavigate, useParams } from "react-router-dom";
import BreadCumb from "../../../../../layouts/BreadCumb";
import { useSelector } from "react-redux";
import { formatDate } from "../../../../../helpers/DateFormater";
import { hasAccess } from "../../../../../hooks/AccessHandler";
import {
    getCourses,
    deleteCourse,
} from "./Queries";
import { CourseModal } from "./CourseModal";

export const CourseDetailsPage = () => {
    const [courseData, setCourseData] = useState(null);
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
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
            const response = await getCourses({ uid: id });
            let data = response;

            // Handle CustomResponse wrapper (if response.data exists)
            if (data && data.data) {
                data = data.data;
            }

            if (data && data.uid) {
                setCourseData(data);
            } else {
                setError(true);
                showToast("Course Not Found", "warning");
            }
        } catch (err) {
            console.error("Error fetching course:", err);
            setError(true);
            showToast("Unable to Fetch Course Details", "warning");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!courseData) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "You're about to delete this course. This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteCourse(courseData.uid);
                Swal.fire(
                    "Deleted!",
                    "The Course has been deleted.",
                    "success"
                );
                navigate("/unisync360/academics/courses");
            }
        } catch (error) {
            console.error("Error deleting Course:", error);
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
                <BreadCumb pageList={["Academics", "Courses", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <center>
                            <ReactLoading type={"cylon"} color={"#696cff"} height={"30px"} width={"50px"} />
                            <h6 className="text-muted mt-2">Loading Course Details...</h6>
                        </center>
                    </div>
                </div>
            </>
        );
    }

    if (error || !courseData) {
        return (
            <>
                <BreadCumb pageList={["Academics", "Courses", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <div className="alert alert-danger" role="alert">
                            <div className="alert-body text-center">
                                <p className="mb-0">
                                    Sorry! Unable to get Course Details. Please Contact System Administrator
                                </p>
                                <button
                                    className="btn btn-primary btn-sm mt-3"
                                    onClick={() => navigate("/unisync360/academics/courses")}
                                >
                                    <i className="bx bx-arrow-back me-1"></i> Back to Courses List
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
            <BreadCumb pageList={["Academics", "Courses", courseData?.name || "View"]} />

            {/* Header Card */}
            <div className="card mb-4 shadow-sm animate__animated animate__fadeInDown animate__faster">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="d-flex align-items-start">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-xl me-3" style={{ width: "80px", height: "80px" }}>
                                        <span className="avatar-initial rounded bg-label-primary h-100 w-100 d-flex align-items-center justify-content-center">
                                            <i className="bx bxs-book bx-lg"></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-1">
                                        <h3 className="mb-0 fw-bold me-2">{courseData.name}</h3>
                                        <span className="badge bg-label-primary">{courseData.code}</span>
                                    </div>

                                    <p className="mb-2 text-muted">
                                        Category: <strong>{courseData.category?.name || courseData.category_name}</strong>
                                    </p>

                                    <div className="d-flex gap-2 flex-wrap mt-3">
                                        <div className="d-flex align-items-center border rounded px-2 py-1">
                                            <i className="bx bx-layer text-info me-1"></i>
                                            <span className="fw-semibold">Level: {courseData.level?.name || courseData.level_name}</span>
                                        </div>
                                        <div className="d-flex align-items-center border rounded px-2 py-1">
                                            <i className="bx bx-time text-warning me-1"></i>
                                            <span className="fw-semibold">Duration: {courseData.duration_years} Years</span>
                                        </div>
                                        <div className="d-flex align-items-center border rounded px-2 py-1">
                                            <i className="bx bx-star text-success me-1"></i>
                                            <span className="fw-semibold">Credits: {courseData.total_credits || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-end mb-3">
                                {hasAccess(user, [["change_course"]]) && (
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => { setSelectedObj(courseData); setShowModal(true); }}
                                    >
                                        <i className="bx bx-edit-alt me-1"></i> Edit
                                    </button>
                                )}
                                {hasAccess(user, [["delete_course"]]) && (
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
                                    <h6 className="mb-2 fw-semibold">System Info</h6>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Created At:</span>
                                        <span className="small fw-medium">{formatDate(courseData.created_at, "DD MMM YYYY")}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Last Updated:</span>
                                        <span className="small fw-medium">{formatDate(courseData.updated_at, "DD MMM YYYY")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Card */}
            <div className="card mb-4">
                <div className="card-header border-bottom">
                    <h5 className="card-title mb-0">Description</h5>
                </div>
                <div className="card-body pt-3">
                    {courseData.description ? (
                        <p>{courseData.description}</p>
                    ) : (
                        <p className="text-muted">No description available.</p>
                    )}
                </div>
            </div>

            <CourseModal
                show={showModal}
                selectedObj={selectedObj}
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedObj(null);
                    setShowModal(false);
                }}
                onClose={() => { setSelectedObj(null); setShowModal(false); }}
            />
        </>
    );
};
