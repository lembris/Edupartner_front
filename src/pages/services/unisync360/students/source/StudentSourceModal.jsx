import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createStudentSource, updateStudentSource } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";

export const StudentSourceModal = ({ selectedObj, onSuccess, onClose }) => {
    const [initialValues, setInitialValues] = useState({
        name: "",
        category: "walk_in",
        description: "",
    });
    const modalRef = useRef(null);
    const [modalInstance, setModalInstance] = useState(null);

    useEffect(() => {
        if (selectedObj) {
            setInitialValues({
                name: selectedObj.name || "",
                category: selectedObj.category || "walk_in",
                description: selectedObj.description || "",
            });
        } else {
            setInitialValues({
                name: "",
                category: "walk_in",
                description: "",
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
        name: Yup.string().required("Source Name is required"),
        category: Yup.string().required("Category is required"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            let result;
            if (selectedObj) {
                result = await updateStudentSource(selectedObj.uid, values);
            } else {
                result = await createStudentSource(values);
            }

            if (result) {
                showToast("success", `Student Source ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            console.error("Source submission error:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving source");
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

    const sourceCategories = [
        { value: 'online', label: 'Online' },
        { value: 'referral', label: 'Referral' },
        { value: 'walk_in', label: 'Walk-in' },
        { value: 'event', label: 'Event' },
        { value: 'school', label: 'School Visit' },
    ];

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="studentSourceModal"
            tabIndex="-1"
            aria-hidden="true"
            style={{ zIndex: 1100 }}
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bx bx-network-chart me-2"></i>
                            {selectedObj ? "Update Source" : "Add New Source"}
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
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Source Name <span className="text-danger">*</span>
                                        </label>
                                        <Field
                                            type="text"
                                            name="name"
                                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                            placeholder="e.g., Facebook Ad, Friend"
                                        />
                                        <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="category" className="form-label">
                                            Category <span className="text-danger">*</span>
                                        </label>
                                        <Field
                                            as="select"
                                            name="category"
                                            className={`form-select ${errors.category ? "is-invalid" : ""}`}
                                        >
                                            {sourceCategories.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="category" component="div" className="invalid-feedback" />
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
        </div>,
        document.body
    );
};
