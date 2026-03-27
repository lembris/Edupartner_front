import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import { createPatient, updatePatient, getPatient } from "../Queries";
import showToast from "../../../../helpers/ToastHelper";

export const PatientModal = ({ selectedObj, onSuccess, onClose, onCreateVisit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [tabsError, setTabsError] = useState([false, false, false, false]);
    const [patientData, setPatientData] = useState(selectedObj);
    const [loadingData, setLoadingData] = useState(false);
    const [savedPatient, setSavedPatient] = useState(null);
    const formikRef = useRef(null);

    const isEditMode = !!selectedObj?.uid;

    useEffect(() => {
        if (selectedObj?.uid) {
            setLoadingData(true);
            getPatient(selectedObj.uid)
                .then((res) => {
                    if (res?.status === 8000 && res?.data) {
                        setPatientData(res.data);
                    }
                })
                .catch((err) => console.error("Failed to fetch patient:", err))
                .finally(() => setLoadingData(false));
        }
    }, [selectedObj?.uid]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose?.();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const handleCloseModal = () => {
        onClose?.();
    };

    const initialValues = {
        first_name: patientData?.first_name || "",
        last_name: patientData?.last_name || "",
        email: patientData?.email || "",
        phone: patientData?.phone || "",
        date_of_birth: patientData?.date_of_birth || "",
        gender: patientData?.gender || "",
        blood_group: patientData?.blood_group || "",
        patient_type: patientData?.patient_type || "REGULAR",
        address: patientData?.address || "",
        alternative_phone: patientData?.alternative_phone || "",
        emergency_contact_name: patientData?.emergency_contact_name || "",
        emergency_contact_phone: patientData?.emergency_contact_phone || "",
        emergency_contact_relationship: patientData?.emergency_contact_relationship || "",
        identification_type: patientData?.identification_type || "",
        identification_number: patientData?.identification_number || "",
        allergies: patientData?.allergies || "",
        chronic_conditions: patientData?.chronic_conditions || "",
        current_medications: patientData?.current_medications || "",
    };

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        phone: Yup.string().required("Phone number is required"),
        gender: Yup.string().required("Gender is required"),
        blood_group: Yup.string().required("Blood group is required"),
        patient_type: Yup.string().required("Patient type is required"),
        email: Yup.string().email("Invalid email").nullable(),
        date_of_birth: Yup.date().nullable().typeError("Invalid date"),
    });

    const genderOptions = [
        { value: "M", label: "Male" },
        { value: "F", label: "Female" },
        { value: "O", label: "Other" },
    ];

    const bloodGroupOptions = [
        { value: "A+", label: "A+" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B-", label: "B-" },
        { value: "AB+", label: "AB+" },
        { value: "AB-", label: "AB-" },
        { value: "O+", label: "O+" },
        { value: "O-", label: "O-" },
        { value: "UNKNOWN", label: "Unknown" },
    ];

    const patientTypeOptions = [
        { value: "REGULAR", label: "Regular" },
        { value: "INSURANCE", label: "Insurance" },
        { value: "CORPORATE", label: "Corporate" },
        { value: "VIP", label: "VIP" },
        { value: "STAFF", label: "Staff" },
    ];

    const identificationTypeOptions = [
        { value: "NATIONAL_ID", label: "National ID" },
        { value: "PASSPORT", label: "Passport" },
        { value: "DRIVERS_LICENSE", label: "Driver's License" },
        { value: "OTHER", label: "Other" },
    ];

    const tabs = [
        {
            key: "basic-info",
            title: "Basic Info",
            icon: "bx bx-user",
            validateFields: ["first_name", "last_name", "phone", "gender", "blood_group", "patient_type"],
        },
        {
            key: "identification",
            title: "Identification",
            icon: "bx bx-id-card",
            validateFields: [],
        },
        {
            key: "emergency-contact",
            title: "Emergency Contact",
            icon: "bx bx-phone",
            validateFields: [],
        },
        {
            key: "medical-info",
            title: "Medical Info",
            icon: "bx bx-first-aid",
            validateFields: [],
        },
    ];

    const handleFormSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setIsSubmitting(true);
            const submitValues = { ...values };
            Object.keys(submitValues).forEach((key) => {
                if (submitValues[key] === "") submitValues[key] = null;
            });

            let result;
            if (selectedObj?.uid) {
                result = await updatePatient(selectedObj.uid, submitValues);
            } else {
                result = await createPatient(submitValues);
            }

            if (result?.status === 8000) {
                showToast("success", `Patient ${selectedObj?.uid ? "Updated" : "Created"} Successfully`);
                if (onSuccess) onSuccess();
                if (!isEditMode && onCreateVisit) {
                    setSavedPatient(result.data);
                } else {
                    resetForm();
                    handleCloseModal();
                }
            } else if (result?.status === 8002) {
                const errors = result?.data || {};
                const errorMessages = Object.values(errors).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
                setErrors(errors);
            } else {
                showToast("error", result?.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Patient submission error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                const errorMessages = Object.values(errorData).flat().join(". ") || "Validation Failed";
                showToast("warning", errorMessages);
            } else {
                showToast("error", "Something went wrong while saving patient");
            }
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    const validateTab = useCallback(
        async (values, setFieldError, setFieldTouched, currentTabIndex) => {
            const currentTab = tabs[currentTabIndex];
            let isValid = true;

            if (currentTab?.validateFields) {
                for (const field of currentTab.validateFields) {
                    try {
                        await validationSchema.validateAt(field, values);
                    } catch (err) {
                        isValid = false;
                        if (err.path && err.message) {
                            setFieldTouched(err.path, true, false);
                            setFieldError(err.path, err.message);
                        }
                    }
                }
            }
            return isValid;
        },
        [tabs, validationSchema]
    );

    const handleTabNext = useCallback(
        async ({ handleNext }) => {
            const currentFormik = formikRef.current;
            if (!currentFormik) return;

            const { values, setFieldError, setFieldTouched } = currentFormik;
            const isValid = await validateTab(values, setFieldError, setFieldTouched, tabIndex);

            if (isValid) {
                setTabsError((prev) => {
                    const updated = [...prev];
                    updated[tabIndex] = false;
                    return updated;
                });
                handleNext();
            } else {
                setTabsError((prev) => {
                    const updated = [...prev];
                    updated[tabIndex] = true;
                    return updated;
                });
            }
        },
        [tabIndex, validateTab]
    );

    const renderBackButton = (handlePrevious) => (
        <button type="button" className="btn btn-sm btn-primary" style={{ width: "100px" }} onClick={handlePrevious}>
            <i className="bx bx-left-arrow-alt"></i> Back
        </button>
    );

    const renderNextButton = (handleNext) => (
        <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{ width: "100px", marginLeft: "auto" }}
            onClick={async () => await handleTabNext({ handleNext })}
        >
            Next <i className="bx bx-right-arrow-alt"></i>
        </button>
    );

    const renderFinishButton = () => (
        <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{ width: "150px", marginLeft: "auto" }}
            disabled={isSubmitting}
            onClick={async () => {
                const currentFormik = formikRef.current;
                if (!currentFormik) return;
                const { values, setSubmitting, resetForm, setErrors, setFieldError, setFieldTouched } = currentFormik;
                const isValid = await validateTab(values, setFieldError, setFieldTouched, tabIndex);
                if (isValid) {
                    handleFormSubmit(values, { setSubmitting, resetForm, setErrors });
                } else {
                    setTabsError((prev) => {
                        const updated = [...prev];
                        updated[tabIndex] = true;
                        return updated;
                    });
                }
            }}
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
    );

    return createPortal(
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
            }}
        >
            <div
                className="modal-content"
                style={{
                    width: "85vw",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                    <h5 style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="bx bx-user-plus"></i>
                        {isEditMode ? "Update Patient" : "Add New Patient"}
                    </h5>
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        aria-label="Close"
                        style={{ border: "none", background: "#6b7280", color: "#fff", borderRadius: "50%", width: "1.75rem", height: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.1rem", padding: 0, lineHeight: 1 }}
                    >
                        <i className="bx bx-x"></i>
                    </button>
                </div>
                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                    {savedPatient ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5">
                            <div className="bg-success bg-opacity-10 rounded-circle p-4 mb-4">
                                <i className="bx bx-check-circle text-success" style={{ fontSize: "3rem" }}></i>
                            </div>
                            <h4 className="fw-bold mb-2">Patient Registered Successfully!</h4>
                            <p className="text-muted mb-1">
                                <strong>{savedPatient.first_name} {savedPatient.last_name}</strong>
                            </p>
                            {savedPatient.patient_id && (
                                <p className="text-muted small mb-4">
                                    Patient ID: <strong>{savedPatient.patient_id}</strong>
                                </p>
                            )}
                            <p className="text-muted mb-4">What would you like to do next?</p>
                            <div className="d-flex flex-wrap gap-3 justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg"
                                    onClick={() => {
                                        onCreateVisit(savedPatient);
                                        handleCloseModal();
                                    }}
                                >
                                    <i className="bx bx-calendar-plus me-2"></i>
                                    Create Visit for this Patient
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-lg"
                                    onClick={() => {
                                        setSavedPatient(null);
                                        setPatientData(null);
                                        setTabIndex(0);
                                        formikRef.current?.resetForm();
                                    }}
                                >
                                    <i className="bx bx-user-plus me-2"></i>
                                    Register Another Patient
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-lg"
                                    onClick={handleCloseModal}
                                >
                                    <i className="bx bx-x me-2"></i>
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : loadingData ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                        innerRef={formikRef}
                    >
                        {() => (
                                <Form>
                                    <FormWizard
                                        shape="circle"
                                        color="#696cff"
                                        stepSize="xs"
                                        onTabChange={({ prevIndex, nextIndex }) => {
                                            setTimeout(() => {
                                                if (nextIndex !== undefined) setTabIndex(nextIndex);
                                                else if (prevIndex !== undefined) setTabIndex(prevIndex);
                                            }, 0);
                                        }}
                                        backButtonTemplate={renderBackButton}
                                        nextButtonTemplate={renderNextButton}
                                        finishButtonTemplate={renderFinishButton}
                                    >
                                        {/* Basic Info */}
                                        <FormWizard.TabContent title="Basic Info" icon="bx bx-user" isValid={true} showErrorOnTab={tabsError[0]}>
                                            <div className="p-3">
                                                <div className="row text-start">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">First Name *</label>
                                                        <Field type="text" name="first_name" className="form-control" placeholder="Enter first name" />
                                                        <ErrorMessage name="first_name" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Last Name *</label>
                                                        <Field type="text" name="last_name" className="form-control" placeholder="Enter last name" />
                                                        <ErrorMessage name="last_name" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Phone *</label>
                                                        <Field type="tel" name="phone" className="form-control" placeholder="Enter phone number" />
                                                        <ErrorMessage name="phone" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Alternative Phone</label>
                                                        <Field type="tel" name="alternative_phone" className="form-control" placeholder="Enter alternative phone" />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Email</label>
                                                        <Field type="email" name="email" className="form-control" placeholder="Enter email address" />
                                                        <ErrorMessage name="email" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Patient Type *</label>
                                                        <Field as="select" name="patient_type" className="form-select">
                                                            <option value="">Select Patient Type</option>
                                                            {patientTypeOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>{option.label}</option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="patient_type" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Date of Birth</label>
                                                        <Field type="date" name="date_of_birth" className="form-control" />
                                                        <ErrorMessage name="date_of_birth" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Gender *</label>
                                                        <Field as="select" name="gender" className="form-select">
                                                            <option value="">Select Gender</option>
                                                            {genderOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>{option.label}</option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="gender" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Blood Group *</label>
                                                        <Field as="select" name="blood_group" className="form-select">
                                                            <option value="">Select</option>
                                                            {bloodGroupOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>{option.label}</option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="blood_group" component="div" className="text-danger small" />
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        <label className="form-label">Address</label>
                                                        <Field as="textarea" name="address" className="form-control" rows="2" placeholder="Enter address" />
                                                    </div>
                                                </div>
                                            </div>
                                        </FormWizard.TabContent>

                                        {/* Identification */}
                                        <FormWizard.TabContent title="Identification" icon="bx bx-id-card" isValid={true} showErrorOnTab={tabsError[1]}>
                                            <div className="p-3">
                                                <div className="row text-start">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">ID Type</label>
                                                        <Field as="select" name="identification_type" className="form-select">
                                                            <option value="">Select ID Type</option>
                                                            {identificationTypeOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>{option.label}</option>
                                                            ))}
                                                        </Field>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">ID Number</label>
                                                        <Field type="text" name="identification_number" className="form-control" placeholder="Enter ID number" />
                                                    </div>
                                                </div>
                                            </div>
                                        </FormWizard.TabContent>

                                        {/* Emergency Contact */}
                                        <FormWizard.TabContent title="Emergency Contact" icon="bx bx-phone" isValid={true} showErrorOnTab={tabsError[2]}>
                                            <div className="p-3">
                                                <div className="row text-start">
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Contact Name</label>
                                                        <Field type="text" name="emergency_contact_name" className="form-control" placeholder="Enter contact name" />
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Contact Phone</label>
                                                        <Field type="tel" name="emergency_contact_phone" className="form-control" placeholder="Enter contact phone" />
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Relationship</label>
                                                        <Field type="text" name="emergency_contact_relationship" className="form-control" placeholder="e.g., Spouse, Parent" />
                                                    </div>
                                                </div>
                                            </div>
                                        </FormWizard.TabContent>

                                        {/* Medical Info */}
                                        <FormWizard.TabContent title="Medical Info" icon="bx bx-first-aid" isValid={true} showErrorOnTab={tabsError[3]}>
                                            <div className="p-3">
                                                <div className="row text-start">
                                                    <div className="col-12 mb-3">
                                                        <label className="form-label">Allergies</label>
                                                        <Field as="textarea" name="allergies" className="form-control" rows="3" placeholder="Enter known allergies" />
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        <label className="form-label">Chronic Conditions</label>
                                                        <Field as="textarea" name="chronic_conditions" className="form-control" rows="3" placeholder="Enter chronic conditions" />
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        <label className="form-label">Current Medications</label>
                                                        <Field as="textarea" name="current_medications" className="form-control" rows="3" placeholder="Enter current medications" />
                                                    </div>
                                                </div>
                                            </div>
                                        </FormWizard.TabContent>
                                    </FormWizard>

                                    <style>{`
                                        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
                                        .form-control, .form-select {
                                            height: 36px;
                                            padding: 0.375rem 0.75rem;
                                            font-size: 1rem;
                                        }
                                        .wizard-card-footer {
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            padding: 2rem 2.5rem;
                                            width: 100%;
                                        }
                                    `}</style>
                                </Form>
                        )}
                    </Formik>}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PatientModal;
