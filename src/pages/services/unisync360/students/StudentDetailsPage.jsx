import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import {
    getStudent, deleteStudent,
    CommunicationAPI, AppointmentAPI, ReminderAPI,
    FacilitationAPI, ContactAPI, ContractAPI, TaskAPI, AlertAPI,
    DocumentAPI, CourseAllocationAPI, AcademicHistoryAPI
} from "./Queries.jsx";
import { StudentModal } from "./StudentModal";
import StudentSupportModal from "./StudentSupportModal";
import BulkDocumentUploadModal from "./BulkDocumentUploadModal";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import showToast from "../../../../helpers/ToastHelper";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";


const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        case 'pending': return 'warning';
        case 'offer_received': return 'info';
        case 'waiting_list': return 'primary';
        default: return 'secondary';
    }
};

const getDocStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'verified': return 'success';
        case 'rejected': return 'danger';
        case 'pending': return 'warning';
        case 'submitted': return 'info';
        default: return 'secondary';
    }
};

const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'urgent': return 'danger';
        case 'high': return 'warning';
        case 'medium': return 'primary';
        case 'low': return 'info';
        default: return 'secondary';
    }
};

const getCommunicationIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'phone': return 'bx-phone';
        case 'email': return 'bx-envelope';
        case 'sms': return 'bx-message-rounded';
        case 'whatsapp': return 'bxl-whatsapp';
        case 'meeting': return 'bx-calendar';
        case 'video_call': return 'bx-video';
        default: return 'bx-message';
    }
};

