import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { TransactionModal } from "./TransactionModal";
import { deleteTransaction } from "./Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const TransactionsListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (transaction) => {
        if (!transaction) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete transaction: ${transaction.reference_number}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteTransaction(transaction.uid);
                Swal.fire(
                    "Deleted!",
                    "The Transaction has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Swal.fire(
                "Error!",
                "Unable to delete transaction. Please try again or contact support.",
                "error"
            );
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'success';
            case 'posted': return 'success';
            case 'rejected': return 'danger';
            case 'pending': return 'warning';
            case 'draft': return 'secondary';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const getTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'invoice': return 'primary';
            case 'payment': return 'success';
            case 'credit_note': return 'info';
            case 'debit_note': return 'warning';
            case 'refund': return 'danger';
            case 'adjustment': return 'secondary';
            default: return 'secondary';
        }
    };

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

    return (
        <>
            <BreadCumb pageList={["Accounts", "Transactions"]} />
            <PaginatedTable
                fetchPath="/unisync360-accounts/transactions/"
                title="Transactions"
                columns={[
                    {
                        key: "reference_number",
                        label: "Reference #",
                        className: "fw-bold",
                        style: { width: "150px" },
                        render: (row) => (
                            <span
                                className="text-primary cursor-pointer fw-semibold"
                                onClick={() => navigate(`/unisync360/accounts/transactions/${row.uid}`)}
                            >
                                {row.reference_number || "N/A"}
                            </span>
                        ),
                    },
                    {
                        key: "transaction_type",
                        label: "Type",
                        style: { width: "120px" },
                        render: (row) => (
                            <span className={`badge bg-label-${getTypeColor(row.transaction_type)} text-capitalize`}>
                                {row.transaction_type?.replace('_', ' ') || "N/A"}
                            </span>
                        ),
                    },
                    {
                        key: "transaction_date",
                        label: "Date",
                        style: { width: "120px" },
                        render: (row) => (
                            <span>{row.transaction_date ? formatDate(row.transaction_date) : "-"}</span>
                        ),
                    },
                    {
                        key: "student",
                        label: "Student",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="fw-semibold">
                                    {row.student_details?.full_name || row.student_name || "-"}
                                </span>
                                <small className="text-muted">{row.student_details?.personal_email || ""}</small>
                            </div>
                        ),
                    },
                    {
                        key: "total_amount",
                        label: "Amount",
                        style: { width: "130px" },
                        render: (row) => (
                            <div className="d-flex flex-column text-end">
                                <span className="fw-bold">
                                    {row.currency || "USD"} {parseFloat(row.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        style: { width: "100px" },
                        render: (row) => (
                            <span className={`badge bg-label-${getStatusColor(row.status)} text-capitalize`}>
                                {row.status || "N/A"}
                            </span>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/unisync360/accounts/transactions/${row.uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: (row) => hasAccess(user, ["change_transaction"]) && row.status !== 'posted',
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: (row) => hasAccess(user, ["delete_transaction"]) && row.status === 'draft',
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                filterGroups={[
                    {
                        group: "transaction_type",
                        label: "Type",
                        options: transactionTypeOptions,
                        selected: [],
                        placeholder: "Filter by Type",
                    },
                    {
                        group: "status",
                        label: "Status",
                        options: statusOptions,
                        selected: [],
                        placeholder: "Filter by Status",
                    },
                ]}
                buttons={[
                    {
                        label: "Add Transaction",
                        render: () => (
                            hasAccess(user, ["add_transaction"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Transaction"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Transaction
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <TransactionModal
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
