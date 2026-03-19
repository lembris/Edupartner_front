import React, { useState, useEffect } from "react";
import { assignRoles, UNISYNC360_ROLES, ROLE_DISPLAY_NAMES, ROLE_COLORS } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import GlobalModal from "../../../../components/modal/GlobalModal";

export const RoleAssignmentModal = ({ show, user, onSuccess, onClose }) => {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && user?.roles) {
            setSelectedRoles(user.roles.map(r => r.name));
        }
    }, [show, user]);

    const roleOptions = Object.entries(UNISYNC360_ROLES).map(([key, value]) => ({
        value: value,
        label: ROLE_DISPLAY_NAMES[value] || key,
        color: ROLE_COLORS[value] || 'secondary',
        description: getRoleDescription(value),
    }));

    function getRoleDescription(role) {
        const descriptions = {
            [UNISYNC360_ROLES.SUPER_ADMIN]: 'Full access to all UniSync360 features and settings',
            [UNISYNC360_ROLES.FACILITATION_OFFICER]: 'Manages universities, schools, students, and applications',
            [UNISYNC360_ROLES.ACCOUNTANT]: 'Manages financial transactions, invoices, and reports',
            [UNISYNC360_ROLES.COUNSELOR]: 'Manages assigned students, counseling sessions, and recommendations',
            [UNISYNC360_ROLES.LEAD_LANCER]: 'Registers students and tracks commissions (basic level)',
            [UNISYNC360_ROLES.EXTERNAL_COUNSELOR]: 'Full student management with document upload and course applications',
        };
        return descriptions[role] || '';
    }

    const handleRoleToggle = (roleValue) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleValue)) {
                return prev.filter(r => r !== roleValue);
            } else {
                return [...prev, roleValue];
            }
        });
    };

    const handleSubmit = async (e) => {
        try {
            setLoading(true);
            await assignRoles({
                user_guid: user.guid,
                roles: selectedRoles,
                action: 'set'
            });
            showToast("success", "Roles updated successfully");
            if (onClose) onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Role assignment error:", error);
            showToast("error", "Failed to update roles");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-shield me-2"></i>Manage Roles</>}
            size="md"
            onSubmit={handleSubmit}
            submitText="Save Roles"
            loading={loading}
        >
            <div className="alert alert-light border mb-3">
                <div className="d-flex align-items-center">
                    <div className="avatar me-2">
                        {user.photo ? (
                            <img src={user.photo} alt="Avatar" className="rounded-circle" />
                        ) : (
                            <span className="avatar-initial rounded-circle bg-label-primary">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                        )}
                    </div>
                    <div>
                        <strong>{user.first_name} {user.last_name}</strong>
                        <br />
                        <small className="text-muted">{user.email}</small>
                    </div>
                </div>
            </div>

            <h6 className="mb-3">Select Roles:</h6>
            
            <div className="list-group">
                {roleOptions.map(role => (
                    <label
                        key={role.value}
                        className={`list-group-item list-group-item-action d-flex align-items-start ${
                            selectedRoles.includes(role.value) ? 'active' : ''
                        }`}
                        style={{ cursor: 'pointer' }}
                    >
                        <input
                            type="checkbox"
                            className="form-check-input me-3 mt-1"
                            checked={selectedRoles.includes(role.value)}
                            onChange={() => handleRoleToggle(role.value)}
                        />
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center">
                                <strong>{role.label}</strong>
                                <span className={`badge bg-${role.color}`}>
                                    {role.label}
                                </span>
                            </div>
                            <small className={selectedRoles.includes(role.value) ? 'text-white-50' : 'text-muted'}>
                                {role.description}
                            </small>
                        </div>
                    </label>
                ))}
            </div>

            {selectedRoles.length === 0 && (
                <div className="alert alert-warning mt-3 mb-0">
                    <i className="bx bx-info-circle me-1"></i>
                    At least one role should be selected for the user to access UniSync360.
                </div>
            )}
        </GlobalModal>
    );
};
