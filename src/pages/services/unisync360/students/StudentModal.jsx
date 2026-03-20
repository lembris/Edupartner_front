import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createStudent, updateStudent } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import { useSelector } from "react-redux";

<<<<<<< Updated upstream
export const StudentModal = ({ selectedObj, onSuccess, onClose, isLeadLancer = false }) => {
    const [errors, setOtherError] = useState({});
    const [tabsError, setTabsError] = useState([false, false, false]);
    const [isValidTab, setIsValidTab] = useState([false, false, false]);
    const [tabIndex, setTabIndex] = useState(0);
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);
    const previousTabIndexRef = useRef(0);
    
    // Get user from Redux
    const user = useSelector((state) => state.userReducer?.data);
    
    // Check if user is admin
    const isAdmin = user?.is_superuser || user?.groups?.some(g => 
        g.includes('admin') || g.includes('super_admin')
    );
    
    // Check if this is a new student being added by lead lancer
    const isLeadLancerAddingStudent = isLeadLancer && !selectedObj;

    // Fetch Lead Lancer source and Review status for pre-filling
    const [leadLancerSourceId, setLeadLancerSourceId] = useState(null);
    const [reviewStatusId, setReviewStatusId] = useState(null);

    useEffect(() => {
        const fetchSourceAndStatus = async () => {
            if (isLeadLancerAddingStudent) {
                try {
                    // Fetch "Lead Lancer" source
                    const sourcesResponse = await fetch("/unisync360-students/sources/?page=1&page_size=100&search=Lead%20Lancer");
                    const sourcesData = await sourcesResponse.json();
                    const leadLancerSource = sourcesData.results?.find(s => s.name === "Lead Lancer");
                    if (leadLancerSource) {
                        setLeadLancerSourceId(leadLancerSource.uid);
                    }

                    // Fetch "Review" status
                    const statusResponse = await fetch("/unisync360-students/statuses/?page=1&page_size=100&search=Review");
                    const statusData = await statusResponse.json();
                    const reviewStatus = statusData.results?.find(s => s.name === "Review");
                    if (reviewStatus) {
                        setReviewStatusId(reviewStatus.uid);
                    }
                } catch (error) {
                    console.error("Error fetching source and status:", error);
                }
            }
        };
        fetchSourceAndStatus();
    }, [isLeadLancerAddingStudent]);
=======
export const StudentModal = ({ selectedObj, isLeadLancer = false, onSuccess, onClose }) => {
    const modalRef = useRef(null);
    const [initialValues, setInitialValues] = useState({
        first_name: "",
        last_name: "",
        personal_email: "",
        personal_phone: "",
        gender: "",
        date_of_birth: "",
        nationality: "",
        source: "",
        status: "",
        profile_picture: "",
    });
>>>>>>> Stashed changes

    // Show/hide modal using Bootstrap API
    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        if (window.bootstrap) {
            const modal = new window.bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
            modal.show();

            return () => {
                modal.hide();
            };
        }
    }, []);

    useEffect(() => {
        if (selectedObj) {
            setInitialValues({
                first_name: selectedObj.first_name || "",
                last_name: selectedObj.last_name || "",
                personal_email: selectedObj.personal_email || "",
                personal_phone: selectedObj.personal_phone || "",
                gender: selectedObj.gender || "",
                date_of_birth: selectedObj.date_of_birth || "",
                nationality: selectedObj.nationality?.uid || selectedObj.nationality || "",
                source: selectedObj.source?.uid || selectedObj.source || "",
                status: selectedObj.status?.uid || selectedObj.status || "",
                profile_picture: selectedObj.profile_picture || "",
            });
        } else {
            setInitialValues({
                first_name: "",
                last_name: "",
                personal_email: "",
                personal_phone: "",
                gender: "",
                date_of_birth: "",
                nationality: "",
                source: "",
                status: "",
                profile_picture: "",
            });
        }
<<<<<<< Updated upstream

        return () => {
            if (modalRef.current) {
                modalRef.current.removeEventListener('hidden.bs.modal', handleHidden);
            }
        };
    }, [onClose]);

    const initialValues = {
        // Basic Information
        first_name: selectedObj?.first_name || "",
        middle_name: selectedObj?.middle_name || "",
        last_name: selectedObj?.last_name || "",
        date_of_birth: selectedObj?.date_of_birth || "",
        gender: selectedObj?.gender || "",
        marital_status: selectedObj?.marital_status || "",
        nationality: selectedObj?.nationality?.uid || selectedObj?.nationality || "",
        passport_number: selectedObj?.passport_number || "",
        passport_expiry: selectedObj?.passport_expiry || "",

        // Contact Information
        personal_email: selectedObj?.personal_email || "",
        personal_phone: selectedObj?.personal_phone || "",
        whatsapp_number: selectedObj?.whatsapp_number || "",
        address: selectedObj?.address || "",
        emergency_contact_name: selectedObj?.emergency_contact_name || "",
        emergency_contact_phone: selectedObj?.emergency_contact_phone || "",
        emergency_contact_relationship: selectedObj?.emergency_contact_relationship || "",

        // Academic & Status
        highest_qualification: selectedObj?.highest_qualification || "",
        previous_school: selectedObj?.previous_school || "",
        previous_school_id: selectedObj?.previous_school_id?.uid || selectedObj?.previous_school_id || "",
        graduation_year: selectedObj?.graduation_year || "",
        source: isLeadLancerAddingStudent && leadLancerSourceId 
            ? leadLancerSourceId 
            : (selectedObj?.source?.uid || selectedObj?.source || ""),
        status: isLeadLancerAddingStudent && reviewStatusId
            ? reviewStatusId
            : (selectedObj?.status?.uid || selectedObj?.status || ""),
        // Auto-set assigned_counselor for non-admin users when creating new student
        assigned_counselor: selectedObj?.assigned_counselor?.uid || selectedObj?.assigned_counselor 
            || (!isAdmin && !isLeadLancerAddingStudent && user?.guid ? user.guid : ""),
    };
