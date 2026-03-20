// UniversityCourseCatalog.jsx - View available university courses for lead lancers
import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "animate.css";
import { motion } from "framer-motion";
import axiosInstance from "../../../../api.jsx";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import Swal from "sweetalert2";
import FilterCardShimmer from "../../../../components/loaders/FilterCardShimmer";
import UniversityCourseCatalogShimmer from "../../../../components/loaders/UniversityCourseCatalogShimmer";
import { formatCurrency } from "../../../../utils/formatters.js";

export const UniversityCourseCatalog = () => {
    // Initial form values
    const initialValues = {
        searchQuery: "",
        filterCountry: "",
        filterUniversity: "",
        filterMinFee: "",
        filterMaxFee: "",
        filterDuration: "",
        filterScholarship: "",
        filterCategory: "",
    };

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
    });
    const [currentFilters, setCurrentFilters] = useState(initialValues);
    const [visibleCards, setVisibleCards] = useState(new Set());
    const [loadingMore, setLoadingMore] = useState(false);
    const endObserverTarget = React.useRef(null);

    // Validation schema
    const validationSchema = Yup.object().shape({
        searchQuery: Yup.string(),
        filterCountry: Yup.string(),
        filterUniversity: Yup.string(),
        filterMinFee: Yup.number().nullable().positive(),
        filterMaxFee: Yup.number().nullable().positive(),
        filterDuration: Yup.string(),
        filterScholarship: Yup.string(),
        filterCategory: Yup.string(),
    });

    const fetchCourses = async (page = 1, pageSize = 10, filterValues = initialValues, append = false) => {
        try {
            if (page === 1) setLoading(true);
            // Update current filters
            if (page === 1) setCurrentFilters(filterValues);

            const params = {
                page,
                page_size: pageSize,
            };
            // Only add parameters that have actual values (not null, undefined, or empty string)
            if (filterValues.searchQuery) params.search = filterValues.searchQuery;
            if (filterValues.filterCountry) params.country = filterValues.filterCountry;
            if (filterValues.filterUniversity) params.university = filterValues.filterUniversity;
            if (filterValues.filterMinFee) params.tuition_fee__gte = filterValues.filterMinFee;
            if (filterValues.filterMaxFee) params.tuition_fee__lte = filterValues.filterMaxFee;
            if (filterValues.filterDuration && filterValues.filterDuration !== null) params.duration_months = filterValues.filterDuration;
            if (filterValues.filterScholarship && filterValues.filterScholarship !== "") params.scholarship_available = filterValues.filterScholarship;
            if (filterValues.filterCategory && filterValues.filterCategory !== null) params.course_category = filterValues.filterCategory;

            const response = await axiosInstance.get(
                "api/unisync360-academic/university-courses/",
                { params }
            );

            let courseData = response.data?.results || response.data?.data || response.data || [];

            // Convert object with numeric keys to array
            if (!Array.isArray(courseData) && typeof courseData === 'object') {
                courseData = Object.values(courseData);
            }

            const totalItems = response.data?.count || (Array.isArray(courseData) ? courseData.length : 0);
            
            // Append new courses for infinite scroll, or replace for new filter
            if (append && page > 1) {
                setCourses((prev) => {
                    const newCourses = Array.isArray(courseData) ? courseData : [];
                    const existingIds = new Set(prev.map(c => c.uid));
                    const uniqueNewCourses = newCourses.filter(c => !existingIds.has(c.uid));
                    return [...prev, ...uniqueNewCourses];
                });
            } else {
                setCourses(Array.isArray(courseData) ? courseData : []);
            }
            
            setPagination((prev) => ({
                ...prev,
                currentPage: page,
                pageSize: pageSize,
                totalItems: totalItems,
            }));
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Failed to load courses: ${error.message}`,
            });
            if (!append) setCourses([]);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchCourses();
    }, []);

    // Intersection Observer for scroll animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const courseId = entry.target.getAttribute("data-course-id");
                        setVisibleCards((prev) => new Set(prev).add(courseId));
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: "50px",
            }
        );

        const cards = document.querySelectorAll("[data-course-id]");
        cards.forEach((card) => observer.observe(card));

        return () => {
            cards.forEach((card) => observer.unobserve(card));
        };
    }, [courses]);

    // Infinite scroll observer - load more when near end
    useEffect(() => {
        // Don't set up observer if already loading or if all data is loaded
        const hasMoreData = pagination.currentPage * pagination.pageSize < pagination.totalItems;
        
        if (!hasMoreData || loadingMore || pagination.totalItems === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    const currentHasMore = pagination.currentPage * pagination.pageSize < pagination.totalItems;
                    if (currentHasMore) {
                        setLoadingMore(true);
                        fetchCourses(pagination.currentPage + 1, pagination.pageSize, currentFilters, true).then(() => {
                            setLoadingMore(false);
                        }).catch(() => {
                            setLoadingMore(false);
                        });
                    }
                }
            },
            {
                threshold: 0.1,
            }
        );

        if (endObserverTarget.current) {
            observer.observe(endObserverTarget.current);
        }

        return () => {
            if (endObserverTarget.current) {
                observer.unobserve(endObserverTarget.current);
            }
        };
    }, [pagination, loadingMore, currentFilters]);

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="row mb-4 animate__animated animate__fadeInDown animate__faster">
                <div className="col-12">
                    <h3 className="mb-1">Browse University Courses</h3>
                    <p className="text-muted">Explore available courses from our partner universities</p>
                </div>
            </div>

            {/* Search and Filters */}
            {loading ? (
                <FilterCardShimmer />
            ) : (
            <div className="row mb-4 animate__animated animate__fadeInUp animate__faster">
                <div className="col-12">
                    <div className="card border-0 shadow-sm animate__animated animate__fadeInUp animate__faster" style={{ borderRadius: "12px" }}>
                        <div className="card-body p-3">
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={(values) => {
                                    fetchCourses(1, 10, values);
                                }}
                                enableReinitialize
                            >
                                {({ values, setFieldValue, resetForm, handleSubmit }) => (
                                    <Form onSubmit={handleSubmit}>
                                         {/* Title */}
                                         <div className="mb-3">
                                             <h6 className="mb-1 fw-bold text-dark">
                                                 <i className="bx bx-filter-alt me-2 text-primary"></i>
                                                 Filter Courses
                                             </h6>
                                         </div>

                                         {/* Search Bar */}
                                         <div className="mb-3">
                                             <div className="input-group">
                                                <span className="input-group-text bg-white border-0">
                                                    <i className="bx bx-search text-primary fs-5"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 py-2 small"
                                                    placeholder="Search courses..."
                                                    style={{ backgroundColor: "#f8f9fa" }}
                                                    value={values.searchQuery}
                                                    onChange={(e) => {
                                                        setFieldValue("searchQuery", e.target.value);
                                                        setTimeout(() => {
                                                            fetchCourses(1, 10, { ...values, searchQuery: e.target.value });
                                                        }, 300);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Filters Grid */}
                                        <div className="row">
                                            {/* Location Section */}
                                            <div className="col-12">
                                                <h6 className="text-dark fw-bold mb-2 small d-flex align-items-center">
                                                    <span className="badge bg-primary me-2" style={{ minWidth: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <i className="bx bx-map-pin fs-5"></i>
                                                    </span>
                                                    Location
                                                </h6>
                                            </div>
                                            {/* Country Filter */}
                                            <FormikSelect
                                                name="filterCountry"
                                                label="Country"
                                                url="/countries/"
                                                isFullPath={false}
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Country"
                                                containerClass="col-md-6"
                                                minChars={0}
                                                debounceMs={300}
                                                onSelectObject={(selected) => {
                                                    setFieldValue("filterUniversity", "");
                                                    const updatedValues = { ...values, filterCountry: selected?.value || "" };
                                                    setTimeout(() => {
                                                        fetchCourses(1, 10, updatedValues);
                                                    }, 300);
                                                }}
                                            />

                                            {/* University Filter */}
                                            <FormikSelect
                                                name="filterUniversity"
                                                label="University"
                                                url={values.filterCountry ? "/unisync360-institutions/universities/" : null}
                                                isFullPath={false}
                                                filters={{ country: values.filterCountry, page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="All Universities"
                                                containerClass="col-md-6"
                                                minChars={0}
                                                debounceMs={300}
                                                isReadOnly={!values.filterCountry}
                                                onSelectObject={(selected) => {
                                                    const updatedValues = { ...values, filterUniversity: selected?.value || "" };
                                                    setTimeout(() => {
                                                        fetchCourses(1, 10, updatedValues);
                                                    }, 300);
                                                }}
                                            />

                                            {/* Course Details Section */}
                                            <div className="col-12">
                                                <h6 className="text-dark fw-bold mb-2 small d-flex align-items-center">
                                                    <span className="badge bg-success me-2" style={{ minWidth: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <i className="bx bx-book fs-5"></i>
                                                    </span>
                                                    Course Details
                                                </h6>
                                            </div>
                                            {/* Category Filter */}
                                            <FormikSelect
                                                name="filterCategory"
                                                label="Category"
                                                url="/unisync360-academic/course-categories/"
                                                isFullPath={false}
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="All Categories"
                                                containerClass="col-md-6"
                                                minChars={0}
                                                debounceMs={300}
                                                onSelectObject={(selected) => {
                                                    const updatedValues = { ...values, filterCategory: selected?.value || "" };
                                                    setTimeout(() => {
                                                        fetchCourses(1, 10, updatedValues);
                                                    }, 300);
                                                }}
                                            />

                                            {/* Duration Filter */}
                                            <FormikSelect
                                                name="filterDuration"
                                                label="Duration (Months)"
                                                staticOptions={[
                                                    { uid: "12", name: "12 months" },
                                                    { uid: "24", name: "24 months" },
                                                    { uid: "36", name: "36 months" },
                                                    { uid: "48", name: "48 months (4 years)" },
                                                    { uid: "60", name: "60 months (5 years)" },
                                                ]}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="All Durations"
                                                containerClass="col-md-6"
                                                isClearable
                                                onSelectObject={(selected) => {
                                                    const updatedValues = { ...values, filterDuration: selected?.value || "" };
                                                    setTimeout(() => {
                                                        fetchCourses(1, 10, updatedValues);
                                                    }, 300);
                                                }}
                                            />

                                            {/* Financial Section */}
                                            <div className="col-12">
                                                <h6 className="text-dark fw-bold mb-2 small d-flex align-items-center">
                                                    <span className="badge bg-warning me-2" style={{ minWidth: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <i className="bx bx-dollar fs-5"></i>
                                                    </span>
                                                    Financial
                                                </h6>
                                            </div>
                                            {/* Min Fee */}
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Min Tuition Fee</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="filterMinFee"
                                                    placeholder="Minimum"
                                                    value={values.filterMinFee}
                                                    onChange={(e) => {
                                                        setFieldValue("filterMinFee", e.target.value);
                                                        const updatedValues = { ...values, filterMinFee: e.target.value };
                                                        setTimeout(() => {
                                                            fetchCourses(1, 10, updatedValues);
                                                        }, 300);
                                                    }}
                                                />
                                            </div>

                                            {/* Max Fee */}
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Max Tuition Fee</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="filterMaxFee"
                                                    placeholder="Maximum"
                                                    value={values.filterMaxFee}
                                                    onChange={(e) => {
                                                        setFieldValue("filterMaxFee", e.target.value);
                                                        const updatedValues = { ...values, filterMaxFee: e.target.value };
                                                        setTimeout(() => {
                                                            fetchCourses(1, 10, updatedValues);
                                                        }, 300);
                                                    }}
                                                />
                                            </div>

                                            {/* Scholarship Filter */}
                                            <FormikSelect
                                                name="filterScholarship"
                                                label="Scholarship"
                                                staticOptions={[
                                                    { uid: "true", name: "With Scholarship" },
                                                    { uid: "false", name: "Without Scholarship" },
                                                ]}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="All Courses"
                                                containerClass="col-md-6"
                                                isClearable
                                                onSelectObject={(selected) => {
                                                    const updatedValues = { ...values, filterScholarship: selected?.value || "" };
                                                    setTimeout(() => {
                                                        fetchCourses(1, 10, updatedValues);
                                                    }, 300);
                                                }}
                                            />

                                            {/* Reset Button */}
                                            <div className="col-12 mt-2 pt-2 border-top">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                        resetForm();
                                                        setTimeout(() => {
                                                            fetchCourses(1, 10, initialValues);
                                                        }, 100);
                                                    }}
                                                >
                                                    <i className="bx bx-reset me-2"></i>
                                                    Reset All Filters
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Courses Grid */}
            {loading ? (
                <UniversityCourseCatalogShimmer count={3} />
            ) : courses && Array.isArray(courses) && courses.length > 0 ? (
                <>
                    <div className="row g-4 mb-4">
                         {courses.map((course, index) => (
                             <motion.div
                                 key={course.uid}
                                 className="col-md-6 col-lg-4"
                                 data-course-id={course.uid}
                                 initial={{ opacity: 0, y: 50 }}
                                 animate={
                                     visibleCards.has(course.uid)
                                         ? { opacity: 1, y: 0 }
                                         : { opacity: 0, y: 50 }
                                 }
                                 transition={{ duration: 0.6, ease: "easeOut" }}
                             >
                                 <div className={`card h-100 border-0 shadow-sm course-card ${course.scholarship_available ? "border-primary border-3" : ""}`}>
                                    {course.scholarship_available && (
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <span className="badge bg-primary rounded-circle p-2" title="Scholarship Available">
                                                <i className="bx bx-award text-white" style={{ fontSize: "1.2rem" }}></i>
                                            </span>
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            {course.course_name || course.course?.name || "N/A"}
                                        </h5>
                                        <p className="card-text text-muted mb-2">
                                            <small>
                                                <i className="bx bx-building me-1"></i>
                                                {course.university_name || course.university?.name || "N/A"}
                                            </small>
                                        </p>
                                        <p className="card-text text-muted mb-2">
                                            <small>
                                                <i className="bx bx-world me-1"></i>
                                                {course.country_name || course.university?.country || "N/A"}
                                            </small>
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted">Intake:</small>
                                            <span className="badge bg-primary">
                                                {course.intakes?.length > 0 ? course.intakes[0] : "N/A"}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted">Tuition:</small>
                                            <strong>
                                                {course.tuition_fee
                                                    ? `${formatCurrency(course.tuition_fee)} ${course.currency || ""}`
                                                    : "N/A"}
                                            </strong>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted">Duration:</small>
                                            <span>{course.duration_months ? `${course.duration_months} months` : "N/A"}</span>
                                        </div>
                                        {course.scholarship_available && (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light-primary rounded">
                                                    <small className="text-primary fw-bold">
                                                        <i className="bx bx-award me-1"></i>
                                                        Scholarship:
                                                    </small>
                                                    <strong className="text-primary">
                                                        {course.scholarship_amount
                                                            ? `${formatCurrency(course.scholarship_amount)} ${course.currency || ""}`
                                                            : "Amount TBD"}
                                                    </strong>
                                                </div>
                                                {course.fee_after_scholarship?.parsedValue && (
                                                    <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light-info rounded">
                                                        <small className="text-primary">Fee After:</small>
                                                        <strong className="text-primary">
                                                            {formatCurrency(course.fee_after_scholarship.parsedValue)} {course.currency || ""}
                                                        </strong>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="card-footer bg-light">
                                        <button
                                            className="btn btn-sm btn-primary w-100"
                                            onClick={() => {
                                                Swal.fire({
                                                    icon: "info",
                                                    title: "Course Details",
                                                    html: `
                                                        <div class="text-start">
                                                            <p><strong>Course:</strong> ${course.course_name || course.course?.name || "N/A"}</p>
                                                            <p><strong>University:</strong> ${course.university_name || course.university?.name || "N/A"
                                                        }</p>
                                                            <p><strong>Country:</strong> ${course.country_name || course.university?.country || "N/A"
                                                        }</p>
                                                            <p><strong>Intake:</strong> ${course.intakes?.length > 0 ? course.intakes[0] : "N/A"}</p>
                                                            <p><strong>Tuition:</strong> ${formatCurrency(
                                                            course.tuition_fee || 0
                                                        )} ${course.currency || ""}</p>
                                                            <p><strong>Duration:</strong> ${course.duration_months ? course.duration_months + " months" : "N/A"}</p>
                                                            <p><strong>Scholarship:</strong> ${course.scholarship_available ? "Available - " + (course.scholarship_amount || "Amount TBD") : "Not Available"
                                                        }</p>
                                                        </div>
                                                    `,
                                                    confirmButtonText: "Close",
                                                });
                                            }}
                                        >
                                            <i className="bx bx-show me-1"></i>
                                            View Details
                                        </button>
                                    </div>
                                    </div>
                                    </motion.div>
                                    ))}
                                    </div>

                    {/* Infinite scroll trigger and loading indicator */}
                    <div ref={endObserverTarget} className="row mt-4" style={{ minHeight: "100px" }}>
                        <div className="col-12">
                            {loadingMore && (
                                <div className="text-center py-4 animate__animated animate__fadeIn">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading more courses...</span>
                                    </div>
                                    <p className="text-muted mt-2">Loading more courses...</p>
                                </div>
                            )}
                            {!loadingMore && pagination.currentPage * pagination.pageSize >= pagination.totalItems && courses.length > 0 && (
                                <div className="text-center py-4 text-muted animate__animated animate__fadeIn">
                                    <i className="bx bx-check-circle" style={{ fontSize: "2rem" }}></i>
                                    <p className="mt-2">No more courses to load</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="row animate__animated animate__fadeInUp animate__faster">
                    <div className="col-12">
                        <div className="card animate__animated animate__fadeInUp animate__faster">
                            <div className="card-body text-center py-4">
                                <i className="bx bx-inbox text-muted" style={{ fontSize: "3rem" }}></i>
                                <p className="text-muted mt-2 mb-0">
                                    {currentFilters.searchQuery || currentFilters.filterCountry || currentFilters.filterUniversity
                                        ? "No courses found matching your filters"
                                        : "No courses available"}
                                </p>
                                {(currentFilters.searchQuery || currentFilters.filterCountry || currentFilters.filterUniversity) && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary mt-3"
                                        onClick={() => {
                                            fetchCourses(1, 10, initialValues);
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversityCourseCatalog;
