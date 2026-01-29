import React, { useState, useEffect } from "react";
import "animate.css";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import Swal from "sweetalert2";
import { getCustomPermissions, getDjangoPermissions, deletePermission, updatePermission } from "./PermissionQueries";
import { PermissionFormModal } from "./PermissionFormModal";
import showToast from "../../../../helpers/ToastHelper";

export const PermissionListPage = () => {
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("custom");
    const [customPermissions, setCustomPermissions] = useState([]);
    const [djangoPermissions, setDjangoPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPermissions();
    }, [activeTab]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            if (activeTab === "custom") {
                const data = await getCustomPermissions();
                setCustomPermissions(data.data || []);
            } else {
                const data = await getDjangoPermissions();
                setDjangoPermissions(data.data || []);
            }
        } catch (error) {
            console.error("Error loading permissions:", error);
            showToast("error", "Failed to load permissions");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (permission) => {
        if (!permission) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete permission: ${permission.name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deletePermission(permission.id);
                showToast("success", "Permission deleted successfully");
                loadPermissions();
            }
        } catch (error) {
            console.error("Error deleting permission:", error);
            showToast("error", "Failed to delete permission");
        }
    };

    const handleToggleStatus = async (permission) => {
        if (!permission) return;

        try {
            await updatePermission(permission.id, { is_active: !permission.is_active });
            const statusText = permission.is_active ? "deactivated" : "activated";
            showToast("success", `Permission ${statusText} successfully`);
            loadPermissions();
        } catch (error) {
            console.error("Error toggling permission status:", error);
            showToast("error", "Failed to change permission status");
        }
    };

    const permissions = activeTab === "custom" ? customPermissions : djangoPermissions;
    const isCustomTab = activeTab === "custom";

    return (
        <>
            <BreadCumb pageList={["UniSync360", "Permission Management"]} />

            <div className="card">
                <div className="card-header border-bottom">
                    <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0">
                            <i className="bx bx-lock me-2"></i>
                            Permissions
                        </h5>
                        {isCustomTab && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setSelectedPermission(null);
                                    setShowModal(true);
                                }}
                            >
                                <i className="bx bx-plus me-1"></i> Add Permission
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="card-header border-bottom">
                    <ul className="nav nav-tabs" role="tablist">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "custom" ? "active" : ""}`}
                                type="button"
                                onClick={() => setActiveTab("custom")}
                            >
                                <i className="bx bx-plus-circle me-1"></i>
                                Custom Permissions <span className="badge bg-primary ms-2">{customPermissions.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "django" ? "active" : ""}`}
                                type="button"
                                onClick={() => setActiveTab("django")}
                            >
                                <i className="bx bx-lock-open me-1"></i>
                                Django Permissions <span className="badge bg-secondary ms-2">{djangoPermissions.length}</span>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Content */}
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : permissions.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bx bx-inbox fs-1 text-muted"></i>
                            <p className="text-muted mt-2">No permissions found</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Code Name</th>
                                        <th>Category</th>
                                        {isCustomTab && <th>Status</th>}
                                        {isCustomTab && <th style={{ width: "150px" }}>Actions</th>}
                                        {!isCustomTab && <th>Description</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissions.map(permission => (
                                        <tr key={permission.id}>
                                            <td>
                                                <strong>{permission.name}</strong>
                                            </td>
                                            <td>
                                                <code className="bg-light px-2 py-1 rounded">{permission.codename}</code>
                                            </td>
                                            <td>
                                                {permission.category ? (
                                                    <span className="badge bg-light text-dark">{permission.category}</span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            {isCustomTab && (
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`badge border-0 ${
                                                            permission.is_active ? "bg-success" : "bg-danger"
                                                        }`}
                                                        onClick={() => handleToggleStatus(permission)}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        {permission.is_active ? "Active" : "Inactive"}
                                                    </button>
                                                </td>
                                            )}
                                            {isCustomTab && (
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary"
                                                            onClick={() => {
                                                                setSelectedPermission(permission);
                                                                setShowModal(true);
                                                            }}
                                                            title="Edit"
                                                        >
                                                            <i className="bx bx-edit"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(permission)}
                                                            title="Delete"
                                                        >
                                                            <i className="bx bx-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                            {!isCustomTab && (
                                                <td>
                                                    <small className="text-muted">
                                                        {permission.description || "-"}
                                                    </small>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!isCustomTab && (
                        <div className="alert alert-info mt-3 mb-0">
                            <i className="bx bx-info-circle me-2"></i>
                            <strong>Read-only permissions:</strong> Django-generated permissions cannot be modified or deleted. They are automatically created from your models.
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <PermissionFormModal
                    selectedPermission={selectedPermission}
                    onSuccess={() => {
                        loadPermissions();
                        setSelectedPermission(null);
                        setShowModal(false);
                    }}
                    onClose={() => {
                        setSelectedPermission(null);
                        setShowModal(false);
                    }}
                />
            )}
        </>
    );
};
