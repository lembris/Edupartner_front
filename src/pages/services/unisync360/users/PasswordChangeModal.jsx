import React, { useState } from "react";
import { changePassword } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import GlobalModal from "../../../../components/modal/GlobalModal";

export const PasswordChangeModal = ({ show, user, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        new_password: "",
        new_password_confirm: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.new_password) {
            newErrors.new_password = "New password is required";
        } else if (formData.new_password.length < 8) {
            newErrors.new_password = "Password must be at least 8 characters";
        }
        if (!formData.new_password_confirm) {
            newErrors.new_password_confirm = "Confirm password is required";
        } else if (formData.new_password !== formData.new_password_confirm) {
            newErrors.new_password_confirm = "Passwords must match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await changePassword(user.guid, formData);
            showToast("success", "Password changed successfully");
            if (onClose) onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Password change error:", error);
            showToast("error", "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-key me-2"></i>Change Password</>}
            size="md"
            onSubmit={handleSubmit}
            submitText="Change Password"
            loading={loading}
        >
            <div className="alert alert-info mb-3">
                <i className="bx bx-info-circle me-1"></i>
                Changing password for: <strong>{user.first_name} {user.last_name}</strong>
                <br />
                <small className="text-muted">{user.email}</small>
            </div>

            <div className="mb-3">
                <label className="form-label">New Password *</label>
                <input
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className={`form-control ${errors.new_password ? 'is-invalid' : ''}`}
                    placeholder="Enter new password"
                />
                {errors.new_password && <div className="invalid-feedback d-block">{errors.new_password}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Confirm New Password *</label>
                <input
                    type="password"
                    name="new_password_confirm"
                    value={formData.new_password_confirm}
                    onChange={handleChange}
                    className={`form-control ${errors.new_password_confirm ? 'is-invalid' : ''}`}
                    placeholder="Confirm new password"
                />
                {errors.new_password_confirm && <div className="invalid-feedback d-block">{errors.new_password_confirm}</div>}
            </div>
        </GlobalModal>
    );
};
