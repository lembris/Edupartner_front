import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createStudent, updateStudent } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../components/modal/GlobalModal";

export const StudentModal = ({ selectedObj, isLeadLancer = false, onSuccess, onClose, showModal, onShowChange }) => {
    const modalRef = useRef(null);
    const [initialValues, setInitialValues] = useState({
        first_name: "",
        last_name: "",
        personal_email: "",
        personal_phone: "",
        gender: "",
        date_of_birth: "",
        nationality: "",
        source: "",
        status: "",
        profile_picture: "",
    });

    useEffect(() => {
        if (selectedObj) {
            setInitialValues({
                first_name: selectedObj.first_name || "",
                last_name: selectedObj.last_name || "",
                personal_email: selectedObj.personal_email || "",
                personal_phone: selectedObj.personal_phone || "",
                gender: selectedObj.gender || "",
                date_of_birth: selectedObj.date_of_birth || "",
                nationality: selectedObj.nationality?.uid || selectedObj.nationality || "",
                source: selectedObj.source?.uid || selectedObj.source || "",
                status: selectedObj.status?.uid || selectedObj.status || "",
                profile_picture: selectedObj.profile_picture || "",
            });
        } else {
            setInitialValues({
                first_name: "",
                last_name: "",
                personal_email: "",
                personal_phone: "",
                gender: "",
                date_of_birth: "",
                nationality: "",
                source: "",
                status: "",
                profile_picture: "",
            });
        }
    }, [selectedObj]);

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        personal_email: Yup.string().email("Must be a valid email").required("Email is required"),
        personal_phone: Yup.string().required("Phone is required"),
        gender: Yup.string().required("Gender is required"),
        date_of_birth: Yup.string().required("Date of birth is required"),
        nationality: Yup.string().required("Nationality is required"),
        source: Yup.string().required("Source is required"),
        status: Yup.string().required("Status is required"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            let response;
            if (selectedObj) {
                response = await updateStudent(selectedObj.uid, values);
            } else {
                response = await createStudent(values);
            }

            if (response.status === 200 || response.status === 201 || response.status === 8000) {
                showToast("success", `Student ${selectedObj ? "updated" : "created"} successfully!`);
                if (onSuccess) onSuccess();
                if (onClose) onClose();
                resetForm();
            } else {
                showToast("error", `Failed to ${selectedObj ? "update" : "create"} student`);
            }
        } catch (error) {
            console.error("Error submitting student:", error);
            if (error.response?.data) {
                setErrors(error.response.data);
            }
            showToast("error", "An error occurred while saving the student");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <GlobalModal
            showModal={showModal}
            onShowChange={onShowChange}
            modalId="studentModal"
            modalTitle={selectedObj ? "Edit Student" : "Add New Student"}
            onOk={() => {}}
            onCancel={onClose}
            size="lg"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label">First Name *</label>
                                <Field type="text" name="first_name" className="form-control" />
                                {errors.first_name && touched.first_name && (
                                    <div className="text-danger small">{errors.first_name}</div>
                                )}
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Last Name *</label>
                                <Field type="text" name="last_name" className="form-control" />
                                {errors.last_name && touched.last_name && (
                                    <div className="text-danger small">{errors.last_name}</div>
                                )}
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Personal Email *</label>
                                <Field type="email" name="personal_email" className="form-control" />
                                {errors.personal_email && touched.personal_email && (
                                    <div className="text-danger small">{errors.personal_email}</div>
                                )}
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Phone Number *</label>
                                <Field type="text" name="personal_phone" className="form-control" />
                                {errors.personal_phone && touched.personal_phone && (
                                    <div className="text-danger small">{errors.personal_phone}</div>
                                )}
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Gender *</label>
                                <Field as="select" name="gender" className="form-select">
                                    <option value="">Select Gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </Field>
                                {errors.gender && touched.gender && (
                                    <div className="text-danger small">{errors.gender}</div>
                                )}
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Date of Birth *</label>
                                <Field type="date" name="date_of_birth" className="form-control" />
                                {errors.date_of_birth && touched.date_of_birth && (
                                    <div className="text-danger small">{errors.date_of_birth}</div>
                                )}
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label">Nationality *</label>
                                <Field type="text" name="nationality" className="form-control" />
                                {errors.nationality && touched.nationality && (
                                    <div className="text-danger small">{errors.nationality}</div>
                                )}
                            </div>

                            {!isLeadLancer && (
                                <>
                                    <div className="col-md-4 mb-3">
                                        <FormikSelect
                                            name="source"
                                            label="Source *"
                                            url="/unisync360-students/sources/"
                                            filters={{ page: 1, page_size: 100, paginated: true }}
                                            mapOption={(item) => ({ value: item.uid, label: item.name })}
                                            placeholder="Select Source"
                                            isRequired={true}
                                        />
                                        {errors.source && touched.source && (
                                            <div className="text-danger small">{errors.source}</div>
                                        )}
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <FormikSelect
                                            name="status"
                                            label="Status *"
                                            url="/unisync360-students/statuses/"
                                            filters={{ page: 1, page_size: 100, paginated: true }}
                                            mapOption={(item) => ({ value: item.uid, label: item.name })}
                                            placeholder="Select Status"
                                            isRequired={true}
                                        />
                                        {errors.status && touched.status && (
                                            <div className="text-danger small">{errors.status}</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : selectedObj ? "Update" : "Create"}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </GlobalModal>
    );
};

export default StudentModal;
