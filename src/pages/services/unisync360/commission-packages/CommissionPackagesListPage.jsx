// CommissionPackagesListPage.jsx - Commission Packages Management
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import ReactLoading from "react-loading";
import BreadCumb from "../../../../layouts/BreadCumb";
import AddCommissionPackageModal from "./AddCommissionPackageModal";
import "./CommissionPackagesListPage.css";

const API_BASE = "http://localhost:8000/api";

export const CommissionPackagesListPage = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [scopeFilter, setScopeFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
    });

    const SCOPE_OPTIONS = [
        "global",
        "country",
        "university",
        "course",
        "agent",
        "combined",
    ];

    const fetchPackages = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params = {
                page,
                page_size: pageSize,
                paginated: "true",
            };
            if (searchQuery) params.search = searchQuery;
            if (scopeFilter) params.scope = scopeFilter;

            const response = await axios.get(`${API_BASE}/unisync360-commission-packages/`, {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            const packagesList = response.data?.data || [];
            setPackages(Array.isArray(packagesList) ? packagesList : []);
            setPagination((prev) => ({
                ...prev,
                currentPage: page,
                pageSize: pageSize,
                totalItems: response.data?.pagination?.total || packagesList.length,
            }));
        } catch (error) {
            console.error("Error fetching commission packages:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load commission packages",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [searchQuery, scopeFilter]);

    const handleDelete = async (uid) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this commission package?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE}/unisync360-commission-packages/${uid}/`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                    });
                    Swal.fire({
                        icon: "success",
                        title: "Deleted",
                        text: "Commission package has been deleted",
                        timer: 2000,
                    });
                    fetchPackages(pagination.currentPage, pagination.pageSize);
                } catch (error) {
                    console.error("Error deleting commission package:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to delete commission package",
                    });
                }
            }
        });
    };

    const getScopeBadge = (scope) => {
        const badges = {
            global: { class: "bg-primary", text: "Global" },
            country: { class: "bg-info", text: "Country" },
            university: { class: "bg-success", text: "University" },
            course: { class: "bg-warning", text: "Course" },
            agent: { class: "bg-secondary", text: "Agent" },
            combined: { class: "bg-dark", text: "Combined" },
        };
        return badges[scope] || badges.global;
    };

    const getStatusBadge = (isActive) => {
        return isActive
            ? { class: "bg-success", text: "Active" }
            : { class: "bg-danger", text: "Inactive" };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    return (
        <div className="container-fluid px-3 py-2">
            <BreadCumb pageList={["Commission Packages"]} />

            {/* Header with Add Button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Commission Packages</h4>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    <i className="bx bx-plus"></i> Add Package
                </button>
            </div>

            {/* Add Package Modal */}
            <AddCommissionPackageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchPackages(pagination.currentPage, pagination.pageSize)}
            />

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
                                placeholder="Search by package name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={scopeFilter}
                            onChange={(e) => setScopeFilter(e.target.value)}
                        >
                            <option value="">All Scopes</option>
                            {SCOPE_OPTIONS.map((scope) => (
                                <option key={scope} value={scope}>
                                    {scope.charAt(0).toUpperCase() + scope.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Packages Table */}
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">Commission Package List</h5>
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
                    ) : packages.length > 0 ? (
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Package Code</th>
                                    <th>Package Name</th>
                                    <th>Scope</th>
                                    <th>Default Rate</th>
                                    <th>Rate Type</th>
                                    <th>Status</th>
                                    <th>Valid From</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((pkg) => (
                                    <tr key={pkg.uid}>
                                        <td className="fw-semibold">{pkg.code}</td>
                                        <td>{pkg.name}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    getScopeBadge(pkg.scope).class
                                                }`}
                                            >
                                                {getScopeBadge(pkg.scope).text}
                                            </span>
                                        </td>
                                        <td>
                                            {pkg.default_rate}%
                                        </td>
                                        <td>{pkg.rate_type}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    getStatusBadge(pkg.is_active).class
                                                }`}
                                            >
                                                {getStatusBadge(pkg.is_active).text}
                                            </span>
                                        </td>
                                        <td className="small">
                                            {pkg.valid_from
                                                ? new Date(pkg.valid_from).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/unisync360/commission-packages/${pkg.uid}`
                                                        )
                                                    }
                                                    title="View"
                                                >
                                                    <i className="bx bx-show"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/unisync360/commission-packages/${pkg.uid}/edit`
                                                        )
                                                    }
                                                    title="Edit"
                                                >
                                                    <i className="bx bx-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(pkg.uid)}
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
                            <p className="text-muted">No commission packages found</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {packages.length > 0 && (
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
                                            fetchPackages(
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
                                            fetchPackages(
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

export default CommissionPackagesListPage;