=======
    }, [selectedObj]);
>>>>>>> Stashed changes

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        personal_email: Yup.string().email("Must be a valid email").required("Email is required"),
        personal_phone: Yup.string().required("Phone is required"),
        gender: Yup.string().required("Gender is required"),
        date_of_birth: Yup.string().required("Date of birth is required"),
        nationality: Yup.string().required("Nationality is required"),
        source: Yup.string().required("Source is required"),
<<<<<<< Updated upstream
        // For non-admin users adding students, assigned_counselor is auto-set
        assigned_counselor: (!isAdmin && !isLeadLancerAddingStudent)
            ? Yup.string().nullable()  // Auto-set, not required
            : isLeadLancerAddingStudent 
                ? Yup.string().nullable() 
                : Yup.string().required("Counselor is required"),
=======
        status: Yup.string().required("Status is required"),
>>>>>>> Stashed changes
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
<<<<<<< Updated upstream
            const submitData = { ...values };
            // Clean empty optional fields only
            if (!submitData.middle_name) delete submitData.middle_name;
            if (!submitData.whatsapp_number) delete submitData.whatsapp_number;
            if (!submitData.passport_number) delete submitData.passport_number;
            if (!submitData.passport_expiry) delete submitData.passport_expiry;
            if (!submitData.highest_qualification) delete submitData.highest_qualification;
            if (!submitData.marital_status) delete submitData.marital_status;
            
            // For lead lancer adding student, don't include assigned_counselor
            if (isLeadLancerAddingStudent) {
                delete submitData.assigned_counselor;
            }

            // Handle previous_school based on qualification type
            if (submitData.highest_qualification === 'advanced_secondary' || submitData.highest_qualification === 'ordinary_secondary') {
                // Use previous_school_id for secondary qualifications
                if (submitData.previous_school_id) {
                    submitData.previous_school_id = submitData.previous_school_id;
                }
                delete submitData.previous_school;
            } else {
                // Use previous_school text for other qualifications
                if (submitData.previous_school) {
                    submitData.previous_school = submitData.previous_school;
                }
                delete submitData.previous_school_id;
            }

