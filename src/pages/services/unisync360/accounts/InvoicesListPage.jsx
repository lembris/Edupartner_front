import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { InvoiceModal } from "./InvoiceModal";
import { deleteInvoice } from "./Queries";
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

export const InvoicesListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (invoice) => {
        if (!invoice) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete invoice: ${invoice.invoice_number}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteInvoice(invoice.uid);
                Swal.fire(
                    "Deleted!",
                    "The invoice has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting invoice:", error);
            Swal.fire(
                "Error!",
                "Unable to delete invoice. Please try again or contact support.",
                "error"
            );
        }
    };

    return (
        <>
            <BreadCumb pageList={["Accounts", "Invoices"]} />
            <PaginatedTable
                fetchPath="/unisync360-accounts/invoices/"
                title="Invoices"
                columns={[
                    {
                        key: "invoice_number",
                        label: "Invoice #",
                        className: "fw-bold",
                        style: { width: "140px" },
                        render: (row) => (
                            <span
                                className="text-primary cursor-pointer fw-semibold"
                                onClick={() => navigate(`/unisync360/accounts/invoices/${row.uid}`)}
                            >
                                {row.invoice_number}
                            </span>
                        ),
                    },
                    {
                        key: "student",
                        label: "Student",
                        style: { width: "250px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar avatar-sm me-2">
                                    {row.student_details?.profile_picture ? (
                                        <img src={row.student_details.profile_picture} alt="Avatar" className="rounded-circle" />
                                    ) : (
                                        <span className="avatar-initial rounded-circle bg-label-primary">
                                            {row.student_details?.first_name?.[0]}{row.student_details?.last_name?.[0]}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="fw-semibold d-block">
                                        {row.student_details?.full_name || `${row.student_details?.first_name || ''} ${row.student_details?.last_name || ''}`}
                                    </span>
                                    <small className="text-muted">{row.student_details?.personal_email}</small>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "invoice_date",
                        label: "Date",
                        render: (row) => formatDate(row.invoice_date),
                    },
                    {
                        key: "due_date",
                        label: "Due Date",
                        render: (row) => (
                            <span className={row.status === 'overdue' ? 'text-danger fw-bold' : ''}>
                                {formatDate(row.due_date)}
                            </span>
                        ),
                    },
                    {
                        key: "total",
                        label: "Total",
                        className: "text-end",
                        render: (row) => (
                            <span className="fw-bold">{formatCurrency(row.total)}</span>
                        ),
                    },
                    {
                        key: "amount_paid",
                        label: "Paid",
                        className: "text-end",
                        render: (row) => (
                            <span className="text-success">{formatCurrency(row.amount_paid)}</span>
                        ),
                    },
                    {
                        key: "balance",
                        label: "Balance",
                        className: "text-end",
                        render: (row) => (
                            <span className={row.balance > 0 ? 'text-danger fw-bold' : 'text-success'}>
                                {formatCurrency(row.balance)}
                            </span>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => (
                            <span className={`badge bg-label-${getStatusColor(row.status)} text-capitalize`}>
                                {row.status?.replace('_', ' ')}
                            </span>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/unisync360/accounts/invoices/${row.uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: (row) => hasAccess(user, ["change_invoice"]) && row.status === 'draft',
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: (row) => hasAccess(user, ["delete_invoice"]) && row.status === 'draft',
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Invoice",
                        render: () => (
                            hasAccess(user, ["add_invoice"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Create new Invoice"
                                >
                                    <i className="bx bx-plus me-1"></i> Create Invoice
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <InvoiceModal
                    show={showModal}
                    selectedObj={selectedObj}
                    onSuccess={() => {
                        setTableRefresh(prev => prev + 1);
                        setSelectedObj(null);
                        setShowModal(false);
                    }}
                    onClose={() => {
                        setSelectedObj(null);
                        setShowModal(false);
                    }}
                />
            )}
        </>
    );
};
