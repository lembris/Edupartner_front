import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import { getInvoice, deleteInvoice, sendInvoice, PaymentAPI } from "./Queries";
import { InvoiceModal } from "./InvoiceModal";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import showToast from "../../../../helpers/ToastHelper";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'draft': return 'secondary';
        case 'sent': return 'info';
        case 'partially_paid': return 'warning';
        case 'paid': return 'success';
        case 'overdue': return 'danger';
        case 'cancelled': return 'dark';
        default: return 'secondary';
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
};

export const InvoiceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);

    const user = useSelector((state) => state.userReducer?.data);

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const response = await getInvoice(id);
            setInvoice(response.data || response);
        } catch (error) {
            console.error("Error fetching invoice:", error);
            showToast("error", "Failed to load invoice details");
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        if (!invoice?.uid) return;
        setPaymentsLoading(true);
        try {
            const response = await PaymentAPI.getAll({ invoice: invoice.uid });
            setPayments(response?.data || response?.results || []);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setPaymentsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchInvoice();
    }, [id]);

    useEffect(() => {
        fetchPayments();
    }, [invoice]);

    const handleDelete = async () => {
        const confirmation = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete invoice!",
        });

        if (confirmation.isConfirmed) {
            try {
                await deleteInvoice(id);
                showToast("success", "Invoice deleted successfully");
                navigate("/unisync360/accounts/invoices");
            } catch (error) {
                showToast("error", "Failed to delete invoice");
            }
        }
    };

    const handleSendInvoice = async () => {
        const confirmation = await Swal.fire({
            title: "Send Invoice?",
            text: "This will send the invoice to the student's email.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#696cff",
            confirmButtonText: "Yes, send it!",
        });

        if (confirmation.isConfirmed) {
            try {
                await sendInvoice(id);
                showToast("success", "Invoice sent successfully");
                fetchInvoice();
            } catch (error) {
                showToast("error", "Failed to send invoice");
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;
    if (!invoice) return <div className="p-5 text-center">Invoice not found</div>;

    const student = invoice.student_details || {};

    return (
        <>
            <div className="animate__animated animate__fadeIn">
                <BreadCumb pageList={["Accounts", "Invoices", invoice.invoice_number]} />

                <div className="card mb-4 border-0 shadow-sm overflow-hidden">
                    <div className="card-body p-0">
                        <div className="bg-primary p-4 text-white" style={{ background: 'linear-gradient(45deg, #696cff 0%, #4346d3 100%)' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="bg-white rounded-circle p-3 shadow">
                                        <i className="bx bx-receipt fs-1 text-primary"></i>
                                    </div>
                                    <div className="text-center text-md-start mt-3 mt-md-0">
                                        <h3 className="text-white mb-1 fw-bold">{invoice.invoice_number}</h3>
                                        <div className="d-flex align-items-center gap-2 opacity-75 mb-2 justify-content-center justify-content-md-start">
                                            <i className="bx bx-calendar"></i> {formatDate(invoice.invoice_date)}
                                            <span className="mx-1">•</span>
                                            <i className="bx bx-time-five"></i> Due: {formatDate(invoice.due_date)}
                                        </div>
                                        <span className={`badge bg-${getStatusColor(invoice.status)} text-capitalize fs-6`}>
                                            {invoice.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 mt-4 mt-md-0 flex-wrap justify-content-center">
                                    <button
                                        className="btn btn-light shadow-sm"
                                        onClick={handlePrint}
                                    >
                                        <i className="bx bx-printer me-1"></i> Print
                                    </button>
                                    {invoice.status === 'draft' && hasAccess(user, ["change_invoice"]) && (
                                        <button
                                            className="btn btn-info text-white shadow-sm"
                                            onClick={handleSendInvoice}
                                        >
                                            <i className="bx bx-send me-1"></i> Send Invoice
                                        </button>
                                    )}
                                    {invoice.status === 'draft' && hasAccess(user, ["change_invoice"]) && (
                                        <button
                                            className="btn fw-semibold shadow-sm"
                                            style={{ backgroundColor: '#fff', color: '#696cff' }}
                                            onClick={() => setShowModal(true)}
                                        >
                                            <i className="bx bx-edit me-1"></i> Edit
                                        </button>
                                    )}
                                    {invoice.status === 'draft' && hasAccess(user, ["delete_invoice"]) && (
                                        <button
                                            className="btn btn-outline-white text-white border-white border-opacity-50"
                                            onClick={handleDelete}
                                        >
                                            <i className="bx bx-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-8 col-lg-7 mb-4">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="bx bx-user me-2 text-primary"></i> Bill To</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-lg me-3">
                                        {student.profile_picture ? (
                                            <img src={student.profile_picture} alt="Avatar" className="rounded-circle" />
                                        ) : (
                                            <span className="avatar-initial rounded-circle bg-label-primary fs-4">
                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h5 className="mb-1">{student.full_name || `${student.first_name} ${student.last_name}`}</h5>
                                        <p className="mb-0 text-muted">
                                            <i className="bx bx-envelope me-1"></i> {student.personal_email}
                                        </p>
                                        <p className="mb-0 text-muted">
                                            <i className="bx bx-phone me-1"></i> {student.personal_phone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="bx bx-list-ul me-2 text-primary"></i> Invoice Items</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Description</th>
                                                <th className="text-center">Qty</th>
                                                <th className="text-end">Unit Price</th>
                                                <th className="text-end">Tax</th>
                                                <th className="text-end">Discount</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.items?.map((item, index) => {
                                                const subtotal = (item.quantity || 0) * (item.unit_price || 0);
                                                const tax = subtotal * ((item.tax_rate || 0) / 100);
                                                const discount = subtotal * ((item.discount_rate || 0) / 100);
                                                const total = subtotal + tax - discount;

                                                return (
                                                    <tr key={index}>
                                                        <td className="fw-medium">{item.description}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="text-end">{formatCurrency(item.unit_price)}</td>
                                                        <td className="text-end text-success">
                                                            {item.tax_rate > 0 ? `${item.tax_rate}%` : '-'}
                                                        </td>
                                                        <td className="text-end text-danger">
                                                            {item.discount_rate > 0 ? `${item.discount_rate}%` : '-'}
                                                        </td>
                                                        <td className="text-end fw-bold">{formatCurrency(total)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <td colSpan="5" className="text-end fw-semibold">Subtotal:</td>
                                                <td className="text-end fw-semibold">{formatCurrency(invoice.subtotal)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="5" className="text-end text-success">Tax:</td>
                                                <td className="text-end text-success">+{formatCurrency(invoice.tax_amount)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="5" className="text-end text-danger">Discount:</td>
                                                <td className="text-end text-danger">-{formatCurrency(invoice.discount_amount)}</td>
                                            </tr>
                                            <tr className="table-primary">
                                                <td colSpan="5" className="text-end fw-bold fs-5">Total:</td>
                                                <td className="text-end fw-bold fs-5">{formatCurrency(invoice.total)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="card shadow-sm mb-4">
                                <div className="card-header">
                                    <h5 className="mb-0"><i className="bx bx-note me-2 text-primary"></i> Notes</h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-0 text-muted">{invoice.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-xl-4 col-lg-5 mb-4">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header">
                                <h5 className="mb-0"><i className="bx bx-money me-2 text-success"></i> Payment Summary</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Total Amount:</span>
                                    <span className="fw-bold">{formatCurrency(invoice.total)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Amount Paid:</span>
                                    <span className="fw-bold text-success">{formatCurrency(invoice.amount_paid)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <span className="fw-bold fs-5">Balance Due:</span>
                                    <span className={`fw-bold fs-5 ${invoice.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                        {formatCurrency(invoice.balance)}
                                    </span>
                                </div>

                                {invoice.balance > 0 && invoice.status !== 'cancelled' && (
                                    <div className="mt-4">
                                        <button className="btn btn-success w-100">
                                            <i className="bx bx-plus me-1"></i> Record Payment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card shadow-sm">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="bx bx-history me-2 text-info"></i> Payment History</h5>
                            </div>
                            <div className="card-body">
                                {paymentsLoading ? (
                                    <div className="text-center py-3">
                                        <i className="bx bx-loader-alt bx-spin fs-3"></i>
                                    </div>
                                ) : payments.length > 0 ? (
                                    <div className="timeline-xs">
                                        {payments.map((payment) => (
                                            <div key={payment.uid} className="timeline-item pb-3 border-start ps-3 position-relative ms-2">
                                                <span className="position-absolute top-0 start-0 translate-middle border border-white rounded-circle bg-success p-1" style={{ width: '12px', height: '12px' }}></span>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <span className="fw-bold text-success">{formatCurrency(payment.amount)}</span>
                                                        <small className="d-block text-muted">{formatDate(payment.payment_date)}</small>
                                                        <small className="text-muted text-capitalize">{payment.payment_method?.replace('_', ' ')}</small>
                                                    </div>
                                                    <span className={`badge bg-label-${payment.status === 'completed' ? 'success' : 'warning'}`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                                {payment.reference_number && (
                                                    <small className="text-muted d-block mt-1">
                                                        Ref: {payment.reference_number}
                                                    </small>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-label-secondary rounded">
                                        <i className="bx bx-receipt fs-1 text-muted"></i>
                                        <p className="text-muted mb-0 mt-2">No payments recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <InvoiceModal
                    selectedObj={invoice}
                    onSuccess={() => {
                        fetchInvoice();
                        setShowModal(false);
                    }}
                    onClose={() => setShowModal(false)}
                />
            )}

            <style>{`
                @media print {
                    .btn, .card-header button, nav, .breadcrumb {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
};
