import React, { useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createCourse, updateCourse } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const CourseModal = ({ show = false, selectedObj, onSuccess, onClose }) => {
    const initialValues = useMemo(() => ({
        name: selectedObj?.name || "",
        code: selectedObj?.code || "",
        category: selectedObj?.category?.uid || selectedObj?.category || "",
        level: selectedObj?.level?.uid || selectedObj?.level || "",
        description: selectedObj?.description || "",
        duration_years: selectedObj?.duration_years || 3,
        total_credits: selectedObj?.total_credits !== null && selectedObj?.total_credits !== undefined ? selectedObj.total_credits : "",
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Course name is required"),
        code: Yup.string().required("Course code is required"),
        category: Yup.string().required("Category is required"),
        level: Yup.string().required("Level is required"),
        duration_years: Yup.number().required("Duration is required").min(0, "Must be positive"),
        total_credits: Yup.number().nullable().typeError("Must be a valid number").min(0, "Must be positive"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            const submitValues = {
                ...values,
                total_credits: values.total_credits === "" ? null : values.total_credits,
            };

            let result;
            if (selectedObj) {
                result = await updateCourse(selectedObj.uid, submitValues);
            } else {
                result = await createCourse(submitValues);
            }

            if (result?.status === 8000) {
                showToast("success", `Course ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                if (onClose) onClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else if (result?.status === 8002) {
                setErrors(result.data);

                const errorMessages = [];
                if (result.data && typeof result.data === 'object') {
                    for (const [field, messages] of Object.entries(result.data)) {
                        if (Array.isArray(messages)) {
                            errorMessages.push(...messages);
                        } else if (typeof messages === 'string') {
                            errorMessages.push(messages);
                        }
                    }
                }

                const errorText = errorMessages.length > 0
                    ? errorMessages.join('. ')
                    : "Validation Failed";
                showToast("warning", errorText);
            } else {
                const errorMessage = result?.message || "Something went wrong while saving course";
                showToast("error", errorMessage);
                if (result?.data) {
                    setErrors(result.data);
                }
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);

                if (error.response?.data?.status === 8002 || error.response?.status === 400) {
                    const errorMessages = [];
                    const data = error.response?.data?.data || error.response?.data;

                    if (data && typeof data === 'object') {
                        for (const [field, messages] of Object.entries(data)) {
                            if (Array.isArray(messages)) {
                                errorMessages.push(...messages);
                            } else if (typeof messages === 'string') {
                                errorMessages.push(messages);
                            }
                        }
                    }

                    const errorText = errorMessages.length > 0
                        ? errorMessages.join('. ')
                        : "Validation Failed";
                    showToast("warning", errorText);
                } else {
                    showToast("warning", error.response?.data?.message || "Validation Failed");
                }
            } else {
                showToast("error", "Something went wrong while saving course");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const title = (
        <>
            <i className="bx bxs-book me-2"></i>
            {selectedObj ? "Update Course" : "Add New Course"}
        </>
    );

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={title}
            onSubmit={handleSubmit}
            submitText={selectedObj ? "Update" : "Save"}
            size="lg"
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
                                    Course Name <span className="text-danger">*</span>
                                </label>
                                <Field
                                    type="text"
                                    name="name"
                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                    placeholder="e.g., Bachelor of Science in Computer Science"
                                />
                                <ErrorMessage name="name" component="div" className="invalid-feedback" />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="code" className="form-label">
                                    Course Code <span className="text-danger">*</span>
                                </label>
                                <Field
                                    type="text"
                                    name="code"
                                    className={`form-control ${errors.code ? "is-invalid" : ""}`}
                                    placeholder="e.g., CS101"
                                />
                                <ErrorMessage name="code" component="div" className="invalid-feedback" />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <FormikSelect
                                    name="category"
                                    label="Category *"
                                    url="/unisync360-academic/course-categories/"
                                    filters={{ page: 1, page_size: 100, paginated: true }}
                                    mapOption={(item) => ({ value: item.uid, label: item.name })}
                                    placeholder="Select Category"
                                    containerClass="mb-0"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <FormikSelect
                                    name="level"
                                    label="Level *"
                                    url="/unisync360-academic/course-levels/"
                                    filters={{ page: 1, page_size: 100, paginated: true }}
                                    mapOption={(item) => ({ value: item.uid, label: item.name })}
                                    placeholder="Select Level"
                                    containerClass="mb-0"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="duration_years" className="form-label">Duration (Years)</label>
                                <Field
                                    type="number"
                                    name="duration_years"
                                    className={`form-control ${errors.duration_years ? "is-invalid" : ""}`}
                                    placeholder="e.g., 3"
                                />
                                <ErrorMessage name="duration_years" component="div" className="invalid-feedback" />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="total_credits" className="form-label">Total Credits</label>
                                <Field
                                    type="number"
                                    name="total_credits"
                                    className={`form-control ${errors.total_credits ? "is-invalid" : ""}`}
                                    placeholder="e.g., 120"
                                />
                                <ErrorMessage name="total_credits" component="div" className="invalid-feedback" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <Field
                                as="textarea"
                                name="description"
                                className="form-control"
                                rows="3"
                                placeholder="Course description..."
                            />
                        </div>
                    </Form>
                )}
            </Formik>
        </GlobalModal>
    );
};
