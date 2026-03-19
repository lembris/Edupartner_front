import React, { useState, useEffect } from "react";
import { getPermissions, assignPermissionsToRole } from "./RoleQueries";
import showToast from "../../../../helpers/ToastHelper";
import GlobalModal from "../../../../components/modal/GlobalModal";

export const PermissionModal = ({ show, selectedRole, onSuccess, onClose }) => {
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (show) {
            loadPermissions();
        }
    }, [show, selectedRole]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const data = await getPermissions();
            const permsData = data.data || [];
            setPermissions(permsData);
            
            if (selectedRole?.permissions && selectedRole.permissions.length > 0) {
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
            if (onClose) onClose();
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

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.codename.toLowerCase().includes(term)
            );
        }

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
            const module = perm.description?.split('.')[0] || 'Other';
            if (!grouped[module]) {
                grouped[module] = [];
            }
            grouped[module].push(perm);
        });
        return grouped;
    };

    if (!show) return null;

    const filteredPermissions = getFilteredPermissions();
    const groupedPermissions = groupPermissionsByModule(filteredPermissions);
    const assignedCount = selectedPermissions.length;
    const totalCount = permissions.length;

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-lock-open me-2"></i>Manage Permissions - <small>{selectedRole?.name}</small></>}
            size="lg"
            onSubmit={handleSave}
            submitText="Save Permissions"
            loading={saving}
        >
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">Loading permissions...</p>
                </div>
            ) : (
                <>
                    <div className="row g-2 mb-3">
                        <div className="col-md-4">
                            <div className="d-flex align-items-center gap-2 p-2 bg-success bg-opacity-10 rounded">
                                <div className="avatar avatar-sm">
                                    <i className="bx bx-check fs-5 text-success"></i>
                                </div>
                                <div>
                                    <small className="text-muted d-block">Assigned</small>
                                    <strong className="d-block fs-5">{assignedCount}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="d-flex align-items-center gap-2 p-2 bg-warning bg-opacity-10 rounded">
                                <div className="avatar avatar-sm">
                                    <i className="bx bx-circle fs-5 text-warning"></i>
                                </div>
                                <div>
                                    <small className="text-muted d-block">Available</small>
                                    <strong className="d-block fs-5">{totalCount - assignedCount}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="d-flex align-items-center gap-2 p-2 bg-info bg-opacity-10 rounded">
                                <div className="avatar avatar-sm">
                                    <i className="bx bx-list-check fs-5 text-info"></i>
                                </div>
                                <div>
                                    <small className="text-muted d-block">Total</small>
                                    <strong className="d-block fs-5">{totalCount}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <ul className="nav nav-tabs mb-3" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setActiveTab('all')}
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
                            >
                                <i className="bx bx-circle me-1"></i>
                                Unassigned ({totalCount - assignedCount})
                            </button>
                        </li>
                    </ul>

                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {filteredPermissions.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bx bx-inbox fs-1 text-muted"></i>
                                <p className="text-muted mt-2">No permissions found</p>
                            </div>
                        ) : (
                            Object.entries(groupedPermissions).map(([module, perms]) => (
                                <div key={module} className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <h6 className="mb-0 fw-bold text-uppercase text-primary" style={{ fontSize: '0.85rem' }}>
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
                                                                            <span className="badge bg-success ms-2" style={{ fontSize: '0.7rem' }}>
                                                                                <i className="bx bx-check"></i>
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
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

                    {selectedPermissions.length === 0 && (
                        <div className="alert alert-warning mt-3 mb-0">
                            <i className="bx bx-info-circle me-1"></i>
                            No permissions selected. Please select at least one permission.
                        </div>
                    )}

                    <div className="d-flex justify-content-end mt-3">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={handleSelectAll}
                            disabled={loading || saving}
                        >
                            {selectedPermissions.length === filteredPermissions.length ? "Deselect All" : "Select All"}
                        </button>
                    </div>
                </>
            )}
        </GlobalModal>
    );
};
