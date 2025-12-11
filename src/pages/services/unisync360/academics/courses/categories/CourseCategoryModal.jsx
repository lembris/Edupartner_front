import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createCourseCategory, updateCourseCategory } from "./Queries";
import showToast from "../../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../../components/ui-templates/form-components/FormikSelect";

export const CourseCategoryModal = ({ selectedObj, onSuccess, onClose }) => {
    const [initialValues, setInitialValues] = useState({
        name: "",
        description: "",
        parent: "",
    });

    useEffect(() => {
        if (selectedObj) {
            setInitialValues({
                name: selectedObj.name || "",
                description: selectedObj.description || "",
                parent: selectedObj.parent?.uid || selectedObj.parent || "",
            });
        } else {
            setInitialValues({
                name: "",
                description: "",
                parent: "",
            });
        }
    }, [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Category name is required"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            // Handle empty string for parent (should be null)
            const payload = { ...values };
            if (payload.parent === "") {
                payload.parent = null;
            }
            // Also, to avoid circular dependency, ensure parent is not self (though backend should handle it, frontend check is nice but skipped for now)

            let result;
            if (selectedObj) {
                result = await updateCourseCategory(selectedObj.uid, payload);
            } else {
                result = await createCourseCategory(payload);
            }

            if (result) {
                showToast("success", `Course Category ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            console.error("Category submission error:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving category");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        const modalElement = document.getElementById("courseCategoryModal");
        if (window.bootstrap && modalElement) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    };

    return (
        <div
            className="modal fade"
            id="courseCategoryModal"
            tabIndex="-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-hidden="true"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title text-white">
                            <i className="bx bx-category me-2"></i>
                            {selectedObj ? "Update Category" : "Add New Category"}
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
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Category Name <span className="text-danger">*</span>
                                        </label>
                                        <Field
                                            type="text"
                                            name="name"
                                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                            placeholder="e.g., Science"
                                        />
                                        <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                    </div>

                                    <div className="mb-3">
                                        <FormikSelect
                                            name="parent"
                                            label="Parent Category"
                                            url="/unisync360-academic/course-categories/"
                                            filters={{ page: 1, page_size: 100, paginated: true }}
                                            mapOption={(item) => ({ value: item.uid, label: item.name })}
                                            placeholder="Select Parent Category (Optional)"
                                            containerClass="mb-0"
                                        />
                                        <small className="text-muted">Leave empty if this is a root category.</small>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description</label>
                                        <Field
                                            as="textarea"
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            placeholder="Brief description..."
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
