import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createStudentStatus, updateStudentStatus } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";

export const StudentStatusModal = ({ selectedObj, onSuccess, onClose }) => {
    const [initialValues, setInitialValues] = useState({
        name: "",
        code: "",
        description: "",
        order: 0,
        is_active_status: true,
    });
    const modalRef = useRef(null);
    const [modalInstance, setModalInstance] = useState(null);

    useEffect(() => {
        console.log("StudentStatusModal mounted/updated. selectedObj:", selectedObj ? "Edit" : "Add");
        if (selectedObj) {
            setInitialValues({
                name: selectedObj.name || "",
                code: selectedObj.code || "",
                description: selectedObj.description || "",
                order: selectedObj.order || 0,
                is_active_status: selectedObj.is_active_status ?? true,
            });
        } else {
            setInitialValues({
                name: "",
                code: "",
                description: "",
                order: 0,
                is_active_status: true,
            });
        }
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
            modal.show();
        }

        return () => {
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

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Status Name is required"),
        code: Yup.string().required("Status Code is required"),
        order: Yup.number().integer("Order must be an integer").min(0, "Order must be positive"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        console.log("handleSubmit called with values:", values);
        try {
            setSubmitting(true);

            let result;
            if (selectedObj) {
                console.log("Updating status...");
                result = await updateStudentStatus(selectedObj.uid, values);
            } else {
                console.log("Creating status...");
                result = await createStudentStatus(values);
            }

            console.log("Submission result:", result);

            if (result) {
                showToast("success", `Student Status ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            console.error("Status submission error:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving status");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (modalInstance) {
            modalInstance.hide();
        }
        if (onClose) onClose();
    };

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="studentStatusModal"
            tabIndex="-1"
            aria-hidden="true"
            style={{ zIndex: 1055 }}
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title text-white">
                            <i className="bx bx-list-check me-2"></i>
                            {selectedObj ? "Update Status" : "Add New Status"}
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
                                        <div className="col-md-8 mb-3">
                                            <label htmlFor="name" className="form-label">
                                                Status Name <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="name"
                                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                                placeholder="e.g., Active, Graduated"
                                            />
                                            <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="code" className="form-label">
                                                Code <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="code"
                                                className={`form-control ${errors.code ? "is-invalid" : ""}`}
                                                placeholder="e.g., ACT"
                                            />
                                            <ErrorMessage name="code" component="div" className="invalid-feedback" />
                                        </div>
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

                                    <div className="row align-items-center">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="order" className="form-label">Display Order</label>
                                            <Field
                                                type="number"
                                                name="order"
                                                className={`form-control ${errors.order ? "is-invalid" : ""}`}
                                            />
                                            <ErrorMessage name="order" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="form-check form-switch mt-4">
                                                <Field
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="is_active_status"
                                                    name="is_active_status"
                                                />
                                                <label className="form-check-label" htmlFor="is_active_status">
                                                    Active Status
                                                </label>
                                            </div>
                                        </div>
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
        </div>,
        document.body
    );
};
