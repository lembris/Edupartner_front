import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createUniversityExpense, updateUniversityExpense, getExpenseCategories, createExpenseCategory } from "./Queries";
import showToast from "../../../../../helpers/ToastHelper";
import GlobalModal from "../../../../../components/modal/GlobalModal";

export const UniversityExpenseModal = ({ show, selectedObj, universityUid, universityId, onSuccess, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);

    const initialValues = useMemo(() => ({
        university: selectedObj?.university || universityUid || universityId || "",
        category: selectedObj?.category || "",
        description: selectedObj?.description || "",
        amount: selectedObj?.amount || "",
        currency: selectedObj?.currency || "USD",
        due_date: selectedObj?.due_date || "",
        paid_date: selectedObj?.paid_date || "",
        is_paid: selectedObj?.is_paid || false,
        payment_reference: selectedObj?.payment_reference || "",
        receipt: null,
    }), [selectedObj, universityUid, universityId]);

    const currencies = [
        { value: "USD", label: "USD - US Dollar" },
        { value: "EUR", label: "EUR - Euro" },
        { value: "GBP", label: "GBP - British Pound" },
        { value: "TSH", label: "TSH - Tanzanian Shilling" },
        { value: "KES", label: "KES - Kenyan Shilling" },
        { value: "UGX", label: "UGX - Ugandan Shilling" },
        { value: "RWF", label: "RWF - Rwandan Franc" },
        { value: "ZAR", label: "ZAR - South African Rand" },
        { value: "JPY", label: "JPY - Japanese Yen" },
        { value: "CNY", label: "CNY - Chinese Yuan" },
        { value: "INR", label: "INR - Indian Rupee" },
        { value: "AUD", label: "AUD - Australian Dollar" },
        { value: "CAD", label: "CAD - Canadian Dollar" },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const result = await getExpenseCategories({ pagination: { page_size: 100 } });
            let list = [];
            if (result.data && Array.isArray(result.data)) list = result.data;
            else if (result.results && Array.isArray(result.results)) list = result.results;
            else if (Array.isArray(result)) list = result;
            setCategories(list);
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            showToast("warning", "Category name is required");
            return;
        }
        setCreatingCategory(true);
        try {
            const result = await createExpenseCategory({ name: newCategoryName, is_active: true });
            if (result) {
                showToast("success", "Category created successfully");
                setNewCategoryName("");
                setShowNewCategoryForm(false);
                await fetchCategories();
            }
        } catch (error) {
            console.error("Error creating category:", error);
            showToast("error", "Failed to create category");
        } finally {
            setCreatingCategory(false);
        }
    };

    const validationSchema = Yup.object().shape({
        category: Yup.string().required("Category is required"),
        description: Yup.string().required("Description is required"),
        amount: Yup.number().required("Amount is required").positive("Amount must be positive"),
        currency: Yup.string().required("Currency is required"),
        due_date: Yup.date().nullable(),
        paid_date: Yup.date().nullable(),
    });

    const handleClose = () => {
        if (onClose) onClose();
    };

    const handleSubmitForm = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            setSubmitting(true);

            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (values[key] !== null && values[key] !== undefined && values[key] !== "") {
                    // Send university and category as UIDs (backend will handle conversion)
                    formData.append(key, values[key]);
                }
            });

            // Ensure university is always set (use UID from URL if available)
            if (!formData.get('university') && universityUid) {
                formData.set('university', universityUid);
            } else if (!formData.get('university') && universityId) {
                formData.set('university', universityId);
            }

            let result;
            if (selectedObj) {
                result = await updateUniversityExpense(selectedObj.uid, formData);
            } else {
                result = await createUniversityExpense(formData);
            }

            if (result) {
                showToast("success", `Expense ${selectedObj ? 'Updated' : 'Created'} Successfully`);
                handleClose();
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                showToast("warning", "Process Failed");
            }
        } catch (error) {
            console.error("Expense submission error:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving expense");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <GlobalModal
            show={show}
            onClose={handleClose}
            title={<><i className="bx bx-wallet me-2"></i>{selectedObj ? "Update Expense" : "Add New Expense"}</>}
            size="lg"
            showFooter={false}
        >
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmitForm}
            >
                {({
                    isSubmitting,
                    values,
                    setFieldValue,
                    errors,
                    touched
                }) => (
                    <Form onSubmit={handleSubmitForm}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="category" className="form-label">
                                                Category <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <Field
                                                    as="select"
                                                    name="category"
                                                    className={`form-select ${errors.category && touched.category ? "is-invalid" : ""}`}
                                                    disabled={loadingCategories}
                                                >
                                                    <option value="">Select Category</option>
{categories.map((cat) => (
    <option key={cat.uid} value={cat.uid}>
         {cat.name}
     </option>
 ))}
                                                </Field>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                                                    title="Add New Category"
                                                >
                                                    <i className="bx bx-plus"></i>
                                                </button>
                                            </div>
                                            <ErrorMessage name="category" component="div" className="text-danger small mt-1" />
                                            
                                            {showNewCategoryForm && (
                                                <div className="mt-2 p-2 border rounded bg-light">
                                                    <div className="input-group input-group-sm">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="New category name"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-success"
                                                            onClick={handleCreateCategory}
                                                            disabled={creatingCategory}
                                                        >
                                                            {creatingCategory ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                "Add"
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="description" className="form-label">
                                                Description <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="text"
                                                name="description"
                                                className={`form-control ${errors.description && touched.description ? "is-invalid" : ""}`}
                                                placeholder="e.g., Partnership Fee Q1 2025"
                                            />
                                            <ErrorMessage name="description" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="amount" className="form-label">
                                                Amount <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                type="number"
                                                name="amount"
                                                step="0.01"
                                                className={`form-control ${errors.amount && touched.amount ? "is-invalid" : ""}`}
                                                placeholder="0.00"
                                            />
                                            <ErrorMessage name="amount" component="div" className="invalid-feedback" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="currency" className="form-label">
                                                Currency <span className="text-danger">*</span>
                                            </label>
                                            <Field
                                                as="select"
                                                name="currency"
                                                className={`form-select ${errors.currency && touched.currency ? "is-invalid" : ""}`}
                                            >
                                                {currencies.map((curr) => (
                                                    <option key={curr.value} value={curr.value}>
                                                        {curr.label}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="currency" component="div" className="invalid-feedback" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="due_date" className="form-label">Due Date</label>
                                            <Field
                                                type="date"
                                                name="due_date"
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="paid_date" className="form-label">Paid Date</label>
                                            <Field
                                                type="date"
                                                name="paid_date"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="payment_reference" className="form-label">Payment Reference</label>
                                            <Field
                                                type="text"
                                                name="payment_reference"
                                                className="form-control"
                                                placeholder="e.g., TXN-12345"
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="receipt" className="form-label">Receipt</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(event) => {
                                                    setFieldValue("receipt", event.currentTarget.files[0]);
                                                }}
                                            />
                                            {selectedObj?.receipt && (
                                                <div className="mt-2">
                                                    <small className="text-muted">
                                                        Current Receipt: 
                                                        <a href={selectedObj.receipt} target="_blank" rel="noopener noreferrer" className="ms-1">
                                                            View <i className="bx bx-link-external"></i>
                                                        </a>
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-check form-switch mb-3">
                                        <Field
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_paid"
                                            name="is_paid"
                                        />
                                        <label className="form-check-label" htmlFor="is_paid">
                                            <i className={`bx ${values.is_paid ? 'bx-check-circle text-success' : 'bx-time text-warning'} me-1`}></i>
                                            {values.is_paid ? "Paid" : "Unpaid"}
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
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
        </GlobalModal>
    );
};
