import React, { useEffect, useState, useCallback, useRef } from "react";
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
    const tabIndexRef = useRef(0);
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);

    const updateTabIndex = (index) => {
        tabIndexRef.current = index;
    };

    useEffect(() => {
        updateTabIndex(0);
        setTabsError([false, false, false]);
        setIsValidTab([false, false, false]);
        setOtherError({});
    }, [selectedObj]);

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
                if (!value) return true;
                const dob = new Date(value);
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }
                return age >= 16;
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
        graduation_year: Yup.number().nullable().transform((v, o) => (o === '' ? null : v))
            .typeError("Must be a number")
            .min(1900, "Invalid Year")
            .max(new Date().getFullYear() + 10, "Year cannot be too far in the future"),
        source: Yup.string().nullable(),
        status: Yup.string().nullable(),
        assigned_counselor: Yup.string().nullable(),
    });

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ];

    const maritalStatusOptions = [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' },
    ];

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            const submitData = { ...values };
            // Clean empty optional fields if necessary or let backend handle it
            if (!submitData.middle_name) delete submitData.middle_name;
            if (!submitData.whatsapp_number) delete submitData.whatsapp_number;
            if (!submitData.passport_number) delete submitData.passport_number;
            if (!submitData.passport_expiry) delete submitData.passport_expiry;
            if (!submitData.assigned_counselor) delete submitData.assigned_counselor;
            if (!submitData.source) delete submitData.source;
            if (!submitData.status) delete submitData.status;

            setSubmitting(true);
            let result;
            if (selectedObj?.uid) {
                result = await updateStudent(selectedObj.uid, submitData);
            } else {
                result = await createStudent(submitData);
            }

            if (result) {
                showToast("success", `Student ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleCloseModal();
                resetForm();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Student submission error:", error);
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);
                setOtherError(errorData);
                showToast("warning", "Validation Failed");
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

    const validateTab = useCallback(async (values, setFieldError, setFieldTouched) => {
        const stepFields = [
            ["first_name", "middle_name", "last_name", "date_of_birth", "gender", "marital_status", "nationality", "passport_number", "passport_expiry"],
            ["personal_email", "personal_phone", "whatsapp_number", "address", "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship"],
            ["highest_qualification", "previous_school", "graduation_year", "source", "status", "assigned_counselor"]
        ];

        const currentIndex = tabIndexRef.current;
        const fieldsToCheck = stepFields[currentIndex] || [];
        let allValid = true;

        await Promise.all(fieldsToCheck.map(async (field) => {
            try {
                // For optional fields that have validation if present (like graduation_year)
                if (field === 'graduation_year' && !values[field]) return;

                await validationSchema.validateAt(field, values);
            } catch (err) {
                allValid = false;
                setFieldTouched(field, true, false);
                setFieldError(field, err.message);
            }
        }));

        return allValid;
    }, [validationSchema]);

    const handleNextStep = useCallback(async (
        handleNext,
        validateForm,
        setFieldTouched
    ) => {
        const currentIndex = tabIndexRef.current;
        const errors = await validateForm();
        
        const stepFields = [
            ["first_name", "middle_name", "last_name", "date_of_birth", "gender", "marital_status", "nationality", "passport_number", "passport_expiry"],
            ["personal_email", "personal_phone", "whatsapp_number", "address", "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship"],
            ["highest_qualification", "previous_school", "graduation_year", "source", "status", "assigned_counselor"]
        ];

        const fieldsToCheck = stepFields[currentIndex] || [];
        let hasError = false;

        // Check if any field in the current step has an error
        fieldsToCheck.forEach(field => {
            if (errors[field]) {
                hasError = true;
                setFieldTouched(field, true, true); // Mark as touched to show error
            }
        });

        if (!hasError) {
            setIsValidTab((prev) => {
                const updated = [...prev];
                updated[currentIndex] = true;
                return updated;
            });
            setTabsError((prev) => {
                const updated = [...prev];
                updated[currentIndex] = false;
                return updated;
            });
            handleNext();
        } else {
            setIsValidTab((prev) => {
                const updated = [...prev];
                updated[currentIndex] = false;
                return updated;
            });
            setTabsError((prev) => {
                const updated = [...prev];
                updated[currentIndex] = true;
                return updated;
            });
            showToast("warning", "Please fix the errors before proceeding.");
        }
    }, []);

    const handleFinalSubmit = useCallback(async (
        values,
        setSubmitting,
        resetForm,
        setErrors,
        setFieldError,
        setFieldTouched,
        validateForm
    ) => {
        const currentIndex = tabIndexRef.current;
        // Run validation for the final tab/step as well
        const errors = await validateForm();
        const stepFields = [
             ["first_name", "middle_name", "last_name", "date_of_birth", "gender", "marital_status", "nationality", "passport_number", "passport_expiry"],
             ["personal_email", "personal_phone", "whatsapp_number", "address", "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship"],
             ["highest_qualification", "previous_school", "graduation_year", "source", "status", "assigned_counselor"]
        ];
        const fieldsToCheck = stepFields[currentIndex] || [];
        let hasError = false;

        fieldsToCheck.forEach(field => {
             if (errors[field]) {
                 hasError = true;
                 setFieldTouched(field, true, true);
             }
        });
        
        // Also check if any previous steps have errors? 
        // Usually final submit triggers validateForm which checks everything. 
        // But handleSubmit (passed to Formik) is only called if isValid is true.
        // Formik's handleSubmit automatically validates. 
        // But we are wrapping the submit button. 

        // If we rely on Formik's handleSubmit, we just need to trigger submitForm().
        // But here we are calling handleSubmit manually.

        // Let's stick to the pattern: validate current tab, then if valid, submit.
        // Actually, since it's "Update" or "Save", we should probably validate the WHOLE form.
        // Formik's `submitForm` does that.

        if (!hasError) {
             // We rely on Formik's validation for the whole form before submission logic runs in handleSubmit
             // But here we manually called handleSubmit.
             // The correct way with Formik is to just call submitForm().
             // But the code structure calls `handleSubmit(values, ...)` directly.
             
             // Let's check if the whole form is valid using the errors object we just got.
             if (Object.keys(errors).length === 0) {
                handleSubmit(values, { setSubmitting, resetForm, setErrors });
             } else {
                 // If there are errors (even in previous tabs), show them
                 // Mark all fields as touched to show errors everywhere?
                 // Or just rely on the fact that we check errors.
                 showToast("warning", "Please fix the errors before submitting.");
                 setIsValidTab((prev) => {
                    const updated = [...prev];
                    updated[currentIndex] = false;
                    return updated;
                 });
                 setTabsError((prev) => {
                     // We might want to highlight which tabs have errors
                     // But for now let's just update current tab error
                     const updated = [...prev];
                     updated[currentIndex] = true; // Assuming error is in this tab for now, or just general error
                     return updated;
                 });
             }
        } else {
            setIsValidTab((prev) => {
                const updated = [...prev];
                updated[currentIndex] = false;
                return updated;
            });
            setTabsError((prev) => {
                const updated = [...prev];
                updated[currentIndex] = true;
                return updated;
            });
            showToast("warning", "Please fix the errors before proceeding.");
        }
    }, [handleSubmit]);

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="studentModal"
            tabIndex="-1"
            aria-labelledby="studentModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title" id="studentModalLabel">
                            <i className="bx bx-user me-2"></i>
                            {selectedObj ? "Update Student" : "Create New Student"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={handleCloseModal}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <Formik
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
                                validateForm
                            }) => (
                                <Form>
                                    <FormWizard
                                        startIndex={0}
                                        shape="circle"
                                        stepSize="xs"
                                        onTabChange={({ nextIndex }) => {
                                            updateTabIndex(nextIndex);
                                        }}
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
                                                onClick={() => handleNextStep(
                                                    handleNext,
                                                    validateForm,
                                                    setFieldTouched
                                                )}
                                            >
                                                Next <i className="bx bx-right-arrow-alt"></i>
                                            </button>
                                        )}
                                        finishButtonTemplate={() => (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-success"
                                                style={{ minWidth: "150px", marginLeft: "auto" }}
                                                disabled={isSubmitting}
                                                onClick={() => handleFinalSubmit(
                                                    values,
                                                    setSubmitting,
                                                    resetForm,
                                                    setErrors,
                                                    setFieldError,
                                                    setFieldTouched,
                                                    validateForm
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
                                                    <ErrorMessage name="first_name" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Middle Name</label>
                                                    <Field name="middle_name" className="form-control" placeholder="Doe" />
                                                    <ErrorMessage name="middle_name" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Last Name *</label>
                                                    <Field name="last_name" className="form-control" placeholder="Smith" />
                                                    <ErrorMessage name="last_name" component="div" className="text-danger small" />
                                                </div>
                                            </div>
                                            <div className="row text-start">
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Date of Birth *</label>
                                                    <Field type="date" name="date_of_birth" className="form-control" />
                                                    <ErrorMessage name="date_of_birth" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Gender *</label>
                                                    <Field as="select" name="gender" className="form-select">
                                                        <option value="">Select Gender</option>
                                                        {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </Field>
                                                    <ErrorMessage name="gender" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Marital Status</label>
                                                    <Field as="select" name="marital_status" className="form-select">
                                                        <option value="">Select Status</option>
                                                        {maritalStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </Field>
                                                    <ErrorMessage name="marital_status" component="div" className="text-danger small" />
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
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Passport Number</label>
                                                    <Field name="passport_number" className="form-control" placeholder="Optional" />
                                                    <ErrorMessage name="passport_number" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Passport Expiry</label>
                                                    <Field type="date" name="passport_expiry" className="form-control" />
                                                    <ErrorMessage name="passport_expiry" component="div" className="text-danger small" />
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
                                                    <ErrorMessage name="personal_email" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Personal Phone *</label>
                                                    <Field name="personal_phone" className="form-control" placeholder="+1234567890" />
                                                    <ErrorMessage name="personal_phone" component="div" className="text-danger small" />
                                                </div>
                                            </div>
                                            <div className="row text-start">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">WhatsApp Number</label>
                                                    <Field name="whatsapp_number" className="form-control" placeholder="+1234567890" />
                                                    <ErrorMessage name="whatsapp_number" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Address *</label>
                                                    <Field as="textarea" name="address" className="form-control" rows="2" placeholder="Full Address" />
                                                    <ErrorMessage name="address" component="div" className="text-danger small" />
                                                </div>
                                            </div>
                                            <hr />
                                            <h6 className="text-start text-primary">Emergency Contact</h6>
                                            <div className="row text-start">
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Contact Name *</label>
                                                    <Field name="emergency_contact_name" className="form-control" />
                                                    <ErrorMessage name="emergency_contact_name" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Contact Phone *</label>
                                                    <Field name="emergency_contact_phone" className="form-control" />
                                                    <ErrorMessage name="emergency_contact_phone" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Relationship *</label>
                                                    <Field name="emergency_contact_relationship" className="form-control" placeholder="e.g. Father" />
                                                    <ErrorMessage name="emergency_contact_relationship" component="div" className="text-danger small" />
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
                                                    <Field name="highest_qualification" className="form-control" placeholder="e.g. High School" />
                                                    <ErrorMessage name="highest_qualification" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Previous School</label>
                                                    <Field name="previous_school" className="form-control" />
                                                    <ErrorMessage name="previous_school" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label">Graduation Year</label>
                                                    <Field type="number" name="graduation_year" className="form-control" placeholder="YYYY" />
                                                    <ErrorMessage name="graduation_year" component="div" className="text-danger small" />
                                                </div>
                                            </div>
                                            <div className="row text-start">
                                                <div className="col-md-4 mb-3">
                                                    <FormikSelect
                                                        name="source"
                                                        label="Source"
                                                        url="/unisync360-students/sources/"
                                                        containerClass="mb-0"
                                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                        placeholder="Select Source"
                                                    />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <FormikSelect
                                                        name="status"
                                                        label="Status"
                                                        url="/unisync360-students/statuses/"
                                                        containerClass="mb-0"
                                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                        placeholder="Select Status"
                                                    />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <FormikSelect
                                                        name="assigned_counselor"
                                                        label="Counselor"
                                                        url="/users-list/"
                                                        containerClass="mb-0"
                                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                                        mapOption={(item) => ({ value: item.guid || item.uid || item.id, label: `${item.first_name} ${item.last_name}` })}
                                                        placeholder="Assign Counselor"
                                                    />
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
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
            <style>{`
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