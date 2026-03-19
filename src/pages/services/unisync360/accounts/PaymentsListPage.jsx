import React, { useState } from "react";
import "animate.css";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { PaymentModal } from "./PaymentModal";
import { deletePayment } from "./Queries.jsx";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const PaymentsListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (payment) => {
        if (!payment) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete payment: ${payment.reference_number}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deletePayment(payment.uid);
                Swal.fire(
                    "Deleted!",
                    "The Payment has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
            Swal.fire(
                "Error!",
                "Unable to delete payment. Please try again or contact support.",
                "error"
            );
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: "warning", label: "Pending" },
            completed: { color: "success", label: "Completed" },
            failed: { color: "danger", label: "Failed" },
            refunded: { color: "info", label: "Refunded" },
        };
        const config = statusConfig[status] || { color: "secondary", label: status };
        return (
            <span className={`badge bg-label-${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getPaymentMethodLabel = (method) => {
        const methodLabels = {
            bank_transfer: "Bank Transfer",
            credit_card: "Credit Card",
            mobile_money: "Mobile Money",
            cash: "Cash",
            cheque: "Cheque",
        };
        return methodLabels[method] || method;
    };

    return (
        <>
            <BreadCumb pageList={["Accounts", "Payments"]} />
            <PaginatedTable
                fetchPath="/unisync360-accounts/payments/"
                title="Payments"
                columns={[
                    {
                        key: "reference_number",
                        label: "Reference #",
                        className: "fw-bold",
                        style: { width: "150px" },
                        render: (row) => (
                            <span className="text-primary fw-semibold">
                                {row.reference_number}
                            </span>
                        ),
                    },
                    {
                        key: "student",
                        label: "Student",
                        style: { width: "200px" },
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span className="fw-semibold">{row.student_name || "-"}</span>
                            </div>
                        ),
                    },
                    {
                        key: "amount",
                        label: "Amount",
                        style: { width: "120px" },
                        render: (row) => (
                            <span className="fw-semibold">
                                {row.currency} {parseFloat(row.amount).toLocaleString()}
                            </span>
                        ),
                    },
                    {
                        key: "payment_method",
                        label: "Payment Method",
                        style: { width: "130px" },
                        render: (row) => (
                            <span>{getPaymentMethodLabel(row.payment_method)}</span>
                        ),
                    },
                    {
                        key: "payment_date",
                        label: "Date",
                        style: { width: "110px" },
                        render: (row) => (
                            <span>{row.payment_date ? formatDate(row.payment_date) : "-"}</span>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        style: { width: "100px" },
                        render: (row) => getStatusBadge(row.status),
                    },
                ]}
                actions={[
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: () => hasAccess(user, ["change_payment"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_payment"]),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Payment",
                        render: () => (
                            hasAccess(user, ["add_payment"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Payment"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Payment
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <PaymentModal
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
