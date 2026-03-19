import React, { useState, useMemo } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createStudentStatus, updateStudentStatus } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const StudentStatusModal = ({ show, selectedObj, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);

    const initialValues = useMemo(() => ({
        name: selectedObj?.name || "",
        code: selectedObj?.code || "",
        description: selectedObj?.description || "",
        order: selectedObj?.order ?? 0,
        is_active_status: selectedObj?.is_active_status ?? true,
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Status Name is required"),
        code: Yup.string().required("Status Code is required"),
        order: Yup.number().integer("Order must be an integer").min(0, "Order must be positive"),
    });

    const handleSubmit = async (values, { setErrors }) => {
        try {
            setLoading(true);

            let result;
            if (selectedObj?.uid) {
                result = await updateStudentStatus(selectedObj.uid, values);
            } else {
                result = await createStudentStatus(values);
            }

            if (result) {
                showToast("success", `Student Status ${selectedObj?.uid ? 'Updated' : 'Created'} Successfully`);
                if (onClose) onClose();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving status");
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
            title={<><i className="bx bx-list-check me-2"></i>{selectedObj?.uid ? "Update Status" : "Add New Status"}</>}
            onSubmit={handleSubmit}
            submitText={selectedObj?.uid ? "Update" : "Save"}
            loading={loading}
            size="md"
        >
            <Formik
                key={selectedObj?.uid || 'new'}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors }) => (
                    <>
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
                                <ErrorMessage name="name" component="div" className="text-danger small" />
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
                                <ErrorMessage name="code" component="div" className="text-danger small" />
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
                                <ErrorMessage name="order" component="div" className="text-danger small" />
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
                    </>
                )}
            </Formik>
        </GlobalModal>
    );
};
