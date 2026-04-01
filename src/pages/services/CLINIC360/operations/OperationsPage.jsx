import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";
import BreadCumb from "../../../../layouts/BreadCumb";
import { PatientModal } from "../patients/PatientModal";
import { VisitModal } from "../visits/VisitModal";
import { VitalsModal } from "../vitals/VitalsModal";
import { ConsultationModal } from "../clinical/ConsultationModal";
import { DiagnosisModal } from "../clinical/DiagnosisModal";
import { LabOrderModal } from "../clinical/LabOrderModal";
import { PrescriptionModal } from "../clinical/PrescriptionModal";
import { PaymentModal } from "../clinical/PaymentModal";
import { LabResultsModal } from "../clinical/LabResultsModal";
import { VisitSummaryModal } from "../clinical/VisitSummaryModal";
import { getPatients, getVisits, getConsultations } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

const WORKFLOW_STEPS = [
    { key: "patient", label: "Patient", icon: "bx bx-user-plus", color: "#696cff" },
    { key: "visit", label: "Visit", icon: "bx bx-calendar-plus", color: "#03c3ec" },
    { key: "vitals", label: "Vitals", icon: "bx bx-heart", color: "#ff3e1d" },
    { key: "consultation", label: "Consultation", icon: "bx bx-message-square", color: "#71dd37" },
    { key: "clinical", label: "Diagnosis / Lab / Rx", icon: "bx bx-clipboard", color: "#ffab00" },
];

