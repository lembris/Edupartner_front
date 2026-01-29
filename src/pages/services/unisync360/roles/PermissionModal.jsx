import React, { useState, useEffect } from "react";
import { getPermissions, assignPermissionsToRole } from "./RoleQueries";
import showToast from "../../../../helpers/ToastHelper";

export const PermissionModal = ({ selectedRole, onSuccess, onClose }) => {
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        loadPermissions();
    }, [selectedRole]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const data = await getPermissions();
            const permsData = data.data || [];
            setPermissions(permsData);
            
            // Set current permissions as selected
            if (selectedRole?.permissions && selectedRole.permissions.length > 0) {
                // Ensure we're using permission IDs
                const selectedIds = Array.isArray(selectedRole.permissions) 
                    ? selectedRole.permissions.map(p => typeof p === 'object' ? p.id : p)
                    : [];
                setSelectedPermissions(selectedIds);
            } else {
                setSelectedPermissions([]);
            }
        } catch (error) {
            console.error("Error loading permissions:", error);
            showToast("error", "Failed to load permissions");
            setSelectedPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSelectAll = () => {
        const filteredPerms = getFilteredPermissions();
        if (selectedPermissions.length === filteredPerms.length) {
            setSelectedPermissions([]);
        } else {
            const allIds = filteredPerms.map(p => p.id);
            setSelectedPermissions(allIds);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await assignPermissionsToRole(selectedRole.id, selectedPermissions);
            showToast("success", "Permissions updated successfully");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error saving permissions:", error);
            showToast("error", "Failed to update permissions");
        } finally {
            setSaving(false);
        }
    };

    const getFilteredPermissions = () => {
        let filtered = permissions;

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.codename.toLowerCase().includes(term)
            );
        }

        // Filter by tab
        if (activeTab === "assigned") {
            filtered = filtered.filter(p => selectedPermissions.includes(p.id));
        } else if (activeTab === "unassigned") {
            filtered = filtered.filter(p => !selectedPermissions.includes(p.id));
        }

        return filtered;
    };

    const groupPermissionsByModule = (perms) => {
        const grouped = {};
        perms.forEach(perm => {
            const module = perm.description.split('.')[0] || 'Other';
            if (!grouped[module]) {
                grouped[module] = [];
            }
            grouped[module].push(perm);
        });
        return grouped;
    };

    const filteredPermissions = getFilteredPermissions();
    const groupedPermissions = groupPermissionsByModule(filteredPermissions);
    const assignedCount = selectedPermissions.length;
    const totalCount = permissions.length;

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            aria-hidden="false"
        >
            <div className="modal-dialog modal-xl" role="document">
                <div className="modal-content">
                    <div className="modal-header bg-light border-bottom">
                        <div>
                            <h5 className="modal-title mb-0">
                                <i className="bx bx-lock-open me-2"></i>
                                Manage Permissions
                            </h5>
                            <small className="text-muted">
                                Role: <strong>{selectedRole?.name}</strong>
                            </small>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className="modal-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mt-2">Loading permissions...</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="px-4 pt-3 pb-3 border-bottom bg-light">
                                    <div className="row g-2">
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center gap-2 p-2">
                                                <div className="avatar avatar-sm bg-success bg-opacity-10">
                                                    <i className="bx bx-check fs-5 text-success"></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Assigned</small>
                                                    <strong className="d-block fs-5">{assignedCount}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center gap-2 p-2">
                                                <div className="avatar avatar-sm bg-warning bg-opacity-10">
                                                    <i className="bx bx-circle fs-5 text-warning"></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Available</small>
                                                    <strong className="d-block fs-5">{totalCount - assignedCount}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center gap-2 p-2">
                                                <div className="avatar avatar-sm bg-info bg-opacity-10">
                                                    <i className="bx bx-list-check fs-5 text-info"></i>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Total</small>
                                                    <strong className="d-block fs-5">{totalCount}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Search Bar */}
                                <div className="px-4 pt-3 pb-3 border-bottom bg-white">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search permissions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Tabs */}
                                <div className="px-4 pt-3 border-bottom">
                                    <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('all')}
                                                role="tab"
                                            >
                                                <i className="bx bx-list-ul me-1"></i>
                                                All Permissions
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'assigned' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('assigned')}
                                                role="tab"
                                            >
                                                <i className="bx bx-check-circle me-1"></i>
                                                Assigned ({assignedCount})
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'unassigned' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('unassigned')}
                                                role="tab"
                                            >
                                                <i className="bx bx-circle me-1"></i>
                                                Unassigned ({totalCount - assignedCount})
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                {/* Permissions List */}
                                <div className="px-4 py-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
                                    {filteredPermissions.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bx bx-inbox fs-1 text-muted"></i>
                                            <p className="text-muted mt-2">No permissions found</p>
                                        </div>
                                    ) : (
                                        Object.entries(groupedPermissions).map(([module, perms]) => (
                                            <div key={module} className="mb-4">
                                                <div className="d-flex align-items-center mb-2">
                                                    <h6 className="mb-0 fw-bold text-uppercase text-primary fs-7">
                                                        {module}
                                                    </h6>
                                                    <span className="badge bg-light text-dark ms-2">
                                                        {perms.filter(p => selectedPermissions.includes(p.id)).length}/{perms.length}
                                                    </span>
                                                </div>

                                                <div className="row g-2">
                                                    {perms.map(permission => {
                                                        const isSelected = selectedPermissions.includes(permission.id);
                                                        return (
                                                            <div key={permission.id} className="col-md-6">
                                                                <div
                                                                    className={`card border ${isSelected ? 'border-success bg-success bg-opacity-5' : 'border-light'}`}
                                                                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                                                                    onClick={() => handlePermissionToggle(permission.id)}
                                                                >
                                                                    <div className="card-body p-2">
                                                                        <div className="d-flex align-items-start">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input mt-1"
                                                                                checked={isSelected}
                                                                                onChange={() => handlePermissionToggle(permission.id)}
                                                                                style={{ cursor: "pointer" }}
                                                                            />
                                                                            <div className="ms-2 flex-grow-1">
                                                                                <p className="mb-1">
                                                                                    <strong className="text-dark">
                                                                                        {permission.name}
                                                                                    </strong>
                                                                                    {isSelected && (
                                                                                        <span className="badge bg-success ms-2 fs-7">
                                                                                            <i className="bx bx-check"></i> Assigned
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                                <small className="text-muted d-block">
                                                                                    {permission.codename}
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer border-top bg-light">
                        <div className="me-auto">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={handleSelectAll}
                                disabled={loading || saving}
                            >
                                {selectedPermissions.length === filteredPermissions.length
                                    ? "Deselect All"
                                    : "Select All"}
                            </button>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving || loading}
                        >
                            {saving ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-save me-1"></i>
                                    Save Permissions
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
