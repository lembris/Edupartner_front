import React, { useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createDocumentRequirement, updateDocumentRequirement, DOCUMENT_TYPE_OPTIONS } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const DocumentRequirementModal = ({ show, selectedObj, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);

    const initialValues = useMemo(() => ({
        name: selectedObj?.name || "",
        description: selectedObj?.description || "",
        document_type: selectedObj?.document_type || "academic",
        is_required: selectedObj?.is_required ?? true,
        is_active: selectedObj?.is_active ?? true,
        countries: selectedObj?.countries?.map(c => c.uid) || [],
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Document name is required").max(100, "Name must be 100 characters or less"),
        description: Yup.string().nullable(),
        document_type: Yup.string().required("Document type is required"),
        is_required: Yup.boolean(),
        is_active: Yup.boolean(),
        countries: Yup.array(),
    });

    const handleSubmit = async (values, { setErrors }) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                description: values.description || null,
            };

            let response;
            if (selectedObj?.uid) {
                response = await updateDocumentRequirement(selectedObj.uid, payload);
            } else {
                response = await createDocumentRequirement(payload);
            }

            if (response.status === 8000 || response.status === 201 || response.status === 200 || response.uid) {
                showToast(
                    selectedObj?.uid ? "Document requirement updated successfully!" : "Document requirement created successfully!",
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
            console.error("Error saving document requirement:", error);
            showToast("Failed to save document requirement. Please try again.", "error");
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
            title={<><i className="bx bx-file me-2"></i>{selectedObj?.uid ? "Edit Document Requirement" : "New Document Requirement"}</>}
            onSubmit={handleSubmit}
            submitText={selectedObj?.uid ? "Update" : "Create"}
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
                        <div className="col-md-8 mb-3">
                            <label className="form-label">Document Name *</label>
                            <Field
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="e.g., Passport, Academic Transcript"
                            />
                            <ErrorMessage name="name" component="div" className="text-danger small" />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Document Type *</label>
                            <Field as="select" name="document_type" className="form-select">
                                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage name="document_type" component="div" className="text-danger small" />
                        </div>

                        <div className="col-12 mb-3">
                            <label className="form-label">Description</label>
                            <Field
                                as="textarea"
                                name="description"
                                className="form-control"
                                rows="3"
                                placeholder="Describe what this document is and any specific requirements..."
                            />
                            <ErrorMessage name="description" component="div" className="text-danger small" />
                        </div>

                        <FormikSelect
                            name="countries"
                            label="Applicable Countries"
                            url="/countries/"
                            placeholder="Select countries (leave empty for all)..."
                            containerClass="col-12 mb-3"
                            isMulti
                            isClearable
                            mapOption={(item) => ({
                                value: item.uid,
                                label: item.name,
                                ...item
                            })}
                        />

                        <div className="col-md-6 mb-3">
                            <div className="form-check">
                                <Field
                                    type="checkbox"
                                    name="is_required"
                                    className="form-check-input"
                                    id="is_required"
                                />
                                <label className="form-check-label" htmlFor="is_required">
                                    <strong>Required Document</strong>
                                    <small className="d-block text-muted">Students must submit this document</small>
                                </label>
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <div className="form-check">
                                <Field
                                    type="checkbox"
                                    name="is_active"
                                    className="form-check-input"
                                    id="is_active"
                                />
                                <label className="form-check-label" htmlFor="is_active">
                                    <strong>Active</strong>
                                    <small className="d-block text-muted">Document requirement is currently active</small>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </Formik>
        </GlobalModal>
    );
};
