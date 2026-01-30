// MyStudentsList.jsx - Lead Lancer's Student List with Mobile-First Design
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { commissionPortalService } from "../commission-portal/Queries.jsx";
import { StudentModal } from "../students/StudentModal.jsx";
import BreadCumb from "../../../../layouts/BreadCumb";
import ReactLoading from "react-loading";
import "./MyStudentsList.css";

export const MyStudentsList = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [filterBy, setFilterBy] = useState("all");

    // Check if user is a lead lancer based on role
    const isLeadLancer = user?.roles?.some(role => 
        role.name === "unisync360_lead_lancer" || 
        role === "unisync360_lead_lancer"
    ) ?? false;

    // Log user roles for debugging
    useEffect(() => {
        console.log("User data:", user);
        console.log("User roles:", user?.roles);
        console.log("Is Lead Lancer:", isLeadLancer);
    }, [user, isLeadLancer]);

    const fetchStudents = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params = {
                page,
                page_size: pageSize,
            };
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;

            const response = await commissionPortalService.getMyStudents(params);
            const studentsList = response?.data?.data || response?.data || [];
            setStudents(Array.isArray(studentsList) ? studentsList : []);
            setPagination((prev) => ({
                ...prev,
                currentPage: page,
                pageSize: pageSize,
                totalItems: response?.count || response?.total || studentsList.length,
            }));
        } catch (error) {
            console.error("Error fetching students:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load students",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [searchQuery, statusFilter]);

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleDelete = async (studentUid) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to remove this student from your records?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, remove it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({
                        icon: "success",
                        title: "Removed",
                        text: "Student has been removed",
                        timer: 2000,
                    });
                    fetchStudents(pagination.currentPage, pagination.pageSize);
                } catch (error) {
                    console.error("Error removing student:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to remove student",
                    });
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: { class: "bg-success", text: "Active" },
            inactive: { class: "bg-warning", text: "Inactive" },
            completed: { class: "bg-primary", text: "Completed" },
            withdrawn: { class: "bg-danger", text: "Withdrawn" },
            deferred: { class: "bg-secondary", text: "Deferred" },
            left: { class: "bg-danger", text: "Left" },
        };
        const statusKey = status?.toLowerCase() || "inactive";
        return badges[statusKey] || badges.inactive;
    };

    const handleStatusChange = async (studentUid, newStatus) => {
        try {
            await commissionPortalService.updateStudentStatus(studentUid, {
                status: newStatus,
            });
            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Student status updated successfully",
                timer: 2000,
            });
            fetchStudents(pagination.currentPage, pagination.pageSize);
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to update student status",
            });
        }
    };

    const filteredStudents = students.filter((student) => {
        if (filterBy === "active") {
            return student.status_name?.toLowerCase() === "active";
        } else if (filterBy === "inactive") {
            return student.status_name?.toLowerCase() !== "active";
        }
        return true;
    });

    return (
        <div className="container-fluid px-3 py-2">
            <BreadCumb pageList={["Lead Lancer", "My Students"]} />

            {/* Register Student Button - Full Width on Mobile */}
            <div className="mb-3">
                <button
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    onClick={() => {
                        setSelectedStudent(null);
                        setShowModal(true);
                    }}
                    style={{ fontSize: "1rem" }}
                >
                    <i className="bx bx-plus me-2"></i>
                    Register Student
                </button>
            </div>

            {/* Search Bar - Full Width on Mobile */}
            <div className="mb-3">
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bx bx-search text-muted"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ fontSize: "1rem" }}
                    />
                </div>
            </div>

            {/* Filters - Stacked on Mobile */}
            <div className="row g-2 mb-3">
                <div className="col-6">
                    <select
                        className="form-select form-select-sm"
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        style={{ fontSize: "0.95rem" }}
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="col-6">
                    <select
                        className="form-select form-select-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ fontSize: "0.95rem" }}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>
                </div>
            </div>

            {/* Students List - Card View for Mobile */}
            <div className="mb-3">
                {loading ? (
                    <div className="text-center py-5">
                        <ReactLoading
                            type="spinningBubbles"
                            color="#475569"
                            height={50}
                            width={50}
                        />
                        <p className="text-muted mt-3">Loading students...</p>
                    </div>
                ) : filteredStudents.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className="d-none d-lg-block">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Students List</h5>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Status</th>
                                                <th>Registered</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student) => (
                                                <tr key={student.uid}>
                                                    <td>
                                                        <strong>
                                                            {student.full_name ||
                                                                `${student.first_name || ""} ${
                                                                    student.last_name || ""
                                                                }`}
                                                        </strong>
                                                    </td>
                                                    <td className="small">
                                                        {student.personal_email || "-"}
                                                    </td>
                                                    <td className="small">
                                                        {student.personal_phone || "-"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                getStatusBadge(
                                                                    student.status_name
                                                                ).class
                                                            }`}
                                                        >
                                                            {getStatusBadge(
                                                                student.status_name
                                                            ).text}
                                                        </span>
                                                    </td>
                                                    <td className="small">
                                                        {new Date(
                                                            student.registration_date
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary border-0"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/unisync360/students/${student.uid}`
                                                                    )
                                                                }
                                                                title="View Details"
                                                            >
                                                                <i className="bx bx-show"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary border-0"
                                                                onClick={() =>
                                                                    handleEdit(student)
                                                                }
                                                                title="Edit Student"
                                                            >
                                                                <i className="bx bx-edit"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="d-lg-none">
                            {filteredStudents.map((student) => (
                                <div key={student.uid} className="card mb-3 border-0 shadow-sm">
                                    <div className="card-body p-3">
                                        {/* Name and Status */}
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="flex-grow-1">
                                                <h6 className="card-title mb-1 fw-bold">
                                                    {student.full_name ||
                                                        `${student.first_name || ""} ${
                                                            student.last_name || ""
                                                        }`}
                                                </h6>
                                            </div>
                                            <span
                                                className={`badge ${getStatusBadge(
                                                    student.status_name
                                                ).class}`}
                                                style={{ whiteSpace: "nowrap", marginLeft: "0.5rem" }}
                                            >
                                                {getStatusBadge(student.status_name).text}
                                            </span>
                                        </div>

                                        {/* Email */}
                                        <div className="mb-2">
                                            <small className="text-muted d-block">Email</small>
                                            <small className="text-break">
                                                {student.personal_email || "-"}
                                            </small>
                                        </div>

                                        {/* Phone */}
                                        <div className="mb-2">
                                            <small className="text-muted d-block">Phone</small>
                                            <small>{student.personal_phone || "-"}</small>
                                        </div>

                                        {/* Registered Date */}
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Registered</small>
                                            <small>
                                                {new Date(
                                                    student.registration_date
                                                ).toLocaleDateString()}
                                            </small>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary flex-grow-1"
                                                onClick={() =>
                                                    navigate(
                                                        `/unisync360/students/${student.uid}`
                                                    )
                                                }
                                                title="View Details"
                                            >
                                                <i className="bx bx-show me-1"></i>
                                                View
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary flex-grow-1"
                                                onClick={() => handleEdit(student)}
                                                title="Edit Student"
                                            >
                                                <i className="bx bx-edit me-1"></i>
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
                            <small className="text-muted">
                                Showing{" "}
                                {(pagination.currentPage - 1) * pagination.pageSize + 1}{" "}
                                to{" "}
                                {Math.min(
                                    pagination.currentPage * pagination.pageSize,
                                    pagination.totalItems
                                )}{" "}
                                of {pagination.totalItems}
                            </small>
                            <div className="btn-group btn-group-sm">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() =>
                                        fetchStudents(
                                            pagination.currentPage - 1,
                                            pagination.pageSize
                                        )
                                    }
                                    disabled={pagination.currentPage === 1}
                                >
                                    <i className="bx bx-chevron-left"></i>
                                </button>
                                {[
                                    ...Array(
                                        Math.ceil(
                                            pagination.totalItems /
                                                pagination.pageSize
                                        )
                                    ),
                                ].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        className={`btn btn-sm ${
                                            index + 1 ===
                                            pagination.currentPage
                                                ? "btn-primary"
                                                : "btn-outline-secondary"
                                        }`}
                                        onClick={() =>
                                            fetchStudents(
                                                index + 1,
                                                pagination.pageSize
                                            )
                                        }
                                        style={{
                                            display: index + 1 <= 3 || index + 1 >= Math.ceil(pagination.totalItems / pagination.pageSize) - 2 ? "inline-block" : "none",
                                            minWidth: "36px"
                                        }}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() =>
                                        fetchStudents(
                                            pagination.currentPage + 1,
                                            pagination.pageSize
                                        )
                                    }
                                    disabled={
                                        pagination.currentPage >=
                                        Math.ceil(
                                            pagination.totalItems /
                                                pagination.pageSize
                                        )
                                    }
                                >
                                    <i className="bx bx-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <i className="bx bx-inbox" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                            <p className="text-muted mt-3">No students found</p>
                            <p className="text-muted small">Register your first student to get started</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Modal - Add/Edit */}
            {showModal && (
                <StudentModal
                    selectedObj={selectedStudent}
                    isLeadLancer={isLeadLancer}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedStudent(null);
                    }}
                    onSuccess={async () => {
                        setShowModal(false);
                        setSelectedStudent(null);
                        fetchStudents(pagination.currentPage, pagination.pageSize);
                    }}
                />
            )}
        </div>
    );
};

export default MyStudentsList;
