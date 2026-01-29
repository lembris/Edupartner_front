import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createStudent, updateStudent } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";

export const StudentModal = ({ selectedObj, onSuccess, onClose }) => {
    const [errors, setOtherError] = useState({});
    const [tabsError, setTabsError] = useState([false, false, false]);
    const [isValidTab, setIsValidTab] = useState([false, false, false]);
    const [tabIndex, setTabIndex] = useState(0);
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);
    const previousTabIndexRef = useRef(0);

    useEffect(() => {
        // Reset state ONLY on mount, not on every render
        setTabIndex(0);
        setTabsError([false, false, false]);
        setIsValidTab([false, false, false]);
        setOtherError({});
    }, []);

    // Initialize modal when component mounts
    useEffect(() => {
        let modal = null;
        if (modalRef.current && window.bootstrap) {
            modal = new window.bootstrap.Modal(modalRef.current, {
                backdrop: 'static',
                keyboard: false
            });
            setModalInstance(modal);

            // Show modal immediately
            modal.show();
        }

        return () => {
            // Cleanup on unmount
            if (modal) {
                modal.hide();
            }
        };
    }, []);

    // Handle modal hidden event
    useEffect(() => {
        const handleHidden = () => {
            if (onClose) onClose();
        };

        if (modalRef.current) {
            modalRef.current.addEventListener('hidden.bs.modal', handleHidden);
        }

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
        source: selectedObj?.source?.uid || selectedObj?.source || "",
        status: selectedObj?.status?.uid || selectedObj?.status || "",
        assigned_counselor: selectedObj?.assigned_counselor?.uid || selectedObj?.assigned_counselor || "",
    };

    const validationSchema = Yup.object().shape({
        // Tab 1: Personal Info
        first_name: Yup.string().required("First Name is required"),
        middle_name: Yup.string().nullable(),
        last_name: Yup.string().required("Last Name is required"),
        date_of_birth: Yup.string().required("Date of Birth is required")
            .test("min-age", "Student must be at least 16 years old", value => {
                if (!value) return false; // Explicitly fail if no value
                try {
                    const dob = new Date(value);
                    if (isNaN(dob.getTime())) return false; // Invalid date
                    const today = new Date();
                    let age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                        age--;
                    }
                    return age >= 16;
                } catch (e) {
                    return false;
                }
            }),
        gender: Yup.string().required("Gender is required"),
        marital_status: Yup.string().nullable(),
        nationality: Yup.string().required("Nationality is required"),
        passport_number: Yup.string().nullable(),
        passport_expiry: Yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr),

        // Tab 2: Contact Info
        personal_email: Yup.string().email("Invalid email format").required("Email is required"),
        personal_phone: Yup.string().required("Phone number is required"),
        whatsapp_number: Yup.string().nullable(),
        address: Yup.string().required("Address is required"),
        emergency_contact_name: Yup.string().required("Emergency Contact Name is required"),
        emergency_contact_phone: Yup.string().required("Emergency Contact Phone is required"),
        emergency_contact_relationship: Yup.string().required("Relationship is required"),

        // Tab 3: Academic & Status
        highest_qualification: Yup.string().nullable(),
        previous_school: Yup.string().nullable(),
        graduation_year: Yup.number().required("Graduation Year is required")
            .typeError("Must be a valid number")
            .min(1900, "Invalid Year")
            .max(new Date().getFullYear() + 10, "Year cannot be too far in the future"),
        source: Yup.string().required("Source is required"),
        status: Yup.string().required("Status is required"),
        assigned_counselor: Yup.string().required("Counselor is required"),
    });

    const handleTabChange = useCallback(({ nextIndex }) => {
        setTabIndex(nextIndex);
    }, []);

    const genderOptions = useMemo(() => [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ], []);

    const maritalStatusOptions = useMemo(() => [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' },
    ], []);

    const relationshipOptions = useMemo(() => [
        { value: 'parent', label: 'Parent' },
        { value: 'guardian', label: 'Guardian' },
        { value: 'sibling', label: 'Sibling' },
        { value: 'relative', label: 'Relative' },
        { value: 'friend', label: 'Friend' },
        { value: 'other', label: 'Other' },
    ], []);

    const highestQualificationOptions = useMemo(() => [
        { value: 'advanced_secondary', label: 'Advanced Secondary' },
        { value: 'ordinary_secondary', label: 'Ordinary Secondary' },
        { value: 'higher_education', label: 'Higher education' },
        { value: 'others', label: 'Others' },
    ], []);

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            const submitData = { ...values };
            // Clean empty optional fields only
            if (!submitData.middle_name) delete submitData.middle_name;
            if (!submitData.whatsapp_number) delete submitData.whatsapp_number;
            if (!submitData.passport_number) delete submitData.passport_number;
            if (!submitData.passport_expiry) delete submitData.passport_expiry;
            if (!submitData.highest_qualification) delete submitData.highest_qualification;
            if (!submitData.marital_status) delete submitData.marital_status;

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

            setSubmitting(true);
            let result;
            if (selectedObj?.uid) {
                result = await updateStudent(selectedObj.uid, submitData);
            } else {
                result = await createStudent(submitData);
            }

            // Check if result has status and it's successful (200 or 8000)
            if (result?.status === 200 || result?.status === 8000) {
                showToast("success", `Student ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleCloseModal();
                resetForm();
                if (onSuccess) onSuccess();
            } else if (result?.status === 8002) {
                // Validation error - show error details in toast and keep modal open
                setErrors(result.data);
                setOtherError(result.data);

                // Extract error messages from the response
                const errorMessages = [];
                if (result.data && typeof result.data === 'object') {
                    for (const [field, messages] of Object.entries(result.data)) {
                        if (Array.isArray(messages)) {
                            errorMessages.push(...messages);
                        } else {
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
                    setOtherError(result.data);
                }
            }
        } catch (error) {
            console.error("Student submission error:", error);
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);
                setOtherError(errorData);

                // Check if it's a validation error (8002)
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

    const handleCloseModal = () => {
        setOtherError({});
        if (modalInstance) {
            modalInstance.hide();
        }
        if (onClose) onClose();
    };

    const validateTab = useCallback(async (values, setFieldError, setTouched, currentTabIndex) => {
        const stepFields = [
            ["first_name", "last_name", "date_of_birth", "gender", "nationality"],
            ["personal_email", "personal_phone", "address", "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship"],
            ["graduation_year", "source", "status", "assigned_counselor"]
        ];

        const fieldsToCheck = stepFields[currentTabIndex] || [];
        let hasError = false;
        const errorFields = [];

        // Validate only current tab fields
        for (const field of fieldsToCheck) {
            try {
                await validationSchema.validateAt(field, values);
            } catch (err) {
                hasError = true;
                errorFields.push(field);
                setTouched({ [field]: true }, false);
                setFieldError(field, err.message);
            }
        }

        if (hasError) {
            const fieldLabels = errorFields.map(f => f.replace(/_/g, ' ').toUpperCase()).join(', ');
            showToast(`Please fix errors in: ${fieldLabels}`, "warning");
        }

        return !hasError;
    }, [validationSchema]);

    const handleTabChanged = useCallback(async (
        { handleNext },
        values,
        setSubmitting,
        resetForm,
        setErrors,
        setFieldError,
        setTouched,
        lastTab
    ) => {
        // Validate the current tab (the one we're on RIGHT NOW, not the one we're moving to)
        const currentTabIndex = previousTabIndexRef.current;
        const isValid = await validateTab(values, setFieldError, setTouched, currentTabIndex);

        // Use setTimeout to ensure state updates process properly
        setTimeout(() => {
            if (isValid) {
                setIsValidTab((prev) => {
                    const updated = [...prev];
                    updated[currentTabIndex] = true;
                    return updated;
                });
                setTabsError((prev) => {
                    const updated = [...prev];
                    updated[currentTabIndex] = false;
                    return updated;
                });

                // Update the previous tab ref for next time
                previousTabIndexRef.current = currentTabIndex + 1;

                if (currentTabIndex === lastTab) {
                    // Last tab - submit form
                    handleSubmit(values, { setSubmitting, resetForm, setErrors, setTouched });
                } else {
                    // Move to next tab
                    handleNext();
                }
            } else {
                setIsValidTab((prev) => {
                    const updated = [...prev];
                    updated[currentTabIndex] = false;
                    return updated;
                });
                setTabsError((prev) => {
                    const updated = [...prev];
                    updated[currentTabIndex] = true;
                    return updated;
                });
            }
        }, 0);

        return isValid;
    }, [validateTab, handleSubmit]);

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="studentModal"
            tabIndex="-1"
            aria-labelledby="studentModalLabel"
            aria-hidden="true"
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="studentModalLabel">
                            <i className="bx bx-user me-2"></i>
                            {selectedObj ? "Update Student" : "Create New Student"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleCloseModal}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <Formik
                            key={selectedObj?.uid || 'new'}
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({
                                isSubmitting,
                                setSubmitting,
                                values,
                                setFieldValue,
                                resetForm,
                                setErrors,
                                setFieldError,
                                setTouched,
                                setFieldTouched,
                                validateForm,
                                errors,
                                touched
                            }) => {
                                // Safe render - no state updates here
                                return (
                                    <Form>
                                        <FormWizard
                                            startIndex={0}
                                            shape="circle"
                                            stepSize="xs"
                                            onTabChange={handleTabChange}
                                            backButtonTemplate={(handlePrevious) => (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-secondary"
                                                    style={{ minWidth: "100px" }}
                                                    onClick={handlePrevious}
                                                >
                                                    <i className="bx bx-left-arrow-alt"></i> Back
                                                </button>
                                            )}
                                            nextButtonTemplate={(handleNext) => (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary"
                                                    style={{ minWidth: "100px", marginLeft: "auto" }}
                                                    onClick={async () => await handleTabChanged(
                                                        { handleNext },
                                                        values,
                                                        setSubmitting,
                                                        resetForm,
                                                        setErrors,
                                                        setFieldError,
                                                        setFieldTouched,
                                                        2  // Last tab index (0, 1, 2)
                                                    )}
                                                >
                                                    Next <i className="bx bx-right-arrow-alt"></i>
                                                </button>
                                            )}
                                            finishButtonTemplate={(handleNext) => (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-success"
                                                    style={{ minWidth: "150px", marginLeft: "auto" }}
                                                    disabled={isSubmitting}
                                                    onClick={async () => await handleTabChanged(
                                                        { handleNext },
                                                        values,
                                                        setSubmitting,
                                                        resetForm,
                                                        setErrors,
                                                        setFieldError,
                                                        setFieldTouched,
                                                        2  // Last tab index (0, 1, 2)
                                                    )}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <i className="bx bx-loader-alt bx-spin"></i> Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bx bx-save"></i> {selectedObj ? "Update" : "Save"}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        >
                                            {/* Tab 1: Basic Information */}
                                            <FormWizard.TabContent
                                                title="Personal Info"
                                                icon="bx bx-user"
                                                showErrorOnTab={tabsError[0]}
                                            >
                                                <div className="row text-start">
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">First Name *</label>
                                                        <Field name="first_name" className="form-control" placeholder="John" />
                                                        {errors.first_name && <div className="text-danger small">{errors.first_name}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Middle Name</label>
                                                        <Field name="middle_name" className="form-control" placeholder="Doe" />
                                                        {errors.middle_name && <div className="text-danger small">{errors.middle_name}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Last Name *</label>
                                                        <Field name="last_name" className="form-control" placeholder="Smith" />
                                                        {errors.last_name && <div className="text-danger small">{errors.last_name}</div>}
                                                    </div>
                                                </div>
                                                <div className="row text-start">
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Date of Birth *</label>
                                                        <Field type="date" name="date_of_birth" className="form-control" />
                                                        {errors.date_of_birth && <div className="text-danger small">{errors.date_of_birth}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Gender *</label>
                                                        <Field as="select" name="gender" className="form-select">
                                                            <option value="">Select Gender</option>
                                                            {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                        </Field>
                                                        {errors.gender && <div className="text-danger small">{errors.gender}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Marital Status</label>
                                                        <Field as="select" name="marital_status" className="form-select">
                                                            <option value="">Select Status</option>
                                                            {maritalStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                        </Field>
                                                        {errors.marital_status && <div className="text-danger small">{errors.marital_status}</div>}
                                                    </div>
                                                </div>
                                                <div className="row text-start">
                                                    <div className="col-md-4 mb-3">
                                                        <FormikSelect
                                                            name="nationality"
                                                            label="Nationality *"
                                                            url="/countries/"
                                                            containerClass="mb-0"
                                                            filters={{ page: 1, page_size: 100, paginated: true }}
                                                            mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                            placeholder="Select Country"
                                                            isRequired={true}
                                                        />
                                                        {errors.nationality && <div className="text-danger small">{errors.nationality}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Passport Number</label>
                                                        <Field name="passport_number" className="form-control" placeholder="Optional" />
                                                        {errors.passport_number && <div className="text-danger small">{errors.passport_number}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Passport Expiry</label>
                                                        <Field type="date" name="passport_expiry" className="form-control" />
                                                        {errors.passport_expiry && <div className="text-danger small">{errors.passport_expiry}</div>}
                                                    </div>
                                                </div>
                                            </FormWizard.TabContent>

                                            {/* Tab 2: Contact Information */}
                                            <FormWizard.TabContent
                                                title="Contact Info"
                                                icon="bx bx-phone"
                                                showErrorOnTab={tabsError[1]}
                                            >
                                                <div className="row text-start">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Personal Email *</label>
                                                        <Field type="email" name="personal_email" className="form-control" placeholder="john@example.com" />
                                                        {errors.personal_email && <div className="text-danger small">{errors.personal_email}</div>}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Personal Phone *</label>
                                                        <Field name="personal_phone" className="form-control" placeholder="+1234567890" />
                                                        {errors.personal_phone && <div className="text-danger small">{errors.personal_phone}</div>}
                                                    </div>
                                                </div>
                                                <div className="row text-start">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">WhatsApp Number</label>
                                                        <Field name="whatsapp_number" className="form-control" placeholder="+1234567890" />
                                                        {errors.whatsapp_number && <div className="text-danger small">{errors.whatsapp_number}</div>}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Address *</label>
                                                        <Field as="textarea" name="address" className="form-control" rows="2" placeholder="Full Address" />
                                                        {errors.address && <div className="text-danger small">{errors.address}</div>}
                                                    </div>
                                                </div>
                                                <hr />
                                                <h6 className="text-start text-primary">Emergency Contact</h6>
                                                <div className="row text-start">
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Contact Name *</label>
                                                        <Field name="emergency_contact_name" className="form-control" />
                                                        {errors.emergency_contact_name && <div className="text-danger small">{errors.emergency_contact_name}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Contact Phone *</label>
                                                        <Field name="emergency_contact_phone" className="form-control" />
                                                        {errors.emergency_contact_phone && <div className="text-danger small">{errors.emergency_contact_phone}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Relationship *</label>
                                                        <Field as="select" name="emergency_contact_relationship" className="form-select">
                                                            <option value="">Select Relationship</option>
                                                            {relationshipOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                        </Field>
                                                        {errors.emergency_contact_relationship && <div className="text-danger small">{errors.emergency_contact_relationship}</div>}
                                                    </div>
                                                </div>
                                            </FormWizard.TabContent>

                                            {/* Tab 3: Academic & Status */}
                                            <FormWizard.TabContent
                                                title="Academic & Status"
                                                icon="bx bx-book"
                                                showErrorOnTab={tabsError[2]}
                                            >
                                                <div className="row text-start">
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Highest Qualification</label>
                                                        <Field as="select" name="highest_qualification" className="form-select">
                                                            <option value="">Select Qualification</option>
                                                            {highestQualificationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                        </Field>
                                                        {errors.highest_qualification && <div className="text-danger small">{errors.highest_qualification}</div>}
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Previous School</label>
                                                        {(values.highest_qualification === 'advanced_secondary' || values.highest_qualification === 'ordinary_secondary') ? (
                                                            <>
                                                                <FormikSelect
                                                                    name="previous_school_id"
                                                                    label=""
                                                                    url="/unisync360-institutions/schools/"
                                                                    containerClass="mb-0"
                                                                    filters={{ page: 1, page_size: 100, paginated: true }}
                                                                    mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                                    placeholder="Select School"
                                                                />
                                                                {errors.previous_school_id && <div className="text-danger small">{errors.previous_school_id}</div>}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Field name="previous_school" className="form-control" placeholder="Enter school name" />
                                                                {errors.previous_school && <div className="text-danger small">{errors.previous_school}</div>}
                                                            </>
                                                        )}
                                                    </div>


                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Graduation Year</label>
                                                        <Field type="number" name="graduation_year" className="form-control" placeholder="YYYY" />
                                                        {errors.graduation_year && <div className="text-danger small">{errors.graduation_year}</div>}
                                                    </div>
                                                </div>
                                                <div className="row text-start">
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
                                                </div>
                                            </FormWizard.TabContent>
                                        </FormWizard>

                                        {errors.non_field_errors && errors.non_field_errors.length > 0 && (
                                            <div className="alert alert-danger mx-3">
                                                {errors.non_field_errors.map((error, index) => (
                                                    <div key={index}>{error}</div>
                                                ))}
                                            </div>
                                        )}
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
                </div>
            </div>
            <style>{`
                 #studentModal {
                   z-index: 1100 !important;
                   position: fixed !important;
                   top: 0;
                   left: 0;
                   width: 100%;
                   height: 100%;
                   display: flex !important;
                   align-items: center;
                   justify-content: center;
                 }
                 #studentModal.show {
                   display: flex !important;
                 }
                 #studentModal.modal {
                   background-color: transparent !important;
                 }
                 #studentModal::before {
                   content: '';
                   position: fixed;
                   top: 0;
                   left: 0;
                   width: 100%;
                   height: 100%;
                   background-color: rgba(0, 0, 0, 0.5);
                   z-index: 1099 !important;
                 }
                 #studentModal .modal-dialog {
                   z-index: 1101 !important;
                   margin: 0;
                   max-width: 800px;
                 }
                 #studentModal .modal-content {
                   z-index: 1101 !important;
                   box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                 }
                 .form-control, .form-select {
                    height: 38px;
                    padding: 0.375rem 0.75rem;
                    font-size: 1rem;
                  }
                  textarea.form-control {
                    height: auto;
                  }
                  .wizard-card-footer {
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                  }
             `}</style>
        </div>,
        document.body
    );
};