// CommissionsListPage.jsx - Commission Management List
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import ReactLoading from "react-loading";
import BreadCumb from "../../../../layouts/BreadCumb";
import "./CommissionsListPage.css";

const API_BASE = "http://localhost:8000/api";

export const CommissionsListPage = () => {
    const navigate = useNavigate();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
    });

    const STATUS_OPTIONS = [
        "pending",
        "projected",
        "approved",
        "processing",
        "paid",
        "rejected",
        "cancelled",
    ];

    const fetchCommissions = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params = {
                page,
                page_size: pageSize,
                paginated: "true",
            };
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;

            const response = await axios.get(`${API_BASE}/unisync360-commissions/`, {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            const commissionsList = response.data?.data || [];
            setCommissions(Array.isArray(commissionsList) ? commissionsList : []);
            setPagination((prev) => ({
                ...prev,
                currentPage: page,
                pageSize: pageSize,
                totalItems: response.data?.pagination?.total || commissionsList.length,
            }));
        } catch (error) {
            console.error("Error fetching commissions:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load commissions",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [searchQuery, statusFilter]);

    const handleDelete = async (uid) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this commission?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE}/unisync360-commissions/${uid}/`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                    });
                    Swal.fire({
                        icon: "success",
                        title: "Deleted",
                        text: "Commission has been deleted",
                        timer: 2000,
                    });
                    fetchCommissions(pagination.currentPage, pagination.pageSize);
                } catch (error) {
                    console.error("Error deleting commission:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to delete commission",
                    });
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: "bg-warning", text: "Pending" },
            projected: { class: "bg-info", text: "Projected" },
            approved: { class: "bg-success", text: "Approved" },
            processing: { class: "bg-primary", text: "Processing" },
            paid: { class: "bg-success", text: "Paid" },
            rejected: { class: "bg-danger", text: "Rejected" },
            cancelled: { class: "bg-secondary", text: "Cancelled" },
        };
        return badges[status] || badges.pending;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    return (
        <div className="container-fluid px-3 py-2">
            <BreadCumb pageList={["Commissions"]} />

            {/* Search and Filter */}
            <div className="mb-3">
                <div className="row g-2">
                    <div className="col-md-8">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bx bx-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search by student name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Commissions Table */}
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">Commission Records</h5>
                </div>
                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center py-5">
                            <ReactLoading
                                type="spinningBubbles"
                                color="#475569"
                                height={50}
                                width={50}
                            />
                        </div>
                    ) : commissions.length > 0 ? (
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Student Name</th>
                                    <th>Program Fee</th>
                                    <th>Commission Rate</th>
                                    <th>Commission Amount</th>
                                    <th>Status</th>
                                    <th>Calculation Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.map((commission) => (
                                    <tr key={commission.uid}>
                                        <td className="fw-semibold">
                                            {commission.student?.full_name || "N/A"}
                                        </td>
                                        <td>{formatCurrency(commission.program_fee)}</td>
                                        <td>{commission.commission_rate}%</td>
                                        <td className="fw-bold">
                                            {formatCurrency(commission.commission_amount)}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    getStatusBadge(commission.status).class
                                                }`}
                                            >
                                                {getStatusBadge(commission.status).text}
                                            </span>
                                        </td>
                                        <td className="small">
                                            {new Date(
                                                commission.calculation_date
                                            ).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/unisync360/commissions/${commission.uid}`
                                                        )
                                                    }
                                                    title="View"
                                                >
                                                    <i className="bx bx-show"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(commission.uid)}
                                                    title="Delete"
                                                >
                                                    <i className="bx bx-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-5">
                            <p className="text-muted">No commissions found</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {commissions.length > 0 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                            {Math.min(
                                pagination.currentPage * pagination.pageSize,
                                pagination.totalItems
                            )}{" "}
                            of {pagination.totalItems}
                        </small>
                        <nav>
                            <ul className="pagination mb-0 sm">
                                <li
                                    className={`page-item ${
                                        pagination.currentPage === 1 ? "disabled" : ""
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            fetchCommissions(
                                                pagination.currentPage - 1,
                                                pagination.pageSize
                                            )
                                        }
                                    >
                                        Previous
                                    </button>
                                </li>
                                <li
                                    className={`page-item ${
                                        pagination.currentPage >=
                                        Math.ceil(pagination.totalItems / pagination.pageSize)
                                            ? "disabled"
                                            : ""
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            fetchCommissions(
                                                pagination.currentPage + 1,
                                                pagination.pageSize
                                            )
                                        }
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommissionsListPage;
