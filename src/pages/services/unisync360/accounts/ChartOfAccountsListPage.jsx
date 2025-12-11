import React, { useState } from "react";
import "animate.css";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import Swal from "sweetalert2";
import { ChartOfAccountsModal } from "./ChartOfAccountsModal";
import { ChartOfAccountsAPI } from "./Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const ChartOfAccountsListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (account) => {
        if (!account) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete account: ${account.code} - ${account.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await ChartOfAccountsAPI.delete(account.uid);
                Swal.fire(
                    "Deleted!",
                    "The account has been deleted successfully.",
                    "success"
                );
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            Swal.fire(
                "Error!",
                "Unable to delete account. Please try again or contact support.",
                "error"
            );
        }
    };

    const formatCurrency = (amount, currency = "USD") => {
        if (amount === null || amount === undefined) return "-";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <>
            <BreadCumb pageList={["Accounts", "Chart of Accounts"]} />
            <PaginatedTable
                fetchPath="/unisync360-accounts/chart-of-accounts/"
                title="Chart of Accounts"
                columns={[
                    {
                        key: "code",
                        label: "Code",
                        className: "fw-bold",
                        style: { width: "120px" },
                        render: (row) => (
                            <span className="text-primary fw-semibold">{row.code}</span>
                        ),
                    },
                    {
                        key: "name",
                        label: "Account Name",
                        style: { width: "250px" },
                        render: (row) => (
                            <div>
                                <span className="fw-semibold">{row.name}</span>
                                {row.description && (
                                    <small className="d-block text-muted fs-11">{row.description}</small>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "account_type",
                        label: "Account Type",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span>{row.account_type?.name || "-"}</span>
                                <small className="text-muted text-capitalize">
                                    {row.account_type?.category || "-"}
                                </small>
                            </div>
                        ),
                    },
                    {
                        key: "parent",
                        label: "Parent Account",
                        render: (row) => (
                            <span>{row.parent?.name || "-"}</span>
                        ),
                    },
                    {
                        key: "current_balance",
                        label: "Current Balance",
                        className: "text-end",
                        render: (row) => (
                            <span className={row.current_balance < 0 ? "text-danger" : "text-success"}>
                                {formatCurrency(row.current_balance, row.currency)}
                            </span>
                        ),
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => (
                            <span className={`badge bg-label-${row.status === 'active' ? "success" : "secondary"}`}>
                                {row.status || "N/A"}
                            </span>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        style: { width: "120px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                {hasAccess(user, [["change_chartofaccounts"]]) && (
                                    <button
                                        aria-label="Edit"
                                        type="button"
                                        className="btn btn-sm btn-outline-primary border-0"
                                        onClick={() => {
                                            setSelectedObj(row);
                                            setShowModal(true);
                                        }}
                                        title="Edit Account"
                                    >
                                        <i className="bx bx-edit"></i>
                                    </button>
                                )}

                                {hasAccess(user, [["delete_chartofaccounts"]]) && (
                                    <button
                                        aria-label="Delete"
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0"
                                        onClick={() => handleDelete(row)}
                                        title="Delete Account"
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                )}
                            </div>
                        ),
                    },
                ]}
                buttons={[
                    {
                        label: "Add Account",
                        render: () => (
                            hasAccess(user, [["add_chartofaccounts"]]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Account"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Account
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <ChartOfAccountsModal
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
