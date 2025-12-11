import React, { useState, useEffect } from "react";
import "animate.css";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { UserModal } from "./UserModal";
import { PasswordChangeModal } from "./PasswordChangeModal";
import { RoleAssignmentModal } from "./RoleAssignmentModal";
import { deleteUser, toggleActivation, getUserStats, ROLE_DISPLAY_NAMES, ROLE_COLORS } from "./Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const UserListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [stats, setStats] = useState(null);
    const user = useSelector((state) => state.userReducer?.data);

    useEffect(() => {
        loadStats();
    }, [tableRefresh]);

    const loadStats = async () => {
        try {
            const response = await getUserStats();
            setStats(response.data);
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const handleDelete = async (userItem) => {
        if (!userItem) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete user: ${userItem.first_name} ${userItem.last_name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteUser(userItem.guid);
                Swal.fire("Deleted!", "The user has been deleted successfully.", "success");
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            Swal.fire("Error!", "Unable to delete user. Please try again.", "error");
        }
    };

    const handleToggleActivation = async (userItem) => {
        if (!userItem) return;

        const action = userItem.is_active ? 'deactivate' : 'activate';
        const actionText = userItem.is_active ? 'Deactivate' : 'Activate';

        try {
            const confirmation = await Swal.fire({
                title: `${actionText} User?`,
                text: `Are you sure you want to ${action} ${userItem.first_name} ${userItem.last_name}?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: userItem.is_active ? "#DD6B55" : "#28a745",
                cancelButtonColor: "#aaa",
                confirmButtonText: `Yes, ${action}!`,
            });

            if (confirmation.isConfirmed) {
                await toggleActivation(userItem.guid, action);
                Swal.fire("Success!", `User has been ${action}d successfully.`, "success");
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error toggling activation:", error);
            Swal.fire("Error!", "Unable to update user status. Please try again.", "error");
        }
    };

    const getRoleBadges = (roles) => {
        if (!roles || roles.length === 0) {
            return <span className="badge bg-label-secondary">No Role</span>;
        }
        return roles.map((role, index) => (
            <span
                key={index}
                className={`badge bg-label-${ROLE_COLORS[role.name] || 'secondary'} me-1`}
            >
                {role.display_name || ROLE_DISPLAY_NAMES[role.name] || role.name}
            </span>
        ));
    };

    return (
        <>
            <BreadCumb pageList={["UniSync360", "User Management"]} />

            {/* Stats Cards */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-sm bg-label-primary me-3">
                                        <i className="bx bx-user fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{stats.total_users || 0}</h6>
                                        <small className="text-muted">Total Users</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-sm bg-label-success me-3">
                                        <i className="bx bx-check-circle fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{stats.active_users || 0}</h6>
                                        <small className="text-muted">Active Users</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-sm bg-label-warning me-3">
                                        <i className="bx bx-x-circle fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{stats.inactive_users || 0}</h6>
                                        <small className="text-muted">Inactive Users</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="avatar avatar-sm bg-label-info me-3">
                                        <i className="bx bx-shield fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{stats.users_by_role?.unisync360_counselor || 0}</h6>
                                        <small className="text-muted">Counselors</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PaginatedTable
                fetchPath="/unisync360-users/"
                title="Users"
                columns={[
                    {
                        key: "name",
                        label: "User Details",
                        className: "fw-bold",
                        style: { width: "280px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar me-2">
                                    {row.photo ? (
                                        <img src={row.photo} alt="Avatar" className="rounded-circle" />
                                    ) : (
                                        <span className="avatar-initial rounded-circle bg-label-primary">
                                            {row.first_name?.[0]}{row.last_name?.[0]}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="fw-semibold">
                                        {row.full_name || `${row.first_name} ${row.last_name}`}
                                    </span>
                                    <small className="d-block text-muted fs-11">{row.email}</small>
                                    <small className="d-block text-muted fs-11">PF: {row.pf_number}</small>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "roles",
                        label: "Roles",
                        render: (row) => getRoleBadges(row.roles)
                    },
                    {
                        key: "contact",
                        label: "Contact",
                        render: (row) => (
                            <div className="d-flex flex-column">
                                <span>{row.phone_number || "-"}</span>
                            </div>
                        )
                    },
                    {
                        key: "status",
                        label: "Status",
                        render: (row) => (
                            <div className="d-flex flex-column align-items-start">
                                <span className={`badge bg-label-${row.is_active ? "success" : "danger"}`}>
                                    {row.is_active ? "Active" : "Inactive"}
                                </span>
                                <small className="text-muted mt-1">{row.status || "ACTIVE"}</small>
                            </div>
                        )
                    },
                    {
                        key: "created_at",
                        label: "Created",
                        render: (row) => (
                            <span className="text-muted">
                                {row.created_at ? formatDate(row.created_at) : "-"}
                            </span>
                        )
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        style: { width: "180px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                {hasAccess(user, [["change_user"]]) && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary border-0"
                                        onClick={() => {
                                            setSelectedObj(row);
                                            setShowModal(true);
                                        }}
                                        title="Edit User"
                                    >
                                        <i className="bx bx-edit"></i>
                                    </button>
                                )}

                                {hasAccess(user, [["assign_role"]]) && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-info border-0"
                                        onClick={() => {
                                            setSelectedObj(row);
                                            setShowRoleModal(true);
                                        }}
                                        title="Manage Roles"
                                    >
                                        <i className="bx bx-shield"></i>
                                    </button>
                                )}

                                {hasAccess(user, [["change_password"]]) && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-warning border-0"
                                        onClick={() => {
                                            setSelectedObj(row);
                                            setShowPasswordModal(true);
                                        }}
                                        title="Change Password"
                                    >
                                        <i className="bx bx-key"></i>
                                    </button>
                                )}

                                {hasAccess(user, [["change_user"]]) && (
                                    <button
                                        type="button"
                                        className={`btn btn-sm border-0 ${row.is_active ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                                        onClick={() => handleToggleActivation(row)}
                                        title={row.is_active ? "Deactivate" : "Activate"}
                                    >
                                        <i className={`bx ${row.is_active ? 'bx-pause' : 'bx-play'}`}></i>
                                    </button>
                                )}

                                {hasAccess(user, [["delete_user"]]) && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0"
                                        onClick={() => handleDelete(row)}
                                        title="Delete User"
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
                        label: "Add User",
                        render: () => (
                            hasAccess(user, [["add_user"]]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new User"
                                >
                                    <i className="bx bx-plus me-1"></i> Add User
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <UserModal
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

            {showPasswordModal && selectedObj && (
                <PasswordChangeModal
                    user={selectedObj}
                    onSuccess={() => {
                        setSelectedObj(null);
                        setShowPasswordModal(false);
                    }}
                    onClose={() => {
                        setSelectedObj(null);
                        setShowPasswordModal(false);
                    }}
                />
            )}

            {showRoleModal && selectedObj && (
                <RoleAssignmentModal
                    user={selectedObj}
                    onSuccess={() => {
                        setTableRefresh(prev => prev + 1);
                        setSelectedObj(null);
                        setShowRoleModal(false);
                    }}
                    onClose={() => {
                        setSelectedObj(null);
                        setShowRoleModal(false);
                    }}
                />
            )}
        </>
    );
};
