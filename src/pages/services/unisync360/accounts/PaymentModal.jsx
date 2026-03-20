import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createPayment, updatePayment } from "./Queries.jsx";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";

export const PaymentModal = ({ selectedObj, onSuccess, onClose }) => {
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
        student: selectedObj?.student?.uid || selectedObj?.student || "",
        amount: selectedObj?.amount || "",
        currency: selectedObj?.currency || "TSH",
        payment_method: selectedObj?.payment_method || "",
        payment_date: selectedObj?.payment_date || "",
        reference_number: selectedObj?.reference_number || "",
        status: selectedObj?.status || "pending",
        description: selectedObj?.description || "",
        bank_name: selectedObj?.bank_name || "",
        account_number: selectedObj?.account_number || "",
    };

    const validationSchema = Yup.object().shape({
        student: Yup.string().required("Student is required"),
        amount: Yup.number()
            .required("Amount is required")
            .positive("Amount must be positive")
            .typeError("Amount must be a number"),
        currency: Yup.string().required("Currency is required"),
        payment_method: Yup.string().required("Payment method is required"),
        payment_date: Yup.date().required("Payment date is required"),
        reference_number: Yup.string().required("Reference number is required"),
        status: Yup.string().required("Status is required"),
        description: Yup.string().nullable(),
        bank_name: Yup.string().nullable(),
        account_number: Yup.string().nullable(),
    });

    const paymentMethodOptions = [
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'mobile_money', label: 'Mobile Money' },
        { value: 'cash', label: 'Cash' },
        { value: 'cheque', label: 'Cheque' },
    ];

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
    ];

    const currencyOptions = [
        { value: 'TSH', label: 'TSH' },
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
        { value: 'JPY', label: 'JPY' },
        { value: 'CHF', label: 'CHF' },
    ];

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            const submitData = { ...values };
            if (!submitData.description) delete submitData.description;
            if (!submitData.bank_name) delete submitData.bank_name;
            if (!submitData.account_number) delete submitData.account_number;

            setSubmitting(true);
            let result;
            if (selectedObj?.uid) {
                result = await updatePayment(selectedObj.uid, submitData);
            } else {
                result = await createPayment(submitData);
            }

            if (result) {
                showToast("success", `Payment ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleCloseModal();
                resetForm();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Payment submission error:", error);
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);
                setOtherError(errorData);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving payment");
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
            id="paymentModal"
            tabIndex="-1"
            aria-labelledby="paymentModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="paymentModalLabel">
                            <i className="bx bx-credit-card me-2"></i>
                            {selectedObj ? "Update Payment" : "Create New Payment"}
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
                                        <FormikSelect
                                            name="student"
                                            label="Student *"
                                            url="/unisync360-students/"
                                            containerClass="col-md-6 mb-3"
                                            filters={{ page: 1, page_size: 20, paginated: true }}
                                            mapOption={(item) => ({
                                                value: item.uid,
                                                label: item.full_name || `${item.first_name} ${item.last_name}`
                                            })}
                                            placeholder="Search student..."
                                            isRequired={true}
                                        />
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Reference Number *</label>
                                            <Field name="reference_number" className="form-control" placeholder="e.g., PAY-2024-001" />
                                            <ErrorMessage name="reference_number" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Amount *</label>
                                            <Field type="number" step="0.01" name="amount" className="form-control" placeholder="0.00" />
                                            <ErrorMessage name="amount" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Currency *</label>
                                            <Field as="select" name="currency" className="form-select">
                                                {currencyOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="currency" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Payment Date *</label>
                                            <Field type="date" name="payment_date" className="form-control" />
                                            <ErrorMessage name="payment_date" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Payment Method *</label>
                                            <Field as="select" name="payment_method" className="form-select">
                                                <option value="">Select Method</option>
                                                {paymentMethodOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="payment_method" component="div" className="text-danger small" />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Status *</label>
                                            <Field as="select" name="status" className="form-select">
                                                {statusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="status" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    {(values.payment_method === 'bank_transfer' || values.payment_method === 'cheque') && (
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Bank Name</label>
                                                <Field name="bank_name" className="form-control" placeholder="Bank name" />
                                                <ErrorMessage name="bank_name" component="div" className="text-danger small" />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Account Number</label>
                                                <Field name="account_number" className="form-control" placeholder="Account number" />
                                                <ErrorMessage name="account_number" component="div" className="text-danger small" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Description</label>
                                            <Field as="textarea" name="description" className="form-control" rows="3" placeholder="Payment description or notes..." />
                                            <ErrorMessage name="description" component="div" className="text-danger small" />
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
