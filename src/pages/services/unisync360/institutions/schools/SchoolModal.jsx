import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createSchool, updateSchool } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";

export const SchoolModal = ({ selectedObj, onSuccess, onClose }) => {
    const [initialValues, setInitialValues] = useState({
        name: "",
        region: "",
        district: "",
        ownership: "government",
        level: "secondary",
        sex_orientation: "",
        registration_number: "",
        registration_year: "",
        phone: "",
        email: "",
        address: "",
        latitude: "",
        longitude: "",
        total_students: "",
        total_teachers: "",
        is_active: true,
        logo: null
    });

    useEffect(() => {
        if (selectedObj) {
            setInitialValues({
                name: selectedObj.name || "",
                region: selectedObj.region?.uid || selectedObj.region || "",
                district: selectedObj.district?.uid || selectedObj.district || "",
                ownership: selectedObj.ownership || "government",
                level: selectedObj.level || "secondary",
                sex_orientation: selectedObj.sex_orientation || "",
                registration_number: selectedObj.registration_number || "",
                registration_year: selectedObj.registration_year || "",
                phone: selectedObj.phone || "",
                email: selectedObj.email || "",
                address: selectedObj.address || "",
                latitude: selectedObj.latitude || "",
                longitude: selectedObj.longitude || "",
                total_students: selectedObj.total_students || "",
                total_teachers: selectedObj.total_teachers || "",
                is_active: selectedObj.is_active ?? true,
                logo: null
            });
        } else {
            setInitialValues({
                name: "",
                region: "",
                district: "",
                ownership: "government",
                level: "secondary",
                sex_orientation: "",
                registration_number: "",
                registration_year: "",
                phone: "",
                email: "",
                address: "",
                latitude: "",
                longitude: "",
                total_students: "",
                total_teachers: "",
                is_active: true,
                logo: null
            });
        }
    }, [selectedObj]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("School name is required"),
        region: Yup.string().required("Region is required"),
        district: Yup.string().required("District is required"),
        ownership: Yup.string().required("Ownership is required"),
        level: Yup.string().required("Level is required"),
        sex_orientation: Yup.string().required("Sex orientation is required"),
        registration_number: Yup.string().required("Registration number is required"),
        email: Yup.string().email("Invalid email address").nullable(),
        registration_year: Yup.number().nullable().min(1900, "Invalid year"),
        total_students: Yup.number().nullable().min(0, "Cannot be negative"),
        total_teachers: Yup.number().nullable().min(0, "Cannot be negative"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (values[key] !== null && values[key] !== undefined && values[key] !== "") {
                    formData.append(key, values[key]);
                }
            });

            let result;
            if (selectedObj) {
                result = await updateSchool(selectedObj.uid, formData);
            } else {
                result = await createSchool(formData);
            }

            if (result) {
                showToast("success", `School ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            console.error("School submission error:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving school");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        const modalElement = document.getElementById("schoolModal");
        if (window.bootstrap) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        }
    };

    return (
        <div
            className="modal fade"
            id="schoolModal"
            tabIndex="-1"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title text-white">
                            <i className="bx bxs-school me-2"></i>
                            {selectedObj ? "Update School" : "Add New School"}
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
                                    {errors.non_field_errors && (
                                        <div className="alert alert-danger">
                                            {Array.isArray(errors.non_field_errors)
                                                ? errors.non_field_errors.map((err, i) => <div key={i}>{err}</div>)
                                                : <div>{errors.non_field_errors}</div>}
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="name" className="form-label">
                                                School Name <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="name"
                                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                                placeholder="e.g., Shaaban Robert Secondary School"
                                            />
                                            <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="region"
                                                label="Region *"
                                                url="/regions/"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select Region"
                                                containerClass="mb-0"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="district"
                                                label="District *"
                                                url="/districts/"
                                                filters={{
                                                    page: 1,
                                                    page_size: 100,
                                                    paginated: true,
                                                    region: values.region // Pass selected region to filter districts
                                                }}
                                                mapOption={(item) => ({ value: item.uid, label: item.name })}
                                                placeholder="Select District"
                                                containerClass="mb-0"
                                                // Reset district when region changes (handled by key prop forcing remount)
                                                key={`district-select-${values.region}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="ownership" className="form-label">Ownership *</label>
                                            <Field as="select" name="ownership" className={`form-select ${errors.ownership ? "is-invalid" : ""}`}>
                                                <option value="government">Government</option>
                                                <option value="private">Private</option>
                                                <option value="religious">Religious</option>
                                                <option value="community">Community</option>
                                            </Field>
                                            <ErrorMessage name="ownership" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="level" className="form-label">Level *</label>
                                            <Field as="select" name="level" className={`form-select ${errors.level ? "is-invalid" : ""}`}>
                                                <option value="a_level">Advanced Secondary</option>
                                                <option value="o_level">Ordinary Secondary</option>
                                                <option value="both">Advanced & Ordinary Secondary</option>
                                            </Field>
                                            <ErrorMessage name="level" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="sex_orientation" className="form-label">Sex orientation *</label>
                                            <Field as="select" name="sex_orientation" className={`form-select ${errors.sex_orientation ? "is-invalid" : ""}`}>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="co_education">Co-education</option>
                                            </Field>
                                            <ErrorMessage name="sex_orientation" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="registration_number" className="form-label">Registration Number *</label>
                                            <Field
                                                type="text"
                                                name="registration_number"
                                                className={`form-control ${errors.registration_number ? "is-invalid" : ""}`}
                                                placeholder="e.g., S.1234"
                                            />
                                            <ErrorMessage name="registration_number" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="registration_year" className="form-label">Registration Year</label>
                                            <Field
                                                type="number"
                                                name="registration_year"
                                                className={`form-control ${errors.registration_year ? "is-invalid" : ""}`}
                                                placeholder="e.g., 2005"
                                            />
                                            <ErrorMessage name="registration_year" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="phone" className="form-label">Phone</label>
                                            <Field
                                                type="text"
                                                name="phone"
                                                className="form-control"
                                                placeholder="+255..."
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <Field
                                                type="email"
                                                name="email"
                                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                                placeholder="info@school.com"
                                            />
                                            <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="address" className="form-label">Address</label>
                                        <Field
                                            as="textarea"
                                            name="address"
                                            className="form-control"
                                            rows="2"
                                            placeholder="Physical Address"
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="latitude" className="form-label">Latitude</label>
                                            <Field
                                                type="number"
                                                step="any"
                                                name="latitude"
                                                className="form-control"
                                                placeholder="e.g., -6.7924"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="longitude" className="form-label">Longitude</label>
                                            <Field
                                                type="number"
                                                step="any"
                                                name="longitude"
                                                className="form-control"
                                                placeholder="e.g., 39.2083"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="total_students" className="form-label">Total Students</label>
                                            <Field
                                                type="number"
                                                name="total_students"
                                                className={`form-control ${errors.total_students ? "is-invalid" : ""}`}
                                                placeholder="0"
                                            />
                                            <ErrorMessage name="total_students" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="total_teachers" className="form-label">Total Teachers</label>
                                            <Field
                                                type="number"
                                                name="total_teachers"
                                                className={`form-control ${errors.total_teachers ? "is-invalid" : ""}`}
                                                placeholder="0"
                                            />
                                            <ErrorMessage name="total_teachers" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="logo" className="form-label">Logo</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(event) => {
                                                setFieldValue("logo", event.currentTarget.files[0]);
                                            }}
                                            accept="image/*"
                                        />
                                        {selectedObj?.logo && (
                                            <div className="mt-2">
                                                <small className="text-muted">Current Logo:</small>
                                                <img src={selectedObj.logo} alt="Current Logo" height="50" className="d-block mt-1 rounded" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-check form-switch">
                                        <Field
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_active"
                                            name="is_active"
                                        />
                                        <label className="form-check-label" htmlFor="is_active">
                                            Active Status
                                        </label>
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
        </div>
    );
};
