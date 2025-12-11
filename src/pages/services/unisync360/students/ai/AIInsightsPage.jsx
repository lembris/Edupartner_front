import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BreadCumb from '../../../../../layouts/BreadCumb';
import { getStudent } from '../Queries';
import { StudentModal } from '../StudentModal';
import StudentSupportModal from '../StudentSupportModal';
import AIInsightsDashboard from './AIInsightsDashboard';
import { formatDate } from '../../../../../helpers/DateFormater';
import { hasAccess } from '../../../../../hooks/AccessHandler';

const AIInsightsPage = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedObj, setSelectedObj] = useState(null);

    // Support Modal States
    const [supportModalType, setSupportModalType] = useState(null);
    const [supportModalObj, setSupportModalObj] = useState(null);

    const fetchStudent = async () => {
        try {
            const res = await getStudent(uid);
            if (res.status === 8000) {
                setStudent(res.data);
            }
        } catch (error) {
            console.error('Error fetching student:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [uid]);

    const openSupportModal = (type, obj = null) => {
        setSupportModalType(type);
        setSupportModalObj(obj);
    };

    const closeSupportModal = () => {
        setSupportModalType(null);
        setSupportModalObj(null);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="alert alert-warning">
                <i className="bx bx-error me-2"></i>
                Student not found
            </div>
        );
    }

    return (
        <>
            <div className="animate__animated animate__fadeIn">
                <BreadCumb pageList={["Students", `${student.first_name} ${student.last_name}`, "AI Insights"]} />

                {/* Modern Profile Header - Same as StudentDetailsPage */}
                <div className="card mb-4 border-0 shadow-sm overflow-hidden">
                    <div className="card-body p-0">
                        <div className="bg-primary p-4 text-white" style={{ background: 'linear-gradient(45deg, #696cff 0%, #4346d3 100%)' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="position-relative">
                                        {student.profile_picture ? (
                                            <img
                                                src={student.profile_picture}
                                                alt="Profile"
                                                className="rounded-circle border border-4 border-white shadow-sm"
                                                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div className="avatar avatar-xl rounded-circle bg-white text-primary fw-bold fs-1 d-flex align-items-center justify-content-center border border-4 border-white shadow-sm" style={{ width: "100px", height: "100px" }}>
                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                            </div>
                                        )}
                                        <span className={`position-absolute bottom-0 end-0 p-2 bg-${student.is_active ? 'success' : 'danger'} border border-2 border-white rounded-circle`}></span>
                                    </div>
                                    <div className="text-center text-md-start mt-3 mt-md-0">
                                        <h3 className="text-white mb-1 fw-bold">{student.full_name}</h3>
                                        <div className="d-flex align-items-center gap-2 opacity-75 mb-2 justify-content-center justify-content-md-start">
                                            <i className="bx bx-envelope"></i> {student.personal_email}
                                            <span className="mx-1">•</span>
                                            <i className="bx bx-id-card"></i> {student.passport_number || "No Passport ID"}
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">
                                            <span className="badge bg-white text-primary bg-opacity-25" style={{ backdropFilter: 'blur(4px)' }}>
                                                <i className="bx bx-user me-1"></i> {student.gender}
                                            </span>
                                            <span className="badge bg-white text-info bg-opacity-25" style={{ backdropFilter: 'blur(4px)' }}>
                                                <i className="bx bx-flag me-1"></i> {student.nationality_name || "Unknown"}
                                            </span>
                                            <span className="badge bg-white text-warning bg-opacity-25" style={{ backdropFilter: 'blur(4px)' }}>
                                                <i className="bx bx-star me-1"></i> {student.status_name || "No Status"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 mt-4 mt-md-0">
                                    <button
                                        className="btn btn-outline-white text-white border-white border-opacity-50"
                                        onClick={() => navigate(`/unisync360/students/${student.uid}`)}
                                    >
                                        <i className="bx bx-arrow-back me-1"></i> Back to Profile
                                    </button>
                                    {hasAccess(user, ["change_student"]) && (
                                        <button
                                            className="btn btn-white text-primary fw-semibold shadow-sm"
                                            onClick={() => {
                                                setSelectedObj(student);
                                                setShowStudentModal(true);
                                            }}
                                        >
                                            <i className="bx bx-edit me-1"></i> Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Left Column: Info Cards */}
                    <div className="col-xl-4 col-lg-5 mb-4">
                        {/* Contact Info Card */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h5 className="mb-0"><i className="bx bx-phone-call me-2 text-primary"></i> Contact Details</h5>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    <li className="d-flex align-items-center mb-3">
                                        <div className="avatar avatar-sm bg-label-primary rounded p-2 me-3 d-flex align-items-center justify-content-center"><i className="bx bx-phone"></i></div>
                                        <div>
                                            <small className="text-muted d-block">Mobile Phone</small>
                                            <span className="fw-medium">{student.personal_phone}</span>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-center mb-3">
                                        <div className="avatar avatar-sm bg-label-success rounded p-2 me-3 d-flex align-items-center justify-content-center"><i className="bx bxl-whatsapp"></i></div>
                                        <div>
                                            <small className="text-muted d-block">WhatsApp</small>
                                            <span className="fw-medium">{student.whatsapp_number || "Not provided"}</span>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-center">
                                        <div className="avatar avatar-sm bg-label-info rounded p-2 me-3 d-flex align-items-center justify-content-center"><i className="bx bx-map"></i></div>
                                        <div>
                                            <small className="text-muted d-block">Address</small>
                                            <span className="fw-medium">{student.address}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Personal Info Card */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h5 className="mb-0"><i className="bx bx-user-circle me-2 text-info"></i> Personal Info</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-6">
                                        <small className="text-muted d-block mb-1">Date of Birth</small>
                                        <span className="fw-medium"><i className="bx bx-calendar me-1"></i> {formatDate(student.date_of_birth)}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block mb-1">Marital Status</small>
                                        <span className="fw-medium text-capitalize">{student.marital_status || "-"}</span>
                                    </div>
                                    <div className="col-12">
                                        <hr className="my-2 dashed" />
                                    </div>
                                    <div className="col-12">
                                        <small className="text-muted d-block mb-1">Emergency Contact</small>
                                        <div className="d-flex align-items-center mt-2">
                                            <div className="avatar avatar-xs bg-label-danger rounded-circle me-2 d-flex align-items-center justify-content-center"><i className="bx bx-first-aid"></i></div>
                                            <div>
                                                <span className="fw-bold d-block">{student.emergency_contact_name}</span>
                                                <small className="text-muted">{student.emergency_contact_relationship} • {student.emergency_contact_phone}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="bx bx-rocket me-2 text-warning"></i> Quick Actions</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => openSupportModal('course_allocation')}
                                    >
                                        <i className="bx bx-plus me-1"></i> New Course Application
                                    </button>
                                    <button
                                        className="btn btn-outline-success"
                                        onClick={() => openSupportModal('academic')}
                                    >
                                        <i className="bx bx-book-add me-1"></i> Add Academic History
                                    </button>
                                    <button
                                        className="btn btn-outline-info"
                                        onClick={() => openSupportModal('document')}
                                    >
                                        <i className="bx bx-upload me-1"></i> Upload Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Insights Dashboard */}
                    <div className="col-xl-8 col-lg-7 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-gradient-primary text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <div className="d-flex align-items-center">
                                    <i className="bx bx-brain fs-4 me-2"></i>
                                    <h5 className="mb-0 text-white">AI Insights & Recommendations</h5>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <AIInsightsDashboard
                                    studentId={student.uid}
                                    studentName={student.full_name}
                                    onApplyCourse={(courseUid) => {
                                        openSupportModal('course_allocation', { university_course: courseUid });
                                    }}
                                    onViewCourse={(courseUid) => {
                                        window.open(`/unisync360/courses/${courseUid}`, '_blank');
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Modal */}
            {showStudentModal && (
                <StudentModal
                    selectedObj={selectedObj}
                    onClose={() => {
                        setShowStudentModal(false);
                        setSelectedObj(null);
                    }}
                    onSuccess={() => {
                        setShowStudentModal(false);
                        setSelectedObj(null);
                        fetchStudent();
                    }}
                />
            )}

            {/* Support Modal for Course Applications, Documents, etc. */}
            {supportModalType && (
                <StudentSupportModal
                    type={supportModalType}
                    studentId={student.uid}
                    selectedObj={supportModalObj}
                    onClose={closeSupportModal}
                    onSuccess={() => {
                        closeSupportModal();
                        fetchStudent();
                    }}
                />
            )}
        </>
    );
};

export default AIInsightsPage;
