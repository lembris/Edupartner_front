import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { createTransaction, updateTransaction } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";

export const TransactionModal = ({ selectedObj, onSuccess, onClose }) => {
    const [errors, setOtherError] = useState({});
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

    const transactionTypeOptions = [
        { value: 'invoice', label: 'Invoice' },
        { value: 'payment', label: 'Payment' },
        { value: 'credit_note', label: 'Credit Note' },
        { value: 'debit_note', label: 'Debit Note' },
        { value: 'refund', label: 'Refund' },
        { value: 'adjustment', label: 'Adjustment' },
    ];

    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'posted', label: 'Posted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const currencyOptions = [
        { value: 'USD', label: 'USD - US Dollar' },
        { value: 'EUR', label: 'EUR - Euro' },
        { value: 'GBP', label: 'GBP - British Pound' },
        { value: 'AUD', label: 'AUD - Australian Dollar' },
        { value: 'CAD', label: 'CAD - Canadian Dollar' },
    ];

    const initialValues = {
        transaction_type: selectedObj?.transaction_type || "",
        transaction_date: selectedObj?.transaction_date || new Date().toISOString().split('T')[0],
        student: selectedObj?.student?.uid || selectedObj?.student || "",
        total_amount: selectedObj?.total_amount || "",
        currency: selectedObj?.currency || "USD",
        description: selectedObj?.description || "",
        status: selectedObj?.status || "draft",
        entries: selectedObj?.entries || [
            { account: "", description: "", debit_amount: "", credit_amount: "" }
        ],
    };

    const validationSchema = Yup.object().shape({
        transaction_type: Yup.string().required("Transaction type is required"),
        transaction_date: Yup.date().required("Transaction date is required"),
        student: Yup.string().required("Student is required"),
        total_amount: Yup.number()
            .required("Amount is required")
            .positive("Amount must be positive")
            .typeError("Must be a valid number"),
        currency: Yup.string().required("Currency is required"),
        description: Yup.string().nullable(),
        status: Yup.string().required("Status is required"),
        entries: Yup.array().of(
            Yup.object().shape({
                account: Yup.string().required("Account is required"),
                description: Yup.string().nullable(),
                debit_amount: Yup.number()
                    .nullable()
                    .transform((v, o) => (o === '' ? null : v))
                    .min(0, "Must be positive"),
                credit_amount: Yup.number()
                    .nullable()
                    .transform((v, o) => (o === '' ? null : v))
                    .min(0, "Must be positive"),
            })
        ).min(1, "At least one entry is required"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            const submitData = { ...values };
            
            submitData.entries = submitData.entries.map(entry => ({
                ...entry,
                debit_amount: entry.debit_amount || 0,
                credit_amount: entry.credit_amount || 0,
            }));

            if (!submitData.description) delete submitData.description;

            setSubmitting(true);
            let result;
            if (selectedObj?.uid) {
                result = await updateTransaction(selectedObj.uid, submitData);
            } else {
                result = await createTransaction(submitData);
            }

            if (result) {
                showToast("success", `Transaction ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleCloseModal();
                resetForm();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Transaction submission error:", error);
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);
                setOtherError(errorData);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving transaction");
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

    const calculateTotals = (entries) => {
        const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit_amount) || 0), 0);
        const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.credit_amount) || 0), 0);
        return { totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
    };

    return createPortal(
        <div
            ref={modalRef}
            className="modal fade"
            id="transactionModal"
            tabIndex="-1"
            aria-labelledby="transactionModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="transactionModalLabel">
                            <i className="bx bx-transfer me-2"></i>
                            {selectedObj ? "Update Transaction" : "Create New Transaction"}
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
                            {({
                                isSubmitting,
                                values,
                                setFieldValue,
                            }) => {
                                const { totalDebit, totalCredit, isBalanced } = calculateTotals(values.entries);
                                
                                return (
                                    <Form>
                                        <div className="row mb-4">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Transaction Type *</label>
                                                <Field as="select" name="transaction_type" className="form-select">
                                                    <option value="">Select Type</option>
                                                    {transactionTypeOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="transaction_type" component="div" className="text-danger small" />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Transaction Date *</label>
                                                <Field type="date" name="transaction_date" className="form-control" />
                                                <ErrorMessage name="transaction_date" component="div" className="text-danger small" />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Status *</label>
                                                <Field as="select" name="status" className="form-select">
                                                    {statusOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="status" component="div" className="text-danger small" />
                                            </div>
                                        </div>

                                        <div className="row mb-4">
                                            <div className="col-md-6 mb-3">
                                                <FormikSelect
                                                    name="student"
                                                    label="Student *"
                                                    url="/unisync360-students/"
                                                    containerClass="mb-0"
                                                    filters={{ page: 1, page_size: 100, paginated: true }}
                                                    mapOption={(item) => ({
                                                        value: item.uid,
                                                        label: `${item.first_name} ${item.last_name} - ${item.personal_email}`
                                                    })}
                                                    placeholder="Search Student..."
                                                    isRequired={true}
                                                    isSearchable={true}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Total Amount *</label>
                                                <Field type="number" step="0.01" name="total_amount" className="form-control" placeholder="0.00" />
                                                <ErrorMessage name="total_amount" component="div" className="text-danger small" />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Currency *</label>
                                                <Field as="select" name="currency" className="form-select">
                                                    {currencyOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="currency" component="div" className="text-danger small" />
                                            </div>
                                        </div>

                                        <div className="row mb-4">
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Description</label>
                                                <Field as="textarea" name="description" className="form-control" rows="2" placeholder="Transaction description..." />
                                                <ErrorMessage name="description" component="div" className="text-danger small" />
                                            </div>
                                        </div>

                                        <hr />
                                        <h6 className="text-primary mb-3">
                                            <i className="bx bx-list-ul me-1"></i> Transaction Entries
                                        </h6>

                                        <FieldArray name="entries">
                                            {({ push, remove }) => (
                                                <>
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered mb-3">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th style={{ width: "30%" }}>Account *</th>
                                                                    <th style={{ width: "30%" }}>Description</th>
                                                                    <th style={{ width: "15%" }}>Debit</th>
                                                                    <th style={{ width: "15%" }}>Credit</th>
                                                                    <th style={{ width: "10%" }} className="text-center">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {values.entries.map((entry, index) => (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            <FormikSelect
                                                                                name={`entries.${index}.account`}
                                                                                url="/unisync360-accounts/accounts/"
                                                                                containerClass="mb-0"
                                                                                filters={{ page: 1, page_size: 100, paginated: true }}
                                                                                mapOption={(item) => ({
                                                                                    value: item.uid,
                                                                                    label: `${item.account_code} - ${item.account_name}`
                                                                                })}
                                                                                placeholder="Select Account"
                                                                                isSearchable={true}
                                                                            />
                                                                            <ErrorMessage name={`entries.${index}.account`} component="div" className="text-danger small" />
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                name={`entries.${index}.description`}
                                                                                className="form-control form-control-sm"
                                                                                placeholder="Entry description"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                type="number"
                                                                                step="0.01"
                                                                                name={`entries.${index}.debit_amount`}
                                                                                className="form-control form-control-sm"
                                                                                placeholder="0.00"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <Field
                                                                                type="number"
                                                                                step="0.01"
                                                                                name={`entries.${index}.credit_amount`}
                                                                                className="form-control form-control-sm"
                                                                                placeholder="0.00"
                                                                            />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {values.entries.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-danger"
                                                                                    onClick={() => remove(index)}
                                                                                >
                                                                                    <i className="bx bx-trash"></i>
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot className="table-light">
                                                                <tr>
                                                                    <td colSpan="2" className="text-end fw-bold">Totals:</td>
                                                                    <td className="fw-bold">{totalDebit.toFixed(2)}</td>
                                                                    <td className="fw-bold">{totalCredit.toFixed(2)}</td>
                                                                    <td className="text-center">
                                                                        {isBalanced ? (
                                                                            <span className="badge bg-success">Balanced</span>
                                                                        ) : (
                                                                            <span className="badge bg-danger">Unbalanced</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => push({ account: "", description: "", debit_amount: "", credit_amount: "" })}
                                                    >
                                                        <i className="bx bx-plus me-1"></i> Add Entry
                                                    </button>
                                                </>
                                            )}
                                        </FieldArray>

                                        {errors.non_field_errors && errors.non_field_errors.length > 0 && (
                                            <div className="alert alert-danger mt-3">
                                                {errors.non_field_errors.map((error, index) => (
                                                    <div key={index}>{error}</div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="modal-footer px-0 pb-0 mt-4">
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
                                );
                            }}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