export const OperationsPage = () => {
    const user = useSelector((state) => state.userReducer?.data);
    const navigate = useNavigate();

    // Search & data
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [todayVisits, setTodayVisits] = useState([]);
    const [loadingVisits, setLoadingVisits] = useState(true);
    const searchTimeoutRef = useRef(null);

    // Selected context — the core of the workflow
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    // Modal states
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [showConsultationModal, setShowConsultationModal] = useState(false);
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
    const [showLabOrderModal, setShowLabOrderModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showLabResultsModal, setShowLabResultsModal] = useState(false);
    const [showVisitSummaryModal, setShowVisitSummaryModal] = useState(false);

    // Patient visits for selected patient
    const [patientVisits, setPatientVisits] = useState([]);
    const [loadingPatientVisits, setLoadingPatientVisits] = useState(false);

    // Visit consultations
    const [visitConsultations, setVisitConsultations] = useState([]);
    const [loadingConsultations, setLoadingConsultations] = useState(false);

    // Load today's visits on mount
    useEffect(() => {
        loadTodayVisits();
    }, []);

    const loadTodayVisits = async () => {
        try {
            setLoadingVisits(true);
            const today = new Date().toISOString().split("T")[0];
            // Backend expects an explicit `visit_date` query param for visit_date filtering.
            const result = await getVisits({ pagination: { visit_date: today } });
            if (result?.status === 8000) {
                const visits = result.data?.results || result.data || [];
                setTodayVisits(Array.isArray(visits) ? visits : []);
            }
        } catch (err) {
            console.error("Failed to load today's visits:", err);
        } finally {
            setLoadingVisits(false);
        }
    };

    // Patient search with debounce
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!term || term.length < 2) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await getPatients({ search: term });
                if (result?.status === 8000) {
                    const patients = result.data?.results || result.data || [];
                    setSearchResults(Array.isArray(patients) ? patients : []);
                }
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setSearching(false);
            }
        }, 400);
    }, []);

    // When a patient is selected, load their visits
    const selectPatient = async (patient) => {
        setSelectedPatient(patient);
        setSelectedVisit(null);
        setSelectedConsultation(null);
        setCurrentStep(1);
        setSearchTerm("");
        setSearchResults([]);

        setLoadingPatientVisits(true);
        try {
            const result = await getVisits({
                // Prefer patient_id, but fall back to phone/uid to prevent empty results after refresh.
                search: patient.patient_id || patient.phone || patient.uid,
            });
            if (result?.status === 8000) {
                const visits = result.data?.results || result.data || [];
                const safeVisits = Array.isArray(visits) ? visits : [];
                setPatientVisits(safeVisits);

                // If a visit for "today" already exists, pick it automatically.
                // This avoids forcing staff to create a duplicate visit after refresh.
                const today = new Date().toISOString().split("T")[0];
                const todayVisits = safeVisits.filter(
                    (v) => (v.visit_date || "").toString().slice(0, 10) === today
                );

                const preferredTodayVisit =
                    todayVisits.find((v) => !["COMPLETED", "CANCELLED"].includes(v.status)) ||
                    todayVisits[0] ||
                    null;

                if (preferredTodayVisit) {
                    setSelectedVisit(preferredTodayVisit);
                    setCurrentStep(2);
                    setLoadingConsultations(true);
                    getConsultations({ search: preferredTodayVisit.uid })
                        .then((result) => {
                            if (result?.status === 8000) {
                                const consultations = result.data?.results || result.data || [];
                                setVisitConsultations(Array.isArray(consultations) ? consultations : []);
                            }
                        })
                        .catch(() => {})
                        .finally(() => setLoadingConsultations(false));
                }
            }
        } catch (err) {
            console.error("Failed to load patient visits:", err);
        } finally {
            setLoadingPatientVisits(false);
        }
    };

    // When a visit is selected, load its consultations
    const selectVisit = async (visit) => {
        setSelectedVisit(visit);
        setSelectedConsultation(null);
        setCurrentStep(2);

        setLoadingConsultations(true);
        try {
            const result = await getConsultations({ search: visit.uid });
            if (result?.status === 8000) {
                const consultations = result.data?.results || result.data || [];
                setVisitConsultations(Array.isArray(consultations) ? consultations : []);
            }
        } catch (err) {
            console.error("Failed to load consultations:", err);
        } finally {
            setLoadingConsultations(false);
        }
    };

    const selectConsultation = (consultation) => {
        setSelectedConsultation(consultation);
        setCurrentStep(4);
    };

    // Reset the entire workflow
    const resetWorkflow = () => {
        setSelectedPatient(null);
        setSelectedVisit(null);
        setSelectedConsultation(null);
        setCurrentStep(0);
        setPatientVisits([]);
        setVisitConsultations([]);
    };

    // Select patient from a today's visit row
    const selectFromTodayVisit = (visit) => {
        const patient = {
            uid: visit.patient_uid || visit.patient?.uid || visit.patient,
            first_name: visit.patient_name?.split(" ")[0] || visit.patient_first_name || "",
            last_name: visit.patient_name?.split(" ").slice(1).join(" ") || visit.patient_last_name || "",
            patient_id: visit.patient_id || visit.patient_patient_id || "",
            patient_name: visit.patient_name || `${visit.patient_first_name || ""} ${visit.patient_last_name || ""}`.trim(),
        };
        setSelectedPatient(patient);
        setSelectedVisit(visit);
        setSelectedConsultation(null);
        setCurrentStep(2);
        setPatientVisits([visit]);
        setVisitConsultations([]);

        // Load consultations for this visit
        setLoadingConsultations(true);
        getConsultations({ search: visit.uid })
            .then((result) => {
                if (result?.status === 8000) {
                    const consultations = result.data?.results || result.data || [];
                    setVisitConsultations(Array.isArray(consultations) ? consultations : []);
                }
            })
            .catch(() => {})
            .finally(() => setLoadingConsultations(false));
    };

    // Callback handlers for modal success flows
    const handlePatientCreated = () => {
        loadTodayVisits();
    };

    const handlePatientCreatedWithVisit = (patient) => {
        setSelectedPatient(patient);
        setCurrentStep(1);
        setShowPatientModal(false);
        setShowVisitModal(true);
    };

    const handleVisitCreated = (visit) => {
        if (visit) {
            setSelectedVisit(visit);
            setCurrentStep(2);
        }
        loadTodayVisits();
    };

    const handleVitalsRecorded = () => {
        setCurrentStep(3);
    };

    const handleConsultationSaved = (consultationData) => {
        if (consultationData?.uid) {
            setSelectedConsultation(consultationData);
            setCurrentStep(4);
        }
        if (selectedVisit) {
            getConsultations({ search: selectedVisit.uid })
                .then((result) => {
                    if (result?.status === 8000) {
                        const consultations = result.data?.results || result.data || [];
                        setVisitConsultations(Array.isArray(consultations) ? consultations : []);
                    }
                })
                .catch(() => {});
        }
    };

    const patientName = selectedPatient
        ? (selectedPatient.patient_name || `${selectedPatient.first_name || ""} ${selectedPatient.last_name || ""}`.trim())
        : "";

    return (
        <>
            <BreadCumb pageList={["CLINIC360", "Operations"]} />

            <div className="container-fluid px-3">
                {/* Workflow Progress Indicator */}
                <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-body py-3 px-4">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bx bx-briefcase text-primary fs-4"></i>
                                <h5 className="mb-0 fw-bold">Patient Operations Workflow</h5>
                            </div>
                            {selectedPatient && (
                                <button className="btn btn-outline-secondary btn-sm" onClick={resetWorkflow}>
                                    <i className="bx bx-reset me-1"></i> New Workflow
                                </button>
                            )}
                        </div>

                        {/* Step Indicator */}
                        <div className="d-flex align-items-center mt-3 overflow-auto pb-2">
                            {WORKFLOW_STEPS.map((step, idx) => (
                                <React.Fragment key={step.key}>
                                    <div
                                        className="d-flex flex-column align-items-center text-center flex-shrink-0"
                                        style={{ minWidth: "90px", cursor: idx <= currentStep ? "pointer" : "default", opacity: idx <= currentStep ? 1 : 0.4 }}
                                        onClick={() => {
                                            if (idx <= currentStep) setCurrentStep(idx);
                                        }}
                                    >
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center mb-1"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: idx <= currentStep ? step.color : "#e9ecef",
                                                color: idx <= currentStep ? "#fff" : "#adb5bd",
                                                transition: "all 0.3s ease",
                                            }}
                                        >
                                            {idx < currentStep ? (
                                                <i className="bx bx-check fs-5"></i>
                                            ) : (
                                                <i className={`${step.icon}`} style={{ fontSize: "18px" }}></i>
                                            )}
                                        </div>
                                        <small className="fw-medium" style={{ fontSize: "0.7rem", color: idx <= currentStep ? step.color : "#adb5bd" }}>
                                            {step.label}
                                        </small>
                                    </div>
                                    {idx < WORKFLOW_STEPS.length - 1 && (
                                        <div
                                            className="flex-grow-1 mx-1"
                                            style={{
                                                height: "2px",
                                                backgroundColor: idx < currentStep ? WORKFLOW_STEPS[idx + 1].color : "#e9ecef",
                                                minWidth: "20px",
                                                transition: "all 0.3s ease",
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Selected Context Summary */}
                        {selectedPatient && (
                            <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top">
                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                                    <i className="bx bx-user me-1"></i>
                                    {patientName}
                                    {selectedPatient.patient_id && <span className="ms-1 opacity-75">({selectedPatient.patient_id})</span>}
                                </span>
                                {selectedVisit && (
                                    <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                                        <i className="bx bx-calendar me-1"></i>
                                        Visit: {selectedVisit.visit_number || selectedVisit.uid?.substring(0, 8)}
                                        {selectedVisit.visit_type && <span className="ms-1">({selectedVisit.visit_type})</span>}
                                    </span>
                                )}
                                {selectedConsultation && (
                                    <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                                        <i className="bx bx-message-square me-1"></i>
                                        Consultation Active
                                    </span>
                                )}
                                {selectedVisit && (
                                    <button
                                        className="btn btn-sm btn-outline-primary ms-2"
                                        onClick={() => setShowVisitSummaryModal(true)}
                                        title="View Complete Visit Summary"
                                    >
                                        <i className="bx bx-file me-1"></i>
                                        View Summary
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="row g-4">
                    {/* LEFT COLUMN: Search & Quick Actions */}
                    <div className="col-lg-5">
                        {/* Patient Search */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-transparent d-flex align-items-center justify-content-between py-3">
                                <h6 className="mb-0 fw-bold">
                                    <i className="bx bx-search me-2 text-primary"></i>
                                    Find or Register Patient
                                </h6>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setShowPatientModal(true)}
                                >
                                    <i className="bx bx-user-plus me-1"></i> New Patient
                                </button>
                            </div>
                            <div className="card-body pt-2">
                                <div className="input-group mb-2">
                                    <span className="input-group-text bg-white border-end-0">
                                        {searching ? (
                                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                        ) : (
                                            <i className="bx bx-search text-muted"></i>
                                        )}
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search by name, phone, or patient ID..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => { setSearchTerm(""); setSearchResults([]); }}
                                        >
                                            <i className="bx bx-x"></i>
                                        </button>
                                    )}
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="list-group list-group-flush" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                        {searchResults.map((patient) => (
                                            <button
                                                key={patient.uid}
                                                className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-2 ${selectedPatient?.uid === patient.uid ? "active" : ""}`}
                                                onClick={() => selectPatient(patient)}
                                            >
                                                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "36px", height: "36px" }}>
                                                    <i className={`bx bx-user ${selectedPatient?.uid === patient.uid ? "text-white" : "text-primary"}`}></i>
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <div className="fw-medium text-truncate">
                                                        {patient.first_name} {patient.last_name}
                                                    </div>
                                                    <div className={`small ${selectedPatient?.uid === patient.uid ? "text-white-50" : "text-muted"}`}>
                                                        {patient.patient_id && <span className="me-2">{patient.patient_id}</span>}
                                                        {patient.phone && <span><i className="bx bx-phone me-1"></i>{patient.phone}</span>}
                                                    </div>
                                                </div>
                                                <i className="bx bx-chevron-right"></i>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
                                    <div className="text-center py-3 text-muted">
                                        <i className="bx bx-user-x fs-3 d-block mb-1"></i>
                                        <small>No patients found. <button className="btn btn-link btn-sm p-0" onClick={() => setShowPatientModal(true)}>Register new patient</button></small>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions Panel — visible when patient is selected */}
                        {selectedPatient && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-transparent py-3">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="bx bx-zap me-2 text-warning"></i>
                                        Quick Actions for {patientName}
                                    </h6>
                                </div>
                                <div className="card-body pt-2">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-info btn-sm w-100 py-2 text-center"
                                                onClick={() => setShowVisitModal(true)}
                                            >
                                                <i className="bx bx-calendar-plus d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">New Visit</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-danger btn-sm w-100 py-2 text-center"
                                                disabled={!selectedVisit}
                                                onClick={() => setShowVitalsModal(true)}
                                            >
                                                <i className="bx bx-heart d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">Vital Signs</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-success btn-sm w-100 py-2 text-center"
                                                disabled={!selectedVisit}
                                                onClick={() => {
                                                    setShowConsultationModal(true);
                                                    setCurrentStep(3);
                                                }}
                                            >
                                                <i className="bx bx-message-square d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">Consultation</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-warning btn-sm w-100 py-2 text-center"
                                                disabled={!selectedConsultation}
                                                onClick={() => setShowDiagnosisModal(true)}
                                            >
                                                <i className="bx bx-clipboard d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">Diagnosis</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-success btn-sm w-100 py-2 text-center"
                                                disabled={!selectedConsultation}
                                                onClick={() => setShowLabOrderModal(true)}
                                            >
                                                <i className="bx bx-test-tube d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">Lab Order</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-secondary btn-sm w-100 py-2 text-center"
                                                disabled={!selectedConsultation}
                                                onClick={() => setShowPrescriptionModal(true)}
                                            >
                                                <i className="bx bx-capsule d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">Prescription</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-primary btn-sm w-100 py-2 text-center"
                                                disabled={!selectedVisit}
                                                onClick={() => setShowPaymentModal(true)}
                                            >
                                                <i className="bx bx-money d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">Payment</small>
                                            </button>
                                        </div>
                                        <div className="col-6">
                                            <button
                                                className="btn btn-outline-secondary btn-sm w-100 py-2 text-center"
                                                disabled={!selectedVisit}
                                                onClick={() => setShowLabResultsModal(true)}
                                            >
                                                <i className="bx bx-file-find d-block fs-4 mb-1"></i>
                                                <small className="fw-medium">Lab Results</small>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Patient Visits — when patient selected but no visit chosen */}
                        {selectedPatient && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-transparent py-3">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="bx bx-calendar me-2 text-info"></i>
                                        Patient Visits
                                    </h6>
                                </div>
                                <div className="card-body pt-0">
                                    {loadingPatientVisits ? (
                                        <div className="text-center py-3">
                                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                            <small className="ms-2 text-muted">Loading visits...</small>
                                        </div>
                                    ) : patientVisits.length === 0 ? (
                                        <div className="text-center py-3 text-muted">
                                            <i className="bx bx-calendar-x fs-3 d-block mb-1"></i>
                                            <small>No visits found. Create one to continue.</small>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                            {patientVisits.map((visit) => (
                                                <button
                                                    key={visit.uid}
                                                    className={`list-group-item list-group-item-action py-2 ${selectedVisit?.uid === visit.uid ? "active" : ""}`}
                                                    onClick={() => selectVisit(visit)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="fw-medium">{visit.visit_number || visit.uid?.substring(0, 8)}</span>
                                                            <span className={`badge ms-2 ${selectedVisit?.uid === visit.uid ? "bg-light text-primary" : "bg-primary bg-opacity-10 text-primary"}`}>
                                                                {visit.visit_type || "Visit"}
                                                            </span>
                                                        </div>
                                                        <small className={selectedVisit?.uid === visit.uid ? "text-white-50" : "text-muted"}>
                                                            {visit.visit_date || ""}
                                                        </small>
                                                    </div>
                                                    {visit.chief_complaint && (
                                                        <small className={`d-block text-truncate mt-1 ${selectedVisit?.uid === visit.uid ? "text-white-50" : "text-muted"}`}>
                                                            {visit.chief_complaint}
                                                        </small>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Visit Consultations */}
                        {selectedVisit && (
                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-header bg-transparent py-3">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="bx bx-message-square me-2 text-success"></i>
                                        Consultations
                                    </h6>
                                </div>
                                <div className="card-body pt-0">
                                    {loadingConsultations ? (
                                        <div className="text-center py-3">
                                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                            <small className="ms-2 text-muted">Loading...</small>
                                        </div>
                                    ) : visitConsultations.length === 0 ? (
                                        <div className="text-center py-3 text-muted">
                                            <small>No consultations yet. Start one from Quick Actions.</small>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {visitConsultations.map((consultation) => (
                                                <button
                                                    key={consultation.uid}
                                                    className={`list-group-item list-group-item-action py-2 ${selectedConsultation?.uid === consultation.uid ? "active" : ""}`}
                                                    onClick={() => selectConsultation(consultation)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="fw-medium">
                                                            <i className="bx bx-message-square me-1"></i>
                                                            {consultation.diagnosis || consultation.symptoms?.substring(0, 40) || "Consultation"}
                                                        </span>
                                                        <small className={selectedConsultation?.uid === consultation.uid ? "text-white-50" : "text-muted"}>
                                                            {consultation.consultation_start ? new Date(consultation.consultation_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                                                        </small>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Today's Activity */}
                    <div className="col-lg-7">
                        {/* Today's Visits */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent d-flex align-items-center justify-content-between py-3">
                                <h6 className="mb-0 fw-bold">
                                    <i className="bx bx-calendar-check me-2 text-success"></i>
                                    Today's Visits
                                    {todayVisits.length > 0 && (
                                        <span className="badge bg-success bg-opacity-10 text-success ms-2">{todayVisits.length}</span>
                                    )}
                                </h6>
                                <button className="btn btn-outline-primary btn-sm" onClick={loadTodayVisits}>
                                    <i className="bx bx-refresh me-1"></i> Refresh
                                </button>
                            </div>
                            <div className="card-body pt-0">
                                {loadingVisits ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <p className="mt-2 text-muted small mb-0">Loading today's visits...</p>
                                    </div>
                                ) : todayVisits.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <i className="bx bx-calendar-x fs-1 d-block mb-2"></i>
                                        <p className="mb-1">No visits recorded today yet.</p>
                                        <small>Search for a patient above to start a new visit.</small>
                                    </div>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                                        <table className="table table-hover table-sm align-middle mb-0">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th>Patient</th>
                                                    <th>Visit #</th>
                                                    <th>Type</th>
                                                    <th>Payment</th>
                                                    <th>Status</th>
                                                    <th className="text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {todayVisits.map((visit) => (
                                                    <tr
                                                        key={visit.uid}
                                                        className={selectedVisit?.uid === visit.uid ? "table-primary" : ""}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => selectFromTodayVisit(visit)}
                                                    >
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "30px", height: "30px" }}>
                                                                    <i className="bx bx-user text-primary" style={{ fontSize: "14px" }}></i>
                                                                </div>
                                                                <div>
                                                                    <div className="fw-medium" style={{ fontSize: "0.85rem" }}>
                                                                        {visit.patient_name || `${visit.patient_first_name || ""} ${visit.patient_last_name || ""}`.trim() || "—"}
                                                                    </div>
                                                                    {(visit.patient_id || visit.patient_patient_id) && (
                                                                        <small className="text-muted">{visit.patient_id || visit.patient_patient_id}</small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><small>{visit.visit_number || "—"}</small></td>
                                                        <td>
                                                            <span className="badge bg-info bg-opacity-10 text-info">
                                                                {visit.visit_type || "—"}
                                                            </span>
                                                        </td>
                                                        <td><small>{visit.payment_type || "—"}</small></td>
                                                        <td>
                                                            <span className={`badge ${visit.status === "COMPLETED" ? "bg-success" : visit.status === "IN_PROGRESS" ? "bg-warning" : "bg-secondary"} bg-opacity-10 ${visit.status === "COMPLETED" ? "text-success" : visit.status === "IN_PROGRESS" ? "text-warning" : "text-secondary"}`}>
                                                                {visit.status || "OPEN"}
                                                            </span>
                                                        </td>
                                                        <td className="text-end">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    selectFromTodayVisit(visit);
                                                                }}
                                                            >
                                                                <i className="bx bx-right-arrow-alt"></i>
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

                        {/* Quick Navigation Links */}
                        <div className="row g-3 mt-3">
                            {[
                                { title: "Queue Board", icon: "bx bx-station", link: "/clinic360/queue-board", color: "success" },
                                { title: "Patient List", icon: "bx bx-list-ul", link: "/clinic360/patients", color: "primary" },
                                { title: "All Visits", icon: "bx bx-calendar", link: "/clinic360/visits", color: "info" },
                                { title: "Dashboard", icon: "bx bx-home", link: "/clinic360/dashboard", color: "warning" },
                            ].map((item, idx) => (
                                <div key={idx} className="col-6 col-md-3">
                                    <div
                                        className="card border-0 shadow-sm text-center py-3 h-100"
                                        style={{ cursor: "pointer", transition: "transform 0.2s" }}
                                        onClick={() => navigate(item.link)}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                                    >
                                        <i className={`${item.icon} text-${item.color} fs-3 d-block mb-1`}></i>
                                        <small className="fw-medium">{item.title}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== MODALS ==================== */}

            {showPatientModal && (
                <PatientModal
                    selectedObj={null}
                    onSuccess={handlePatientCreated}
                    onClose={() => setShowPatientModal(false)}
                    onCreateVisit={handlePatientCreatedWithVisit}
                />
            )}

            {showVisitModal && selectedPatient && (
                <VisitModal
                    patient={selectedPatient}
                    onSuccess={handleVisitCreated}
                    onClose={() => setShowVisitModal(false)}
                    onRecordVitals={(visit) => {
                        setSelectedVisit(visit);
                        setCurrentStep(2);
                        setShowVisitModal(false);
                        setShowVitalsModal(true);
                    }}
                />
            )}

            {showVitalsModal && selectedVisit && (
                <VitalsModal
                    visit={selectedVisit}
                    onSuccess={handleVitalsRecorded}
                    onClose={() => setShowVitalsModal(false)}
                />
            )}

            {showConsultationModal && selectedVisit && (
                <ConsultationModal
                    visitUid={selectedVisit.uid}
                    selectedObj={null}
                    onSuccess={handleConsultationSaved}
                    onClose={() => setShowConsultationModal(false)}
                    patient={selectedPatient}
                    visit={selectedVisit}
                    onAddDiagnosis={(consultUid) => {
                        setSelectedConsultation({ uid: consultUid });
                        setShowConsultationModal(false);
                        setShowDiagnosisModal(true);
                        setCurrentStep(4);
                    }}
                    onAddLabOrder={(consultUid) => {
                        setSelectedConsultation({ uid: consultUid });
                        setShowConsultationModal(false);
                        setShowLabOrderModal(true);
                        setCurrentStep(4);
                    }}
                    onAddPrescription={(consultUid) => {
                        setSelectedConsultation({ uid: consultUid });
                        setShowConsultationModal(false);
                        setShowPrescriptionModal(true);
                        setCurrentStep(4);
                    }}
                />
            )}

            {showDiagnosisModal && selectedConsultation && (
                <DiagnosisModal
                    consultationUid={selectedConsultation.uid}
                    selectedObj={null}
                    onSuccess={() => {}}
                    onClose={() => setShowDiagnosisModal(false)}
                    patient={selectedPatient}
                    visit={selectedVisit}
                />
            )}

            {showLabOrderModal && selectedConsultation && (
                <LabOrderModal
                    consultationUid={selectedConsultation.uid}
                    selectedObj={null}
                    onSuccess={() => {}}
                    onClose={() => setShowLabOrderModal(false)}
                    patient={selectedPatient}
                    visit={selectedVisit}
                />
            )}

            {showPrescriptionModal && selectedConsultation && (
                <PrescriptionModal
                    consultationUid={selectedConsultation.uid}
                    selectedObj={null}
                    onSuccess={() => {}}
                    onClose={() => setShowPrescriptionModal(false)}
                    patient={selectedPatient}
                    visit={selectedVisit}
                />
            )}

            {showPaymentModal && selectedVisit && (
                <PaymentModal
                    visitUid={selectedVisit.uid}
                    selectedObj={null}
                    onSuccess={() => {}}
                    onClose={() => setShowPaymentModal(false)}
                    patient={selectedPatient}
                    visit={selectedVisit}
                />
            )}

            {showLabResultsModal && selectedVisit && (
                <LabResultsModal
                    visitUid={selectedVisit.uid}
                    onClose={() => setShowLabResultsModal(false)}
                    patient={selectedPatient}
                    visit={selectedVisit}
                />
            )}

            {showVisitSummaryModal && selectedVisit && (
                <VisitSummaryModal
                    patient={selectedPatient}
                    visit={selectedVisit}
                    onClose={() => setShowVisitSummaryModal(false)}
                />
            )}
        </>
    );
};

export default OperationsPage;
