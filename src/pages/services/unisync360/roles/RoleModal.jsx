import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createRole, updateRole } from "./RoleQueries";
import showToast from "../../../../helpers/ToastHelper";

export const RoleModal = ({ selectedRole, onSuccess }) => {
    const [initialValues, setInitialValues] = useState({
        name: "",
        description: "",
        is_active: true,
    });

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Role name is required").min(2, "Role name must be at least 2 characters"),
        description: Yup.string(),
    });

    useEffect(() => {
        if (selectedRole) {
            setInitialValues({
                name: selectedRole.name || "",
                description: selectedRole.description || "",
                is_active: selectedRole.is_active !== false,
            });
        } else {
            setInitialValues({
                name: "",
                description: "",
                is_active: true,
            });
        }
    }, [selectedRole]);

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            const payload = {
                name: values.name,
                description: values.description,
                is_active: values.is_active,
            };

            if (selectedRole) {
                await updateRole(selectedRole.id || selectedRole.uid, payload);
                showToast("success", "Role updated successfully");
            } else {
                await createRole(payload);
                showToast("success", "Role created successfully");
            }

            handleClose();
            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Role submission error:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation failed");
            } else {
                showToast("error", "Something went wrong while saving the role");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        const modalElement = document.getElementById("roleModal");
        if (window.bootstrap) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    };

    return (
        <div
            className="modal fade"
            id="roleModal"
            tabIndex="-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-hidden="true"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title text-white">
                            <i className="bx bx-shield me-2"></i>
                            {selectedRole ? "Edit Role" : "Create New Role"}
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
                        {({ isSubmitting, errors, touched, values }) => (
                            <Form>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Role Name <span className="text-danger">*</span>
                                        </label>
                                        <Field
                                            type="text"
                                            className={`form-control ${
                                                errors.name && touched.name ? "is-invalid" : ""
                                            }`}
                                            id="name"
                                            name="name"
                                            placeholder="e.g., Administrator, Manager"
                                        />
                                        <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">
                                            Description
                                        </label>
                                        <Field
                                            as="textarea"
                                            className={`form-control ${
                                                errors.description && touched.description ? "is-invalid" : ""
                                            }`}
                                            id="description"
                                            name="description"
                                            rows="3"
                                            placeholder="Role description..."
                                        />
                                        <ErrorMessage name="description" component="div" className="invalid-feedback" />
                                    </div>

                                    <div className="form-check form-switch mb-3">
                                        <Field
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_active"
                                            name="is_active"
                                        />
                                        <label className="form-check-label" htmlFor="is_active">
                                            Active Role
                                        </label>
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
                                                <span
                                                    className="spinner-border spinner-border-sm me-1"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Saving...
                                            </>
                                        ) : selectedRole ? (
                                            "Update Role"
                                        ) : (
                                            "Create Role"
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
