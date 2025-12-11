import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { changePassword } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";

export const PasswordChangeModal = ({ user, onSuccess, onClose }) => {
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        let modal = null;
        if (modalRef.current && window.bootstrap) {
            modal = new window.bootstrap.Modal(modalRef.current, {
                backdrop: 'static',
                keyboard: false
            });
            setModalInstance(modal);
            modal.show();
        }

        return () => {
            if (modal) {
                modal.hide();
            }
        };
    }, []);

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
        new_password: "",
        new_password_confirm: "",
    };

    const validationSchema = Yup.object().shape({
        new_password: Yup.string()
            .required("New password is required")
            .min(8, "Password must be at least 8 characters"),
        new_password_confirm: Yup.string()
            .required("Confirm password is required")
            .oneOf([Yup.ref('new_password')], 'Passwords must match'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);
            await changePassword(user.guid, values);
            showToast("success", "Password changed successfully");
            handleCloseModal();
            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Password change error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Failed to change password");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        if (modalInstance) {
            modalInstance.hide();
        }
        if (onClose) onClose();
    };

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="passwordChangeModal"
            tabIndex="-1"
            aria-labelledby="passwordChangeModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title" id="passwordChangeModalLabel">
                            <i className="bx bx-key me-2"></i>
                            Change Password
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleCloseModal}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="alert alert-info mb-3">
                            <i className="bx bx-info-circle me-1"></i>
                            Changing password for: <strong>{user.first_name} {user.last_name}</strong>
                            <br />
                            <small className="text-muted">{user.email}</small>
                        </div>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className="mb-3">
                                        <label className="form-label">New Password *</label>
                                        <Field
                                            type="password"
                                            name="new_password"
                                            className="form-control"
                                            placeholder="Enter new password"
                                        />
                                        <ErrorMessage name="new_password" component="div" className="text-danger small" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm New Password *</label>
                                        <Field
                                            type="password"
                                            name="new_password_confirm"
                                            className="form-control"
                                            placeholder="Confirm new password"
                                        />
                                        <ErrorMessage name="new_password_confirm" component="div" className="text-danger small" />
                                    </div>

                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCloseModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-warning"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <i className="bx bx-loader-alt bx-spin me-1"></i> Changing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-check me-1"></i> Change Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
