import React, { useState, useMemo } from "react";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createInvoice, updateInvoice } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import GlobalModal from "../../../../components/modal/GlobalModal";

const generateInvoiceNumber = () => {
    const date = new Date();
    const prefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${prefix}-${uniqueId}`;
};

export const InvoiceModal = ({ show, selectedObj, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);

    const initialValues = useMemo(() => ({
        invoice_number: selectedObj?.invoice_number || generateInvoiceNumber(),
        student: selectedObj?.student?.uid || selectedObj?.student || "",
        course_allocation: selectedObj?.course_allocation?.uid || selectedObj?.course_allocation || "",
        invoice_date: selectedObj?.invoice_date || new Date().toISOString().split('T')[0],
        due_date: selectedObj?.due_date || "",
        notes: selectedObj?.notes || "",
        items: selectedObj?.items?.length > 0 ? selectedObj.items.map(item => ({
            uid: item.uid || "",
            description: item.description || "",
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            tax_rate: item.tax_rate || 0,
            discount_rate: item.discount_rate || 0,
        })) : [{
            description: "",
            quantity: 1,
            unit_price: 0,
            tax_rate: 0,
            discount_rate: 0,
        }],
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        invoice_number: Yup.string().required("Invoice number is required"),
        student: Yup.string().required("Student is required"),
        course_allocation: Yup.string().nullable(),
        invoice_date: Yup.date().required("Invoice date is required"),
        due_date: Yup.date().required("Due date is required"),
        notes: Yup.string().nullable(),
        items: Yup.array().of(
            Yup.object().shape({
                description: Yup.string().required("Description is required"),
                quantity: Yup.number().min(1, "Min 1").required("Required"),
                unit_price: Yup.number().required("Required"),
                tax_rate: Yup.number().min(0).max(100).nullable(),
                discount_rate: Yup.number().min(0).max(100).nullable(),
            })
        ).min(1, "At least one item is required"),
    });

    const calculateItemTotal = (item) => {
        const subtotal = (item.quantity || 0) * (item.unit_price || 0);
        const tax = subtotal * ((item.tax_rate || 0) / 100);
        const discount = subtotal * ((item.discount_rate || 0) / 100);
        return subtotal + tax - discount;
    };

    const calculateTotals = (items) => {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        items.forEach(item => {
            const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
            subtotal += itemSubtotal;
            totalTax += itemSubtotal * ((item.tax_rate || 0) / 100);
            totalDiscount += itemSubtotal * ((item.discount_rate || 0) / 100);
        });

        const total = subtotal + totalTax - totalDiscount;
        return { subtotal, totalTax, totalDiscount, total };
    };

    const handleSubmit = async (values, { setErrors }) => {
        try {
            setLoading(true);
            const submitData = {
                ...values,
                items: values.items.map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity) || 1,
                    unit_price: parseFloat(item.unit_price) || 0,
                    tax_rate: parseFloat(item.tax_rate) || 0,
                    discount_rate: parseFloat(item.discount_rate) || 0,
                })),
            };

            if (!submitData.course_allocation) {
                delete submitData.course_allocation;
            }

            let result;
            if (selectedObj?.uid) {
                result = await updateInvoice(selectedObj.uid, submitData);
            } else {
                result = await createInvoice(submitData);
            }

            if (result) {
                showToast("success", `Invoice ${selectedObj?.uid ? 'Updated' : 'Created'} Successfully`);
                if (onClose) onClose();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData) {
                setErrors(errorData);
                showToast("warning", "Validation Failed");
            } else {
                showToast("error", "Something went wrong while saving invoice");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-receipt me-2"></i>{selectedObj?.uid ? "Update Invoice" : "Create New Invoice"}</>}
            size="lg"
            onSubmit={handleSubmit}
            submitText={selectedObj?.uid ? "Update" : "Create Invoice"}
            loading={loading}
        >
            <Formik
                key={selectedObj?.uid || 'new'}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, errors }) => {
                    const totals = calculateTotals(values.items);

                    return (
                        <>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Invoice Number *</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-primary text-white">
                                            <i className="bx bx-receipt"></i>
                                        </span>
                                        <Field 
                                            type="text" 
                                            name="invoice_number" 
                                            className="form-control fw-bold" 
                                            placeholder="INV-YYYYMM-XXXXXX"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setFieldValue('invoice_number', generateInvoiceNumber())}
                                            title="Generate new invoice number"
                                        >
                                            <i className="bx bx-refresh"></i>
                                        </button>
                                    </div>
                                    <ErrorMessage name="invoice_number" component="div" className="text-danger small" />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Invoice Date *</label>
                                    <Field type="date" name="invoice_date" className="form-control" />
                                    <ErrorMessage name="invoice_date" component="div" className="text-danger small" />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Due Date *</label>
                                    <Field type="date" name="due_date" className="form-control" />
                                    <ErrorMessage name="due_date" component="div" className="text-danger small" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <FormikSelect
                                        name="student"
                                        label="Student *"
                                        url="/unisync360-students/"
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 20, paginated: true }}
                                        mapOption={(item) => ({
                                            value: item.uid,
                                            label: `${item.first_name} ${item.last_name} - ${item.personal_email}`,
                                        })}
                                        placeholder="Search student..."
                                        isRequired={true}
                                        onSelectObject={(selected) => {
                                            setFieldValue('course_allocation', '');
                                        }}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <FormikSelect
                                        name="course_allocation"
                                        label="Course Allocation"
                                        url="/unisync360-applications/course-allocations/"
                                        containerClass="mb-0"
                                        filters={{ 
                                            page: 1, 
                                            page_size: 20, 
                                            paginated: true,
                                            student: values.student 
                                        }}
                                        mapOption={(item) => {
                                            const uc = item.university_course || {};
                                            
                                            const ucFee = uc.tuition_fee ? parseFloat(uc.tuition_fee) : 0;
                                            const itemFee = item.tuition_fee ? parseFloat(item.tuition_fee) : 0;
                                            const tuitionFee = ucFee > 0 ? ucFee : itemFee;
                                            
                                            const currency = uc.currency || item.currency || 'USD';
                                            const courseName = uc.course?.name || item.course_name || 'Course';
                                            const universityName = uc.university?.name || item.university_name || 'University';
                                            const hasScholarship = uc.scholarship_available || item.scholarship_available;
                                            
                                            let label = `${courseName} - ${universityName} (${currency} ${tuitionFee.toLocaleString()})`;
                                            if (hasScholarship) {
                                                label += ' Scholarship';
                                            }
                                            return { value: item.uid, label, ...item };
                                        }}
                                        placeholder="Select course allocation..."
                                        isDisabled={!values.student}
                                        onSelectObject={(selected) => {
                                            if (selected) {
                                                const uc = selected.university_course || {};
                                                const courseName = uc.course?.name || selected.course_name || 'Course';
                                                const universityName = uc.university?.name || selected.university_name || 'University';
                                                
                                                const ucFee = uc.tuition_fee ? parseFloat(uc.tuition_fee) : 0;
                                                const itemFee = selected.tuition_fee ? parseFloat(selected.tuition_fee) : 0;
                                                const tuitionFee = ucFee > 0 ? ucFee : itemFee;
                                                
                                                const currency = uc.currency || selected.currency || 'USD';
                                                const intakePeriod = selected.intake_period || '';
                                                
                                                const scholarshipAvailable = uc.scholarship_available || selected.scholarship_available;
                                                const scholarshipType = uc.scholarship_type || selected.scholarship_type;
                                                const ucScholarshipAmt = uc.scholarship_amount ? parseFloat(uc.scholarship_amount) : 0;
                                                const itemScholarshipAmt = selected.scholarship_amount ? parseFloat(selected.scholarship_amount) : 0;
                                                const scholarshipAmount = ucScholarshipAmt > 0 ? ucScholarshipAmt : itemScholarshipAmt;

                                                const items = [];

                                                items.push({
                                                    description: `Tuition Fee - ${courseName} at ${universityName}${intakePeriod ? ` (${intakePeriod})` : ''}`,
                                                    quantity: 1,
                                                    unit_price: tuitionFee,
                                                    tax_rate: 0,
                                                    discount_rate: 0,
                                                });

                                                if (scholarshipAvailable && scholarshipAmount > 0) {
                                                    let discountAmount = 0;
                                                    let discountDescription = '';

                                                    if (scholarshipType === 'full') {
                                                        discountAmount = tuitionFee;
                                                        discountDescription = `Scholarship (Full) - ${universityName}`;
                                                    } else if (scholarshipType === 'fixed') {
                                                        discountAmount = scholarshipAmount;
                                                        discountDescription = `Scholarship (${currency} ${scholarshipAmount.toLocaleString()}) - ${universityName}`;
                                                    } else if (scholarshipType === 'percentage') {
                                                        discountAmount = tuitionFee * (scholarshipAmount / 100);
                                                        discountDescription = `Scholarship (${scholarshipAmount}%) - ${universityName}`;
                                                    }

                                                    if (discountAmount > 0) {
                                                        items.push({
                                                            description: discountDescription,
                                                            quantity: 1,
                                                            unit_price: -discountAmount,
                                                            tax_rate: 0,
                                                            discount_rate: 0,
                                                        });
                                                    }
                                                }

                                                if (selected.application_fee_amount && parseFloat(selected.application_fee_amount) > 0) {
                                                    items.push({
                                                        description: `Application Fee - ${universityName}`,
                                                        quantity: 1,
                                                        unit_price: parseFloat(selected.application_fee_amount),
                                                        tax_rate: 0,
                                                        discount_rate: 0,
                                                    });
                                                }

                                                setFieldValue('items', items);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Notes</label>
                                    <Field as="textarea" name="notes" className="form-control" rows="2" placeholder="Optional notes..." />
                                    <ErrorMessage name="notes" component="div" className="text-danger small" />
                                </div>
                            </div>

                            <hr />
                            <h6 className="text-primary mb-3">
                                <i className="bx bx-list-ul me-1"></i> Invoice Items
                            </h6>

                            <FieldArray name="items">
                                {({ push, remove }) => (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: '30%' }}>Description *</th>
                                                        <th style={{ width: '10%' }}>Qty *</th>
                                                        <th style={{ width: '15%' }}>Unit Price *</th>
                                                        <th style={{ width: '12%' }}>Tax %</th>
                                                        <th style={{ width: '12%' }}>Discount %</th>
                                                        <th style={{ width: '15%' }} className="text-end">Total</th>
                                                        <th style={{ width: '6%' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {values.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <Field
                                                                    name={`items.${index}.description`}
                                                                    className="form-control form-control-sm"
                                                                    placeholder="Item description"
                                                                />
                                                                <ErrorMessage name={`items.${index}.description`} component="div" className="text-danger small" />
                                                            </td>
                                                            <td>
                                                                <Field
                                                                    type="number"
                                                                    name={`items.${index}.quantity`}
                                                                    className="form-control form-control-sm"
                                                                    min="1"
                                                                    step="1"
                                                                />
                                                                <ErrorMessage name={`items.${index}.quantity`} component="div" className="text-danger small" />
                                                            </td>
                                                            <td>
                                                                <Field
                                                                    type="number"
                                                                    name={`items.${index}.unit_price`}
                                                                    className={`form-control form-control-sm ${item.unit_price < 0 ? 'text-success' : ''}`}
                                                                    step="0.01"
                                                                />
                                                                <ErrorMessage name={`items.${index}.unit_price`} component="div" className="text-danger small" />
                                                            </td>
                                                            <td>
                                                                <Field
                                                                    type="number"
                                                                    name={`items.${index}.tax_rate`}
                                                                    className="form-control form-control-sm"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                />
                                                            </td>
                                                            <td>
                                                                <Field
                                                                    type="number"
                                                                    name={`items.${index}.discount_rate`}
                                                                    className="form-control form-control-sm"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                />
                                                            </td>
                                                            <td className={`text-end align-middle fw-bold ${calculateItemTotal(item) < 0 ? 'text-success' : ''}`}>
                                                                {calculateItemTotal(item) < 0 ? '-' : ''}${Math.abs(calculateItemTotal(item)).toFixed(2)}
                                                            </td>
                                                            <td className="text-center align-middle">
                                                                {values.items.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger border-0"
                                                                        onClick={() => remove(index)}
                                                                    >
                                                                        <i className="bx bx-trash"></i>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm mb-3"
                                            onClick={() => push({
                                                description: "",
                                                quantity: 1,
                                                unit_price: 0,
                                                tax_rate: 0,
                                                discount_rate: 0,
                                            })}
                                        >
                                            <i className="bx bx-plus me-1"></i> Add Item
                                        </button>
                                    </>
                                )}
                            </FieldArray>

                            <div className="row justify-content-end">
                                <div className="col-md-5">
                                    <div className="card bg-light border-0">
                                        <div className="card-body py-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <span className="fw-semibold">${totals.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Tax:</span>
                                                <span className="text-success">+${totals.totalTax.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Discount:</span>
                                                <span className="text-danger">-${totals.totalDiscount.toFixed(2)}</span>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-bold fs-5">Total:</span>
                                                <span className="fw-bold fs-5 text-primary">${totals.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errors.non_field_errors && errors.non_field_errors.length > 0 && (
                                <div className="alert alert-danger mt-3">
                                    {errors.non_field_errors.map((error, index) => (
                                        <div key={index}>{error}</div>
                                    ))}
                                </div>
                            )}
                        </>
                    );
                }}
            </Formik>
        </GlobalModal>
    );
};
