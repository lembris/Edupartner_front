import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ChartOfAccountsAPI } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";

export const ChartOfAccountsModal = ({ selectedObj, onSuccess, onClose }) => {
    const [errors, setOtherError] = useState({});
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        setOtherError({});
    }, [selectedObj]);

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
        account_type: selectedObj?.account_type?.uid || selectedObj?.account_type || "",
        code: selectedObj?.code || "",
        name: selectedObj?.name || "",
        description: selectedObj?.description || "",
        parent: selectedObj?.parent?.uid || selectedObj?.parent || "",
        opening_balance: selectedObj?.opening_balance || 0,
        currency: selectedObj?.currency || "USD",
        status: selectedObj?.status || "active",
    };

    const validationSchema = Yup.object().shape({
        account_type: Yup.string().required("Account Type is required"),
        code: Yup.string()
            .required("Account Code is required")
            .max(20, "Code must be 20 characters or less"),
        name: Yup.string()
            .required("Account Name is required")
            .max(100, "Name must be 100 characters or less"),
        description: Yup.string().nullable(),
        parent: Yup.string().nullable(),
        opening_balance: Yup.number()
            .typeError("Must be a valid number")
            .nullable()
            .transform((v, o) => (o === '' ? null : v)),
        currency: Yup.string().required("Currency is required"),
        status: Yup.string().required("Status is required"),
    });

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];

    const currencyOptions = [
        { value: 'USD', label: 'USD - US Dollar' },
        { value: 'EUR', label: 'EUR - Euro' },
        { value: 'GBP', label: 'GBP - British Pound' },
        { value: 'AED', label: 'AED - UAE Dirham' },
        { value: 'INR', label: 'INR - Indian Rupee' },
    ];

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            const submitData = { ...values };
            if (!submitData.description) delete submitData.description;
            if (!submitData.parent) delete submitData.parent;
            if (submitData.opening_balance === null || submitData.opening_balance === "") {
                submitData.opening_balance = 0;
            }

            setSubmitting(true);
            let result;
            if (selectedObj?.uid) {
                result = await ChartOfAccountsAPI.update(selectedObj.uid, submitData);
            } else {
                result = await ChartOfAccountsAPI.create(submitData);
            }

            if (result) {
                showToast("success", `Account ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleCloseModal();
                resetForm();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Account submission error:", error);
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);
                setOtherError(errorData);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving account");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setOtherError({});
        if (modalInstance) {
            modalInstance.hide();
        }
        if (onClose) onClose();
    };

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="chartOfAccountsModal"
            tabIndex="-1"
            aria-labelledby="chartOfAccountsModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="chartOfAccountsModalLabel">
                            <i className="bx bx-wallet me-2"></i>
                            {selectedObj ? "Update Account" : "Create New Account"}
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
                            {({ isSubmitting, values }) => (
                                <Form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="account_type"
                                                label="Account Type *"
                                                url="/unisync360-accounts/account-types/"
                                                containerClass="mb-0"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: `${item.name} (${item.category})` })}
                                                placeholder="Select Account Type"
                                                isRequired={true}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Account Code *</label>
                                            <Field name="code" className="form-control" placeholder="e.g., 1001" />
                                            <ErrorMessage name="code" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Account Name *</label>
                                            <Field name="name" className="form-control" placeholder="e.g., Cash in Hand" />
                                            <ErrorMessage name="name" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Description</label>
                                            <Field as="textarea" name="description" className="form-control" rows="2" placeholder="Optional description" />
                                            <ErrorMessage name="description" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <FormikSelect
                                                name="parent"
                                                label="Parent Account"
                                                url="/unisync360-accounts/chart-of-accounts/"
                                                containerClass="mb-0"
                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                mapOption={(item) => ({ value: item.uid, label: `${item.code} - ${item.name}` })}
                                                placeholder="Select Parent (Optional)"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Opening Balance</label>
                                            <Field type="number" step="0.01" name="opening_balance" className="form-control" placeholder="0.00" />
                                            <ErrorMessage name="opening_balance" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Currency *</label>
                                            <Field as="select" name="currency" className="form-select">
                                                {currencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </Field>
                                            <ErrorMessage name="currency" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Status *</label>
                                            <Field as="select" name="status" className="form-select">
                                                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </Field>
                                            <ErrorMessage name="status" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    {errors.non_field_errors && errors.non_field_errors.length > 0 && (
                                        <div className="alert alert-danger">
                                            {errors.non_field_errors.map((error, index) => (
                                                <div key={index}>{error}</div>
                                            ))}
                                        </div>
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
                                                    <i className="bx bx-save me-1"></i> {selectedObj ? "Update" : "Save"}
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
            <style>{`
                .form-control, .form-select {
                    height: 38px;
                    padding: 0.375rem 0.75rem;
                    font-size: 1rem;
                }
                textarea.form-control {
                    height: auto;
                }
            `}</style>
        </div>,
        document.body
    );
};
