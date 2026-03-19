import React, { useState, useMemo } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createStudentSource, updateStudentSource } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const StudentSourceModal = ({ show, selectedObj, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);

    const initialValues = useMemo(() => ({
        name: selectedObj?.name || "",
        category: selectedObj?.category || "walk_in",
        description: selectedObj?.description || "",
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Source Name is required"),
        category: Yup.string().required("Category is required"),
    });

    const handleSubmit = async (values, { setErrors }) => {
        try {
            setLoading(true);

            let result;
            if (selectedObj?.uid) {
                result = await updateStudentSource(selectedObj.uid, values);
            } else {
                result = await createStudentSource(values);
            }

            if (result) {
                showToast("success", `Student Source ${selectedObj?.uid ? 'Updated' : 'Created'} Successfully`);
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
                showToast("error", "Something went wrong while saving source");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const sourceCategories = [
        { value: 'online', label: 'Online' },
        { value: 'referral', label: 'Referral' },
        { value: 'walk_in', label: 'Walk-in' },
        { value: 'event', label: 'Event' },
        { value: 'school', label: 'School Visit' },
    ];

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-network-chart me-2"></i>{selectedObj?.uid ? "Update Source" : "Add New Source"}</>}
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
                            <ErrorMessage name="name" component="div" className="text-danger small" />
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
                            <ErrorMessage name="category" component="div" className="text-danger small" />
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
                    </>
                )}
            </Formik>
        </GlobalModal>
    );
};
