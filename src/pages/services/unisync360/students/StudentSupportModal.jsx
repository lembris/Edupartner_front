import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    CommunicationAPI, AppointmentAPI, ReminderAPI,
    ContactAPI, TaskAPI, AlertAPI, FacilitationAPI,
    FacilitationStepAPI, FacilitationProgressAPI,
    DocumentAPI, AcademicHistoryAPI, CourseAllocationAPI
} from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../components/modal/GlobalModal";

const StudentSupportModal = ({ show, type, studentId, selectedObj, onSuccess, onClose }) => {
    let initialValues = {};
    let validationSchema = {};
    let api = null;
    let title = "";
    const [showPassword, setShowPassword] = useState(false);

    // State for Facilitation Timeline
    const [steps, setSteps] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loadingSteps, setLoadingSteps] = useState(false);
    const [localFacilitation, setLocalFacilitation] = useState(null);

    // Add Step State
    const [showAddStep, setShowAddStep] = useState(false);
    const [newStepName, setNewStepName] = useState("");
    const [newStepDesc, setNewStepDesc] = useState("");

    // Course Allocation State - Standard intake months
    const intakeMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        setLocalFacilitation(selectedObj);

        // Fetch details if facilitation editing
        if (type === 'facilitation' && selectedObj?.uid) {
            fetchFacilitationDetails();
        }
    }, [selectedObj, type]);

    const fetchFacilitationDetails = async () => {
        if (!selectedObj?.uid) return;

        try {
            setLoadingSteps(true);

            // Fetch current facilitation state (in case we updated it)
            if (localFacilitation) {
                try {
                    const facRes = await FacilitationAPI.getAll({ uid: selectedObj.uid }); // or .get(uid) if implemented
                    // createCRUD.getAll usually takes params. createCRUD doesn't have .get(uid) unless we made it.
                    // In Queries.jsx: createCRUD has getAll, create, update, delete. 
                    // getAll takes params. So FacilitationAPI.getAll({ uid: ... }) isn't standard for ID fetch.
                    // usually we filter. 
                    // BUT wait, Query.jsx createCRUD definition:
                    // getAll: async (params = {}) => ... get(`${API_URL}/${endpoint}/`, { params }) ...
                    // It doesn't have a 'get single by id' method unless we add it.
                    // However, typically we can filter by ID or use the list if we just want refresh.
                    // Let's assume getAll({ uid: ... }) works if backend supports it (it does: get(request, uid=None)).
                    // The backend View has `def get(self, request, uid=None)`.
                    // But the URL `/unisync360-facilitation/requests/` (list) and `/unisync360-facilitation/requests/<uid>/` (detail) are different.
                    // `getAll` uses the list endpoint.
                    // We need a `get` method in createCRUD or use `update` (patch) to refresh? No.
                    // I'll just skip refreshing the facilitation object for now to avoid breaking things, 
                    // OR I can try to fetch steps/progress which is the main goal.
                } catch (e) { }
            }

            // 1. Fetch Steps
            if (selectedObj.service) {
                const stepsRes = await FacilitationStepAPI.getAll({ service: selectedObj.service });
                if (stepsRes.status === 8000) {
                    setSteps(stepsRes.data || []);
                }
            }

            // 2. Fetch Progress
            const progressRes = await FacilitationProgressAPI.getAll({ facilitation: selectedObj.uid });
            if (progressRes.status === 8000) {
                setProgress(progressRes.data || []);
            }

        } catch (err) {
            console.error("Error fetching timeline:", err);
        } finally {
            setLoadingSteps(false);
        }
    };

    const handleMarkComplete = async (stepUid) => {
        try {
            const data = {
                facilitation: selectedObj.uid,
                step: stepUid,
                status: 'completed',
                completed_date: new Date().toISOString(),
            };

            const res = await FacilitationProgressAPI.create(data);
            if (res.status === 8000) {
                showToast("success", "Step marked as completed");
                fetchFacilitationDetails(); // Refresh timeline
            } else {
                showToast("error", res.message || "Failed to update step");
            }
        } catch (err) {
            console.error(err);
            showToast("error", "Failed to update step");
        }
    };

    const handleAddStep = async () => {
        if (!newStepName.trim()) {
            showToast("error", "Step name is required");
            return;
        }

        try {
            await FacilitationStepAPI.create({
                service: selectedObj.service,
                name: newStepName,
                description: newStepDesc,
                order: steps.length + 1,
                is_required: true
            });
            fetchFacilitationDetails();
            showToast("success", "Step added successfully");
            setShowAddStep(false);
            setNewStepName("");
            setNewStepDesc("");
        } catch (e) {
            console.error(e);
            showToast("error", "Failed to add step");
        }
    };

    // Helper for datetime-local input (YYYY-MM-DDTHH:mm)
    const toDateTimeInput = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Adjust to local time for input
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const localDate = new Date(date.getTime() - offsetMs);
        return localDate.toISOString().slice(0, 16);
    };

    // Helper to convert local input back to UTC ISO
    const toUTCISOString = (localString) => {
        if (!localString) return null;
        const date = new Date(localString);
        return date.toISOString();
    };

    // Configuration based on type
    switch (type) {
        case 'communication':
            api = CommunicationAPI;
            title = selectedObj ? "Edit Communication" : "Log Communication";
            initialValues = {
                communication_type: selectedObj?.communication_type || 'phone',
                subject: selectedObj?.subject || '',
                message: selectedObj?.message || '',
                scheduled_date: toDateTimeInput(selectedObj?.scheduled_date),
                completed_date: toDateTimeInput(selectedObj?.completed_date),
                is_completed: selectedObj?.is_completed || false,
            };
            validationSchema = Yup.object({
                communication_type: Yup.string().required("Type is required"),
                subject: Yup.string().required("Subject is required"),
                message: Yup.string().required("Message is required"),
            });
            break;

        case 'appointment':
            api = AppointmentAPI;
            title = selectedObj ? "Edit Appointment" : "Schedule Appointment";
            initialValues = {
                title: selectedObj?.title || '',
                description: selectedObj?.description || '',
                appointment_date: toDateTimeInput(selectedObj?.appointment_date),
                location: selectedObj?.location || '',
                status: selectedObj?.status || 'scheduled',
                attendees: selectedObj?.attendees || [], // Array of user GUIDs
            };
            validationSchema = Yup.object({
                title: Yup.string().required("Title is required"),
                appointment_date: Yup.date().required("Date is required"),
            });
            break;

        case 'reminder':
            api = ReminderAPI;
            title = selectedObj ? "Edit Reminder" : "Add Reminder";
            initialValues = {
                title: selectedObj?.title || '',
                message: selectedObj?.message || '',
                reminder_date: toDateTimeInput(selectedObj?.reminder_date),
            };
            validationSchema = Yup.object({
                title: Yup.string().required("Title is required"),
                reminder_date: Yup.date().required("Date is required"),
            });
            break;

        case 'contact':
            api = ContactAPI;
            title = selectedObj ? "Edit Contact" : "Add Contact";
            initialValues = {
                name: selectedObj?.name || '',
                relationship: selectedObj?.relationship || 'other',
                phone: selectedObj?.phone || '',
                email: selectedObj?.email || '',
                address: selectedObj?.address || '',
                portal_access: selectedObj?.portal_access || 'none',
                is_primary: selectedObj?.is_primary || false,
                password: '', // For creating/updating user
            };
            validationSchema = Yup.object({
                name: Yup.string().required("Name is required"),
                relationship: Yup.string().required("Relationship is required"),
                phone: Yup.string().required("Phone is required"),
                password: Yup.string().when('portal_access', {
                    is: (val) => val && val !== 'none',
                    then: (schema) => {
                        // Require password if creating new contact OR if existing contact doesn't have a user account yet
                        if (!selectedObj || !selectedObj.user) {
                            return schema.required("Password is required to enable portal access").min(6, "Password must be at least 6 characters");
                        }
                        // Editing existing contact who already has a user: Password is optional
                        return schema.test('password-strength', 'Password must be at least 6 characters', function (value) {
                            if (!value) return true; // Allow empty to keep unchanged
                            return value.length >= 6;
                        });
                    },
                    otherwise: (schema) => schema.notRequired(),
                }),
            });
            break;

        case 'task':
            api = TaskAPI;
            title = selectedObj ? "Edit Task" : "Add Task";
            initialValues = {
                title: selectedObj?.title || '',
                description: selectedObj?.description || '',
                assigned_to: selectedObj?.assigned_to || '', // User GUID
                priority: selectedObj?.priority || 'medium',
                status: selectedObj?.status || 'pending',
                due_date: toDateTimeInput(selectedObj?.due_date),
            };
            validationSchema = Yup.object({
                title: Yup.string().required("Title is required"),
                assigned_to: Yup.string().required("Assignee is required"),
                due_date: Yup.date().required("Due date is required"),
            });
            break;

        case 'alert':
            api = AlertAPI;
            title = selectedObj ? "Edit Alert" : "Add Alert";
            initialValues = {
                title: selectedObj?.title || '',
                message: selectedObj?.message || '',
                severity: selectedObj?.severity || 'info',
            };
            validationSchema = Yup.object({
                title: Yup.string().required("Title is required"),
                message: Yup.string().required("Message is required"),
                severity: Yup.string().required("Severity is required"),
            });
            break;

        case 'facilitation':
            api = FacilitationAPI;
            title = selectedObj ? "Edit Request" : "New Request";
            initialValues = {
                service: selectedObj?.service || '',
                notes: selectedObj?.notes || '',
                status: selectedObj?.status || 'pending',
            };
            validationSchema = Yup.object({
                service: Yup.string().required("Service is required"),
            });
            break;

        case 'document':
            api = DocumentAPI; // Ensure this API handles file uploads correctly (multipart/form-data)
            title = selectedObj ? "Edit Document" : "Upload Document";
            initialValues = {
                requirement: selectedObj?.requirement || '',
                status: selectedObj?.status || 'pending',
                document_file: null, // For file upload
            };
            validationSchema = Yup.object({
                requirement: Yup.string().required("Requirement is required"),
            });
            break;

        case 'academic':
            api = AcademicHistoryAPI;
            title = selectedObj ? "Edit Academic History" : "Add Academic History";
            initialValues = {
                qualification: selectedObj?.qualification || '',
                institution_name: selectedObj?.institution_name || '',
                school: selectedObj?.school || '',
                index_number: selectedObj?.index_number || '',
                start_year: selectedObj?.start_year || '',
                end_year: selectedObj?.end_year || '',
                grade: selectedObj?.grade || '',
            };
            validationSchema = Yup.object({
                qualification: Yup.string().required("Qualification is required"),
                start_year: Yup.number().required("Start Year is required").min(1900, "Invalid Year"),
                end_year: Yup.number().required("Graduation Year is required").min(1900, "Invalid Year"),

                school: Yup.string().when('qualification', {
                    is: (val) => ['o_level', 'a_level'].includes(val),
                    then: (schema) => schema.required("School is required"),
                    otherwise: (schema) => schema.nullable()
                }),
                index_number: Yup.string().when('qualification', {
                    is: (val) => ['o_level', 'a_level'].includes(val),
                    then: (schema) => schema.required("Index Number is required"),
                    otherwise: (schema) => schema.nullable()
                }),
                institution_name: Yup.string().when('qualification', {
                    is: (val) => !['o_level', 'a_level'].includes(val),
                    then: (schema) => schema.required("Institution Name is required"),
                    otherwise: (schema) => schema.nullable()
                }),
            });
            break;

        case 'course_allocation':
            api = CourseAllocationAPI;
            title = selectedObj ? "Edit Course Application" : "New Course Application";
            initialValues = {
                university_course: selectedObj?.university_course || '',
                priority: selectedObj?.priority || 1,
                status: selectedObj?.status || 'pending',
                application_date: selectedObj?.application_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                intake_period: selectedObj?.intake_period || '',
            };
            validationSchema = Yup.object({
                university_course: Yup.string().required("Course is required"),
                priority: Yup.number().required("Priority is required").min(1, "Priority must be at least 1"),
                status: Yup.string().required("Status is required"),
                intake_period: Yup.string().required("Intake period is required"),
            });
            break;

        default:
            return null;
    }

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            let submitData;
            let isMultipart = false;

            if (type === 'document') {
                isMultipart = true;
                submitData = new FormData();
                submitData.append('student', studentId);
                submitData.append('requirement', values.requirement);
                submitData.append('status', values.status);

                if (values.document_file) {
                    submitData.append('document_file', values.document_file);
                }
            } else {
                submitData = { ...values, student: studentId };

                // Convert date fields back to UTC ISO string or null if empty
                const safeToUTC = (val) => val ? toUTCISOString(val) : null;

                if ('scheduled_date' in submitData) submitData.scheduled_date = safeToUTC(submitData.scheduled_date);
                if ('completed_date' in submitData) submitData.completed_date = safeToUTC(submitData.completed_date);
                if ('appointment_date' in submitData) submitData.appointment_date = safeToUTC(submitData.appointment_date);
                if ('reminder_date' in submitData) submitData.reminder_date = safeToUTC(submitData.reminder_date);
                if ('due_date' in submitData) submitData.due_date = safeToUTC(submitData.due_date);
            }

            setSubmitting(true);

            let result;
            if (selectedObj?.uid) {
                result = await api.update(selectedObj.uid, submitData);
            } else {
                result = await api.create(submitData);
            }

            if (result && result.status === 8000) {
                showToast("success", `${title} Successful`);
                handleClose();
                if (onSuccess) onSuccess();
            } else {
                showToast("error", result?.message || "Operation failed");
                if (result?.status === 8002 && result.data) {
                    setErrors(result.data);
                }
            }
        } catch (error) {
            console.error("Submission error:", error);
            showToast("error", "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={title}
            onSubmit={handleSubmit}
            loading={false}
            submitText="Save Changes"
            size="lg"
        >
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        {/* --- Communication Fields --- */}
                        {type === 'communication' && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <Field as="select" name="communication_type" className="form-select">
                                        <option value="phone">Phone Call</option>
                                        <option value="email">Email</option>
                                        <option value="sms">SMS</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="video_call">Video Call</option>
                                    </Field>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Subject</label>
                                    <Field name="subject" className="form-control" />
                                    <ErrorMessage name="subject" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message/Notes</label>
                                    <Field as="textarea" name="message" className="form-control" rows="3" />
                                    <ErrorMessage name="message" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <div className="form-check">
                                        <Field type="checkbox" name="is_completed" className="form-check-input" id="commCompleted" />
                                        <label className="form-check-label" htmlFor="commCompleted">Completed</label>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- Appointment Fields --- */}
                        {type === 'appointment' && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <Field name="title" className="form-control" />
                                    <ErrorMessage name="title" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date & Time</label>
                                    <Field type="datetime-local" name="appointment_date" className="form-control" />
                                    <ErrorMessage name="appointment_date" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Location/Link</label>
                                    <Field name="location" className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <Field as="textarea" name="description" className="form-control" rows="2" />
                                </div>
                                <div className="mb-3">
                                    <FormikSelect
                                        name="attendees"
                                        label="Attendees"
                                        url="/users-list/"
                                        isMulti={true}
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                        mapOption={(item) => ({ value: item.guid, label: `${item.first_name} ${item.last_name}` })}
                                        placeholder="Select Attendees"
                                    />
                                </div>
                            </>
                        )}

                        {/* --- Reminder Fields --- */}
                        {type === 'reminder' && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <Field name="title" className="form-control" />
                                    <ErrorMessage name="title" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date & Time</label>
                                    <Field type="datetime-local" name="reminder_date" className="form-control" />
                                    <ErrorMessage name="reminder_date" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message</label>
                                    <Field as="textarea" name="message" className="form-control" rows="2" />
                                </div>
                            </>
                        )}

                        {/* --- Contact Fields --- */}
                        {type === 'contact' && (
                            <>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Name</label>
                                        <Field name="name" className="form-control" />
                                        <ErrorMessage name="name" component="div" className="text-danger small" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Relationship</label>
                                        <Field as="select" name="relationship" className="form-select">
                                            <option value="father">Father</option>
                                            <option value="mother">Mother</option>
                                            <option value="guardian">Guardian</option>
                                            <option value="sponsor">Sponsor</option>
                                            <option value="self">Self</option>
                                            <option value="other">Other</option>
                                        </Field>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Phone</label>
                                    <Field name="phone" className="form-control" />
                                    <ErrorMessage name="phone" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <Field type="email" name="email" className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Portal Access</label>
                                    <Field as="select" name="portal_access" className="form-select">
                                        <option value="none">No Access</option>
                                        <option value="view">View Only</option>
                                        <option value="full">Full Access</option>
                                    </Field>
                                </div>
                                {values.portal_access !== 'none' && (
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Password {(!selectedObj || !selectedObj.user) ? <span className="text-danger">*</span> : <small className="text-muted fw-normal">(Leave blank to keep unchanged)</small>}
                                        </label>
                                        <div className="input-group">
                                            <Field
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="form-control"
                                                placeholder="Set login password"
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}></i>
                                            </button>
                                        </div>
                                        <ErrorMessage name="password" component="div" className="text-danger small" />
                                    </div>
                                )}
                            </>
                        )}

                        {/* --- Task Fields --- */}
                        {type === 'task' && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <Field name="title" className="form-control" />
                                    <ErrorMessage name="title" component="div" className="text-danger small" />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Due Date</label>
                                        <Field type="datetime-local" name="due_date" className="form-control" />
                                        <ErrorMessage name="due_date" component="div" className="text-danger small" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Priority</label>
                                        <Field as="select" name="priority" className="form-select">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </Field>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <FormikSelect
                                        name="assigned_to"
                                        label="Assign To"
                                        url="/users-list/"
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                        mapOption={(item) => ({ value: item.guid, label: `${item.first_name} ${item.last_name}` })}
                                        placeholder="Select User"
                                    />
                                    <ErrorMessage name="assigned_to" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <Field as="textarea" name="description" className="form-control" rows="2" />
                                </div>
                            </>
                        )}

                        {/* --- Alert Fields --- */}
                        {type === 'alert' && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <Field name="title" className="form-control" />
                                    <ErrorMessage name="title" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Severity</label>
                                    <Field as="select" name="severity" className="form-select">
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="critical">Critical</option>
                                    </Field>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message</label>
                                    <Field as="textarea" name="message" className="form-control" rows="3" />
                                    <ErrorMessage name="message" component="div" className="text-danger small" />
                                </div>
                            </>
                        )}

                        {/* --- Facilitation Fields --- */}
                        {type === 'facilitation' && (
                            <>
                                <div className="mb-3">
                                    <FormikSelect
                                        name="service"
                                        label="Service"
                                        url="/unisync360-facilitation/services/"
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                                        placeholder="Select Service"
                                        isDisabled={!!selectedObj}
                                    />
                                    <ErrorMessage name="service" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <Field as="select" name="status" className="form-select">
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </Field>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Notes</label>
                                    <Field as="textarea" name="notes" className="form-control" rows="3" placeholder="Any specific details..." />
                                </div>

                                {selectedObj && (
                                    <div className="mt-4 pt-3 border-top">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0">Processing Timeline</h6>
                                            <div>
                                                <button type="button" className="btn btn-xs btn-icon text-primary me-1" onClick={fetchFacilitationDetails} title="Refresh Timeline">
                                                    <i className="bx bx-refresh fs-4"></i>
                                                </button>
                                                {!showAddStep && (
                                                    <button type="button" className="btn btn-xs btn-outline-primary" onClick={() => setShowAddStep(true)} title="Add New Step">
                                                        <i className="bx bx-plus"></i> Add Step
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {showAddStep && (
                                            <div className="card mb-3 bg-light border-0">
                                                <div className="card-body p-3">
                                                    <h6 className="card-title mb-2 text-primary">New Process Step</h6>
                                                    <div className="mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Step Name (e.g. Document Verification)"
                                                            value={newStepName}
                                                            onChange={(e) => setNewStepName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Description (Optional)"
                                                            value={newStepDesc}
                                                            onChange={(e) => setNewStepDesc(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button type="button" className="btn btn-xs btn-secondary" onClick={() => {
                                                            setShowAddStep(false);
                                                            setNewStepName("");
                                                            setNewStepDesc("");
                                                        }}>Cancel</button>
                                                        <button type="button" className="btn btn-xs btn-primary" onClick={handleAddStep}>Save Step</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {loadingSteps ? (
                                            <div className="text-center py-2"><span className="spinner-border spinner-border-sm text-primary"></span> Loading timeline...</div>
                                        ) : (
                                            <div className="timeline-wrapper">
                                                {steps.length === 0 ? (
                                                    <div className="alert alert-light text-center small">
                                                        No processing steps defined for this service.
                                                    </div>
                                                ) : (
                                                    <div className="timeline-xs ms-2">
                                                        {steps.map((step, index) => {
                                                            const stepProgress = progress.find(p => p.step === step.uid);
                                                            const isCompleted = !!stepProgress;

                                                            return (
                                                                <div key={step.uid} className="timeline-item pb-4 border-start ps-3 position-relative ms-2">
                                                                    <span className={`position-absolute top-0 start-0 translate-middle border border-white rounded-circle p-2 d-flex align-items-center justify-content-center text-white shadow-sm ${isCompleted ? 'bg-success' : 'bg-secondary'}`} style={{ width: '24px', height: '24px' }}>
                                                                        {isCompleted ? <i className="bx bx-check"></i> : <span style={{ fontSize: '10px' }}>{index + 1}</span>}
                                                                    </span>

                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <div>
                                                                            <h6 className={`mb-1 ${isCompleted ? 'text-success' : ''}`}>{step.name}</h6>
                                                                            {step.description && <p className="mb-1 text-muted small">{step.description}</p>}

                                                                            {isCompleted && stepProgress && (
                                                                                <small className="text-muted d-block bg-light p-1 rounded px-2 mt-1">
                                                                                    <i className="bx bx-check-double me-1 text-success"></i>
                                                                                    {new Date(stepProgress.completed_date).toLocaleDateString()}
                                                                                    {stepProgress.completed_by_details && ` by ${stepProgress.completed_by_details.first_name}`}
                                                                                </small>
                                                                            )}
                                                                        </div>

                                                                        {!isCompleted && (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-xs btn-outline-primary ms-2 text-nowrap"
                                                                                onClick={() => handleMarkComplete(step.uid)}
                                                                            >
                                                                                Mark Done
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* --- Document Fields --- */}
                        {type === 'document' && (
                            <>
                                <div className="mb-3">
                                    <FormikSelect
                                        name="requirement"
                                        label="Document Requirement"
                                        url="/unisync360-applications/document-requirements/"
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 100, paginated: true, is_active: true }}
                                        mapOption={(item) => ({ value: item.uid, label: `${item.name} (${item.document_type})` })}
                                        placeholder="Select Requirement"
                                    />
                                    <ErrorMessage name="requirement" component="div" className="text-danger small" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <Field as="select" name="status" className="form-select">
                                        <option value="pending">Pending</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="verified">Verified</option>
                                        <option value="rejected">Rejected</option>
                                    </Field>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Upload Document</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={(event) => {
                                            const file = event.target.files[0];
                                            if (file) {
                                                values.document_file = file;
                                            }
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* --- Academic History Fields --- */}
                        {type === 'academic' && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Qualification</label>
                                    <Field as="select" name="qualification" className="form-select">
                                        <option value="">Select Qualification</option>
                                        <option value="o_level">O Level</option>
                                        <option value="a_level">A Level</option>
                                        <option value="diploma">Diploma</option>
                                        <option value="bachelors">Bachelor's Degree</option>
                                        <option value="masters">Master's Degree</option>
                                        <option value="phd">PhD</option>
                                        <option value="other">Other</option>
                                    </Field>
                                    <ErrorMessage name="qualification" component="div" className="text-danger small" />
                                </div>

                                {['o_level', 'a_level'].includes(values.qualification) ? (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">School</label>
                                            <Field name="school" className="form-control" placeholder="School Name" />
                                            <ErrorMessage name="school" component="div" className="text-danger small" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Index Number</label>
                                            <Field name="index_number" className="form-control" placeholder="Index Number" />
                                            <ErrorMessage name="index_number" component="div" className="text-danger small" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="mb-3">
                                        <label className="form-label">Institution Name</label>
                                        <Field name="institution_name" className="form-control" />
                                        <ErrorMessage name="institution_name" component="div" className="text-danger small" />
                                    </div>
                                )}

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Start Year</label>
                                        <Field type="number" name="start_year" className="form-control" placeholder="YYYY" />
                                        <ErrorMessage name="start_year" component="div" className="text-danger small" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Graduation Year</label>
                                        <Field type="number" name="end_year" className="form-control" placeholder="YYYY" />
                                        <ErrorMessage name="end_year" component="div" className="text-danger small" />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Grade/GPA/DIV</label>
                                    <Field name="grade" className="form-control" placeholder="e.g. 3.5/4.0 or A ot 3.13" />
                                </div>
                            </>
                        )}

                        {/* --- Course Allocation Fields --- */}
                        {type === 'course_allocation' && (
                            <>
                                <div className="mb-3">
                                    <FormikSelect
                                        name="university_course"
                                        label="University Course"
                                        url="/unisync360-academic/university-courses/"
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 100, paginated: true, is_active: true }}
                                        mapOption={(item) => ({
                                            value: item.uid,
                                            label: `${item.course_name} - ${item.university_name} (${item.country_name})`
                                        })}
                                        placeholder="Select Course"
                                    />
                                    <ErrorMessage name="university_course" component="div" className="text-danger small" />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Priority</label>
                                        <Field type="number" name="priority" className="form-control" min="1" />
                                        <ErrorMessage name="priority" component="div" className="text-danger small" />
                                        <small className="text-muted">1 = 1st choice, 2 = 2nd choice, etc.</small>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Status</label>
                                        <Field as="select" name="status" className="form-select">
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="waiting_list">Waiting List</option>
                                            <option value="offer_received">Offer Received</option>
                                        </Field>
                                        <ErrorMessage name="status" component="div" className="text-danger small" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Application Date</label>
                                        <Field type="date" name="application_date" className="form-control" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Intake Period</label>
                                        <Field as="select" name="intake_period" className="form-select">
                                            <option value="">Select Intake Month</option>
                                            {intakeMonths.map((month) => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="intake_period" component="div" className="text-danger small" />
                                    </div>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </Formik>
        </GlobalModal>
    );
};

export default StudentSupportModal;
