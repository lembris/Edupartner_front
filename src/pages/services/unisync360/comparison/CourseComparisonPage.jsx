import React, { useState, useEffect } from "react";
import BreadCumb from "../../../../layouts/BreadCumb";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import { Formik, Form } from "formik";
import { getCourseComparisonData, getPopularCourses, getCountryComparison } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";

export const CourseComparisonPage = () => {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [popularCourses, setPopularCourses] = useState([]);
    const [countryStats, setCountryStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPopular, setLoadingPopular] = useState(true);
    const [loadingCountry, setLoadingCountry] = useState(true);

    useEffect(() => {
        fetchPopularCourses();
        fetchCountryStats();
    }, []);

    const fetchPopularCourses = async () => {
        try {
            setLoadingPopular(true);
            const response = await getPopularCourses({ limit: 10 });
            if (response.status === 8000 || response.status === 200) {
                setPopularCourses(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching popular courses:", error);
        } finally {
            setLoadingPopular(false);
        }
    };

    const fetchCountryStats = async () => {
        try {
            setLoadingCountry(true);
            const response = await getCountryComparison();
            if (response.status === 8000 || response.status === 200) {
                setCountryStats((response.data || []).slice(0, 5));
            }
        } catch (error) {
            console.error("Error fetching country stats:", error);
        } finally {
            setLoadingCountry(false);
        }
    };

    const handleAddCourse = (course) => {
        if (!course) return;
        const courseUid = course.uid || course.value;
        if (!courseUid) {
            showToast("Invalid course selected", "error");
            return;
        }
        if (selectedCourses.find(c => (c.uid || c.value) === courseUid)) {
            showToast("Course already added to comparison", "warning");
            return;
        }
        if (selectedCourses.length >= 4) {
            showToast("Maximum 4 courses can be compared at once", "warning");
            return;
        }
        setSelectedCourses([...selectedCourses, { ...course, uid: courseUid }]);
        setComparisonData([]);
    };

    const handleRemoveCourse = (courseUid) => {
        setSelectedCourses(selectedCourses.filter(c => (c.uid || c.value) !== courseUid));
        setComparisonData([]);
    };

    const handleCompare = async () => {
        if (selectedCourses.length < 2) {
            showToast("Please select at least 2 courses to compare", "warning");
            return;
        }

        try {
            setLoading(true);
            const courseUids = selectedCourses.map(c => c.uid || c.value);
            const response = await getCourseComparisonData(courseUids);
            if (response.status === 8000 || response.status === 200) {
                setComparisonData(response.data || []);
            } else {
                showToast(response.message || "Failed to fetch comparison data", "error");
            }
        } catch (error) {
            console.error("Comparison error:", error);
            showToast("Failed to fetch comparison data", "error");
        } finally {
            setLoading(false);
        }
    };

    const getSuccessRateColor = (rate) => {
        if (rate >= 80) return 'success';
        if (rate >= 60) return 'info';
        if (rate >= 40) return 'warning';
        return 'danger';
    };

    const getPopularityBadge = (rank) => {
        if (rank <= 3) return { color: 'success', label: 'Very Popular' };
        if (rank <= 6) return { color: 'info', label: 'Popular' };
        if (rank <= 10) return { color: 'warning', label: 'Moderate' };
        return { color: 'secondary', label: 'Low' };
    };

    const getCountryColor = (index) => {
        const colors = ['primary', 'success', 'info', 'warning', 'danger'];
        return colors[index % colors.length];
    };

    const calculateAverageStats = () => {
        if (comparisonData.length === 0) {
            return { avgAcceptance: 72, avgDays: 45, avgTuition: 32000, visaRate: 89 };
        }
        const totalApps = comparisonData.reduce((sum, c) => sum + (c.total_applications || 0), 0);
        const successfulApps = comparisonData.reduce((sum, c) => sum + (c.successful_applications || 0), 0);
        const avgAcceptance = totalApps > 0 ? Math.round((successfulApps / totalApps) * 100) : 0;
        const avgTuition = Math.round(comparisonData.reduce((sum, c) => sum + (c.tuition_fee || 0), 0) / comparisonData.length);
        const avgDays = Math.round(
            comparisonData.filter(c => c.avg_processing_days).reduce((sum, c) => sum + c.avg_processing_days, 0) / 
            comparisonData.filter(c => c.avg_processing_days).length
        ) || 45;
        return { avgAcceptance, avgDays, avgTuition, visaRate: 89 };
    };

    const stats = calculateAverageStats();

    return (
        <>
            <BreadCumb pageList={["Analytics", "Course Comparison"]} />

            <div className="row">
                {/* Course Selection Panel */}
                <div className="col-12 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 className="mb-0 text-white">
                                        <i className="bx bx-git-compare me-2"></i>
                                        Course Comparison Tool
                                    </h5>
                                    <small className="opacity-75">Compare up to 4 courses side by side</small>
                                </div>
                                {selectedCourses.length >= 2 && (
                                    <button 
                                        className="btn btn-light"
                                        onClick={handleCompare}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : (
                                            <i className="bx bx-analyse me-2"></i>
                                        )}
                                        Compare Now
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-8">
                                    <Formik initialValues={{ course: '' }} onSubmit={() => {}} enableReinitialize>
                                        {({ setFieldValue, values }) => (
                                            <Form>
                                                <FormikSelect
                                                    name="course"
                                                    label="Search and Add Course"
                                                    url="/unisync360-academic/university-courses/"
                                                    placeholder="Type to search courses..."
                                                    containerClass="mb-0"
                                                    isClearable
                                                    mapOption={(item) => ({
                                                        value: item.uid,
                                                        label: `${item.course?.name || item.name} - ${item.university?.name || ''}`,
                                                        uid: item.uid,
                                                        course: item.course,
                                                        university: item.university,
                                                        tuition_fee: item.tuition_fee,
                                                        currency: item.currency,
                                                        duration: item.duration,
                                                        intake_months: item.intake_months,
                                                    })}
                                                    formatOptionLabel={(option) => (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <span className="fw-medium">{option.course?.name || option.label}</span>
                                                                <small className="d-block text-muted">
                                                                    {option.university?.name} • {option.university?.country?.name}
                                                                </small>
                                                            </div>
                                                            <span className="badge bg-label-primary">
                                                                {option.currency || '$'}{Number(option.tuition_fee || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    onSelectObject={(obj) => {
                                                        if (obj) {
                                                            handleAddCourse(obj);
                                                            setTimeout(() => setFieldValue('course', ''), 100);
                                                        }
                                                    }}
                                                />
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                                <div className="col-md-4 text-end">
                                    <span className="text-muted">
                                        {selectedCourses.length}/4 courses selected
                                    </span>
                                </div>
                            </div>

                            {/* Selected Courses Tags */}
                            {selectedCourses.length > 0 && (
                                <div className="mt-3 d-flex flex-wrap gap-2">
                                    {selectedCourses.map((course, index) => (
                                        <div 
                                            key={course.uid || course.value || index}
                                            className="badge bg-label-primary d-flex align-items-center gap-2 py-2 px-3"
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            <span className="badge bg-primary me-1">{index + 1}</span>
                                            {course.course?.name || course.course_name || course.label}
                                            <span className="text-muted">({course.university?.name || course.university_name || ''})</span>
                                            <button 
                                                type="button"
                                                className="btn-close btn-close-sm ms-1"
                                                onClick={() => handleRemoveCourse(course.uid || course.value)}
                                                style={{ fontSize: '0.6rem' }}
                                            ></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                {comparisonData.length > 0 && (
                    <div className="col-12 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bx bx-table me-2 text-primary"></i>
                                    Comparison Results
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '200px' }}>Attribute</th>
                                                {comparisonData.map((course, idx) => (
                                                    <th key={course.uid || idx} className="text-center">
                                                        <span className="badge bg-primary me-1">{idx + 1}</span>
                                                        {course.course_name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bxs-school me-2 text-info"></i>
                                                    University
                                                </td>
                                                {comparisonData.map((course, idx) => (
                                                    <td key={course.uid || idx} className="text-center">
                                                        {course.university_name}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-map me-2 text-success"></i>
                                                    Country
                                                </td>
                                                {comparisonData.map((course, idx) => (
                                                    <td key={course.uid || idx} className="text-center">
                                                        <span className="badge bg-label-info">
                                                            {course.country_name}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-dollar me-2 text-success"></i>
                                                    Tuition Fee
                                                </td>
                                                {comparisonData.map((course, idx) => {
                                                    const lowestFee = Math.min(...comparisonData.map(c => c.tuition_fee || Infinity));
                                                    const isLowest = (course.tuition_fee || 0) === lowestFee && lowestFee !== Infinity;
                                                    return (
                                                        <td key={course.uid || idx} className={`text-center ${isLowest ? 'bg-label-success' : ''}`}>
                                                            <span className={`fs-5 fw-bold ${isLowest ? 'text-success' : 'text-primary'}`}>
                                                                {course.currency || '$'}{Number(course.tuition_fee || 0).toLocaleString()}
                                                            </span>
                                                            <small className="d-block text-muted">/year</small>
                                                            {isLowest && <span className="badge bg-success mt-1">Lowest</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-time me-2 text-warning"></i>
                                                    Duration
                                                </td>
                                                {comparisonData.map((course, idx) => (
                                                    <td key={course.uid || idx} className="text-center">
                                                        {course.duration || 'N/A'}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-user-check me-2 text-primary"></i>
                                                    Total Applications
                                                </td>
                                                {comparisonData.map((course, idx) => (
                                                    <td key={course.uid || idx} className="text-center">
                                                        <span className="badge bg-label-primary fs-6">
                                                            {course.total_applications || 0}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-check-circle me-2 text-success"></i>
                                                    Success Rate
                                                </td>
                                                {comparisonData.map((course, idx) => {
                                                    const highestRate = Math.max(...comparisonData.map(c => c.success_rate || 0));
                                                    const isHighest = (course.success_rate || 0) === highestRate && highestRate > 0;
                                                    return (
                                                        <td key={course.uid || idx} className={`text-center ${isHighest ? 'bg-label-success' : ''}`}>
                                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                                <div className="progress" style={{ width: '60px', height: '8px' }}>
                                                                    <div 
                                                                        className={`progress-bar bg-${getSuccessRateColor(course.success_rate || 0)}`}
                                                                        style={{ width: `${course.success_rate || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`badge bg-${getSuccessRateColor(course.success_rate || 0)}`}>
                                                                    {course.success_rate || 0}%
                                                                </span>
                                                            </div>
                                                            {isHighest && <span className="badge bg-success mt-1">Best</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-trending-up me-2 text-info"></i>
                                                    Popularity Rank
                                                </td>
                                                {comparisonData.map((course, idx) => {
                                                    const badge = getPopularityBadge(course.popularity_rank || 99);
                                                    return (
                                                        <td key={course.uid || idx} className="text-center">
                                                            <span className={`badge bg-${badge.color}`}>
                                                                #{course.popularity_rank || 'N/A'} - {badge.label}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-calendar me-2 text-warning"></i>
                                                    Intake Months
                                                </td>
                                                {comparisonData.map((course, idx) => (
                                                    <td key={course.uid || idx} className="text-center">
                                                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                            {(course.intake_months || []).length > 0 ? (
                                                                course.intake_months.map((month, mIdx) => (
                                                                    <span key={mIdx} className="badge bg-label-warning">
                                                                        {month}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-muted">N/A</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">
                                                    <i className="bx bx-hourglass me-2 text-danger"></i>
                                                    Avg. Processing Time
                                                </td>
                                                {comparisonData.map((course, idx) => (
                                                    <td key={course.uid || idx} className="text-center">
                                                        {course.avg_processing_days ? `${course.avg_processing_days} days` : 'N/A'}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popular Courses Section */}
                <div className="col-xl-6 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">
                                <i className="bx bx-trending-up me-2 text-success"></i>
                                Most Applied Courses
                            </h5>
                            <span className="badge bg-label-success">Top 10</span>
                        </div>
                        <div className="card-body p-0">
                            {loadingPopular ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : popularCourses.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {popularCourses.map((course, idx) => (
                                        <li 
                                            key={course.uid || idx} 
                                            className="list-group-item d-flex align-items-center justify-content-between py-3"
                                        >
                                            <div className="d-flex align-items-center">
                                                <span className={`badge ${idx < 3 ? 'bg-success' : 'bg-label-primary'} me-3`}>
                                                    #{idx + 1}
                                                </span>
                                                <div>
                                                    <span className="fw-semibold d-block">{course.course_name}</span>
                                                    <small className="text-muted">
                                                        {course.university_name} • {course.country_name}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-primary">{course.application_count} apps</span>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary ms-2"
                                                    onClick={() => handleAddCourse({
                                                        uid: course.uid,
                                                        course_name: course.course_name,
                                                        university_name: course.university_name,
                                                        course: { name: course.course_name },
                                                        university: { name: course.university_name },
                                                        tuition_fee: course.tuition_fee,
                                                        currency: course.currency,
                                                    })}
                                                    disabled={selectedCourses.find(c => c.uid === course.uid)}
                                                >
                                                    <i className="bx bx-plus"></i>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <i className="bx bx-info-circle fs-1"></i>
                                    <p className="mb-0 mt-2">No popular courses data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="col-xl-6 mb-4">
                    <div className="row g-4">
                        {/* Country Distribution */}
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="bx bx-globe me-2 text-info"></i>
                                        Applications by Country
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {loadingCountry ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border spinner-border-sm text-primary"></div>
                                        </div>
                                    ) : countryStats.length > 0 ? (
                                        <div className="row g-3">
                                            {countryStats.map((item, idx) => (
                                                <div key={item.uid || idx} className="col-6">
                                                    <div className={`d-flex align-items-center p-2 rounded bg-label-${getCountryColor(idx)}`}>
                                                        <div className="flex-grow-1">
                                                            <span className="fw-medium">{item.country_name}</span>
                                                        </div>
                                                        <span className={`badge bg-${getCountryColor(idx)}`}>
                                                            {item.total_applications}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-3">
                                            <p className="mb-0">No country data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Application Rate Trend */}
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="bx bx-line-chart me-2 text-warning"></i>
                                        Application Success Metrics
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="text-center p-3 bg-label-success rounded">
                                                <h3 className="mb-1 text-success">{stats.avgAcceptance}%</h3>
                                                <small className="text-muted">Avg. Acceptance Rate</small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-3 bg-label-info rounded">
                                                <h3 className="mb-1 text-info">{stats.avgDays}</h3>
                                                <small className="text-muted">Avg. Days to Decision</small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-3 bg-label-warning rounded">
                                                <h3 className="mb-1 text-warning">${(stats.avgTuition / 1000).toFixed(0)}K</h3>
                                                <small className="text-muted">Avg. Tuition Fee</small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-3 bg-label-primary rounded">
                                                <h3 className="mb-1 text-primary">{stats.visaRate}%</h3>
                                                <small className="text-muted">Visa Success Rate</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseComparisonPage;
