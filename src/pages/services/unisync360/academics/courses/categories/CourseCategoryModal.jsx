import React, { useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createCourseCategory, updateCourseCategory } from "./Queries";
import showToast from "../../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../../../components/modal/GlobalModal";

export const CourseCategoryModal = ({ show = false, selectedObj, onSuccess, onClose }) => {
    const initialValues = useMemo(() => ({
        name: selectedObj?.name || "",
        description: selectedObj?.description || "",
        parent: selectedObj?.parent?.uid || selectedObj?.parent || "",
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Category name is required"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            const payload = { ...values };
            if (payload.parent === "") {
                payload.parent = null;
            }

            let result;
            if (selectedObj) {
                result = await updateCourseCategory(selectedObj.uid, payload);
            } else {
                result = await createCourseCategory(payload);
            }

            if (result) {
                showToast("success", `Course Category ${selectedObj ? 'Updated' : 'Created'} Successfully`);
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
                showToast("error", "Something went wrong while saving category");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const title = (
        <>
            <i className="bx bx-category me-2"></i>
            {selectedObj ? "Update Category" : "Add New Category"}
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
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">
                                Category Name <span className="text-danger">*</span>
                            </label>
                            <Field
                                type="text"
                                name="name"
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                placeholder="e.g., Science"
                            />
                            <ErrorMessage name="name" component="div" className="invalid-feedback" />
                        </div>

                        <div className="mb-3">
                            <FormikSelect
                                name="parent"
                                label="Parent Category"
                                url="/unisync360-academic/course-categories/"
                                filters={{ page: 1, page_size: 100, paginated: true }}
                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                placeholder="Select Parent Category (Optional)"
                                containerClass="mb-0"
                            />
                            <small className="text-muted">Leave empty if this is a root category.</small>
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
