import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createUniversity, updateUniversity, getCountries } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import FormikSelect from "../../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../../components/modal/GlobalModal";

const mapCountryOption = (item) => ({ value: item.uid, label: item.name });

export const UniversityModal = ({ show, selectedObj, onSuccess, onClose }) => {
     const [formikRef, setFormikRef] = useState(null);
     const [loading, setLoading] = useState(false);

     const initialValues = useMemo(() => ({
          name: selectedObj?.name || "",
          acronym: selectedObj?.acronym || "",
          type: selectedObj?.type || "Public",
          website: selectedObj?.website || "",
          email: selectedObj?.email || "",
          phone_number: selectedObj?.phone_number || "",
          address: selectedObj?.address || "",
          description: selectedObj?.description || "",
          ranking: selectedObj?.ranking || "",
          established_year: selectedObj?.established_year || "",
          is_active: selectedObj?.is_active ?? true,
          logo: null,
          country: selectedObj?.country || selectedObj?.country_uid || "",
     }), [selectedObj?.uid, selectedObj?.name, selectedObj?.acronym, selectedObj?.type, selectedObj?.website, selectedObj?.email, selectedObj?.phone_number, selectedObj?.address, selectedObj?.description, selectedObj?.ranking, selectedObj?.established_year, selectedObj?.is_active, selectedObj?.country, selectedObj?.country_uid]);

     const countryFilters = useMemo(() => ({ page: 1, page_size: 100, paginated: true }), []);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("University name is required"),
        country: Yup.string().required("Country is required"),
        type: Yup.string().required("Type is required"),
        email: Yup.string().email("Invalid email address").nullable(),
        website: Yup.string().url("Invalid URL").nullable(),
    });

    const handleClose = () => {
        if (onClose) onClose();
    };

    return (
        <GlobalModal
            show={show}
            onClose={handleClose}
            title={<><i className="bx bxs-school me-2"></i>{selectedObj ? "Update University" : "Add New University"}</>}
            size="lg"
            showFooter={false}
        >
            <Formik
                key={selectedObj?.uid || 'new'}
                innerRef={setFormikRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                    try {
                        setLoading(true);
                        setSubmitting(true);

                        // Prepare FormData for file upload
                        const formData = new FormData();
                        Object.keys(values).forEach(key => {
                            if (values[key] !== null && values[key] !== undefined && values[key] !== "") {
                                formData.append(key, values[key]);
                            }
                        });

                        let result;
                        if (selectedObj) {
                            result = await updateUniversity(selectedObj.uid, formData);
                        } else {
                            result = await createUniversity(formData);
                        }

                        if (result) {
                            showToast("success", `University ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                            handleClose();
                            resetForm();
                            if (onSuccess) onSuccess();
                        } else {
                            showToast("warning", "Process Failed");
                        }
                    } catch (error) {
                        console.error("University submission error:", error);
                        if (error.response && error.response.data) {
                            setErrors(error.response.data);
                            showToast("warning", "Validation Failed");
                        } else {
                            showToast("error", "Something went wrong while saving university");
                        }
                    } finally {
                        setLoading(false);
                        setSubmitting(false);
                    }
                }}
            >
                {({
                    isSubmitting,
                    values,
                    setFieldValue,
                    errors,
                    handleSubmit
                }) => (
                    <Form onSubmit={handleSubmit}>
                        <div className="modal-body" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                            <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="name" className="form-label">
                                                University Name <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="name"
                                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                                placeholder="e.g., University of Dar es Salaam"
                                            />
                                            <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                             {show && (
                                                 <FormikSelect
                                                     name="country"
                                                     label="Country *"
                                                     url="/countries/"
                                                     filters={countryFilters}
                                                     mapOption={mapCountryOption}
                                                     placeholder="Select Country"
                                                     containerClass="mb-0"
                                                 />
                                             )}
                                         </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="acronym" className="form-label">Acronym</label>
                                            <Field
                                                type="text"
                                                name="acronym"
                                                className="form-control"
                                                placeholder="e.g., UDSM"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="type" className="form-label">Type</label>
                                            <Field as="select" name="type" className="form-select">
                                                <option value="Public">Public</option>
                                                <option value="Private">Private</option>
                                            </Field>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="ranking" className="form-label">World/National Ranking</label>
                                            <Field
                                                type="number"
                                                name="ranking"
                                                className="form-control"
                                                placeholder="e.g., 1"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="website" className="form-label">Website</label>
                                            <Field
                                                type="url"
                                                name="website"
                                                className={`form-control ${errors.website ? "is-invalid" : ""}`}
                                                placeholder="https://..."
                                            />
                                            <ErrorMessage name="website" component="div" className="invalid-feedback" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <Field
                                                type="email"
                                                name="email"
                                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                                placeholder="info@university.ac.tz"
                                            />
                                            <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="phone_number" className="form-label">Phone Number</label>
                                            <Field
                                                type="text"
                                                name="phone_number"
                                                className="form-control"
                                                placeholder="+255..."
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="established_year" className="form-label">Established Year</label>
                                            <Field
                                                type="number"
                                                name="established_year"
                                                className="form-control"
                                                placeholder="e.g., 1970"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="address" className="form-label">Address</label>
                                        <Field
                                            type="text"
                                            name="address"
                                            className="form-control"
                                            placeholder="Physical Address"
                                        />
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

                                    <div className="mb-3">
                                        <label htmlFor="logo" className="form-label">Logo</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(event) => {
                                                setFieldValue("logo", event.currentTarget.files[0]);
                                            }}
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
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
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
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
        </GlobalModal>
    );
};
