import React, { useState } from "react";
import "animate.css";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import Swal from "sweetalert2";
import { deleteRole, toggleRoleStatus } from "./RoleQueries";
import { RoleModal } from "./RoleModal";
import { PermissionModal } from "./PermissionModal";
import showToast from "../../../../helpers/ToastHelper";

export const RoleListPage = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);

    const handleDelete = async (roleItem) => {
        if (!roleItem) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete role: ${roleItem.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deleteRole(roleItem.id);
                Swal.fire("Deleted!", "The role has been deleted successfully.", "success");
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            Swal.fire("Error!", "Unable to delete role. Please try again.", "error");
        }
    };

    const handleToggleStatus = async (roleItem) => {
        if (!roleItem) return;

        try {
            await toggleRoleStatus(roleItem.id, roleItem.is_active);
            const statusText = roleItem.is_active ? "deactivated" : "activated";
            showToast("success", `Role ${statusText} successfully`);
            setTableRefresh((prev) => prev + 1);
        } catch (error) {
            console.error("Error toggling role status:", error);
            showToast("error", "Unable to change role status. Please try again.");
        }
    };

    return (
        <>
            <BreadCumb pageList={["UniSync360", "Role Management"]} />
<<<<<<< Updated upstream

            <PaginatedTable
                fetchPath="/unisync360-users/roles/"
                title="Roles"
                columns={[
                    {
                        key: "name",
                        label: "Role Name",
                        className: "fw-bold",
                        style: { width: "300px" },
                        render: (row) => <strong>{row.name}</strong>,
                    },
                    {
                        key: "permissions_count",
                        label: "Permissions",
                        render: (row) => (
                            <span className="badge bg-label-info">
                                {row.permissions?.length || 0} permissions
                            </span>
                        )
                    },
                    {
                        key: "user_count",
                        label: "Users Assigned",
                        render: (row) => (
                            <span className="badge bg-label-secondary">
                                {row.user_count || 0} users
                            </span>
                        )
                    },
                    {
                        key: "is_active",
                        label: "Status",
                        style: { width: "120px" },
                        className: "text-center",
                        render: (row) => (
                            <button
                                type="button"
                                className={`badge border-0 ${
                                    row.is_active
                                        ? "bg-success cursor-pointer"
                                        : "bg-danger cursor-pointer"
                                }`}
                                onClick={() => handleToggleStatus(row)}
                                style={{ cursor: "pointer" }}
                                title={`Click to ${row.is_active ? "deactivate" : "activate"}`}
                            >
                                {row.is_active ? "Active" : "Inactive"}
                            </button>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => {
                            setSelectedRole(row);
                            setShowModal(true);
                        },
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Permissions",
                        icon: "bx bx-lock",
                        onClick: (row) => {
                            setSelectedRole(row);
                            setShowPermissionModal(true);
                        },
                        className: "btn-outline-warning text-warning",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        className: "btn-outline-secondary text-danger",
                    },
                ]}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Role",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setSelectedRole(null);
                                    setShowModal(true);
                                }}
                                title="Add new Role"
                            >
                                <i className="bx bx-plus me-1"></i> Add Role
                            </button>
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

=======

            <PaginatedTable
                fetchPath="/unisync360-users/roles/"
                title="Roles"
                columns={[
                    {
                        key: "name",
                        label: "Role Name",
                        className: "fw-bold",
                        style: { width: "300px" },
                        render: (row) => <strong>{row.name}</strong>,
                    },
                    {
                        key: "permissions_count",
                        label: "Permissions",
                        render: (row) => (
                            <span className="badge bg-label-info">
                                {row.permissions?.length || 0} permissions
                            </span>
                        )
                    },
                    {
                        key: "user_count",
                        label: "Users Assigned",
                        render: (row) => (
                            <span className="badge bg-label-secondary">
                                {row.user_count || 0} users
                            </span>
                        )
                    },
                    {
                        key: "is_active",
                        label: "Status",
                        style: { width: "120px" },
                        className: "text-center",
                        render: (row) => (
                            <button
                                type="button"
                                className={`badge border-0 ${
                                    row.is_active
                                        ? "bg-success cursor-pointer"
                                        : "bg-danger cursor-pointer"
                                }`}
                                onClick={() => handleToggleStatus(row)}
                                style={{ cursor: "pointer" }}
                                title={`Click to ${row.is_active ? "deactivate" : "activate"}`}
                            >
                                {row.is_active ? "Active" : "Inactive"}
                            </button>
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        style: { width: "200px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary border-0"
                                    onClick={() => {
                                        setSelectedRole(row);
                                        setShowModal(true);
                                    }}
                                    title="Edit Role"
                                >
                                    <i className="bx bx-edit"></i>
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-warning border-0"
                                    onClick={() => {
                                        setSelectedRole(row);
                                        setShowPermissionModal(true);
                                    }}
                                    title="Manage Permissions"
                                >
                                    <i className="bx bx-lock"></i>
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger border-0"
                                    onClick={() => handleDelete(row)}
                                    title="Delete Role"
                                >
                                    <i className="bx bx-trash"></i>
                                </button>
                            </div>
                        ),
                    },
                ]}
                buttons={[
                    {
                        label: "Add Role",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setSelectedRole(null);
                                    setShowModal(true);
                                }}
                                title="Add new Role"
                            >
                                <i className="bx bx-plus me-1"></i> Add Role
                            </button>
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

>>>>>>> Stashed changes
            {showModal && (
                <RoleModal
                    selectedRole={selectedRole}
                    onSuccess={() => {
                        setTableRefresh((prev) => prev + 1);
                        setSelectedRole(null);
                        setShowModal(false);
                    }}
                    onClose={() => {
                        setSelectedRole(null);
                        setShowModal(false);
                    }}
                />
            )}

            {showPermissionModal && selectedRole && (
                <PermissionModal
                    selectedRole={selectedRole}
                    onSuccess={() => {
                        setTableRefresh((prev) => prev + 1);
                        setSelectedRole(null);
                        setShowPermissionModal(false);
                    }}
                    onClose={() => {
                        setSelectedRole(null);
                        setShowPermissionModal(false);
                    }}
                />
            )}
        </>
    );
};
