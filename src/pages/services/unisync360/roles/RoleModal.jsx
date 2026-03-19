import React, { useState, useMemo } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createRole, updateRole } from "./RoleQueries";
import showToast from "../../../../helpers/ToastHelper";
import GlobalModal from "../../../../components/modal/GlobalModal";

export const RoleModal = ({ show, selectedRole, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);

    const initialValues = useMemo(() => ({
        name: selectedRole?.name || "",
        description: selectedRole?.description || "",
        is_active: selectedRole?.is_active ?? true,
    }), [selectedRole]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Role name is required").min(2, "Role name must be at least 2 characters"),
        description: Yup.string(),
    });

    const handleSubmit = async (values, { setErrors }) => {
        try {
            setLoading(true);

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

            if (onClose) onClose();
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
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-shield me-2"></i>{selectedRole ? "Edit Role" : "Create New Role"}</>}
            size="md"
            onSubmit={handleSubmit}
            submitText={selectedRole ? "Update Role" : "Create Role"}
            loading={loading}
        >
            <Formik
                key={selectedRole?.id || 'new'}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors }) => (
                    <>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">
                                Role Name <span className="text-danger">*</span>
                            </label>
                            <Field
                                type="text"
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                id="name"
                                name="name"
                                placeholder="e.g., Administrator, Manager"
                            />
                            <ErrorMessage name="name" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                                Description
                            </label>
                            <Field
                                as="textarea"
                                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                                id="description"
                                name="description"
                                rows="3"
                                placeholder="Role description..."
                            />
                            <ErrorMessage name="description" component="div" className="text-danger small" />
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
                    </>
                )}
            </Formik>
        </GlobalModal>
    );
};
