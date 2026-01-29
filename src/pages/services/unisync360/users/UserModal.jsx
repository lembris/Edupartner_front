import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createUser, updateUser, UNISYNC360_ROLES, ROLE_DISPLAY_NAMES } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";

export const UserModal = ({ selectedObj, onSuccess, onClose }) => {
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);

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

    const initialValues = {
        email: selectedObj?.email || "",
        pf_number: selectedObj?.pf_number || "",
        username: selectedObj?.username || "",
        first_name: selectedObj?.first_name || "",
        middle_name: selectedObj?.middle_name || "",
        last_name: selectedObj?.last_name || "",
        dob: selectedObj?.dob || "",
        sex: selectedObj?.sex || "",
        phone_number: selectedObj?.phone_number || "",
        alternative_contact: selectedObj?.alternative_contact || "",
        office_location: selectedObj?.office_location || "",
        status: selectedObj?.status || "ACTIVE",
        password: "",
        password_confirm: "",
        roles: selectedObj?.roles?.map(r => r.name) || [],
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email("Invalid email").required("Email is required"),
        pf_number: selectedObj ? Yup.string() : Yup.string().required("PF Number is required"),
        username: selectedObj ? Yup.string() : Yup.string().required("Username is required"),
        first_name: Yup.string().required("First name is required"),
        middle_name: Yup.string().nullable(),
        last_name: Yup.string().required("Last name is required"),
        dob: Yup.date().nullable(),
        sex: Yup.string().nullable(),
        phone_number: Yup.string().nullable(),
        alternative_contact: Yup.string().nullable(),
        office_location: Yup.string().nullable(),
        status: Yup.string().required("Status is required"),
        password: selectedObj 
            ? Yup.string() 
            : Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
        password_confirm: selectedObj 
            ? Yup.string() 
            : Yup.string().required("Confirm password").oneOf([Yup.ref('password')], 'Passwords must match'),
        roles: selectedObj ? Yup.array() : Yup.array().min(1, "At least one role is required"),
    });

    const statusOptions = [
        { value: 'NEW', label: 'New' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'SUSPENDED', label: 'Suspended' },
        { value: 'RETIRED', label: 'Retired' },
    ];

    const sexOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
    ];

    const roleOptions = Object.entries(UNISYNC360_ROLES).map(([key, value]) => ({
        value: value,
        label: ROLE_DISPLAY_NAMES[value] || key,
    }));

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);
            
            const submitData = {};

            // Always include these fields
            submitData.email = values.email;
            submitData.first_name = values.first_name;
            submitData.last_name = values.last_name;
            submitData.status = values.status;

            // Include these if provided/changed
            if (values.middle_name) submitData.middle_name = values.middle_name;
            if (values.dob) submitData.dob = values.dob;
            if (values.sex) submitData.sex = values.sex;
            if (values.phone_number) submitData.phone_number = values.phone_number;
            if (values.alternative_contact) submitData.alternative_contact = values.alternative_contact;
            if (values.office_location) submitData.office_location = values.office_location;

            // For create (new user)
            if (!selectedObj) {
                submitData.username = values.username;
                submitData.pf_number = values.pf_number;
                submitData.password = values.password;
                submitData.roles = values.roles;
            } else {
                // For update (edit user) - only include fields that might have changed
                // Don't send password, username, pf_number (read-only)
                // But allow roles to be sent if needed
                if (values.roles && values.roles.length > 0) {
                    submitData.roles = values.roles;
                }
            }

            let result;
            if (selectedObj?.guid) {
                result = await updateUser(selectedObj.guid, submitData);
            } else {
                result = await createUser(submitData);
            }

            if (result) {
                showToast("success", `User ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleCloseModal();
                resetForm();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("User submission error:", error);
            const errorData = error.response?.data?.data || error.response?.data;
            if (errorData) {
                setErrors(errorData);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving user");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        if (modalInstance) {
            modalInstance.hide();
        }
        if (onClose) onClose();
    };

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="userModal"
            tabIndex="-1"
            aria-labelledby="userModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="userModalLabel">
                            <i className="bx bx-user-plus me-2"></i>
                            {selectedObj ? "Update User" : "Create New User"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleCloseModal}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <Formik
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, values, setFieldValue }) => (
                                <Form>
                                    <h6 className="text-primary mb-3">
                                        <i className="bx bx-id-card me-1"></i> Account Information
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email *</label>
                                            <Field 
                                                type="email" 
                                                name="email" 
                                                className="form-control" 
                                                placeholder="user@example.com" 
                                            />
                                            <ErrorMessage name="email" component="div" className="text-danger small" />
                                        </div>
                                        {!selectedObj && (
                                            <>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Username *</label>
                                                    <Field 
                                                        name="username" 
                                                        className="form-control" 
                                                        placeholder="username" 
                                                    />
                                                    <ErrorMessage name="username" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">PF Number *</label>
                                                    <Field 
                                                        name="pf_number" 
                                                        className="form-control" 
                                                        placeholder="PF-001" 
                                                    />
                                                    <ErrorMessage name="pf_number" component="div" className="text-danger small" />
                                                </div>
                                            </>
                                        )}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Status</label>
                                            <Field as="select" name="status" className="form-select">
                                                {statusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="status" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <hr />
                                    <h6 className="text-primary mb-3">
                                        <i className="bx bx-user me-1"></i> Personal Information
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">First Name *</label>
                                            <Field name="first_name" className="form-control" placeholder="John" />
                                            <ErrorMessage name="first_name" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Middle Name</label>
                                            <Field name="middle_name" className="form-control" placeholder="Doe" />
                                            <ErrorMessage name="middle_name" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Last Name *</label>
                                            <Field name="last_name" className="form-control" placeholder="Smith" />
                                            <ErrorMessage name="last_name" component="div" className="text-danger small" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Date of Birth</label>
                                            <Field type="date" name="dob" className="form-control" />
                                            <ErrorMessage name="dob" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Sex</label>
                                            <Field as="select" name="sex" className="form-select">
                                                <option value="">Select</option>
                                                {sexOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="sex" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Office Location</label>
                                            <Field name="office_location" className="form-control" placeholder="Building A" />
                                            <ErrorMessage name="office_location" component="div" className="text-danger small" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone Number</label>
                                            <Field name="phone_number" className="form-control" placeholder="+255..." />
                                            <ErrorMessage name="phone_number" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Alternative Contact</label>
                                            <Field name="alternative_contact" className="form-control" placeholder="+255..." />
                                            <ErrorMessage name="alternative_contact" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    {!selectedObj && (
                                        <>
                                            <hr />
                                            <h6 className="text-primary mb-3">
                                                <i className="bx bx-lock me-1"></i> Password
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Password *</label>
                                                    <Field 
                                                        type="password" 
                                                        name="password" 
                                                        className="form-control" 
                                                        placeholder="••••••••" 
                                                    />
                                                    <ErrorMessage name="password" component="div" className="text-danger small" />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Confirm Password *</label>
                                                    <Field 
                                                        type="password" 
                                                        name="password_confirm" 
                                                        className="form-control" 
                                                        placeholder="••••••••" 
                                                    />
                                                    <ErrorMessage name="password_confirm" component="div" className="text-danger small" />
                                                </div>
                                            </div>

                                            <hr />
                                            <h6 className="text-primary mb-3">
                                                <i className="bx bx-shield me-1"></i> Roles *
                                            </h6>
                                            <div className="row">
                                                {roleOptions.map(role => (
                                                    <div className="col-md-6 mb-2" key={role.value}>
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`role-${role.value}`}
                                                                checked={values.roles.includes(role.value)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFieldValue('roles', [...values.roles, role.value]);
                                                                    } else {
                                                                        setFieldValue('roles', values.roles.filter(r => r !== role.value));
                                                                    }
                                                                }}
                                                            />
                                                            <label className="form-check-label" htmlFor={`role-${role.value}`}>
                                                                {role.label}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <ErrorMessage name="roles" component="div" className="text-danger small" />
                                        </>
                                    )}

                                    <div className="modal-footer px-0 pb-0">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCloseModal}
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
                                                    <i className="bx bx-loader-alt bx-spin me-1"></i> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-save me-1"></i> {selectedObj ? "Update" : "Create"}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
