import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { recruiterService } from "../commission-portal/Queries.jsx";
import { LeadLancerModal } from "./LeadLancerModal.jsx";
import ProtectedRoute from "../../../../components/wrapper/ProtectedRoute.jsx";
import BreadCumb from "../../../../layouts/BreadCumb";
import ReactLoading from "react-loading";
import { formatDate } from "../../../../helpers/DateFormater.js";
import { BadgeClassHelper } from "../../../../helpers/BadgeClassHelper.js";

export const LeadLancerListPage = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedLeadLancer, setSelectedLeadLancer] = useState(null);
    const [leadLancers, setLeadLancers] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
    });

    const fetchLeadLancers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const result = await recruiterService.getRecruiters({
                pagination: { page: page, page_size: pageSize },
                search: "",
            });
            
            let list = [];
            if (result.data && Array.isArray(result.data)) {
                list = result.data;
            } else if (result.results && Array.isArray(result.results)) {
                list = result.results;
            }
            
            setLeadLancers(list);
            setPagination(prev => ({
                ...prev,
                currentPage: page,
                pageSize: pageSize,
                totalItems: result.count || result.total || list.length,
            }));
        } catch (error) {
            console.error("Error fetching lead lancers:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load lead lancers",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeadLancers();
    }, []);

    const handleEdit = (leadLancer) => {
        setSelectedLeadLancer(leadLancer);
        setShowModal(true);
    };

    const handleDelete = async (uid) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await recruiterService.deleteRecruiter(uid);
                    Swal.fire(
                        "Deleted!",
                        "Lead lancer has been deleted.",
                        "success"
                    );
                    fetchLeadLancers(pagination.currentPage, pagination.pageSize);
                } catch (error) {
                    console.error("Error deleting lead lancer:", error);
                    Swal.fire(
                        "Error!",
                        "Failed to delete lead lancer.",
                        "error"
                    );
                }
            }
        });
    };

    const handlePageChange = (page) => {
        fetchLeadLancers(page, pagination.pageSize);
    };

    const handlePageSizeChange = (newPageSize) => {
        fetchLeadLancers(1, newPageSize);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedLeadLancer(null);
    };

    const handleModalSuccess = () => {
        closeModal();
        fetchLeadLancers(pagination.currentPage, pagination.pageSize);
    };

    const getActiveStatusBadge = (isActive) => {
        return isActive ? "Active" : "Inactive";
    };

    const getStatusBadgeClass = (isActive) => {
        return isActive ? "bg-success" : "bg-danger";
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Lead Lancers</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-end">
                                <li className="breadcrumb-item">
                                    <a href="/">Home</a>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href="/unisync360/dashboard">UniSync360</a>
                                </li>
                                <li className="breadcrumb-item active">Lead Lancers</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Lead Lancers Management</h3>
                                    <button 
                                        className="btn btn-primary btn-sm float-end"
                                        onClick={() => setShowModal(true)}
                                    >
                                        <i className="bx bx-plus"></i> Add Lead Lancer
                                    </button>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <ReactLoading type="spinningBubbles" color="#475569" height={50} width={50} />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>Status</th>
                                                            <th>Created</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leadLancers.map((leadLancer) => (
                                                            <tr key={leadLancer.uid}>
                                                                <td>{leadLancer.full_name || `${leadLancer.first_name} ${leadLancer.last_name}`}</td>
                                                                <td>{leadLancer.email}</td>
                                                                <td>{leadLancer.phone_number || '-'}</td>
                                                                <td>
                                                                    <span className={`badge ${getStatusBadgeClass(leadLancer.is_active)}`}>
                                                                        {getActiveStatusBadge(leadLancer.is_active)}
                                                                    </span>
                                                                </td>
                                                                <td>{formatDate(leadLancer.created_at)}</td>
                                                                <td>
                                                                    <div className="dropdown">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary dropdown-toggle"
                                                                            type="button"
                                                                            data-bs-toggle="dropdown"
                                                                        >
                                                                            <i className="bx bx-dots-vertical-rounded"></i>
                                                                        </button>
                                                                        <ul className="dropdown-menu">
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => handleEdit(leadLancer)}
                                                                                >
                                                                                    <i className="bx bx-edit"></i> Edit
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item text-danger"
                                                                                    onClick={() => handleDelete(leadLancer.uid)}
                                                                                >
                                                                                    <i className="bx bx-trash"></i> Delete
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {leadLancers.length === 0 && (
                                                <div className="text-center py-4">
                                                    <p className="text-muted">No lead lancers found</p>
                                                </div>
                                            )}

                                            {/* Pagination */}
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <div className="text-muted">
                                                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} entries
                                                </div>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                        disabled={pagination.currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                    {[...Array(Math.ceil(pagination.totalItems / pagination.pageSize))].map((_, index) => (
                                                        <button
                                                            key={index + 1}
                                                            className={`btn btn-sm ${index + 1 === pagination.currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                            onClick={() => handlePageChange(index + 1)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                        disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.pageSize)}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal for Add/Edit Lead Lancer */}
            <LeadLancerModal
                show={showModal}
                onHide={closeModal}
                onSuccess={handleModalSuccess}
                leadLancerData={selectedLeadLancer}
            />
        </div>
    );
};