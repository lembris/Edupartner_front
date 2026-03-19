import React, { useState, useMemo } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createCourseAllocation, updateCourseAllocation, ALLOCATION_STATUS_OPTIONS } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const CourseAllocationModal = ({ show, selectedObj, onSuccess, onClose }) => {
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    const [loading, setLoading] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const initialValues = useMemo(() => ({
        student: selectedObj?.student?.uid || selectedObj?.student || "",
        university_course: selectedObj?.university_course?.uid || selectedObj?.university_course || "",
        intake_month: selectedObj?.intake_month || "",
        intake_year: selectedObj?.intake_year || currentYear,
        priority: selectedObj?.priority || 1,
        status: selectedObj?.status || "pending",
        application_date: selectedObj?.application_date || new Date().toISOString().split('T')[0],
        notes: selectedObj?.notes || "",
        scholarship_applied: selectedObj?.scholarship_applied || false,
        scholarship_amount: selectedObj?.scholarship_amount || "",
        agent_commission: selectedObj?.agent_commission || "",
        estimated_start_date: selectedObj?.estimated_start_date || "",
    }), [selectedObj, currentYear]);

    const validationSchema = Yup.object().shape({
        student: Yup.string().required("Student is required"),
        university_course: Yup.string().required("University course is required"),
        intake_month: Yup.string().required("Intake month is required"),
        intake_year: Yup.number().required("Intake year is required").min(currentYear, "Year must be current or future"),
        priority: Yup.number().min(1).max(10).required("Priority is required"),
        status: Yup.string().required("Status is required"),
        application_date: Yup.date().required("Application date is required"),
        notes: Yup.string(),
        scholarship_applied: Yup.boolean(),
        scholarship_amount: Yup.number().nullable().min(0, "Amount must be positive"),
        agent_commission: Yup.number().nullable().min(0, "Commission must be positive"),
    });

    const handleSubmit = async (values, { setErrors }) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                intake_period: `${values.intake_month} ${values.intake_year}`,
                scholarship_amount: values.scholarship_amount || null,
                agent_commission: values.agent_commission || null,
            };

            let response;
            if (selectedObj?.uid) {
                response = await updateCourseAllocation(selectedObj.uid, payload);
            } else {
                response = await createCourseAllocation(payload);
            }

            if (response.status === 8000 || response.status === 201 || response.status === 200) {
                showToast(
                    selectedObj?.uid ? "Course allocation updated successfully!" : "Course allocation created successfully!",
                    "success"
                );
                onClose();
                if (onSuccess) onSuccess();
            } else {
                showToast(response.message || "Operation failed", "error");
                if (response.errors) {
                    setErrors(response.errors);
                }
            }
        } catch (error) {
            console.error("Error saving course allocation:", error);
            showToast("Failed to save course allocation. Please try again.", "error");
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-task me-2"></i>{selectedObj?.uid ? "Edit Course Allocation" : "New Course Allocation"}</>}
            onSubmit={handleSubmit}
            submitText={selectedObj?.uid ? "Update Allocation" : "Create Allocation"}
            loading={loading}
            size="lg"
        >
            <Formik
                key={selectedObj?.uid || 'new'}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => (
                    <div className="row">
                        <FormikSelect
                            name="student"
                            label="Student *"
                            url="/unisync360-students/"
                            placeholder="Search and select student..."
                            containerClass="col-md-6 mb-3"
                            mapOption={(item) => ({
                                value: item.uid,
                                label: `${item.first_name} ${item.last_name}`,
                                ...item
                            })}
                            formatOptionLabel={(option) => (
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-xs me-2">
                                        <span className="avatar-initial rounded-circle bg-label-primary">
                                            {option.first_name?.[0]}{option.last_name?.[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <span>{option.label}</span>
                                        <small className="d-block text-muted">{option.personal_email}</small>
                                    </div>
                                </div>
                            )}
                        />

                        <FormikSelect
                            name="university_course"
                            label="University Course *"
                            url="/unisync360-academic/university-courses/"
                            placeholder="Search and select course..."
                            containerClass="col-md-6 mb-3"
                            mapOption={(item) => ({
                                value: item.uid,
                                label: `${item.course_name || ''} - ${item.university_name || ''}`,
                                ...item
                            })}
                            formatOptionLabel={(option) => (
                                <div>
                                    <span className="fw-medium">{option.course_name || option.label}</span>
                                    <small className="d-block" style={{ color: '#555' }}>
                                        <i className="bx bxs-school me-1"></i>
                                        {option.university_name}
                                        {option.tuition_fee && (
                                            <span className="ms-2">
                                                | <i className="bx bx-money me-1"></i>
                                                {option.currency} {parseFloat(option.tuition_fee).toLocaleString()}
                                            </span>
                                        )}
                                    </small>
                                    {option.scholarship_available && (
                                        <small className="d-block" style={{ color: '#28a745', fontWeight: '500' }}>
                                            <i className="bx bx-gift me-1"></i>
                                            Scholarship: {
                                                option.scholarship_type === 'percentage'
                                                    ? `${option.scholarship_amount}%`
                                                    : option.scholarship_type === 'fixed'
                                                    ? `${option.currency} ${parseFloat(option.scholarship_amount || 0).toLocaleString()}`
                                                    : 'Full Scholarship'
                                            }
                                            {option.fee_after_scholarship && (
                                                <span className="ms-2">
                                                    | Fee after: <strong>{option.currency} {parseFloat(option.fee_after_scholarship).toLocaleString()}</strong>
                                                </span>
                                            )}
                                        </small>
                                    )}
                                </div>
                            )}
                            onChange={(option) => {
                                setFieldValue("university_course", option?.value || "");
                                setSelectedCourseData(option);
                                if (option?.scholarship_available) {
                                    setFieldValue("scholarship_applied", true);
                                    if (option?.scholarship_amount) {
                                        setFieldValue("scholarship_amount", option.scholarship_amount);
                                    }
                                } else {
                                    setFieldValue("scholarship_applied", false);
                                    setFieldValue("scholarship_amount", "");
                                }
                            }}
                        />

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Intake Month *</label>
                            <Field as="select" name="intake_month" className="form-select">
                                <option value="">Select Month</option>
                                {months.map((month) => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="intake_month" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Intake Year *</label>
                            <Field as="select" name="intake_year" className="form-select">
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="intake_year" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Priority *</label>
                            <Field as="select" name="priority" className="form-select">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <option key={num} value={num}>#{num} {num === 1 ? "(Highest)" : num === 10 ? "(Lowest)" : ""}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="priority" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Status *</label>
                            <Field as="select" name="status" className="form-select">
                                {ALLOCATION_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="status" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Application Date *</label>
                            <Field type="date" name="application_date" className="form-control" />
                            <ErrorMessage name="application_date" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Estimated Start Date</label>
                            <Field type="date" name="estimated_start_date" className="form-control" />
                            <ErrorMessage name="estimated_start_date" component="div" className="text-danger small" />
                        </div>

                        {selectedCourseData?.scholarship_available && (
                            <div className="col-12 mb-3">
                                <div className="alert alert-success d-flex align-items-start">
                                    <i className="bx bx-check-circle me-2 mt-1"></i>
                                    <div>
                                        <strong>Scholarship Available on Course</strong>
                                        <div className="small mt-1">
                                            <div>
                                                <strong>Type:</strong> <span className="fw-medium">
                                                    {selectedCourseData.scholarship_type === 'percentage' 
                                                        ? 'Percentage' 
                                                        : selectedCourseData.scholarship_type === 'fixed'
                                                        ? 'Fixed Amount'
                                                        : 'Full Scholarship'}
                                                </span>
                                            </div>
                                            <div>
                                                <strong>Value:</strong> <span className="fw-medium">
                                                    {selectedCourseData.scholarship_type === 'percentage' 
                                                        ? `${selectedCourseData.scholarship_amount}%` 
                                                        : selectedCourseData.scholarship_type === 'fixed'
                                                        ? `${selectedCourseData.currency || 'USD'} ${parseFloat(selectedCourseData.scholarship_amount || 0).toLocaleString()}`
                                                        : 'Full Coverage'}
                                                </span>
                                            </div>
                                            {selectedCourseData.fee_after_scholarship && (
                                                <div>
                                                    <strong>Fee After Scholarship:</strong> <span className="fw-medium text-success">
                                                        {selectedCourseData.currency || 'USD'} {parseFloat(selectedCourseData.fee_after_scholarship).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!selectedCourseData?.scholarship_available && (
                            <div className="col-md-6 mb-3">
                                <div className="form-check mt-4">
                                    <Field
                                        type="checkbox"
                                        name="scholarship_applied"
                                        className="form-check-input"
                                        id="scholarship_applied"
                                    />
                                    <label className="form-check-label" htmlFor="scholarship_applied">
                                        Scholarship Applied
                                    </label>
                                </div>
                            </div>
                        )}

                        {!selectedCourseData?.scholarship_available && values.scholarship_applied && (
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Scholarship Amount</label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Field
                                        type="number"
                                        name="scholarship_amount"
                                        className="form-control"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <ErrorMessage name="scholarship_amount" component="div" className="text-danger small" />
                            </div>
                        )}

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Agent Commission</label>
                            <div className="input-group">
                                <span className="input-group-text">$</span>
                                <Field
                                    type="number"
                                    name="agent_commission"
                                    className="form-control"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <ErrorMessage name="agent_commission" component="div" className="text-danger small" />
                        </div>

                        <div className="col-12 mb-3">
                            <label className="form-label">Notes</label>
                            <Field
                                as="textarea"
                                name="notes"
                                className="form-control"
                                rows="3"
                                placeholder="Add any additional notes about this allocation..."
                            />
                            <ErrorMessage name="notes" component="div" className="text-danger small" />
                        </div>
                    </div>
                )}
            </Formik>
        </GlobalModal>
    );
};
