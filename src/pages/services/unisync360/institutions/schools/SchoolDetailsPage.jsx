import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import showToast from "../../../../../helpers/ToastHelper";
import ReactLoading from "react-loading";
import "animate.css";
import { useNavigate, useParams } from "react-router-dom";
import BreadCumb from "../../../../../layouts/BreadCumb";
import { useSelector } from "react-redux";
import Chart from "react-apexcharts";
const ReactApexChart = Chart;
import { hasAccess } from "../../../../../hooks/AccessHandler";
import {
    getSchools,
    deleteSchool,
    scrapeNectaSchool,
    getNectaHistory,
    getNectaDetails,
    deleteNectaHistory
} from "./Queries";
import { SchoolModal } from "./SchoolModal";

// Analytics Component
// Displays historical performance trends and metrics
const SchoolNectaAnalytics = ({ history }) => {
    if (!history || history.length === 0) return null;

    // Process data for charts (sort by year ascending)
    const sortedHistory = [...history].sort((a, b) => a.year - b.year);
    const categories = sortedHistory.map(h => h.year);

    // Metrics
    const latestYear = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1] : null;

    if (!latestYear) return null;

    const divI = latestYear.division_breakdown?.I || 0;
    const divII = latestYear.division_breakdown?.II || 0;
    const divIII = latestYear.division_breakdown?.III || 0;
    const divIV = latestYear.division_breakdown?.IV || 0;

    const totalPassed = divI + divII + divIII + divIV;
    const passRate = latestYear.total_candidates ? Math.round((totalPassed / latestYear.total_candidates) * 100) : 0;

    const getLeadingDivision = (breakdown) => {
        if (!breakdown) return "N/A";
        const entries = Object.entries(breakdown).filter(([key]) => ['I', 'II', 'III', 'IV', '0'].includes(key));
        if (entries.length === 0) return "N/A";

        // Find key with max value
        const maxEntry = entries.reduce((max, current) => current[1] > max[1] ? current : max, entries[0]);
        return maxEntry[0] === '0' ? 'Zero' : `Div ${maxEntry[0]}`;
    };

    const leadingDivision = getLeadingDivision(latestYear.division_breakdown);

    // ApexCharts Area Chart for Performance Trends
    const PerformanceTrendChart = () => {
        const series = [
            {
                name: "Division I",
                data: sortedHistory.map(h => {
                    const total = h.total_candidates || 1;
                    return Math.round((h.division_breakdown?.I || 0) / total * 100);
                })
            },
            {
                name: "Division II",
                data: sortedHistory.map(h => {
                    const total = h.total_candidates || 1;
                    return Math.round((h.division_breakdown?.II || 0) / total * 100);
                })
            },
            {
                name: "Division III",
                data: sortedHistory.map(h => {
                    const total = h.total_candidates || 1;
                    return Math.round((h.division_breakdown?.III || 0) / total * 100);
                })
            },
            {
                name: "Division IV",
                data: sortedHistory.map(h => {
                    const total = h.total_candidates || 1;
                    return Math.round((h.division_breakdown?.IV || 0) / total * 100);
                })
            }
        ];

        const options = {
            chart: {
                type: "area",
                stacked: true,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                fontFamily: "Roboto, sans-serif"
            },
            colors: ["#28a745", "#17a2b8", "#ffc107", "#dc3545"],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                width: 2
            },
            fill: {
                type: "gradient",
                gradient: {
                    opacityFrom: 0.45,
                    opacityTo: 0.05
                }
            },
            xaxis: {
                categories: sortedHistory.map(h => h.year),
                title: {
                    text: "Year"
                }
            },
            yaxis: {
                title: {
                    text: "Percentage (%)"
                },
                min: 0,
                max: 100
            },
            tooltip: {
                shared: true,
                intersect: false
            },
            legend: {
                position: "bottom",
                horizontalAlign: "left"
            }
        };

        return (
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={300}
            />
        );
    };

    // Gender Comparison Chart (Simple Bar)
    const GenderChart = () => {
        const genderData = latestYear.gender_breakdown || latestYear.sex_breakdown || { M: 0, F: 0 };
        const m = genderData.M || 0;
        const f = genderData.F || 0;
        const t = m + f;

        if (t === 0) return <div className="text-center text-muted small py-5">No gender data available</div>;

        const mP = Math.round((m / t) * 100);
        const fP = Math.round((f / t) * 100);

        return (
            <div className="w-100">
                <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold text-danger"><i className="bx bx-female"></i> Female</span>
                    <span className="fw-bold text-primary">Male <i className="bx bx-male"></i></span>
                </div>
                <div className="progress mb-2" style={{ height: "25px" }}>
                    <div className="progress-bar bg-danger" style={{ width: `${fP}%` }}>{fP > 10 ? `${fP}%` : ''}</div>
                    <div className="progress-bar bg-primary" style={{ width: `${mP}%` }}>{mP > 10 ? `${mP}%` : ''}</div>
                </div>
                <div className="d-flex justify-content-between small text-muted">
                    <span>{f} Candidates</span>
                    <span>{m} Candidates</span>
                </div>

                {/* Simple Donut representation using CSS conic-gradient if needed, but bar is clearer for comparison */}
                <div className="mt-4 pt-3 border-top">
                    <div className="d-flex align-items-center justify-content-center gap-4">
                        <div className="text-center">
                            <div className="display-6 text-danger fw-bold">{f}</div>
                            <small className="text-muted">Girls</small>
                        </div>
                        <div className="vr"></div>
                        <div className="text-center">
                            <div className="display-6 text-primary fw-bold">{m}</div>
                            <small className="text-muted">Boys</small>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="row g-3 mb-4">
                {/* Pass Rate Card */}
                <div className="col-md-4">
                    <div className="card bg-label-success h-100">
                        <div className="card-body p-3">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="mb-1 text-success">Pass Rate ({latestYear.year})</h6>
                                    <h3 className="mb-0 text-success">{passRate}%</h3>
                                    <small>Div I - IV</small>
                                </div>
                                <div className="avatar bg-white rounded p-2">
                                    <i className="bx bx-check-circle fs-3 text-success"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrollment Card */}
                <div className="col-md-4">
                    <div className="card bg-label-primary h-100">
                        <div className="card-body p-3">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="mb-1 text-primary">Total Candidates</h6>
                                    <h3 className="mb-0 text-primary">{latestYear.total_candidates}</h3>
                                    <small>In {latestYear.year}</small>
                                </div>
                                <div className="avatar bg-white rounded p-2">
                                    <i className="bx bx-group fs-3 text-primary"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leading Division Card */}
                <div className="col-md-4">
                    <div className="card bg-label-info h-100">
                        <div className="card-body p-3">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="mb-1 text-info">Leading Division</h6>
                                    <h3 className="mb-0 text-info">{leadingDivision}</h3>
                                    <small>Most Common Performance</small>
                                </div>
                                <div className="avatar bg-white rounded p-2">
                                    <i className="bx bx-trophy fs-3 text-info"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                {/* Performance Trend Chart */}
                <div className="col-md-8">
                    <div className="card border shadow-none h-100">
                        <div className="card-header p-3 pb-0">
                            <h6 className="card-title mb-0">Performance Trend (Divisions)</h6>
                            <small className="text-muted">Historical distribution of grades over years</small>
                        </div>
                        <div className="card-body px-4 pb-4 pt-4">
                            <PerformanceTrendChart />
                        </div>
                    </div>
                </div>

                {/* Gender Comparison */}
                <div className="col-md-4">
                    <div className="card border shadow-none h-100">
                        <div className="card-header p-3 pb-0">
                            <h6 className="card-title mb-0">Gender Comparison</h6>
                            <small className="text-muted">Distribution in {latestYear.year}</small>
                        </div>
                        <div className="card-body px-4 pb-4 pt-4 d-flex align-items-center">
                            <GenderChart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to calculate Subject Performance from Student Results