export const StudentDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedObj, setSelectedObj] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [activeTab, setActiveTab] = useState("communication");

    // Tab Data States
    const [tabData, setTabData] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);
    const [supportModalType, setSupportModalType] = useState(null);
    const [supportModalObj, setSupportModalObj] = useState(null);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const user = useSelector((state) => state.userReducer?.data);
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
    }, [student, loading, activeTab]);

    const scrollTabs = (direction) => {
        if (tabsRef.current) {
            if (direction === 'left') {
                tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
            } else {
                tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
            }
        }
    };

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const response = await getStudent(id);
            setStudent(response.data);
        } catch (error) {
            console.error("Error fetching student:", error);
            showToast("error", "Failed to load student details");
        } finally {
            setLoading(false);
        }
    };

    const fetchTabContent = async () => {
        if (!student?.uid) return;
        setTabLoading(true);
        setTabData([]);
        try {
            let response;
            const params = { student: student.uid };

            switch (activeTab) {
                case 'communication':
                    response = await CommunicationAPI.getAll(params);
                    break;
                case 'appointments':
                    response = await AppointmentAPI.getAll(params);
                    break;
                case 'reminder':
                    response = await ReminderAPI.getAll(params);
                    break;
                case 'facilitations':
                    response = await FacilitationAPI.getAll(params);
                    break;
                case 'contacts':
                    response = await ContactAPI.getAll(params);
                    break;
                case 'contracts':
                    response = await ContractAPI.getAll(params);
                    break;
                case 'tasks':
                    response = await TaskAPI.getAll(params);
                    break;
                case 'alert':
                    response = await AlertAPI.getAll(params);
                    break;
                case 'vault':
                    response = await DocumentAPI.getAll(params);
                    break;
                case 'academics':
                    response = await AcademicHistoryAPI.getAll(params);
                    break;
                case 'course_applications':
                    response = await CourseAllocationAPI.getAll(params);
                    break;
                // Add other cases as needed
                default:
                    response = { results: [] };
            }

            setTabData(response?.data || response?.results || []);
        } catch (error) {
            console.error(`Error fetching ${activeTab}:`, error);
            // showToast("error", "Failed to load tab data");
        } finally {
            setTabLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchStudent();
    }, [id]);

    useEffect(() => {
        fetchTabContent();
    }, [activeTab, student]);

    const handleDelete = async () => {
        const confirmation = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete student!",
        });

        if (confirmation.isConfirmed) {
            try {
                await deleteStudent(id);
                showToast("success", "Student deleted successfully");
                navigate("/unisync360/students");
            } catch (error) {
                showToast("error", "Failed to delete student");
            }
        }
    };

    const handleItemDelete = async (api, uid, isNested = false) => {
        const confirmation = await Swal.fire({
            title: "Are you sure?",
            text: "Delete this item?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirmation.isConfirmed) {
            try {
                let result;
                if (isNested) {
                    // Ensure the API supports deleteWithContext
                    result = await api.deleteWithContext(uid, student.uid);
                } else {
                    result = await api.delete(uid);
                }
                if (result && result.status === 8000) {
                    showToast("success", "Item deleted successfully");
                    fetchTabContent();
                } else {
                    showToast("error", result?.message || "Failed to delete item");
                }
            } catch (error) {
                console.error("Delete error:", error);
                showToast("error", "Failed to delete item");
            }
        }
    };

    const handleTaskStatusToggle = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            const result = await TaskAPI.update(task.uid, { status: newStatus });
            if (result && result.status === 8000) {
                showToast("success", `Task marked as ${newStatus}`);
                fetchTabContent();
            } else {
                showToast("error", result?.message || "Failed to update task status");
            }
        } catch (error) {
            console.error("Task update error:", error);
            showToast("error", "Failed to update task status");
        }
    };

    const openSupportModal = (type, obj = null) => {
        setSupportModalType(type);
        setSupportModalObj(obj);
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;
    if (!student) return <div className="p-5 text-center">Student not found</div>;

    return (
        <>
            <div className="animate__animated animate__fadeIn">
                <BreadCumb pageList={["Students", `${student.first_name} ${student.last_name}`]} />

                {/* Modern Profile Header - Same as before */}
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
                                        className="btn btn-warning text-white fw-semibold shadow-sm"
                                        onClick={() => navigate(`/unisync360/students/${student.uid}/ai-insights`)}
                                    >
                                        <i className="bx bx-brain me-1"></i> AI Insights
                                    </button>
                                    {hasAccess(user, ["change_student"]) && (
                                        <button
                                            className="btn fw-semibold shadow-sm"
                                            style={{ backgroundColor: '#fff', color: '#696cff' }}
                                            onClick={() => {
                                                setSelectedObj(student);
                                                setShowStudentModal(true);
                                            }}
                                        >
                                            <i className="bx bx-edit me-1"></i> Edit Profile
                                        </button>
                                    )}
                                    {hasAccess(user, ["delete_student"]) && (
                                        <button
                                            className="btn btn-outline-white text-white border-white border-opacity-50 hover-white"
                                            onClick={handleDelete}
                                        >
                                            <i className="bx bx-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Left Column: Info Cards (Static for now or from student obj) */}
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
                    </div>

                    {/* Right Column: Tabs & Content */}
                    <div className="col-xl-8 col-lg-7 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header p-0 position-relative border-bottom">
                                <div className="d-flex align-items-center bg-light rounded-top">
                                    {showScrollArrows && (
                                        <button type="button" className="btn btn-sm btn-icon btn-link text-secondary rounded-0 shadow-none" onClick={() => scrollTabs('left')}>
                                            <i className="bx bx-chevrons-left fs-4"></i>
                                        </button>
                                    )}

                                    <div className="flex-grow-1 overflow-hidden position-relative" ref={tabsRef} style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        <ul className="nav nav-tabs nav-fill flex-nowrap hide-scrollbar mb-0 border-bottom-0" role="tablist" style={{ minWidth: "100%" }}>
                                            {[
                                                { id: "communication", label: "Communication", icon: "bx-message-detail" },
                                                { id: "appointments", label: "Appointments", icon: "bx-calendar-event" },
                                                { id: "reminder", label: "Reminder", icon: "bx-alarm" },
                                                { id: "facilitations", label: "Facilitations", icon: "bx-support" },
                                                { id: "contacts", label: "Contacts", icon: "bx-user-pin" },
                                                // { id: "contracts", label: "Contracts", icon: "bx-file" },
                                                { id: "tasks", label: "Tasks", icon: "bx-check-square" },
                                                // { id: "alert", label: "Alert", icon: "bx-bell" },
                                                { id: "vault", label: "Documents", icon: "bx-folder" },
                                                { id: "academics", label: "Academics", icon: "bx-book" },
                                                { id: "course_applications", label: "Course Applications", icon: "bxs-graduation" },
                                            ].map(tab => (
                                                <li className="nav-item" key={tab.id}>
                                                    <button
                                                        className={`nav-link border-0 rounded-0 ${activeTab === tab.id ? "active" : ""}`}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        style={{ whiteSpace: 'nowrap' }}
                                                    >
                                                        <i className={`bx ${tab.icon} me-1`}></i> {tab.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {showScrollArrows && (
                                        <button type="button" className="btn btn-sm btn-icon btn-link text-secondary rounded-0 shadow-none" onClick={() => scrollTabs('right')}>
                                            <i className="bx bx-chevrons-right fs-4"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="card-body p-4">
                                {/* --- Dynamic Content Rendering --- */}

                                {/* Communication Tab */}
                                {activeTab === "communication" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Communication Log</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('communication')}>
                                                <i className="bx bx-plus me-1"></i> Log Communication
                                            </button>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="timeline-xs">
                                                {tabData.map((comm) => (
                                                    <div key={comm.uid} className="timeline-item pb-4 border-start ps-3 position-relative ms-2">
                                                        <span className="position-absolute top-0 start-0 translate-middle border border-white rounded-circle bg-primary p-2 d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '32px', height: '32px' }}>
                                                            <i className={`bx ${getCommunicationIcon(comm.communication_type)}`}></i>
                                                        </span>
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="badge bg-label-secondary text-capitalize ms-2">{comm.communication_type}</span>
                                                            <div>
                                                                <small className="text-muted me-2">{formatDate(comm.created_at)}</small>
                                                                <button className="btn btn-xs btn-icon text-primary" onClick={() => openSupportModal('communication', comm)}><i className="bx bx-edit"></i></button>
                                                                <button className="btn btn-xs btn-icon text-danger" onClick={() => handleItemDelete(CommunicationAPI, comm.uid)}><i className="bx bx-trash"></i></button>
                                                            </div>
                                                        </div>
                                                        <h6 className="mb-1">{comm.subject}</h6>
                                                        <p className="mb-0 text-muted small">{comm.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <p className="text-muted mb-0">No communication logs found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Appointments Tab */}
                                {activeTab === "appointments" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Appointments</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('appointment')}>
                                                <i className="bx bx-plus me-1"></i> New Appointment
                                            </button>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="list-group list-group-flush">
                                                {tabData.map((appt) => (
                                                    <div key={appt.uid} className="list-group-item d-flex justify-content-between align-items-center p-3 mb-2 border rounded">
                                                        <div>
                                                            <h6 className="mb-1">{appt.title}</h6>
                                                            <small className="text-muted d-block"><i className="bx bx-time me-1"></i> {formatDate(appt.appointment_date, true)}</small>
                                                            <small className="text-muted"><i className="bx bx-map me-1"></i> {appt.location}</small>

                                                            {/* Attendees Avatars */}
                                                            {appt.attendees_details && appt.attendees_details.length > 0 && (
                                                                <div className="d-flex align-items-center mt-2">
                                                                    <div className="d-flex avatar-group">
                                                                        {appt.attendees_details.slice(0, 5).map((attendee, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="avatar avatar-xs pull-up"
                                                                                title={`${attendee.first_name} ${attendee.last_name}`}
                                                                                data-bs-toggle="tooltip"
                                                                                data-bs-placement="top"
                                                                            >
                                                                                {attendee.profile_picture ? (
                                                                                    <img src={attendee.profile_picture} alt="Avatar" className="rounded-circle" />
                                                                                ) : (
                                                                                    <span className="avatar-initial rounded-circle bg-label-secondary text-dark" style={{ fontSize: '10px' }}>
                                                                                        {attendee.first_name?.[0]}{attendee.last_name?.[0]}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        {appt.attendees_details.length > 5 && (
                                                                            <div className="avatar avatar-xs">
                                                                                <span className="avatar-initial rounded-circle bg-secondary text-white" style={{ fontSize: '10px' }}>
                                                                                    +{appt.attendees_details.length - 5}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-end">
                                                            <span className={`badge bg-label-${appt.status === 'scheduled' ? 'primary' : 'secondary'} mb-2`}>{appt.status}</span>
                                                            <div>
                                                                <button className="btn btn-sm btn-icon text-primary" onClick={() => openSupportModal('appointment', appt)}><i className="bx bx-edit"></i></button>
                                                                <button className="btn btn-sm btn-icon text-danger" onClick={() => handleItemDelete(AppointmentAPI, appt.uid)}><i className="bx bx-trash"></i></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <p className="text-muted mb-0">No appointments scheduled.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reminders Tab */}
                                {activeTab === "reminder" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Reminders</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('reminder')}>
                                                <i className="bx bx-plus me-1"></i> Add Reminder
                                            </button>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="row g-3">
                                                {tabData.map((rem) => (
                                                    <div key={rem.uid} className="col-md-6">
                                                        <div className="card h-100 border shadow-none">
                                                            <div className="card-body">
                                                                <div className="d-flex justify-content-between mb-2">
                                                                    <h6 className="card-title mb-0">{rem.title}</h6>
                                                                    <div>
                                                                        <button className="btn btn-xs btn-icon text-primary" onClick={() => openSupportModal('reminder', rem)}><i className="bx bx-edit"></i></button>
                                                                        <button className="btn btn-xs btn-icon text-danger" onClick={() => handleItemDelete(ReminderAPI, rem.uid)}><i className="bx bx-trash"></i></button>
                                                                    </div>
                                                                </div>
                                                                <p className="card-text small text-muted mb-2">{rem.message}</p>
                                                                <small className="text-primary fw-bold"><i className="bx bx-alarm me-1"></i> {formatDate(rem.reminder_date, true)}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <p className="text-muted mb-0">No reminders found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Facilitations Tab */}
                                {activeTab === "facilitations" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Facilitations</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('facilitation')}>
                                                <i className="bx bx-plus me-1"></i> New Request
                                            </button>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="table-responsive border rounded">
                                                <table className="table table-hover mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Service</th>
                                                            <th>Step</th>
                                                            <th>Status</th>
                                                            <th>Started</th>
                                                            <th className="text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tabData.map((fac) => (
                                                            <tr key={fac.uid}>
                                                                <td className="fw-bold">{fac.service_name}</td>
                                                                <td>{fac.current_step_name || "Not Started"}</td>
                                                                <td><span className="badge bg-label-info">{fac.status}</span></td>
                                                                <td>{formatDate(fac.start_date)}</td>
                                                                <td className="text-center">
                                                                    <button className="btn btn-sm btn-icon text-primary me-1" onClick={() => openSupportModal('facilitation', fac)} title="Edit / Update Progress"><i className="bx bx-edit"></i></button>
                                                                    <button className="btn btn-sm btn-icon text-danger" onClick={() => handleItemDelete(FacilitationAPI, fac.uid)}><i className="bx bx-trash"></i></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <p className="text-muted mb-0">No facilitations recorded.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Contacts Tab */}
                                {activeTab === "contacts" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Contacts</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('contact')}>
                                                <i className="bx bx-plus me-1"></i> Add Contact
                                            </button>
                                        </div>
                                        <div className="row g-3">
                                            {tabData?.length > 0 ? (
                                                tabData.map((contact) => (
                                                    <div key={contact.uid} className="col-md-6">
                                                        <div className="card h-100 border shadow-none">
                                                            <div className="card-body">
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <div className="avatar bg-label-primary rounded me-3 d-flex align-items-center justify-content-center">
                                                                        <span className="fw-bold">{contact.name?.[0]}</span>
                                                                    </div>
                                                                    <div className="flex-grow-1">
                                                                        <h6 className="mb-0">{contact.name}</h6>
                                                                        <small className="text-muted text-capitalize">{contact.relationship}</small>
                                                                    </div>
                                                                    <div className="dropdown">
                                                                        <button className="btn btn-icon btn-sm text-muted" onClick={() => openSupportModal('contact', contact)}><i className="bx bx-edit"></i></button>
                                                                        <button className="btn btn-icon btn-sm text-danger" onClick={() => handleItemDelete(ContactAPI, contact.uid)}><i className="bx bx-trash"></i></button>
                                                                    </div>
                                                                </div>
                                                                <div className="small">
                                                                    <div className="mb-1"><i className="bx bx-phone me-2"></i> {contact.phone}</div>
                                                                    {contact.email && <div className="mb-1"><i className="bx bx-envelope me-2"></i> {contact.email}</div>}
                                                                    <div className="mt-2 badge bg-label-secondary">Portal: {contact.portal_access}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-12 text-center py-5 bg-label-secondary rounded">
                                                    <p className="text-muted mb-0">No contacts found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tasks Tab */}
                                {activeTab === "tasks" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Tasks</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('task')}>
                                                <i className="bx bx-plus me-1"></i> New Task
                                            </button>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="list-group list-group-flush border rounded">
                                                {tabData.map((task) => (
                                                    <div key={task.uid} className="list-group-item d-flex justify-content-between align-items-center p-3">
                                                        <div className="d-flex align-items-center">
                                                            <input
                                                                className="form-check-input me-3"
                                                                type="checkbox"
                                                                checked={task.status === 'completed'}
                                                                onChange={() => handleTaskStatusToggle(task)}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                            <div>
                                                                <h6 className={`mb-0 ${task.status === 'completed' ? 'text-decoration-line-through text-muted' : ''}`}>{task.title}</h6>
                                                                <small className="text-muted">Due: {formatDate(task.due_date)}</small>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className={`badge bg-label-${getPriorityColor(task.priority)} me-2`}>{task.priority}</span>
                                                            {task.status !== 'completed' && (
                                                                <button className="btn btn-sm btn-icon text-primary" onClick={() => openSupportModal('task', task)}><i className="bx bx-edit"></i></button>
                                                            )}
                                                            <button className="btn btn-sm btn-icon text-danger" onClick={() => handleItemDelete(TaskAPI, task.uid)}><i className="bx bx-trash"></i></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <p className="text-muted mb-0">No tasks pending.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "vault" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Documents</h5>
                                            <div>
                                                <button className="btn btn-outline-primary btn-sm shadow-sm me-2" onClick={() => setShowBulkUpload(true)}>
                                                    <i className="bx bx-cloud-upload me-1"></i> Bulk Upload
                                                </button>
                                                <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('document')}>
                                                    <i className="bx bx-upload me-1"></i> Upload Document
                                                </button>
                                            </div>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="table-responsive border rounded">
                                                <table className="table table-hover mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Document</th>
                                                            <th>Uploaded On</th>
                                                            <th>Status</th>
                                                            <th className="text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tabData.map((doc) => (
                                                            <tr key={doc.uid}>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <i className="bx bxs-file-pdf fs-4 text-danger me-2"></i>
                                                                        <span className="fw-medium">{doc.requirement_name}</span>
                                                                    </div>
                                                                </td>
                                                                {/* We don't have document_type on StudentDocument directly, it's on requirement. Serializer doesn't include it flatly by default but let's assume or remove column */}
                                                                {/* Actually the serializer has requirement_name. Let's just show Requirement Name and maybe status. */}
                                                                {/* If we want type, we need to expand serializer or just skip it for now. */}
                                                                {/* <td className="text-capitalize">{doc.document_type}</td> */}
                                                                <td>{formatDate(doc.uploaded_date)}</td>
                                                                <td>
                                                                    <span className={`badge bg-label-${getDocStatusColor(doc.status)}`}>
                                                                        {doc.status}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <a href={doc.document_file} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-icon text-primary me-1" title="Download"><i className="bx bx-download"></i></a>
                                                                    <button className="btn btn-sm btn-icon text-primary me-1" onClick={() => openSupportModal('document', doc)} title="Edit"><i className="bx bx-edit"></i></button>
                                                                    <button className="btn btn-sm btn-icon text-danger" onClick={() => handleItemDelete(DocumentAPI, doc.uid, true)} title="Delete"><i className="bx bx-trash"></i></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <p className="text-muted mb-0">No documents found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Academics Tab */}
                                {activeTab === "academics" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Academic History</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('academic')}>
                                                <i className="bx bx-plus me-1"></i> Add History
                                            </button>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="timeline-xs">
                                                {tabData.map((aca) => (
                                                    <div key={aca.uid} className="timeline-item pb-4 border-start ps-3 position-relative ms-2">
                                                        <span className="position-absolute top-0 start-0 translate-middle border border-white rounded-circle bg-info p-2" style={{ width: '12px', height: '12px' }}></span>
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="badge bg-label-primary text-capitalize">{aca.qualification}</span>
                                                            <div>
                                                                <button className="btn btn-xs btn-icon text-primary" onClick={() => openSupportModal('academic', aca)}><i className="bx bx-edit"></i></button>
                                                                <button className="btn btn-xs btn-icon text-danger" onClick={() => handleItemDelete(AcademicHistoryAPI, aca.uid, true)}><i className="bx bx-trash"></i></button>
                                                            </div>
                                                        </div>
                                                        <h6 className="mb-1">{aca.institution_name}</h6>
                                                        <p className="mb-0 text-muted small">
                                                            {aca.start_year} - {aca.end_year || "Present"} • Grade: {aca.grade}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <p className="text-muted mb-0">No academic history found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Course Applications Tab */}
                                {activeTab === "course_applications" && (
                                    <div className="animate__animated animate__fadeIn animate__faster">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="mb-0 text-primary fw-bold">Course Applications</h5>
                                            <button className="btn btn-primary btn-sm shadow-sm" onClick={() => openSupportModal('course_allocation')}>
                                                <i className="bx bx-plus me-1"></i> New Application
                                            </button>
                                        </div>
                                        {tabData?.length > 0 ? (
                                            <div className="row g-3">
                                                {tabData.map((alloc) => (
                                                    <div key={alloc.uid} className="col-12">
                                                        <div className="card border shadow-none h-100">
                                                            <div className="card-body p-3">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div className="flex-grow-1">
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <span className={`badge bg-${alloc.priority === 1 ? 'success' : alloc.priority === 2 ? 'info' : 'secondary'} me-2`}>
                                                                                {alloc.priority === 1 ? '1st' : alloc.priority === 2 ? '2nd' : `${alloc.priority}th`}
                                                                            </span>
                                                                            <h6 className="mb-0 fw-bold">{alloc.course_name || alloc.university_course_details?.course_name || 'N/A'}</h6>
                                                                        </div>
                                                                        <p className="text-muted mb-2 small">
                                                                            <i className="bx bx-buildings me-1"></i>
                                                                            {alloc.university_name || alloc.university_course_details?.university_name || 'N/A'}
                                                                            <span className="mx-2">•</span>
                                                                            <i className="bx bx-globe me-1"></i>
                                                                            {alloc.country_name || alloc.university_course_details?.country_name || 'N/A'}
                                                                        </p>
                                                                        <div className="d-flex flex-wrap gap-2">
                                                                            <span className={`badge bg-label-${getStatusColor(alloc.status)}`}>
                                                                                <i className="bx bx-check-circle me-1"></i>
                                                                                {alloc.status?.replace('_', ' ')}
                                                                            </span>
                                                                            {alloc.intake_period && (
                                                                                <span className="badge bg-label-primary">
                                                                                    <i className="bx bx-calendar me-1"></i>
                                                                                    {alloc.intake_period} Intake
                                                                                </span>
                                                                            )}
                                                                            <span className="badge bg-label-secondary">
                                                                                <i className="bx bx-time me-1"></i>
                                                                                Applied: {formatDate(alloc.application_date)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex gap-1">
                                                                        <button className="btn btn-sm btn-icon text-primary" onClick={() => openSupportModal('course_allocation', alloc)} title="Edit">
                                                                            <i className="bx bx-edit"></i>
                                                                        </button>
                                                                        <button className="btn btn-sm btn-icon text-danger" onClick={() => handleItemDelete(CourseAllocationAPI, alloc.uid)} title="Delete">
                                                                            <i className="bx bx-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 bg-label-secondary rounded">
                                                <i className="bx bxs-graduation fs-1 text-muted"></i>
                                                <p className="text-muted mb-0 mt-2">No course applications found.</p>
                                                <small className="text-muted">Click "New Application" to add a course application.</small>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showStudentModal && (
                <StudentModal
                    selectedObj={selectedObj}
                    onSuccess={() => {
                        fetchStudent();
                        setSelectedObj(null);
                        setShowStudentModal(false);
                    }}
                    onClose={() => {
                        setSelectedObj(null);
                        setShowStudentModal(false);
                    }}
                />
            )}

            {supportModalType && (
                <StudentSupportModal
                    type={supportModalType}
                    studentId={student.uid}
                    selectedObj={supportModalObj}
                    onSuccess={() => {
                        fetchTabContent();
                        setSupportModalType(null);
                        setSupportModalObj(null);
                    }}
                    onClose={() => {
                        setSupportModalType(null);
                        setSupportModalObj(null);
                    }}
                />
            )}

            {showBulkUpload && (
                <BulkDocumentUploadModal
                    studentId={student.uid}
                    onSuccess={() => {
                        fetchTabContent();
                        // Only close if all done? Or keep open? 
                        // Usually better to let user close after seeing success, or close automatically.
                        // Let's keep it open so they see green checks, but they can close manually.
                        // Actually, if onSuccess is called from Modal after loop, maybe we just refresh tab.
                    }}
                    onClose={() => setShowBulkUpload(false)}
                />
            )}
        </>
    );
};




