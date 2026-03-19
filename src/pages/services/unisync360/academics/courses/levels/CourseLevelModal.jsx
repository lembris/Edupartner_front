import React, { useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createCourseLevel, updateCourseLevel } from "./Queries";
import showToast from "../../../../../../helpers/ToastHelper";
import GlobalModal from "../../../../../../components/modal/GlobalModal";

export const CourseLevelModal = ({ show = false, selectedObj, onSuccess, onClose }) => {
    const initialValues = useMemo(() => ({
        name: selectedObj?.name || "",
        code: selectedObj?.code || "",
        description: selectedObj?.description || "",
        order: selectedObj?.order || 0,
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Level name is required"),
        code: Yup.string().required("Level code is required"),
        order: Yup.number().required("Order is required").min(0, "Must be positive"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            let result;
            if (selectedObj) {
                result = await updateCourseLevel(selectedObj.uid, values);
            } else {
                result = await createCourseLevel(values);
            }

            if (result) {
                showToast("success", `Course Level ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                if (onClose) onClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving level");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const title = (
        <>
            <i className="bx bx-layer me-2"></i>
            {selectedObj ? "Update Level" : "Add New Level"}
        </>
    );

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={title}
            onSubmit={handleSubmit}
            submitText={selectedObj ? "Update" : "Save"}
            size="md"
        >
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
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="name" className="form-label">
                                    Level Name <span className="text-danger">*</span>
                                </label>
                                <Field
                                    type="text"
                                    name="name"
                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                    placeholder="e.g., Bachelor Degree"
                                />
                                <ErrorMessage name="name" component="div" className="invalid-feedback" />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="code" className="form-label">
                                    Code <span className="text-danger">*</span>
                                </label>
                                <Field
                                    type="text"
                                    name="code"
                                    className={`form-control ${errors.code ? "is-invalid" : ""}`}
                                    placeholder="e.g., BACH"
                                />
                                <ErrorMessage name="code" component="div" className="invalid-feedback" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="order" className="form-label">Order</label>
                            <Field
                                type="number"
                                name="order"
                                className={`form-control ${errors.order ? "is-invalid" : ""}`}
                                placeholder="e.g., 1"
                            />
                            <small className="text-muted">Used for sorting levels (e.g. 1 for Certificate, 2 for Diploma...)</small>
                            <ErrorMessage name="order" component="div" className="invalid-feedback" />
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
                    </Form>
                )}
            </Formik>
        </GlobalModal>
    );
};
