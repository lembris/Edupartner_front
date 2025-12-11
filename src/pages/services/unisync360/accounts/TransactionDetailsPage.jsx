import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import { getTransaction, deleteTransaction, approveTransaction, rejectTransaction, postTransaction } from "./Queries";
import { TransactionModal } from "./TransactionModal";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import showToast from "../../../../helpers/ToastHelper";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

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

export const TransactionDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const user = useSelector((state) => state.userReducer?.data);

    const fetchTransaction = async () => {
        setLoading(true);
        try {
            const response = await getTransaction(id);
            setTransaction(response.data);
        } catch (error) {
            console.error("Error fetching transaction:", error);
            showToast("error", "Failed to load transaction details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTransaction();
    }, [id]);

    const handleDelete = async () => {
        const confirmation = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirmation.isConfirmed) {
            try {
                await deleteTransaction(id);
                showToast("success", "Transaction deleted successfully");
                navigate("/unisync360/accounts/transactions");
            } catch (error) {
                showToast("error", "Failed to delete transaction");
            }
        }
    };

    const handleApprove = async () => {
        const confirmation = await Swal.fire({
            title: "Approve Transaction?",
            text: "This will approve the transaction for posting.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            confirmButtonText: "Yes, approve it!",
        });

        if (confirmation.isConfirmed) {
            try {
                await approveTransaction(id);
                showToast("success", "Transaction approved successfully");
                fetchTransaction();
            } catch (error) {
                showToast("error", "Failed to approve transaction");
            }
        }
    };

    const handleReject = async () => {
        const { value: reason } = await Swal.fire({
            title: "Reject Transaction?",
            input: "textarea",
            inputLabel: "Rejection Reason",
            inputPlaceholder: "Enter the reason for rejection...",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Reject",
            inputValidator: (value) => {
                if (!value) {
                    return "Please provide a reason for rejection";
                }
            },
        });

        if (reason) {
            try {
                await rejectTransaction(id, { reason });
                showToast("success", "Transaction rejected");
                fetchTransaction();
            } catch (error) {
                showToast("error", "Failed to reject transaction");
            }
        }
    };

    const handlePost = async () => {
        const confirmation = await Swal.fire({
            title: "Post Transaction?",
            text: "This will post the transaction to the ledger. This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#17a2b8",
            confirmButtonText: "Yes, post it!",
        });

        if (confirmation.isConfirmed) {
            try {
                await postTransaction(id);
                showToast("success", "Transaction posted successfully");
                fetchTransaction();
            } catch (error) {
                showToast("error", "Failed to post transaction");
            }
        }
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;
    if (!transaction) return <div className="p-5 text-center">Transaction not found</div>;

    const totalDebit = transaction.entries?.reduce((sum, e) => sum + parseFloat(e.debit_amount || 0), 0) || 0;
    const totalCredit = transaction.entries?.reduce((sum, e) => sum + parseFloat(e.credit_amount || 0), 0) || 0;

    return (
        <>
            <div className="animate__animated animate__fadeIn">
                <BreadCumb pageList={["Accounts", "Transactions", transaction.reference_number || "Details"]} />

                <div className="card mb-4 border-0 shadow-sm overflow-hidden">
                    <div className="card-body p-0">
                        <div className="bg-primary p-4 text-white" style={{ background: 'linear-gradient(45deg, #696cff 0%, #4346d3 100%)' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="avatar avatar-xl rounded-circle bg-white text-primary fw-bold fs-1 d-flex align-items-center justify-content-center border border-4 border-white shadow-sm" style={{ width: "80px", height: "80px" }}>
                                        <i className="bx bx-transfer"></i>
                                    </div>
                                    <div className="text-center text-md-start mt-3 mt-md-0">
                                        <h3 className="text-white mb-1 fw-bold">{transaction.reference_number}</h3>
                                        <div className="d-flex align-items-center gap-2 opacity-75 mb-2 justify-content-center justify-content-md-start">
                                            <span className={`badge bg-${getTypeColor(transaction.transaction_type)} text-capitalize`}>
                                                {transaction.transaction_type?.replace('_', ' ')}
                                            </span>
                                            <span className="mx-1">•</span>
                                            <i className="bx bx-calendar"></i> {formatDate(transaction.transaction_date)}
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">
                                            <span className={`badge bg-${getStatusColor(transaction.status)} text-capitalize`}>
                                                {transaction.status}
                                            </span>
                                            <span className="badge bg-white text-primary bg-opacity-25" style={{ backdropFilter: 'blur(4px)' }}>
                                                {transaction.currency} {parseFloat(transaction.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 mt-4 mt-md-0 flex-wrap">
                                    {transaction.status === 'pending' && hasAccess(user, [["approve_transaction"]]) && (
                                        <>
                                            <button
                                                className="btn btn-success fw-semibold shadow-sm"
                                                onClick={handleApprove}
                                            >
                                                <i className="bx bx-check me-1"></i> Approve
                                            </button>
                                            <button
                                                className="btn btn-danger fw-semibold shadow-sm"
                                                onClick={handleReject}
                                            >
                                                <i className="bx bx-x me-1"></i> Reject
                                            </button>
                                        </>
                                    )}
                                    {transaction.status === 'approved' && hasAccess(user, [["post_transaction"]]) && (
                                        <button
                                            className="btn btn-info text-white fw-semibold shadow-sm"
                                            onClick={handlePost}
                                        >
                                            <i className="bx bx-upload me-1"></i> Post to Ledger
                                        </button>
                                    )}
                                    {transaction.status !== 'posted' && hasAccess(user, [["change_transaction"]]) && (
                                        <button
                                            className="btn fw-semibold shadow-sm"
                                            style={{ backgroundColor: '#fff', color: '#696cff' }}
                                            onClick={() => {
                                                setSelectedObj(transaction);
                                                setShowModal(true);
                                            }}
                                        >
                                            <i className="bx bx-edit me-1"></i> Edit
                                        </button>
                                    )}
                                    {transaction.status === 'draft' && hasAccess(user, [["delete_transaction"]]) && (
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
                    <div className="col-xl-4 col-lg-5 mb-4">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h5 className="mb-0"><i className="bx bx-info-circle me-2 text-primary"></i> Transaction Info</h5>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    <li className="d-flex align-items-center mb-3">
                                        <div className="avatar avatar-sm bg-label-primary rounded p-2 me-3 d-flex align-items-center justify-content-center">
                                            <i className="bx bx-hash"></i>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Reference Number</small>
                                            <span className="fw-medium">{transaction.reference_number}</span>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-center mb-3">
                                        <div className="avatar avatar-sm bg-label-info rounded p-2 me-3 d-flex align-items-center justify-content-center">
                                            <i className="bx bx-calendar"></i>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Transaction Date</small>
                                            <span className="fw-medium">{formatDate(transaction.transaction_date)}</span>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-center mb-3">
                                        <div className="avatar avatar-sm bg-label-success rounded p-2 me-3 d-flex align-items-center justify-content-center">
                                            <i className="bx bx-dollar"></i>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Total Amount</small>
                                            <span className="fw-bold fs-5">
                                                {transaction.currency} {parseFloat(transaction.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="card mb-4 shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h5 className="mb-0"><i className="bx bx-user me-2 text-info"></i> Student</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar me-3">
                                        {transaction.student_details?.profile_picture ? (
                                            <img src={transaction.student_details.profile_picture} alt="Avatar" className="rounded-circle" />
                                        ) : (
                                            <span className="avatar-initial rounded-circle bg-label-primary">
                                                {transaction.student_details?.first_name?.[0]}{transaction.student_details?.last_name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="fw-semibold d-block">
                                            {transaction.student_details?.full_name || transaction.student_name || "N/A"}
                                        </span>
                                        <small className="text-muted">{transaction.student_details?.personal_email}</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {transaction.description && (
                            <div className="card shadow-sm">
                                <div className="card-header">
                                    <h5 className="mb-0"><i className="bx bx-note me-2 text-warning"></i> Description</h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-0">{transaction.description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-xl-8 col-lg-7 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <h5 className="mb-0"><i className="bx bx-list-ul me-2 text-primary"></i> Transaction Entries</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Account</th>
                                                <th>Description</th>
                                                <th className="text-end">Debit</th>
                                                <th className="text-end">Credit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transaction.entries && transaction.entries.length > 0 ? (
                                                transaction.entries.map((entry, index) => (
                                                    <tr key={entry.uid || index}>
                                                        <td>
                                                            <div className="d-flex flex-column">
                                                                <span className="fw-semibold">
                                                                    {entry.account_details?.account_code || entry.account_code || "N/A"}
                                                                </span>
                                                                <small className="text-muted">
                                                                    {entry.account_details?.account_name || entry.account_name || ""}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>{entry.description || "-"}</td>
                                                        <td className="text-end">
                                                            {parseFloat(entry.debit_amount || 0) > 0 ? (
                                                                <span className="text-success fw-medium">
                                                                    {parseFloat(entry.debit_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </span>
                                                            ) : "-"}
                                                        </td>
                                                        <td className="text-end">
                                                            {parseFloat(entry.credit_amount || 0) > 0 ? (
                                                                <span className="text-danger fw-medium">
                                                                    {parseFloat(entry.credit_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </span>
                                                            ) : "-"}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-muted">
                                                        No entries found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <td colSpan="2" className="text-end fw-bold">Totals:</td>
                                                <td className="text-end fw-bold text-success">
                                                    {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="text-end fw-bold text-danger">
                                                    {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" className="text-end fw-bold">Balance:</td>
                                                <td className="text-end">
                                                    {Math.abs(totalDebit - totalCredit) < 0.01 ? (
                                                        <span className="badge bg-success">Balanced</span>
                                                    ) : (
                                                        <span className="badge bg-danger">
                                                            Difference: {Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {transaction.approval_history && transaction.approval_history.length > 0 && (
                            <div className="card shadow-sm mt-4">
                                <div className="card-header">
                                    <h5 className="mb-0"><i className="bx bx-history me-2 text-info"></i> Approval History</h5>
                                </div>
                                <div className="card-body">
                                    <div className="timeline-xs">
                                        {transaction.approval_history.map((history, index) => (
                                            <div key={index} className="timeline-item pb-3 border-start ps-3 position-relative ms-2">
                                                <span className={`position-absolute top-0 start-0 translate-middle border border-white rounded-circle bg-${getStatusColor(history.action)} p-2`} style={{ width: '12px', height: '12px' }}></span>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className={`badge bg-label-${getStatusColor(history.action)} text-capitalize`}>
                                                        {history.action}
                                                    </span>
                                                    <small className="text-muted">{formatDate(history.created_at, true)}</small>
                                                </div>
                                                <h6 className="mb-1">{history.user_name || "System"}</h6>
                                                {history.comment && <p className="mb-0 text-muted small">{history.comment}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <TransactionModal
                    selectedObj={selectedObj}
                    onSuccess={() => {
                        fetchTransaction();
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
