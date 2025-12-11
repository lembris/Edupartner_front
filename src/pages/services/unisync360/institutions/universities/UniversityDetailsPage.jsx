import React, { useState, useEffect, useRef } from "react";
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
    getUniversities,
    deleteUniversity,
    getUniversityCourses,
    getCourseAllocations,
    getUniversityAccommodations,
    getUniversityGallery,
    getUniversityExpenses,
    deleteUniversityExpense
} from "./Queries";
import { UniversityModal } from "./UniversityModal";
import { UniversityExpenseModal } from "./UniversityExpenseModal";

export const UniversityDetailsPage = () => {
    const [universityData, setUniversityData] = useState(null);
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Tab specific states
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [accommodations, setAccommodations] = useState([]);
    const [loadingAccommodations, setLoadingAccommodations] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const tabsRef = useRef(null);
    const [showScrollArrows, setShowScrollArrows] = useState(false);

    const checkScroll = () => {
        if (tabsRef.current) {
            const { scrollWidth, clientWidth } = tabsRef.current;
            setShowScrollArrows(scrollWidth > clientWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scrollTabs = (direction) => {
        if (tabsRef.current) {
            if (direction === 'left') {
                tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
            } else {
                tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
            }
        }
    };

    const handleFetchUniversity = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUniversities({ uid: id });
            let data = response;

            // Handle CustomResponse wrapper (if response.data exists)
            if (data && data.data) {
                data = data.data;
            }

            // Handle weird keyed response format (e.g., { "4": { ... } })
            if (data && typeof data === 'object' && !data.uid && !data.name) {
                const values = Object.values(data);
                if (values.length > 0 && values[0]?.uid) {
                    data = values[0];
                }
            }

            if (data && data.uid) {
                setUniversityData(data);
            } else {
                setError(true);
                showToast("University Not Found", "warning");
            }
        } catch (err) {
            console.error("Error fetching university:", err);
            setError(true);
            showToast("Unable to Fetch University Details", "warning");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        if (!id) return;
        setLoadingCourses(true);
        try {
            const result = await getUniversityCourses({ universityUid: id });
            let courseList = [];
            
            if (result.data && Array.isArray(result.data)) {
                courseList = result.data;
            } else if (result.results && Array.isArray(result.results)) {
                courseList = result.results;
            } else if (Array.isArray(result)) {
                courseList = result;
            }
            
            setCourses(courseList);
        } catch (err) {
            console.error("Error fetching courses:", err);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchApplications = async () => {
        if (!id) return;
        setLoadingApplications(true);
        try {
            const result = await getCourseAllocations({ universityUid: id });
            let appList = [];
            
            if (result.data && Array.isArray(result.data)) {
                appList = result.data;
            } else if (result.results && Array.isArray(result.results)) {
                appList = result.results;
            } else if (Array.isArray(result)) {
                appList = result;
            }
            
            setApplications(appList);
        } catch (err) {
            console.error("Error fetching applications:", err);
        } finally {
            setLoadingApplications(false);
        }
    };

    const fetchAccommodations = async () => {
        if (!id) return;
        setLoadingAccommodations(true);
        try {
            const result = await getUniversityAccommodations({ universityUid: id });
            let list = [];
            if (result.data && Array.isArray(result.data)) list = result.data;
            else if (result.results && Array.isArray(result.results)) list = result.results;
            else if (Array.isArray(result)) list = result;
            setAccommodations(list);
        } catch (err) {
            console.error("Error fetching accommodations:", err);
        } finally {
            setLoadingAccommodations(false);
        }
    };

    const fetchGallery = async () => {
        if (!id) return;
        setLoadingGallery(true);
        try {
            const result = await getUniversityGallery({ universityUid: id });
            let list = [];
            if (result.data && Array.isArray(result.data)) list = result.data;
            else if (result.results && Array.isArray(result.results)) list = result.results;
            else if (Array.isArray(result)) list = result;
            setGallery(list);
        } catch (err) {
            console.error("Error fetching gallery:", err);
        } finally {
            setLoadingGallery(false);
        }
    };

    const fetchExpenses = async () => {
        if (!id) return;
        setLoadingExpenses(true);
        try {
            const result = await getUniversityExpenses({ universityUid: id });
            let list = [];
            if (result.data && Array.isArray(result.data)) list = result.data;
            else if (result.results && Array.isArray(result.results)) list = result.results;
            else if (Array.isArray(result)) list = result;
            setExpenses(list);
        } catch (err) {
            console.error("Error fetching expenses:", err);
        } finally {
            setLoadingExpenses(false);
        }
    };

    const handleDeleteExpense = async (expense) => {
        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete the expense "${expense.description}". This action cannot be undone.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteUniversityExpense(expense.uid);
                Swal.fire("Deleted!", "The expense has been deleted.", "success");
                fetchExpenses();
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
            Swal.fire("Error", "Unable to delete expense. Please try again.", "error");
        }
    };

    const handleDelete = async () => {
        if (!universityData) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "You're about to delete this university. This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteUniversity(universityData.uid);
                Swal.fire(
                    "Deleted!",
                    "The University has been deleted.",
                    "success"
                );
                navigate("/unisync360/institutions/universities");
            }
        } catch (error) {
            console.error("Error deleting University:", error);
            Swal.fire(
                "Error",
                "Unable to delete. Please try again or contact support.",
                "error"
            );
        }
    };

    useEffect(() => {
        handleFetchUniversity();
    }, [id, tableRefresh]);

    useEffect(() => {
        if (activeTab === "courses") {
            fetchCourses();
        } else if (["admissions", "students", "analytics"].includes(activeTab)) {
            fetchApplications();
            fetchCourses(); // Courses are useful for analytics too
        } else if (activeTab === "accommodations") {
            fetchAccommodations();
        } else if (activeTab === "gallery") {
            fetchGallery();
        } else if (activeTab === "expenses") {
            fetchExpenses();
        }
    }, [activeTab, id]);

    if (loading) {
        return (
            <>
                <BreadCumb pageList={["Universities", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <center>
                            <ReactLoading type={"cylon"} color={"#696cff"} height={"30px"} width={"50px"} />
                            <h6 className="text-muted mt-2">Loading University Details...</h6>
                        </center>
                    </div>
                </div>
            </>
        );
    }

    if (error || !universityData) {
        return (
            <>
                <BreadCumb pageList={["Universities", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <div className="alert alert-danger" role="alert">
                            <div className="alert-body text-center">
                                <p className="mb-0">
                                    Sorry! Unable to get University Details. Please Contact System Administrator
                                </p>
                                <button
                                    className="btn btn-primary btn-sm mt-3"
                                    onClick={() => navigate("/unisync360/institutions/universities")}
                                >
                                    <i className="bx bx-arrow-back me-1"></i> Back to Universities List
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
            <BreadCumb pageList={["Universities", universityData?.name || "View"]} />

            {/* Header Card */}
            <div className="card mb-4 shadow-sm animate__animated animate__fadeInDown animate__faster">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="d-flex align-items-start">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-xl me-3" style={{ width: "100px", height: "100px" }}>
                                        {universityData?.logo ? (
                                            <img
                                                src={universityData.logo}
                                                alt="University Logo"
                                                className="rounded"
                                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                            />
                                        ) : (
                                            <span className="avatar-initial rounded bg-label-primary h-100 w-100 d-flex align-items-center justify-content-center">
                                                <i className="bx bxs-school bx-lg"></i>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-1">
                                        <h3 className="mb-0 fw-bold me-2">{universityData.name}</h3>
                                        <span className={`badge bg-${universityData.status === 'active' ? 'success' : universityData.status === 'suspended' ? 'warning' : 'danger'}`}>
                                            {universityData.status ? String(universityData.status).toUpperCase() : "UNKNOWN"}
                                        </span>
                                    </div>
                                    
                                    <p className="mb-2 text-muted d-flex align-items-center">
                                        <i className="bx bx-map me-1"></i>
                                        {universityData.country_name || "Unknown Country"}
                                    </p>

                                    <div className="d-flex gap-2 flex-wrap mt-3">
                                        {universityData.ranking && (
                                            <div className="d-flex align-items-center border rounded px-2 py-1">
                                                <i className="bx bx-trophy text-warning me-1"></i>
                                                <span className="fw-semibold">Rank #{universityData.ranking}</span>
                                            </div>
                                        )}
                                        {universityData.established_year && (
                                            <div className="d-flex align-items-center border rounded px-2 py-1">
                                                <i className="bx bx-calendar text-primary me-1"></i>
                                                <span className="text-muted">Est. {universityData.established_year}</span>
                                            </div>
                                        )}
                                        {universityData.partnership_status && (
                                            <div className={`d-flex align-items-center border rounded px-2 py-1 bg-label-${universityData.partnership_status === 'active' ? 'success' : 'secondary'}`}>
                                                <i className="bx bx-handshake me-1"></i>
                                                <span className="fw-semibold">
                                                    Partnership: {String(universityData.partnership_status).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-end mb-3">
                                {hasAccess(user, [["change_university"]]) && (
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#universityModal"
                                        onClick={() => setSelectedObj(universityData)}
                                    >
                                        <i className="bx bx-edit-alt me-1"></i> Edit
                                    </button>
                                )}
                                {hasAccess(user, [["delete_university"]]) && (
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
                                    <h6 className="mb-2 fw-semibold">Created By</h6>
                                    {universityData.created_by_details ? (
                                        <div className="d-flex align-items-center">
                                            <div className="avatar avatar-xs me-2">
                                                <span className="avatar-initial rounded-circle bg-primary">
                                                    {universityData.created_by_details.first_name?.[0]}
                                                    {universityData.created_by_details.last_name?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fw-medium fs-13">
                                                    {universityData.created_by_details.first_name} {universityData.created_by_details.last_name}
                                                </div>
                                                <div className="text-muted fs-12">
                                                    {formatDate(universityData.created_at, "DD MMM YYYY, HH:mm")}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted">System</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Navigation Tabs */}
                <div className="card-footer p-0 position-relative">
                    <div className="d-flex align-items-center bg-light">
                        {showScrollArrows && (
                            <button 
                                type="button"
                                className="btn btn-sm btn-icon btn-link text-secondary rounded-0 shadow-none"
                                onClick={() => scrollTabs('left')}
                                title="Scroll Left"
                            >
                                <i className="bx bx-chevrons-left fs-4"></i>
                            </button>
                        )}
                        
                        <div 
                            className="flex-grow-1 overflow-hidden position-relative"
                            ref={tabsRef}
                            style={{ 
                                overflowX: 'auto', 
                                scrollbarWidth: 'none', 
                                msOverflowStyle: 'none' 
                            }}
                        >
                            <style>
                                {`
                                    .hide-scrollbar::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}
                            </style>
                            <ul className="nav nav-tabs nav-fill flex-nowrap hide-scrollbar mb-0 border-bottom-0" role="tablist" style={{ minWidth: "100%" }}>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "overview" ? "active" : ""}`}
                                        onClick={() => setActiveTab("overview")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-info-circle me-1"></i> Overview
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "courses" ? "active" : ""}`}
                                        onClick={() => setActiveTab("courses")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-book me-1"></i> Courses
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "partnerships" ? "active" : ""}`}
                                        onClick={() => setActiveTab("partnerships")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-handshake me-1"></i> Partnership
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "admissions" ? "active" : ""}`}
                                        onClick={() => setActiveTab("admissions")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-file me-1"></i> Admissions
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "students" ? "active" : ""}`}
                                        onClick={() => setActiveTab("students")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-user-check me-1"></i> Students
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                         type="button"
                                         className={`nav-link border-0 rounded-0 ${activeTab === "accommodations" ? "active" : ""}`}
                                         onClick={() => setActiveTab("accommodations")}
                                         style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-home me-1"></i> Accommodations
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "gallery" ? "active" : ""}`}
                                        onClick={() => setActiveTab("gallery")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-images me-1"></i> Gallery
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "analytics" ? "active" : ""}`}
                                        onClick={() => setActiveTab("analytics")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-bar-chart-alt-2 me-1"></i> Analytics
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className={`nav-link border-0 rounded-0 ${activeTab === "expenses" ? "active" : ""}`}
                                        onClick={() => setActiveTab("expenses")}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="bx bx-wallet me-1"></i> Expenses
                                    </button>
                                </li>
                                {/* Add more tabs here as needed */}
                            </ul>
                        </div>
                        
                        {showScrollArrows && (
                            <button 
                                type="button"
                                className="btn btn-sm btn-icon btn-link text-secondary rounded-0 shadow-none"
                                onClick={() => scrollTabs('right')}
                                title="Scroll Right"
                            >
                                <i className="bx bx-chevrons-right fs-4"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content p-0">
                
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="row">
                            <div className="col-md-8 mb-4">
                                <div className="card h-100">
                                    <div className="card-header border-bottom">
                                        <h5 className="card-title mb-0">About University</h5>
                                    </div>
                                    <div className="card-body pt-3">
                                        {universityData.description ? (
                                            <div dangerouslySetInnerHTML={{ __html: universityData.description }} />
                                        ) : (
                                            <p className="text-muted text-center py-3">No description available.</p>
                                        )}
                                        
                                        {universityData.map_embed && (
                                            <div className="mt-4">
                                                <h6 className="fw-semibold mb-3">Location Map</h6>
                                                <div 
                                                    className="ratio ratio-16x9 rounded overflow-hidden shadow-sm border"
                                                    dangerouslySetInnerHTML={{ __html: universityData.map_embed }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-4 mb-4">
                                <div className="card h-100">
                                    <div className="card-header border-bottom">
                                        <h5 className="card-title mb-0">Contact & Details</h5>
                                    </div>
                                    <div className="card-body pt-3">
                                        <div className="mb-4">
                                            <h6 className="fw-semibold text-muted mb-2 text-uppercase fs-12">Contact Information</h6>
                                            <ul className="list-unstyled mb-0">
                                                <li className="mb-2 d-flex">
                                                    <i className="bx bx-envelope me-2 mt-1 text-primary"></i>
                                                    <span>
                                                        {universityData.email ? (
                                                            <a href={`mailto:${universityData.email}`} className="text-body">{universityData.email}</a>
                                                        ) : <span className="text-muted">-</span>}
                                                    </span>
                                                </li>
                                                <li className="mb-2 d-flex">
                                                    <i className="bx bx-phone me-2 mt-1 text-primary"></i>
                                                    <span>{universityData.phone || "-"}</span>
                                                </li>
                                                <li className="mb-2 d-flex">
                                                    <i className="bx bx-globe me-2 mt-1 text-primary"></i>
                                                    <span>
                                                        {universityData.website ? (
                                                            <a href={universityData.website} target="_blank" rel="noopener noreferrer" className="text-body">
                                                                {universityData.website}
                                                            </a>
                                                        ) : <span className="text-muted">-</span>}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="mb-4">
                                            <h6 className="fw-semibold text-muted mb-2 text-uppercase fs-12">Location</h6>
                                            <div className="d-flex">
                                                <i className="bx bx-map-pin me-2 mt-1 text-danger"></i>
                                                <span>{universityData.address || "No address provided"}</span>
                                            </div>
                                        </div>

                                        {universityData.partnership_status === 'active' && (
                                            <div className="mb-4">
                                                <h6 className="fw-semibold text-muted mb-2 text-uppercase fs-12">Partnership Details</h6>
                                                <div className="p-3 bg-label-success rounded">
                                                    <div className="mb-1">
                                                        <span className="fw-semibold">Status:</span> Active
                                                    </div>
                                                    {universityData.partnership_start_date && (
                                                        <div>
                                                            <span className="fw-semibold">Since:</span> {formatDate(universityData.partnership_start_date, "DD MMM YYYY")}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h6 className="fw-semibold text-muted mb-2 text-uppercase fs-12">System Metadata</h6>
                                            <ul className="list-unstyled mb-0 fs-13">
                                                <li className="mb-1">
                                                    <span className="fw-semibold">Last Updated:</span><br/>
                                                    <span className="text-muted">{formatDate(universityData.updated_at, "DD MMM YYYY, HH:mm")}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Courses Tab */}
                {activeTab === "courses" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center border-bottom">
                                <h5 className="card-title mb-0">Courses Offered ({courses.length})</h5>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/unisync360/academic/university-courses/add?university=${universityData.uid}`)}
                                >
                                    <i className="bx bx-plus me-1"></i> Add Course
                                </button>
                            </div>
                            
                            {loadingCourses ? (
                                <div className="card-body text-center py-5">
                                    <ReactLoading type={"cylon"} color={"#696cff"} height={30} width={50} />
                                    <p className="text-muted mt-2">Loading courses...</p>
                                </div>
                            ) : courses.length === 0 ? (
                                <div className="card-body text-center py-5">
                                    <div className="mb-3">
                                        <span className="avatar-initial rounded-circle bg-label-secondary p-4">
                                            <i className="bx bx-book-open fs-1"></i>
                                        </span>
                                    </div>
                                    <h5>No Courses Found</h5>
                                    <p className="text-muted">There are no courses listed for this university yet.</p>
                                    <button 
                                        className="btn btn-outline-primary btn-sm mt-2"
                                        onClick={() => navigate(`/unisync360/academic/university-courses/add?university=${universityData.uid}`)}
                                    >
                                        Add First Course
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped border-top">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Course Name</th>
                                                <th>Details</th>
                                                <th>Duration</th>
                                                <th>Tuition</th>
                                                <th>Scholarship</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map((course) => (
                                                <tr key={course.uid}>
                                                    <td>
                                                        <div className="fw-bold text-primary cursor-pointer" onClick={() => navigate(`/unisync360/academic/university-courses/${course.uid}`)}>
                                                            {course.course_name || course.course?.name}
                                                        </div>
                                                        <small className="text-muted">{course.intakes && course.intakes.length > 0 ? `Intakes: ${course.intakes.join(", ")}` : "No intake info"}</small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-label-info me-1">
                                                            {course.level_name || course.course?.level?.name || "N/A"}
                                                        </span>
                                                        {course.currency && <span className="badge bg-label-secondary">{course.currency}</span>}
                                                    </td>
                                                    <td>{course.duration_months ? `${course.duration_months} Months` : "-"}</td>
                                                    <td>{course.tuition_fee ? `${Number(course.tuition_fee).toLocaleString()}` : "-"}</td>
                                                    <td>
                                                        {course.scholarship_available ? (
                                                            <span className="badge bg-success">Available</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">None</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <button 
                                                            className="btn btn-sm btn-icon btn-outline-primary"
                                                            onClick={() => navigate(`/unisync360/academic/university-courses/${course.uid}`)}
                                                            title="View Details"
                                                        >
                                                            <i className="bx bx-show"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Partnership Tab */}
                {activeTab === "partnerships" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header border-bottom">
                                        <h5 className="card-title mb-0">Partnership Status</h5>
                                    </div>
                                    <div className="card-body pt-4 text-center">
                                        <div className={`mb-3 rounded-circle p-4 d-inline-flex bg-label-${universityData.partnership_status === 'active' ? 'success' : 'secondary'}`}>
                                            <i className={`bx bx-${universityData.partnership_status === 'active' ? 'check-shield' : 'time'} fs-1`}></i>
                                        </div>
                                        <h4 className="fw-bold mb-1">{String(universityData.partnership_status || 'Inactive').toUpperCase()}</h4>
                                        <p className="text-muted">Current Partnership Standing</p>
                                        
                                        {universityData.partnership_start_date && (
                                            <div className="mt-4 p-3 border rounded bg-light">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-semibold">Start Date:</span>
                                                    <span>{formatDate(universityData.partnership_start_date, "DD MMM YYYY")}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-semibold">Duration:</span>
                                                    <span>Active</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header border-bottom">
                                        <h5 className="card-title mb-0">Agreement Details</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="alert alert-info d-flex mb-4">
                                            <i className="bx bx-info-circle me-2 mt-1"></i>
                                            <div>
                                                <strong>Contract Information</strong>
                                                <br/>
                                                Please contact the legal department for full contract details and commission structures specific to this university.
                                            </div>
                                        </div>
                                        
                                        <h6 className="fw-semibold mb-3">Key Contacts</h6>
                                        {universityData.phone || universityData.email ? (
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-2">
                                                            <span className="avatar-initial rounded-circle bg-label-primary">
                                                                <i className="bx bx-envelope"></i>
                                                            </span>
                                                        </div>
                                                        <span>Admissions Email</span>
                                                    </div>
                                                    <span className="fw-medium">{universityData.email || "N/A"}</span>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm me-2">
                                                            <span className="avatar-initial rounded-circle bg-label-info">
                                                                <i className="bx bx-phone"></i>
                                                            </span>
                                                        </div>
                                                        <span>Admissions Phone</span>
                                                    </div>
                                                    <span className="fw-medium">{universityData.phone || "N/A"}</span>
                                                </li>
                                            </ul>
                                        ) : (
                                            <p className="text-muted">No specific contact information listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admissions Tab (Renamed from Applications) */}
                {activeTab === "admissions" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="row mb-4">
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-primary text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Total Applications</p>
                                                <h4 className="mb-0 text-white">{applications.length}</h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-file fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-success text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Accepted</p>
                                                <h4 className="mb-0 text-white">
                                                    {applications.filter(a => ['approved', 'offer_received', 'enrolled'].includes(a.status)).length}
                                                </h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-check-circle fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-warning text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Pending</p>
                                                <h4 className="mb-0 text-white">
                                                    {applications.filter(a => ['pending', 'under_review'].includes(a.status)).length}
                                                </h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-time fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-danger text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Rejected</p>
                                                <h4 className="mb-0 text-white">
                                                    {applications.filter(a => a.status === 'rejected').length}
                                                </h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-x-circle fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header border-bottom d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">Recent Applications</h5>
                            </div>
                            
                            {loadingApplications ? (
                                <div className="card-body text-center py-5">
                                    <ReactLoading type={"cylon"} color={"#696cff"} height={30} width={50} />
                                    <p className="text-muted mt-2">Loading applications...</p>
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="card-body text-center py-5">
                                    <div className="mb-3">
                                        <span className="avatar-initial rounded-circle bg-label-secondary p-4">
                                            <i className="bx bx-file fs-1"></i>
                                        </span>
                                    </div>
                                    <h5>No Applications Found</h5>
                                    <p className="text-muted">There are no student applications for this university yet.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped border-top">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Student</th>
                                                <th>Course</th>
                                                <th>Intake</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app) => (
                                                <tr key={app.uid}>
                                                    <td>
                                                        <div className="fw-bold text-primary cursor-pointer" onClick={() => navigate(`/unisync360/students/${app.student?.uid}`)}>
                                                            {app.student_name || (app.student ? `${app.student.first_name} ${app.student.last_name}` : "Unknown")}
                                                        </div>
                                                        <small className="text-muted">{app.application_reference || "-"}</small>
                                                    </td>
                                                    <td>
                                                        <div>{app.university_course_name || app.university_course?.course?.name}</div>
                                                    </td>
                                                    <td>{app.intake_period}</td>
                                                    <td>{formatDate(app.application_date)}</td>
                                                    <td>
                                                        <span className={`badge bg-label-${
                                                            app.status === 'approved' || app.status === 'enrolled' ? 'success' : 
                                                            app.status === 'rejected' ? 'danger' : 
                                                            app.status === 'offer_received' ? 'info' : 'warning'
                                                        }`}>
                                                            {String(app.status).toUpperCase().replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button 
                                                            className="btn btn-sm btn-icon btn-outline-primary"
                                                            onClick={() => navigate(`/unisync360/applications/course-allocations/${app.uid}`)}
                                                            title="View Application"
                                                        >
                                                            <i className="bx bx-show"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Students Tab */}
                {activeTab === "students" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h5 className="card-title mb-0">Enrolled Students</h5>
                            </div>
                            <div className="card-body">
                                {loadingApplications ? (
                                    <div className="text-center py-5">
                                        <ReactLoading type={"cylon"} color={"#696cff"} height={30} width={50} />
                                        <p className="text-muted mt-2">Loading students...</p>
                                    </div>
                                ) : applications.filter(app => ['approved', 'enrolled', 'offer_received'].includes(app.status)).length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <span className="avatar-initial rounded-circle bg-label-info p-4">
                                                <i className="bx bx-user-check fs-1"></i>
                                            </span>
                                        </div>
                                        <h5>No Students Enrolled</h5>
                                        <p className="text-muted">No students currently have an accepted offer or enrollment status.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Student Name</th>
                                                    <th>Course</th>
                                                    <th>Enrolled Date</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Profile</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {applications
                                                    .filter(app => ['approved', 'enrolled', 'offer_received'].includes(app.status))
                                                    .map(app => (
                                                    <tr key={app.uid}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="avatar avatar-sm me-2">
                                                                    <span className="avatar-initial rounded-circle bg-label-primary">
                                                                        {app.student?.first_name?.[0]}{app.student?.last_name?.[0]}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold">{app.student_name || (app.student ? `${app.student.first_name} ${app.student.last_name}` : "Unknown")}</div>
                                                                    <small className="text-muted">{app.student?.personal_email}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{app.university_course_name || app.university_course?.course?.name}</td>
                                                        <td>{formatDate(app.application_date)}</td>
                                                        <td>
                                                            <span className="badge bg-label-success">
                                                                {String(app.status).toUpperCase().replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <button 
                                                                className="btn btn-sm btn-icon btn-outline-secondary"
                                                                onClick={() => navigate(`/unisync360/students/${app.student?.uid}`)}
                                                                title="View Student Profile"
                                                            >
                                                                <i className="bx bx-user"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Accommodations Tab */}
                {activeTab === "accommodations" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center border-bottom">
                                <h5 className="card-title mb-0">Accommodations</h5>
                                {/* Add button logic here if needed */}
                            </div>
                            <div className="card-body">
                                {loadingAccommodations ? (
                                    <div className="text-center py-5">
                                        <ReactLoading type={"cylon"} color={"#696cff"} height={30} width={50} />
                                        <p className="text-muted mt-2">Loading accommodations...</p>
                                    </div>
                                ) : accommodations.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <span className="avatar-initial rounded-circle bg-label-secondary p-4">
                                                <i className="bx bx-home fs-1"></i>
                                            </span>
                                        </div>
                                        <h5>No Accommodations Found</h5>
                                        <p className="text-muted">No accommodation options listed for this university.</p>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {accommodations.map(acc => (
                                            <div className="col-md-6 col-lg-4 mb-4" key={acc.uid}>
                                                <div className="card h-100 border">
                                                    {acc.images && acc.images.length > 0 ? (
                                                        <img src={acc.images[0]} className="card-img-top" alt={acc.name} style={{height: "200px", objectFit: "cover"}} />
                                                    ) : (
                                                        <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: "200px"}}>
                                                            <i className="bx bx-home text-secondary fs-1"></i>
                                                        </div>
                                                    )}
                                                    <div className="card-body">
                                                        <h5 className="card-title">{acc.name}</h5>
                                                        <p className="card-text text-muted small">{acc.type === 'on_campus' ? 'On Campus' : 'Off Campus'} • {acc.room_type}</p>
                                                        <h6 className="text-primary mb-3">{acc.currency} {Number(acc.cost_per_month).toLocaleString()} / month</h6>
                                                        
                                                        {acc.facilities && acc.facilities.length > 0 && (
                                                            <div className="d-flex flex-wrap gap-1 mb-3">
                                                                {acc.facilities.slice(0, 4).map((facility, idx) => (
                                                                    <span key={idx} className="badge bg-label-info">{facility}</span>
                                                                ))}
                                                                {acc.facilities.length > 4 && (
                                                                    <span className="badge bg-label-secondary">+{acc.facilities.length - 4}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        <p className="card-text small">{acc.description ? acc.description.substring(0, 100) + '...' : 'No description available.'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Gallery Tab */}
                {activeTab === "gallery" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h5 className="card-title mb-0">Campus Gallery</h5>
                            </div>
                            <div className="card-body">
                                {loadingGallery ? (
                                    <div className="text-center py-5">
                                        <ReactLoading type={"cylon"} color={"#696cff"} height={30} width={50} />
                                        <p className="text-muted mt-2">Loading gallery...</p>
                                    </div>
                                ) : gallery.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <span className="avatar-initial rounded-circle bg-label-secondary p-4">
                                                <i className="bx bx-images fs-1"></i>
                                            </span>
                                        </div>
                                        <h5>No Images Found</h5>
                                        <p className="text-muted">No gallery images available for this university.</p>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {gallery.map(item => (
                                            <div className="col-sm-6 col-md-4 col-lg-3" key={item.uid}>
                                                <div className="position-relative rounded overflow-hidden shadow-sm h-100 group-hover-overlay">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.caption || "Gallery Image"} 
                                                        className="w-100 h-100"
                                                        style={{objectFit: "cover", minHeight: "200px"}}
                                                    />
                                                    <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 p-2 text-white">
                                                        <p className="mb-0 small text-truncate">{item.caption || "Campus Image"}</p>
                                                        <span className="badge bg-primary fs-xs">{item.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h5 className="card-title mb-0">Application Success Rate</h5>
                                    </div>
                                    <div className="card-body d-flex align-items-center justify-content-center flex-column">
                                        {applications.length > 0 ? (
                                            <>
                                                <div style={{ width: "150px", height: "150px" }} className="position-relative d-flex align-items-center justify-content-center rounded-circle border border-5 border-primary mb-3">
                                                    <span className="fs-3 fw-bold">
                                                        {Math.round((applications.filter(a => ['approved', 'enrolled'].includes(a.status)).length / applications.length) * 100)}%
                                                    </span>
                                                </div>
                                                <p className="text-muted text-center">
                                                    <strong>{applications.filter(a => ['approved', 'enrolled'].includes(a.status)).length}</strong> successful out of <strong>{applications.length}</strong> applications
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-muted">Not enough data to calculate.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h5 className="card-title mb-0">Course Popularity</h5>
                                    </div>
                                    <div className="card-body">
                                        {courses.length > 0 && applications.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {courses.slice(0, 5).map(course => {
                                                    const count = applications.filter(a => 
                                                        a.university_course === course.uid || 
                                                        a.university_course?.uid === course.uid || 
                                                        a.university_course_name === course.course_name
                                                    ).length;
                                                    const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;
                                                    
                                                    return (
                                                        <li key={course.uid} className="list-group-item px-0">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="fw-medium">{course.course_name || course.course?.name}</span>
                                                                <span className="text-muted small">{count} applicants</span>
                                                            </div>
                                                            <div className="progress" style={{ height: "6px" }}>
                                                                <div 
                                                                    className="progress-bar" 
                                                                    role="progressbar" 
                                                                    style={{ width: `${percentage}%` }}
                                                                    aria-valuenow={percentage} 
                                                                    aria-valuemin="0" 
                                                                    aria-valuemax="100"
                                                                ></div>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <p className="text-muted text-center py-4">No data available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Expenses Tab */}
                {activeTab === "expenses" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        {/* Expense Summary Cards */}
                        <div className="row mb-4">
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-primary text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Total Expenses</p>
                                                <h4 className="mb-0 text-white">{expenses.length}</h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-wallet fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-success text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Paid</p>
                                                <h4 className="mb-0 text-white">
                                                    {expenses.filter(e => e.is_paid).length}
                                                </h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-check-circle fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-warning text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Unpaid</p>
                                                <h4 className="mb-0 text-white">
                                                    {expenses.filter(e => !e.is_paid).length}
                                                </h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-time fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-lg-3">
                                <div className="card bg-info text-white h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p className="mb-1 opacity-75">Total Amount</p>
                                                <h4 className="mb-0 text-white">
                                                    {expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0).toLocaleString()}
                                                </h4>
                                            </div>
                                            <div className="avatar bg-white bg-opacity-25 rounded p-1">
                                                <i className="bx bx-dollar-circle fs-4 text-white"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center border-bottom">
                                <h5 className="card-title mb-0">University Expenses</h5>
                                {hasAccess(user, [["add_universityexpense"]]) && (
                                    <button
                                        className="btn btn-primary btn-sm"
                                        data-bs-toggle="modal"
                                        data-bs-target="#universityExpenseModal"
                                        onClick={() => setSelectedExpense(null)}
                                    >
                                        <i className="bx bx-plus me-1"></i> Add Expense
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                {loadingExpenses ? (
                                    <div className="text-center py-5">
                                        <ReactLoading type={"cylon"} color={"#696cff"} height={30} width={50} />
                                        <p className="text-muted mt-2">Loading expenses...</p>
                                    </div>
                                ) : expenses.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <span className="avatar-initial rounded-circle bg-label-secondary p-4">
                                                <i className="bx bx-wallet fs-1"></i>
                                            </span>
                                        </div>
                                        <h5>No Expenses Found</h5>
                                        <p className="text-muted">No expenses recorded for this university yet.</p>
                                        {hasAccess(user, [["add_universityexpense"]]) && (
                                            <button
                                                className="btn btn-primary btn-sm mt-2"
                                                data-bs-toggle="modal"
                                                data-bs-target="#universityExpenseModal"
                                                onClick={() => setSelectedExpense(null)}
                                            >
                                                <i className="bx bx-plus me-1"></i> Add First Expense
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover table-striped">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Category</th>
                                                    <th>Amount</th>
                                                    <th>Due Date</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((expense) => (
                                                    <tr key={expense.uid}>
                                                        <td>
                                                            <div className="fw-bold">{expense.description}</div>
                                                            {expense.payment_reference && (
                                                                <small className="text-muted">Ref: {expense.payment_reference}</small>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-label-info">
                                                                {expense.category_name || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="fw-semibold">
                                                                {expense.currency} {parseFloat(expense.amount).toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {expense.due_date ? formatDate(expense.due_date) : "-"}
                                                        </td>
                                                        <td>
                                                            {expense.is_paid ? (
                                                                <span className="badge bg-success">
                                                                    <i className="bx bx-check me-1"></i>Paid
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-warning">
                                                                    <i className="bx bx-time me-1"></i>Unpaid
                                                                </span>
                                                            )}
                                                            {expense.paid_date && (
                                                                <div className="small text-muted">
                                                                    {formatDate(expense.paid_date)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group btn-group-sm">
                                                                {expense.receipt && (
                                                                    <a
                                                                        href={expense.receipt}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-icon btn-outline-info"
                                                                        title="View Receipt"
                                                                    >
                                                                        <i className="bx bx-file"></i>
                                                                    </a>
                                                                )}
                                                                {hasAccess(user, [["change_universityexpense"]]) && (
                                                                    <button
                                                                        className="btn btn-icon btn-outline-primary"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#universityExpenseModal"
                                                                        onClick={() => setSelectedExpense(expense)}
                                                                        title="Edit"
                                                                    >
                                                                        <i className="bx bx-edit"></i>
                                                                    </button>
                                                                )}
                                                                {hasAccess(user, [["delete_universityexpense"]]) && (
                                                                    <button
                                                                        className="btn btn-icon btn-outline-danger"
                                                                        onClick={() => handleDeleteExpense(expense)}
                                                                        title="Delete"
                                                                    >
                                                                        <i className="bx bx-trash"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <UniversityModal 
                selectedObj={selectedObj} 
                onSuccess={() => {
                    setTableRefresh(prev => prev + 1);
                    setSelectedObj(null);
                }}
                onClose={() => setSelectedObj(null)}
            />

            <UniversityExpenseModal
                selectedObj={selectedExpense}
                universityUid={id}
                onSuccess={() => {
                    fetchExpenses();
                    setSelectedExpense(null);
                }}
                onClose={() => setSelectedExpense(null)}
            />
        </>
    );
};


