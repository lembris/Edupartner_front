import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createCourse, updateCourse } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";

export const CourseModal = ({ selectedObj, onSuccess, onClose }) => {
    const [initialValues, setInitialValues] = useState({
        name: "",
        code: "",
        category: "",
        level: "",
        description: "",
        duration_years: 3,
        total_credits: "",
    });

    useEffect(() => {
        if (selectedObj) {
            setInitialValues({
                name: selectedObj.name || "",
                code: selectedObj.code || "",
                category: selectedObj.category?.uid || selectedObj.category || "",
                level: selectedObj.level?.uid || selectedObj.level || "",
                description: selectedObj.description || "",
                duration_years: selectedObj.duration_years || 3,
                total_credits: selectedObj.total_credits || "",
            });
        } else {
            setInitialValues({
                name: "",
                code: "",
                category: "",
                level: "",
                description: "",
                duration_years: 3,
                total_credits: "",
            });
        }
    }, [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Course name is required"),
        code: Yup.string().required("Course code is required"),
        category: Yup.string().required("Category is required"),
        level: Yup.string().required("Level is required"),
        duration_years: Yup.number().required("Duration is required").min(0, "Must be positive"),
        total_credits: Yup.number().nullable().min(0, "Must be positive"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            // We can send JSON directly unless we have file uploads (which Course model doesn't seem to have yet)
            // If using FormData in Queries.jsx (which we didn't strictly force), we can pass object or FormData.
            // Queries.jsx uses api.post(..., data, config) where config is json.
            // So we can pass 'values' directly.

            let result;
            if (selectedObj) {
                result = await updateCourse(selectedObj.uid, values);
            } else {
                result = await createCourse(values);
            }

            if (result) {
                showToast("success", `Course ${selectedObj ? 'Updated' : 'Created'} Successfully`);
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
        // Manually hide bootstrap modal if needed, though usually data-bs-dismiss handles it or parent handles it.
        const modalElement = document.getElementById("courseModal");
        if (window.bootstrap && modalElement) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    };

    return (
        <div
            className="modal fade"
            id="courseModal"
            tabIndex="-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title text-white">
                            <i className="bx bxs-book me-2"></i>
                            {selectedObj ? "Update Course" : "Add New Course"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
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
                                            <label htmlFor="name" className="form-label">
                                                Course Name <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="name"
                                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                                placeholder="e.g., Bachelor of Science in Computer Science"
                                            />
                                            <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="code" className="form-label">
                                                Course Code <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="code"
                                                className={`form-control ${errors.code ? "is-invalid" : ""}`}
                                                placeholder="e.g., CS101"
                                            />
                                            <ErrorMessage name="code" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="category"
                                                label="Category *"
                                                url="/unisync360-academic/course-categories/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Category"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="level"
                                                label="Level *"
                                                url="/unisync360-academic/course-levels/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Level"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="duration_years" className="form-label">Duration (Years)</label>
                                            <Field
                                                type="number"
                                                name="duration_years"
                                                className={`form-control ${errors.duration_years ? "is-invalid" : ""}`}
                                                placeholder="e.g., 3"
                                            />
                                            <ErrorMessage name="duration_years" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="total_credits" className="form-label">Total Credits</label>
                                            <Field
                                                type="number"
                                                name="total_credits"
                                                className={`form-control ${errors.total_credits ? "is-invalid" : ""}`}
                                                placeholder="e.g., 120"
                                            />
                                            <ErrorMessage name="total_credits" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description</label>
                                        <Field
                                            as="textarea"
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            placeholder="Course description..."
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
