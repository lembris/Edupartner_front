import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { getPatient, deletePatient } from "../Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";
import showToast from "../../../../helpers/ToastHelper";
import { PatientModal } from "./PatientModal";

export const PatientDetailPage = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchPatient = async () => {
        try {
            setLoading(true);
            const response = await getPatient(uid);
            if (response.status === 8000) {
                setPatient(response.data);
            } else {
                setError(response.message || "Failed to load patient");
            }
        } catch (err) {
            console.error("Error fetching patient:", err);
            setError("Failed to load patient details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatient();
    }, [uid]);

    const handleDelete = async () => {
        if (!patient) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete patient: ${patient.first_name} ${patient.last_name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deletePatient(patient.uid);
                showToast("success", "Patient deleted successfully");
                navigate("/clinic360/patients");
            }
        } catch (err) {
            console.error("Error deleting patient:", err);
            showToast("error", "Failed to delete patient");
        }
    };

    const handlePatientUpdate = () => {
        fetchPatient();
        setShowModal(false);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading patient details...</p>
                </div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="container-fluid">
                <BreadCumb pageList={["CLINIC360", "Patients", "Details"]} />
                <div className="alert alert-danger" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="bx bx-error-circle me-2"></i>
                        <div>
                            <h6 className="alert-heading mb-1">Error Loading Patient</h6>
                            <p className="mb-0">{error || "Patient not found"}</p>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => navigate("/clinic360/patients")}>
                        <i className="bx bx-arrow-back me-1"></i> Back to Patients
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <BreadCumb pageList={["CLINIC360", "Patients", patient.patient_id]} />

            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Patient Information</h5>
                            <div className="d-flex gap-2">
                                {hasAccess(user, ["change_patient"]) && (
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setShowModal(true)}>
                                        <i className="bx bx-edit me-1"></i> Edit
                                    </button>
                                )}
                                {hasAccess(user, ["delete_patient"]) && (
                                    <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                                        <i className="bx bx-trash me-1"></i> Delete
                                    </button>
                                )}
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate("/clinic360/patients")}>
                                    <i className="bx bx-arrow-back me-1"></i> Back
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 text-center mb-4">
                                    <div className="avatar avatar-xl mx-auto mb-2 bg-label-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: "120px", height: "120px" }}>
                                        <span className="text-primary display-4 fw-bold">
                                            {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                                        </span>
                                    </div>
                                    <h5 className="mb-1">{patient.first_name} {patient.last_name}</h5>
                                    <span className={`badge bg-${
                                        patient.patient_type === 'VIP' ? 'warning' :
                                        patient.patient_type === 'INSURANCE' ? 'success' :
                                        patient.patient_type === 'CORPORATE' ? 'info' :
                                        patient.patient_type === 'STAFF' ? 'secondary' : 'primary'
                                    }`}>
                                        {patient.patient_type || 'REGULAR'}
                                    </span>
                                    <p className="text-muted mt-2 mb-0">
                                        <strong>ID:</strong> {patient.patient_id}
                                    </p>
                                </div>
                                <div className="col-md-9">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="text-muted small mb-1">Phone</label>
                                            <p className="mb-0">{patient.phone || "-"}</p>
                                            {patient.alternative_phone && (
                                                <small className="text-muted">Alt: {patient.alternative_phone}</small>
                                            )}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="text-muted small mb-1">Email</label>
                                            <p className="mb-0">{patient.email || "-"}</p>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="text-muted small mb-1">Date of Birth</label>
                                            <p className="mb-0">{patient.date_of_birth ? formatDate(patient.date_of_birth) : "-"}</p>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="text-muted small mb-1">Gender</label>
                                            <p className="mb-0">
                                                {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : patient.gender || "-"}
                                            </p>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="text-muted small mb-1">Blood Group</label>
                                            <p className="mb-0">{patient.blood_group || "-"}</p>
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="text-muted small mb-1">Address</label>
                                            <p className="mb-0">{patient.address || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0"><i className="bx bx-phone me-1"></i> Emergency Contact</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <label className="text-muted small mb-1">Name</label>
                                    <p className="mb-0">{patient.emergency_contact_name || "-"}</p>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="text-muted small mb-1">Phone</label>
                                    <p className="mb-0">{patient.emergency_contact_phone || "-"}</p>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="text-muted small mb-1">Relationship</label>
                                    <p className="mb-0">{patient.emergency_contact_relationship || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0"><i className="bx bx-id-card me-1"></i> Identification</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <label className="text-muted small mb-1">ID Type</label>
                                    <p className="mb-0">
                                        {patient.identification_type === 'NATIONAL_ID' ? 'National ID' :
                                         patient.identification_type === 'PASSPORT' ? 'Passport' :
                                         patient.identification_type === 'DRIVERS_LICENSE' ? "Driver's License" :
                                         patient.identification_type || "-"}
                                    </p>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="text-muted small mb-1">ID Number</label>
                                    <p className="mb-0">{patient.identification_number || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0"><i className="bx bx-medical me-1"></i> Medical Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="text-muted small mb-1">Allergies</label>
                                <p className="mb-0">{patient.allergies || <span className="text-muted">None reported</span>}</p>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small mb-1">Chronic Conditions</label>
                                <p className="mb-0">{patient.chronic_conditions || <span className="text-muted">None reported</span>}</p>
                            </div>
                            <div>
                                <label className="text-muted small mb-1">Current Medications</label>
                                <p className="mb-0">{patient.current_medications || <span className="text-muted">None reported</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0"><i className="bx bx-shield-alt me-1"></i> Insurance</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="text-muted small mb-1">Default Insurance</label>
                                <p className="mb-0">{patient.default_insurance_name || <span className="text-muted">No insurance</span>}</p>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <label className="text-muted small mb-1">Credit Limit</label>
                                    <p className="mb-0">{patient.credit_limit ? `$${patient.credit_limit}` : "$0"}</p>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small mb-1">Balance</label>
                                    <p className="mb-0">{patient.current_balance ? `$${patient.current_balance}` : "$0"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0"><i className="bx bx-history me-1"></i> Registration Info</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <label className="text-muted small mb-1">Registered At</label>
                                    <p className="mb-0">{patient.registered_at ? formatDate(patient.registered_at) : "-"}</p>
                                </div>
                                <div className="col-md-4">
                                    <label className="text-muted small mb-1">Created At</label>
                                    <p className="mb-0">{patient.created_at ? formatDate(patient.created_at) : "-"}</p>
                                </div>
                                <div className="col-md-4">
                                    <label className="text-muted small mb-1">Last Updated</label>
                                    <p className="mb-0">{patient.updated_at ? formatDate(patient.updated_at) : "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <PatientModal
                    selectedObj={patient}
                    onSuccess={handlePatientUpdate}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};