const SubjectPerformanceChart = ({ students }) => {
    if (!students || students.length === 0) return null;

    // Extract all subjects and calculate grades
    const subjectStats = {};

    students.forEach(student => {
        if (student.results) {
            Object.entries(student.results).forEach(([subject, grade]) => {
                if (!subjectStats[subject]) {
                    subjectStats[subject] = { A: 0, B: 0, C: 0, D: 0, F: 0, total: 0 };
                }

                // Clean grade (remove +, - for simple grouping if needed, usually NECTA is A, B, C, D, F)
                const cleanGrade = grade.replace('+', '').replace('-', '');

                if (['A', 'B', 'B+', 'C', 'D', 'F'].includes(grade) || ['A', 'B', 'C', 'D', 'F'].includes(cleanGrade)) {
                    const key = cleanGrade === 'B+' ? 'B' : cleanGrade; // Group B+ with B or treat separately
                    // Actually NECTA has A, B+, B, C, D, E, F sometimes. Let's map loosely
                    if (grade === 'A') subjectStats[subject].A++;
                    else if (grade.startsWith('B')) subjectStats[subject].B++;
                    else if (grade === 'C') subjectStats[subject].C++;
                    else if (grade === 'D') subjectStats[subject].D++;
                    else subjectStats[subject].F++;

                    subjectStats[subject].total++;
                }
            });
        }
    });

    // Calculate Pass Rate (A-D) per subject
    const subjectData = Object.entries(subjectStats).map(([subject, stats]) => {
        const passed = stats.A + stats.B + stats.C + stats.D;
        const passRate = stats.total ? Math.round((passed / stats.total) * 100) : 0;
        return { subject, passRate, ...stats };
    }).sort((a, b) => b.passRate - a.passRate).slice(0, 8); // Top 8 subjects

    if (subjectData.length === 0) return null;

    return (
        <div className="mt-4">
            <h6 className="text-muted text-uppercase fs-7 mb-3">Top Subject Performance (Pass Rate)</h6>
            <div className="row g-2">
                {subjectData.map((item, idx) => (
                    <div key={idx} className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                            <div style={{ width: "40px", fontWeight: "bold" }}>{item.subject}</div>
                            <div className="flex-grow-1 mx-2">
                                <div className="progress" style={{ height: "8px" }}>
                                    <div
                                        className={`progress-bar bg-${item.passRate >= 75 ? 'success' : item.passRate >= 50 ? 'info' : 'warning'}`}
                                        style={{ width: `${item.passRate}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-end" style={{ width: "40px" }}><small>{item.passRate}%</small></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper to get Best 3 Balance Subject Combination
const getBestCombination = (results) => {
    if (!results) return "-";

    const excludedSubjects = ['GENERAL STUDIES', 'BASIC APPLIED MATHEMATICS', 'DIVINITY'];
    const gradeWeights = { 'A': 1, 'B+': 2, 'B': 3, 'C': 4, 'D': 5, 'E': 6, 'F': 7, 'S': 8 };

    // Filter and Sort
    const sortedSubjects = Object.entries(results)
        .filter(([subject]) => !excludedSubjects.includes(subject.toUpperCase()))
        .map(([subject, grade]) => ({
            subject: subject.toUpperCase(),
            grade,
            weight: gradeWeights[grade] || 99
        }))
        .sort((a, b) => a.weight - b.weight);

    // Get top 3
    const top3 = sortedSubjects.slice(0, 3).map(s => s.subject);

    if (top3.length < 3) return top3.join("/"); // Not enough subjects

    // Define Combinations (Standard NECTA Subject Names)
    const combinations = {
        "PCM": ["PHYSICS", "CHEMISTRY", "ADVANCED MATHEMATICS"],
        "PCB": ["PHYSICS", "CHEMISTRY", "BIOLOGY"],
        "PGM": ["PHYSICS", "GEOGRAPHY", "ADVANCED MATHEMATICS"],
        "HGL": ["HISTORY", "GEOGRAPHY", "ENGLISH LANGUAGE"],
        "ECA": ["ECONOMICS", "COMMERCE", "ACCOUNTANCY"],
        "HKL": ["HISTORY", "KISWAHILI", "ENGLISH LANGUAGE"],
        "EGM": ["ECONOMICS", "GEOGRAPHY", "ADVANCED MATHEMATICS"],
        "CBG": ["CHEMISTRY", "BIOLOGY", "GEOGRAPHY"],
        "PMC": ["PHYSICS", "ADVANCED MATHEMATICS", "COMPUTER SCIENCE"],
        "HGK": ["HISTORY", "GEOGRAPHY", "KISWAHILI"],
        "HGE": ["HISTORY", "GEOGRAPHY", "ECONOMICS"],
        "CBA": ["CHEMISTRY", "BIOLOGY", "AGRICULTURE"],
        "CBN": ["CHEMISTRY", "BIOLOGY", "FOOD AND HUMAN NUTRITION"],
        "PeBFa": ["PHYSICAL EDUCATION", "BIOLOGY", "FINE ART"],
        "KLF": ["KISWAHILI", "ENGLISH LANGUAGE", "FRENCH LANGUAGE"],
        "KEC": ["KISWAHILI", "ENGLISH LANGUAGE", "CHINESE LANGUAGE"],
        "PeGE": ["PHYSICAL EDUCATION", "GEOGRAPHY", "ECONOMICS"],
        "HKF": ["HISTORY", "KISWAHILI", "FRENCH LANGUAGE"],
        "AHG": ["ARABIC LANGUAGE", "HISTORY", "GEOGRAPHY"],
        "KAR": ["KISWAHILI", "ARABIC LANGUAGE", "ISLAMIC KNOWLEDGE"],
        "KLG": ["KISWAHILI", "ENGLISH LANGUAGE", "GEOGRAPHY"],
        "AKF": ["ARABIC LANGUAGE", "KISWAHILI", "FRENCH LANGUAGE"],
        "AHK": ["ARABIC LANGUAGE", "HISTORY", "KISWAHILI"],
        "AKL": ["ARABIC LANGUAGE", "KISWAHILI", "ENGLISH LANGUAGE"],
        "KLI": ["KISWAHILI", "ENGLISH LANGUAGE", "ISLAMIC KNOWLEDGE"],
        "GKI": ["GEOGRAPHY", "KISWAHILI", "ISLAMIC KNOWLEDGE"],
        "CBM": ["CHEMISTRY", "BIOLOGY", "ADVANCED MATHEMATICS"],
        "HLF": ["HISTORY", "ENGLISH LANGUAGE", "FRENCH LANGUAGE"],
        "PeCB": ["PHYSICAL EDUCATION", "CHEMISTRY", "BIOLOGY"],
        "PcoM": ["PHYSICS", "COMPUTER SCIENCE", "ADVANCED MATHEMATICS"]
    };

    // Check for match (ignoring order)
    for (const [code, subjects] of Object.entries(combinations)) {
        const isMatch = subjects.every(s => top3.includes(s));
        if (isMatch) return code;
    }

    const shortNames = {
        "BASIC MATHEMATICS": "MATH",
        "ADVANCED MATHEMATICS": "ADV MATH",
        "PHYSICS": "PHY",
        "CHEMISTRY": "CHEM",
        "BIOLOGY": "BIO",
        "GEOGRAPHY": "GEO",
        "HISTORY": "HIST",
        "ENGLISH LANGUAGE": "ENG",
        "KISWAHILI": "KIS",
        "CIVICS": "CIV",
        "BOOK KEEPING": "BK",
        "COMMERCE": "COMM",
        "LITERATURE": "LIT",
        "ACCOUNTANCY": "ACC",
        "AGRICULTURE": "AGRI",
        "COMPUTER SCIENCE": "COMP",
        "FOOD AND HUMAN NUTRITION": "FOOD",
        "FINE ART": "ART",
        "FRENCH LANGUAGE": "FRE",
        "CHINESE LANGUAGE": "CHI",
        "ARABIC LANGUAGE": "ARA",
        "ISLAMIC KNOWLEDGE": "ISL",
        "PHYSICAL EDUCATION": "PE",
        "ECONOMICS": "ECO"
    };

    return top3.map(s => shortNames[s] || s.substring(0, 3)).join("/");
};

export const SchoolDetailsPage = () => {
    const [schoolData, setSchoolData] = useState(null);
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const { id } = useParams(); // Router uses :id
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NECTA Scraper State
    const [nectaUrl, setNectaUrl] = useState("");
    const [nectaYear, setNectaYear] = useState(new Date().getFullYear());
    const [nectaExamType, setNectaExamType] = useState("CSEE");
    const [scraping, setScraping] = useState(false);
    const [scrapedData, setScrapedData] = useState(null);
    const [studentSearch, setStudentSearch] = useState("");
    const [nectaHistory, setNectaHistory] = useState([]);

    const generateNectaUrl = (examType, year, regNumber) => {
        if (!regNumber) return "";
        const cleanReg = regNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const examPath = examType.toLowerCase();
        const baseUrl = examType === "ACSEE" 
            ? "https://matokeo.necta.go.tz" 
            : "https://onlinesys.necta.go.tz";
        return `${baseUrl}/results/${year}/${examPath}/results/${cleanReg}.htm`;
    };

    useEffect(() => {
        if (schoolData?.registration_number) {
            setNectaUrl(generateNectaUrl(nectaExamType, nectaYear, schoolData.registration_number));
        }
    }, [nectaExamType, nectaYear, schoolData?.registration_number]);

    const fetchHistory = async () => {
        if (!id) return;
        try {
            const history = await getNectaHistory(id);
            setNectaHistory(history);
        } catch (error) {
            console.error("Failed to load history");
        }
    };

    const handleViewHistory = async (nectaUid) => {
        setLoading(true);
        try {
            const response = await getNectaDetails(nectaUid);
            const historyData = response.data;

            // Validate: Check if scraped data belongs to the currently opened school
            if (historyData.school_name && schoolData?.name && 
                historyData.school_name.toLowerCase().trim() !== schoolData.name.toLowerCase().trim()) {
                showToast(
                    `⚠️ School Mismatch: Data is from "${historyData.school_name}" but you're viewing "${schoolData.name}"`,
                    "warning"
                );
            }

            setScrapedData(historyData);
            // Smooth scroll to results
            window.scrollTo({ top: 500, behavior: 'smooth' });
        } catch (error) {
            showToast("Failed to load details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHistory = async (nectaUid) => {
        const confirmation = await Swal.fire({
            title: "Are you sure?",
            text: "This will delete these scraped results permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirmation.isConfirmed) {
            try {
                await deleteNectaHistory(nectaUid);
                showToast("Results deleted successfully", "success");
                // If we deleted the currently viewed data, clear it
                if (scrapedData?.uid === nectaUid) {
                    setScrapedData(null);
                }
                fetchHistory();
            } catch (error) {
                showToast("Failed to delete results", "error");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "necta") {
            fetchHistory();
        }
    }, [activeTab, id]);

    const handleScrape = async (e) => {
        e.preventDefault();
        if (!nectaUrl) return showToast("Please enter a URL", "warning");

        setScraping(true);
        setScrapedData(null);
        try {
            const response = await scrapeNectaSchool({
                url: nectaUrl,
                year: nectaYear,
                exam_type: nectaExamType,
                school_uid: id
            });
            setScrapedData(response.data);
            fetchHistory(); // Refresh history
            showToast("Scraping Successful!", "success");
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.error || "Scraping Failed", "error");
        } finally {
            setScraping(false);
        }
    };

    // Filter students based on search
    const filteredStudents = scrapedData?.students?.filter(student =>
        student.candidate_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.division.toLowerCase().includes(studentSearch.toLowerCase())
    ) || [];

    const handleFetchSchool = async () => {
        setLoading(true);
        setError(null);
        setScrapedData(null); // Clear previous school's scraped data
        setNectaHistory([]); // Clear previous school's history
        setStudentSearch(""); // Clear search filter
        try {
            const response = await getSchools({ uid: id });
            let data = response;

            // Unwrap standardized response format if present (e.g. { status: 200, data: {...} })
            if (data && data.data && !data.uid) {
                data = data.data;
            }

            if (data) {
                // If the API returns an array, pick the first element
                const detailData = Array.isArray(data) ? data[0] : data;
                setSchoolData(detailData);
            } else {
                setError(true);
                showToast("School Not Found", "warning");
            }
        } catch (err) {
            console.error("Error fetching school:", err);
            setError(true);
            showToast("Unable to Fetch School Details", "warning");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!schoolData) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "You're about to delete this school. This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteSchool(schoolData.uid);
                Swal.fire(
                    "Deleted!",
                    "The School has been deleted.",
                    "success"
                );
                navigate("/unisync360/institutions/schools");
            }
        } catch (error) {
            console.error("Error deleting School:", error);
            Swal.fire(
                "Error",
                "Unable to delete. Please try again or contact support.",
                "error"
            );
        }
    };

    useEffect(() => {
        handleFetchSchool();
    }, [id, tableRefresh]);

    if (loading) {
        return (
            <>
                <BreadCumb pageList={["Schools", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <center>
                            <ReactLoading type={"cylon"} color={"#696cff"} height={"30px"} width={"50px"} />
                            <h6 className="text-muted mt-2">Loading School Details...</h6>
                        </center>
                    </div>
                </div>
            </>
        );
    }

    if (error || !schoolData) {
        return (
            <>
                <BreadCumb pageList={["Schools", "View"]} />
                <div className="card">
                    <div className="card-body">
                        <div className="alert alert-danger" role="alert">
                            <div className="alert-body text-center">
                                <p className="mb-0">
                                    Sorry! Unable to get School Details. Please Contact System Administrator
                                </p>
                                <button
                                    className="btn btn-primary btn-sm mt-3"
                                    onClick={() => navigate("/unisync360/institutions/schools")}
                                >
                                    <i className="bx bx-arrow-back me-1"></i> Back to Schools List
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
            <BreadCumb pageList={["Schools", schoolData?.name || "View"]} />

            {/* Header Card */}
            <div className="card mb-4 shadow-sm animate__animated animate__fadeInDown animate__faster">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <div className="d-flex align-items-start">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-xl me-3">
                                        {schoolData?.logo ? (
                                            <img
                                                src={schoolData.logo}
                                                alt="School Logo"
                                                className="rounded"
                                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                            />
                                        ) : (
                                            <span className="avatar-initial rounded bg-label-primary">
                                                <i className="bx bxs-school bx-lg"></i>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <h4 className="mb-1 fw-bold">
                                        {schoolData.name}
                                    </h4>
                                    <p className="mb-2 text-muted">
                                        {schoolData.city && `${schoolData.city}, `}
                                        {schoolData.country_name || schoolData.country?.name || "Unknown Country"}
                                    </p>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <span className={`badge bg-${schoolData.is_active ? "success" : "danger"}`}>
                                            {schoolData.is_active ? "Active" : "Inactive"}
                                        </span>
                                        {schoolData.ownership && (
                                            <span className="badge bg-info text-capitalize">
                                                {schoolData.ownership}
                                            </span>
                                        )}
                                        {schoolData.level && (
                                            <span className="badge bg-primary text-capitalize">
                                                {schoolData.level?.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                        {schoolData.sex_orientation && (
                                            <span className="badge bg-secondary text-capitalize">
                                                {schoolData.sex_orientation?.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                        {schoolData.location && (
                                            <span className="badge bg-dark text-capitalize">
                                                {schoolData.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            {hasAccess(user, [["change_school"]]) && (
                                <button
                                    className="btn btn-primary btn-sm me-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#schoolModal"
                                    onClick={() => setSelectedObj(schoolData)}
                                >
                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                </button>
                            )}
                            {hasAccess(user, [["delete_school"]]) && (
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleDelete}
                                >
                                    <i className="bx bx-trash me-1"></i> Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="card-footer p-0">
                    <ul className="nav nav-tabs nav-fill" role="tablist">
                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <i className="bx bx-info-circle me-1"></i> Overview
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link ${activeTab === "necta" ? "active" : ""}`}
                                onClick={() => setActiveTab("necta")}
                            >
                                <i className="bx bx-data me-1"></i> NECTA Data
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content p-0">

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h5 className="card-title mb-0">General Information</h5>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="fw-medium" style={{ width: "35%" }}>Reg. Number:</td>
                                                    <td>{schoolData.registration_number || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-medium">Reg. Year:</td>
                                                    <td>{schoolData.registration_year || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-medium">Region:</td>
                                                    <td>{schoolData.region?.name || schoolData.region_name || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-medium">District:</td>
                                                    <td>{schoolData.district?.name || schoolData.district_name || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-medium">Accommodation:</td>
                                                    <td className="text-capitalize">{schoolData.accommodation?.replace(/_/g, ' ') || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-medium">School Bias:</td>
                                                    <td className="text-capitalize">{schoolData.school_bias || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-medium">Email:</td>
                                                    <td>
                                                        {schoolData.email ? (
                                                            <a href={`mailto:${schoolData.email}`}>{schoolData.email}</a>
                                                        ) : "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-medium">Phone:</td>
                                                    <td>{schoolData.phone || "-"}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h5 className="card-title mb-0">Statistics & Location</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row mb-4">
                                            <div className="col-6">
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-sm rounded bg-label-primary me-2 p-1">
                                                        <i className="bx bx-user fs-4"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{schoolData.total_students ? schoolData.total_students.toLocaleString() : "0"}</h6>
                                                        <small className="text-muted">Students</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-sm rounded bg-label-success me-2 p-1">
                                                        <i className="bx bx-group fs-4"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{schoolData.total_teachers ? schoolData.total_teachers.toLocaleString() : "0"}</h6>
                                                        <small className="text-muted">Teachers</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {schoolData.address && (
                                            <div className="mt-3">
                                                <h6 className="fw-semibold">Address</h6>
                                                <p className="mb-1 text-muted">
                                                    <i className="bx bx-map me-1"></i>
                                                    {schoolData.address}
                                                </p>
                                                {schoolData.latitude && schoolData.longitude && (
                                                    <small className="text-primary">
                                                        <i className="bx bx-current-location me-1"></i>
                                                        {schoolData.latitude}, {schoolData.longitude}
                                                    </small>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Facilities Section */}
                        {schoolData.facilities && Object.keys(schoolData.facilities).length > 0 && (
                            <div className="row">
                                <div className="col-12 mb-4">
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="card-title mb-0">
                                                <i className="bx bx-building-house me-2"></i>
                                                Facilities
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                {Object.entries(schoolData.facilities).map(([key, value]) => (
                                                    <div key={key} className="col-md-3 col-sm-6">
                                                        <div className="d-flex align-items-center p-2 border rounded">
                                                            <div className="avatar avatar-sm rounded bg-label-info me-2">
                                                                <i className="bx bx-check fs-5"></i>
                                                            </div>
                                                            <div>
                                                                <span className="text-capitalize fw-medium">
                                                                    {key.replace(/_/g, ' ')}
                                                                </span>
                                                                {typeof value === 'number' && (
                                                                    <small className="d-block text-muted">{value} available</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* NECTA Tab */}
                {activeTab === "necta" && (
                    <div className="animate__animated animate__fadeIn animate__faster">
                        <div className="row">
                            {/* Scraper Form & Basic Analysis */}
                            <div className="col-md-4 mb-4">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h5 className="card-title mb-0">Scrape NECTA Results</h5>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleScrape}>
                                            <div className="mb-3">
                                                 <label className="form-label">Exam Type</label>
                                                 <select
                                                     className="form-select"
                                                     value={nectaExamType}
                                                     onChange={(e) => {
                                                         setNectaExamType(e.target.value);
                                                         // Auto-fill URL when CSEE 2025 is selected
                                                         if (e.target.value === "CSEE" && nectaYear === 2025) {
                                                             setNectaUrl("https://matokeo.necta.go.tz");
                                                         }
                                                     }}
                                                 >
                                                     <option value="CSEE">CSEE (Form 4)</option>
                                                     <option value="ACSEE">ACSEE (Form 6)</option>
                                                 </select>
                                                 </div>
                                                 <div className="mb-3">
                                                 <label className="form-label">Year</label>
                                                 <input
                                                     type="number"
                                                     className="form-control"
                                                     value={nectaYear}
                                                     onChange={(e) => {
                                                         setNectaYear(e.target.value);
                                                         // Auto-fill URL when year is set to 2025 and exam is CSEE
                                                         if (nectaExamType === "CSEE" && e.target.value === 2025) {
                                                             setNectaUrl("https://matokeo.necta.go.tz");
                                                         }
                                                     }}
                                                     min="2000"
                                                     max={new Date().getFullYear()}
                                                 />
                                                 </div>
                                                 <div className="mb-3">
                                                 <label className="form-label">Result Page URL</label>
                                                 <input
                                                     type="url"
                                                     className="form-control"
                                                     value={nectaUrl}
                                                     onChange={(e) => setNectaUrl(e.target.value)}
                                                     placeholder="https://matokeo.necta.go.tz"
                                                     required
                                                 />
                                                 <div className="form-text">
                                                     {nectaExamType === "CSEE" && nectaYear === 2025 ? (
                                                         <span className="text-info">
                                                             <i className="bx bx-info-circle me-1"></i>
                                                             Auto-filled for 2025 CSEE
                                                         </span>
                                                     ) : schoolData?.registration_number ? (
                                                         <span className="text-success">
                                                             <i className="bx bx-check-circle me-1"></i>
                                                             Auto-generated from Reg# {schoolData.registration_number}
                                                         </span>
                                                     ) : (
                                                         "Paste the direct link to the school's result page"
                                                     )}
                                                 </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100"
                                                disabled={scraping}
                                            >
                                                {scraping ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                        Scraping...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bx bx-cloud-download me-1"></i> Start Scraper Agent
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Results Analysis */}
                            <div className="col-md-8 mb-4">
                                <div className="card h-100">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">Result Analysis</h5>
                                        <div className="d-flex gap-2">
                                            {scrapedData && schoolData?.name && 
                                             scrapedData.school_name?.toLowerCase().trim() !== schoolData.name.toLowerCase().trim() && (
                                                <span className="badge bg-warning text-dark" title="This data belongs to a different school">
                                                    <i className="bx bx-alert-triangle me-1"></i>School Mismatch
                                                </span>
                                            )}
                                            {scrapedData && <span className="badge bg-success">Latest Fetch</span>}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {scrapedData ? (
                                            <div>
                                                <div className="row mb-4">
                                                    <div className="col-md-6">
                                                        <h6 className="text-muted text-uppercase fs-7">School Info</h6>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <div className="avatar avatar-sm bg-label-primary rounded p-1 me-2">
                                                                <i className="bx bxs-school"></i>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0">{scrapedData.school_name}</h6>
                                                                <small>{scrapedData.center_number}</small>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-sm bg-label-info rounded p-1 me-2">
                                                                <i className="bx bx-user-voice"></i>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0">{scrapedData.total_candidates}</h6>
                                                                <small>Total Candidates</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 text-md-end">
                                                        <h6 className="text-muted text-uppercase fs-7">Performance</h6>
                                                        <div className="display-6 text-primary fw-bold mb-0">
                                                            {(() => {
                                                                if (!scrapedData.division_breakdown) return "N/A";
                                                                const entries = Object.entries(scrapedData.division_breakdown).filter(([key]) => ['I', 'II', 'III', 'IV', '0'].includes(key));
                                                                if (entries.length === 0) return "N/A";
                                                                const maxEntry = entries.reduce((max, current) => current[1] > max[1] ? current : max, entries[0]);
                                                                return maxEntry[0] === '0' ? 'Fail' : `Div ${maxEntry[0]}`;
                                                            })()}
                                                        </div>
                                                        <small className="text-muted">Leading Division</small>
                                                    </div>
                                                </div>

                                                <hr className="my-3" />

                                                <h6 className="text-muted text-uppercase fs-7 mb-3">Division Breakdown</h6>
                                                <div className="row g-2 text-center">
                                                    {[
                                                        { label: "Div I", value: scrapedData.division_breakdown.I, color: "success" },
                                                        { label: "Div II", value: scrapedData.division_breakdown.II, color: "info" },
                                                        { label: "Div III", value: scrapedData.division_breakdown.III, color: "warning" },
                                                        { label: "Div IV", value: scrapedData.division_breakdown.IV, color: "danger" },
                                                        { label: "Div 0", value: scrapedData.division_breakdown['0'], color: "secondary" },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="col">
                                                            <div className={`p-2 rounded bg-label-${item.color}`}>
                                                                <div className="fw-bold fs-5">{item.value}</div>
                                                                <small>{item.label}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Subject Performance Analysis */}
                                                <SubjectPerformanceChart students={scrapedData.students} />
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                {nectaHistory && nectaHistory.length > 0 ? (
                                                    <SchoolNectaAnalytics history={nectaHistory} />
                                                ) : (
                                                    <>
                                                        <div className="avatar avatar-xl bg-label-secondary rounded-circle mb-3 mx-auto">
                                                            <i className="bx bx-bar-chart-alt-2 fs-1"></i>
                                                        </div>
                                                        <h5>No Data Available</h5>
                                                        <p>Run the scraper to view analytics and results.</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* History Table */}
                            <div className="col-12 mb-4">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="card-title mb-0">Scraping History</h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Exam</th>
                                                    <th>Year</th>
                                                    <th>Divisions</th>
                                                    <th>Candidates</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {nectaHistory.length > 0 ? (
                                                    nectaHistory.map((item) => (
                                                        <tr key={item.uid}>
                                                            <td><span className="badge bg-label-primary">{item.exam_type}</span></td>
                                                            <td>{item.year}</td>
                                                            <td>
                                                                <div className="d-flex gap-2 text-xs">
                                                                    <span className="text-success fw-bold">I: {item.division_breakdown.I}</span>
                                                                    <span className="text-info fw-bold">II: {item.division_breakdown.II}</span>
                                                                    <span className="text-warning fw-bold">III: {item.division_breakdown.III}</span>
                                                                    <span className="text-danger fw-bold">IV: {item.division_breakdown.IV}</span>
                                                                    <span className="text-secondary fw-bold">0: {item.division_breakdown['0']}</span>
                                                                </div>
                                                            </td>
                                                            <td>{item.total_candidates}</td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn btn-xs btn-outline-primary"
                                                                        onClick={() => handleViewHistory(item.uid)}
                                                                        title="View Details"
                                                                    >
                                                                        <i className="bx bx-show"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-xs btn-outline-danger"
                                                                        onClick={() => handleDeleteHistory(item.uid)}
                                                                        title="Delete"
                                                                    >
                                                                        <i className="bx bx-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-muted py-3">
                                                            No scraping history found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Full Width Student Results */}
                            {scrapedData && scrapedData.students && (
                                <div className="col-12 mb-4">
                                    <div className="card">
                                        <div className="card-header border-bottom d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="card-title mb-0">Student Results</h5>
                                                <small className="text-muted">Detailed list of all candidates</small>
                                            </div>
                                            <div style={{ width: "250px" }}>
                                                <div className="input-group input-group-merge">
                                                    <span className="input-group-text" id="basic-addon-search31"><i className="bx bx-search"></i></span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search Candidate..."
                                                        value={studentSearch}
                                                        onChange={(e) => setStudentSearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive text-nowrap" style={{ maxHeight: "600px" }}>
                                            <table className="table table-hover table-striped">
                                                <thead className="table-light sticky-top">
                                                    <tr>
                                                        <th>Candidate No</th>
                                                        <th>Sex</th>
                                                        <th>Div</th>
                                                        <th>Points</th>
                                                        <th>Best 3 Comb.</th>
                                                        <th>Subject Grades</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredStudents.length > 0 ? (
                                                        filteredStudents.map((student, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    <span className="fw-bold text-primary">{student.candidate_number}</span>
                                                                </td>
                                                                <td>{student.sex}</td>
                                                                <td>
                                                                    <span className={`badge bg-${student.division === 'I' ? 'success' :
                                                                            student.division === 'II' ? 'info' :
                                                                                student.division === 'III' ? 'warning' :
                                                                                    student.division === 'IV' ? 'danger' : 'secondary'
                                                                        } rounded-pill`}>
                                                                        {student.division}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="fw-semibold">{student.points || "-"}</span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-label-primary">{getBestCombination(student.results)}</span>
                                                                </td>
                                                                <td style={{ whiteSpace: "normal" }}>
                                                                    <div className="d-flex flex-wrap gap-1">
                                                                        {Object.entries(student.results).map(([subject, grade], i) => (
                                                                            <span key={i} className="badge bg-label-dark border" style={{ fontWeight: "normal" }}>
                                                                                <span className="opacity-75">{subject}:</span> <b>{grade}</b>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center py-5">
                                                                <div className="text-muted">No students found matching "{studentSearch}"</div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="card-footer border-top">
                                            <small className="text-muted">Showing {filteredStudents.length} of {scrapedData.students.length} students</small>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SchoolModal
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