=======
>>>>>>> Stashed changes
            setSubmitting(true);

            let result;
            if (selectedObj) {
                result = await updateStudent(selectedObj.uid, values);
            } else {
                result = await createStudent(values);
            }

            // Check if result has status and handle accordingly
            if (result?.status === 8000) {
                showToast("success", `Student ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else if (result?.status === 8002) {
                // Validation error - show error details in toast and keep modal open
                setErrors(result.data);

                // Extract error messages from the response
                const errorMessages = [];
                if (result.data && typeof result.data === 'object') {
                    for (const [field, messages] of Object.entries(result.data)) {
                        if (Array.isArray(messages)) {
                            errorMessages.push(...messages);
                        } else if (typeof messages === 'string') {
                            errorMessages.push(messages);
                        }
                    }
                }

                const errorText = errorMessages.length > 0
                    ? errorMessages.join('. ')
                    : "Validation Failed";
                showToast("warning", errorText);
            } else {
                // Other errors
                const errorMessage = result?.message || "Something went wrong while saving student";
                showToast("error", errorMessage);
                if (result?.data) {
                    setErrors(result.data);
                }
            }
        } catch (error) {
            console.error("Student submission error:", error);
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);

                // Check if it's a validation error (8002) or 400 Bad Request
                if (error.response?.data?.status === 8002 || error.response?.status === 400) {
                    // Extract error messages from the response data
                    const errorMessages = [];
                    const data = error.response?.data?.data || error.response?.data;

                    if (data && typeof data === 'object') {
                        for (const [field, messages] of Object.entries(data)) {
                            if (Array.isArray(messages)) {
                                errorMessages.push(...messages);
                            } else if (typeof messages === 'string') {
                                errorMessages.push(messages);
                            }
                        }
                    }

                    const errorText = errorMessages.length > 0
                        ? errorMessages.join('. ')
                        : "Validation Failed";
                    showToast("warning", errorText);
                } else {
                    showToast("warning", error.response?.data?.message || "Validation Failed");
                }
            } else {
                showToast("error", "Something went wrong while saving student");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        // Manually hide bootstrap modal if needed
        const modalElement = document.getElementById("studentModal");
        if (window.bootstrap && modalElement) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    };

    return (
        <div
            ref={modalRef}
            className="modal fade"
            id="studentModal"
            tabIndex="-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bx bxs-user me-2"></i>
                            {selectedObj ? "Update Student" : "Add New Student"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={handleClose}
                        ></button>
                    </div>

                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({
                            isSubmitting,
                            values,
                            setFieldValue,
                            errors
                        }) => (
                            <Form>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="first_name" className="form-label">
                                                First Name <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="first_name"
                                                className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
                                                placeholder="e.g., John"
                                            />
                                            <ErrorMessage name="first_name" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="last_name" className="form-label">
                                                Last Name <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="last_name"
                                                className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
                                                placeholder="e.g., Doe"
                                            />
                                            <ErrorMessage name="last_name" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="personal_email" className="form-label">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="email"
                                                name="personal_email"
                                                className={`form-control ${errors.personal_email ? "is-invalid" : ""}`}
                                                placeholder="e.g., john@example.com"
                                            />
                                            <ErrorMessage name="personal_email" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="personal_phone" className="form-label">
                                                Phone <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="tel"
                                                name="personal_phone"
                                                className={`form-control ${errors.personal_phone ? "is-invalid" : ""}`}
                                                placeholder="e.g., +1234567890"
                                            />
                                            <ErrorMessage name="personal_phone" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="gender" className="form-label">
                                                Gender <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                as="select"
                                                name="gender"
                                                className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </Field>
                                            <ErrorMessage name="gender" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="date_of_birth" className="form-label">
                                                Date of Birth <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="date"
                                                name="date_of_birth"
                                                className={`form-control ${errors.date_of_birth ? "is-invalid" : ""}`}
                                            />
                                            <ErrorMessage name="date_of_birth" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="nationality"
                                                label="Nationality *"
                                                url="/unisync360-students/nationalities/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Nationality"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="source"
                                                label="Source *"
                                                url="/unisync360-students/sources/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Source"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <FormikSelect
                                                name="status"
                                                label="Status *"
                                                url="/unisync360-students/statuses/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Status"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                    </div>
                                </div>

<<<<<<< Updated upstream

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Graduation Year</label>
                                                        <Field type="number" name="graduation_year" className="form-control" placeholder="YYYY" />
                                                        {errors.graduation_year && <div className="text-danger small">{errors.graduation_year}</div>}
                                                    </div>
                                                </div>
                                                <div className="row text-start">
                                                    {!isLeadLancer && (
                                                    <div className="col-md-4 mb-3">
                                                        <FormikSelect
                                                            name="source"
                                                            label="Source *"
                                                            url="/unisync360-students/sources/"
                                                            containerClass="mb-0"
                                                            filters={{ page: 1, page_size: 100, paginated: true }}
                                                            mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                            placeholder="Select Source"
                                                            isRequired={true}
                                                        />
                                                        {errors.source && <div className="text-danger small">{errors.source}</div>}
                                                    </div>
                                                    )}
                                                    {!isLeadLancer && (
                                                    <div className="col-md-4 mb-3">
                                                        <FormikSelect
                                                            name="status"
                                                            label="Status *"
                                                            url="/unisync360-students/statuses/"
                                                            containerClass="mb-0"
                                                            filters={{ page: 1, page_size: 100, paginated: true }}
                                                            mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                            placeholder="Select Status"
                                                            isRequired={true}
                                                        />
                                                        {errors.status && <div className="text-danger small">{errors.status}</div>}
                                                    </div>
                                                    )}
                                                    {!isLeadLancer && (
                                                    <div className="col-md-4 mb-3">
                                                         <FormikSelect
                                                              name="assigned_counselor"
                                                              label="Counselor *"
                                                              url="/users-list/"
                                                              containerClass="mb-0"
                                                              filters={{ page: 1, page_size: 100, paginated: true }}
                                                              mapOption={(item) => ({ value: item.guid || item.uid || item.id, label: `${item.first_name} ${item.last_name}` })}
                                                             placeholder="Assign Counselor"
                                                             isRequired={true}
                                                         />
                                                         {errors.assigned_counselor && <div className="text-danger small">{errors.assigned_counselor}</div>}
                                                    </div>
                                                    )}
                                                </div>
                                            </FormWizard.TabContent>
                                        </FormWizard>

                                        {errors.non_field_errors && errors.non_field_errors.length > 0 && (
                                            <div className="alert alert-danger mx-3">
                                                {errors.non_field_errors.map((error, index) => (
                                                    <div key={index}>{error}</div>
                                                ))}
                                            </div>
=======
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            selectedObj ? "Update" : "Save"
>>>>>>> Stashed changes
                                        )}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};
