import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createUniversityCourse, updateUniversityCourse, getCourses, getUniversities } from "./Queries";
import showToast from "../../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../../components/ui-templates/form-components/FormikSelect";

export const UniversityCourseModal = ({ selectedObj, onSuccess, onClose }) => {
    const [initialValues, setInitialValues] = useState({
        university: "",
        course: "",
        tuition_fee: "",
        currency: "USD",
        duration_months: "",
        intakes: [],
        scholarship_available: false,
        scholarship_amount: "",
        scholarship_type: "",
        application_deadline: "",
    });

    useEffect(() => {
        if (selectedObj) {
            setInitialValues({
                university: selectedObj.university?.uid || selectedObj.university || "",
                course: selectedObj.course?.uid || selectedObj.course || "",
                tuition_fee: selectedObj.tuition_fee || "",
                currency: selectedObj.currency || "USD",
                duration_months: selectedObj.duration_months || "",
                intakes: selectedObj.intakes || [],
                scholarship_available: selectedObj.scholarship_available || false,
                scholarship_amount: selectedObj.scholarship_amount || "",
                scholarship_type: selectedObj.scholarship_type || "",
                application_deadline: selectedObj.application_deadline || "",
            });
        } else {
            setInitialValues({
                university: "",
                course: "",
                tuition_fee: "",
                currency: "USD",
                duration_months: "",
                intakes: [],
                scholarship_available: false,
                scholarship_amount: "",
                scholarship_type: "",
                application_deadline: "",
            });
        }
    }, [selectedObj]);

    const validationSchema = Yup.object().shape({
        university: Yup.string().required("University is required"),
        course: Yup.string().required("Course is required"),
        tuition_fee: Yup.number().required("Tuition Fee is required").min(0, "Must be positive"),
        duration_months: Yup.number().required("Duration is required").min(1, "Must be at least 1 month"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            // Prepare payload
            const payload = { ...values };

            // Handle empty date
            if (!payload.application_deadline) {
                payload.application_deadline = null;
            }

            // Handle empty numerics if they are optional (though validation schema says required for some)
            if (payload.scholarship_amount === "") {
                payload.scholarship_amount = null;
            }

            let result;
            if (selectedObj) {
                result = await updateUniversityCourse(selectedObj.uid, payload);
            } else {
                result = await createUniversityCourse(payload);
            }

            if (result) {
                showToast("success", `University Course ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            console.error("Course submission error:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving course");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        const modalElement = document.getElementById("universityCourseModal");
        if (window.bootstrap && modalElement) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    };

    const monthOptions = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div
            className="modal fade"
            id="universityCourseModal"
            tabIndex="-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bx bxs-graduation me-2"></i>
                            {selectedObj ? "Update University Course" : "Add New University Course"}
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
                                    {errors.non_field_errors && (
                                        <div className="alert alert-danger">
                                            {Array.isArray(errors.non_field_errors)
                                                ? errors.non_field_errors.map((err, i) => <div key={i}>{err}</div>)
                                                : <div>{errors.non_field_errors}</div>}
                                        </div>
                                    )}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="university"
                                                label="University *"
                                                url="/unisync360-institutions/universities/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select University"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="course"
                                                label="Course *"
                                                url="/unisync360-academic/courses/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Course"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="tuition_fee" className="form-label">Tuition Fee *</label>
                                            <Field
                                                type="number"
                                                name="tuition_fee"
                                                className={`form-control ${errors.tuition_fee ? "is-invalid" : ""}`}
                                                placeholder="e.g., 5000"
                                            />
                                            <ErrorMessage name="tuition_fee" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="currency" className="form-label">Currency</label>
                                            <Field as="select" name="currency" className="form-select">
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="TZS">TZS</option>
                                                <option value="SEK">SEK</option>
                                                <option value="KES">KES</option>
                                                <option value="UGX">UGX</option>
                                                <option value="RWF">RWF</option>
                                                <option value="ZAR">ZAR</option>
                                                <option value="NGN">NGN</option>
                                                <option value="GHS">GHS</option>
                                                <option value="INR">INR</option>
                                                <option value="CNY">CNY</option>
                                                <option value="AUD">AUD</option>
                                                <option value="CAD">CAD</option>
                                            </Field>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="duration_months" className="form-label">Duration (Months) *</label>
                                            <Field
                                                type="number"
                                                name="duration_months"
                                                className={`form-control ${errors.duration_months ? "is-invalid" : ""}`}
                                                placeholder="e.g., 36"
                                            />
                                            <ErrorMessage name="duration_months" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Intake Months</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {monthOptions.map((month) => (
                                                <div className="form-check" key={month}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`intake-${month}`}
                                                        name="intakes"
                                                        value={month}
                                                        checked={values.intakes.includes(month)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFieldValue("intakes", [...values.intakes, month]);
                                                            } else {
                                                                setFieldValue("intakes", values.intakes.filter(m => m !== month));
                                                            }
                                                        }}
                                                    />
                                                    <label className="form-check-label" htmlFor={`intake-${month}`}>
                                                        {month.substring(0, 3)}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="row align-items-center mb-3">
                                        <div className="col-md-4">
                                            <div className="form-check form-switch">
                                                <Field
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="scholarship_available"
                                                    name="scholarship_available"
                                                />
                                                <label className="form-check-label" htmlFor="scholarship_available">
                                                    Scholarship Available
                                                </label>
                                            </div>
                                        </div>
                                        {values.scholarship_available && (
                                            <>
                                                <div className="col-md-4">
                                                    <label htmlFor="scholarship_type" className="form-label">Type</label>
                                                    <Field as="select" name="scholarship_type" className="form-select">
                                                        <option value="">Select Type</option>
                                                        <option value="percentage">Percentage</option>
                                                        <option value="fixed">Fixed Amount</option>
                                                        <option value="full">Full Scholarship</option>
                                                    </Field>
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="scholarship_amount" className="form-label">Amount/Percent</label>
                                                    <Field
                                                        type="number"
                                                        name="scholarship_amount"
                                                        className="form-control"
                                                        placeholder="e.g., 50"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="application_deadline" className="form-label">Application Deadline (Next)</label>
                                        <Field
                                            type="date"
                                            name="application_deadline"
                                            className="form-control"
                                        />
                                    </div>
                                </div>

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
