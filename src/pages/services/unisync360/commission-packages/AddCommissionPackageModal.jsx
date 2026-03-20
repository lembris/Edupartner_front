// AddCommissionPackageModal.jsx - Modal for creating new commission packages
import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "./AddCommissionPackageModal.css";

const API_BASE = "http://localhost:8000/api";

export const AddCommissionPackageModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        scope: "global",
        default_rate: "",
        rate_type: "percentage",
        is_active: true,
        valid_from: new Date().toISOString().split("T")[0],
        valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        priority: 0,
        description: "",
        commission_terms: {
            rate_type: "percentage",
            eligibility: {
                min_tuition: 0,
                max_tuition: null,
            },
            additional_rules: {
                scholarship_deduction: false,
            },
        },
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleNestedChange = (path, value) => {
        setFormData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            const keys = path.split(".");
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            Swal.fire("Error", "Package code is required", "error");
            return;
        }
        if (!formData.name.trim()) {
            Swal.fire("Error", "Package name is required", "error");
            return;
        }
        if (!formData.default_rate || isNaN(formData.default_rate)) {
            Swal.fire("Error", "Valid default rate is required", "error");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                default_rate: parseFloat(formData.default_rate),
                commission_terms: {
                    ...formData.commission_terms,
                    eligibility: {
                        ...formData.commission_terms.eligibility,
                        min_tuition: parseFloat(
                            formData.commission_terms.eligibility.min_tuition || 0
                        ),
                        max_tuition: formData.commission_terms.eligibility.max_tuition
                            ? parseFloat(formData.commission_terms.eligibility.max_tuition)
                            : null,
                    },
                },
            };

            const response = await axios.post(
                `${API_BASE}/unisync360-commission-packages/`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Commission package created successfully",
                timer: 2000,
            });

            resetForm();
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error creating package:", error);
            const errorMsg =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to create commission package";
            Swal.fire("Error", errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            name: "",
            scope: "global",
            default_rate: "",
            rate_type: "percentage",
            is_active: true,
            valid_from: new Date().toISOString().split("T")[0],
            valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            priority: 0,
            description: "",
            commission_terms: {
                rate_type: "percentage",
                eligibility: {
                    min_tuition: 0,
                    max_tuition: null,
                },
                additional_rules: {
                    scholarship_deduction: false,
                },
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add Commission Package</h3>
                    <button
                        className="btn-close"
                        onClick={onClose}
                        type="button"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Row 1: Code and Name */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Package Code *</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="e.g., GLOBAL-STD-001"
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Package Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Global Standard Commission"
                                className="form-control"
                            />
                        </div>
                    </div>

                    {/* Row 2: Scope and Rate Type */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Scope *</label>
                            <select
                                name="scope"
                                value={formData.scope}
                                onChange={handleInputChange}
                                className="form-control"
                            >
                                <option value="global">Global</option>
                                <option value="country">Country</option>
                                <option value="university">University</option>
                                <option value="course">Course</option>
                                <option value="agent">Agent</option>
                                <option value="combined">Combined</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Rate Type *</label>
                            <select
                                name="rate_type"
                                value={formData.rate_type}
                                onChange={handleInputChange}
                                className="form-control"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount</option>
                                <option value="tiered">Tiered</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Default Rate and Priority */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Default Rate ({formData.rate_type}) *</label>
                            <input
                                type="number"
                                name="default_rate"
                                value={formData.default_rate}
                                onChange={handleInputChange}
                                placeholder="10.00"
                                step="0.01"
                                min="0"
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <input
                                type="number"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                className="form-control"
                            />
                        </div>
                    </div>

                    {/* Row 4: Valid From and Valid To */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Valid From</label>
                            <input
                                type="date"
                                name="valid_from"
                                value={formData.valid_from}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Valid To</label>
                            <input
                                type="date"
                                name="valid_to"
                                value={formData.valid_to}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    {/* Row 5: Min/Max Tuition */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Min Tuition (Eligibility)</label>
                            <input
                                type="number"
                                value={
                                    formData.commission_terms.eligibility.min_tuition || ""
                                }
                                onChange={(e) =>
                                    handleNestedChange(
                                        "commission_terms.eligibility.min_tuition",
                                        e.target.value
                                    )
                                }
                                placeholder="0"
                                step="0.01"
                                min="0"
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Tuition (Optional)</label>
                            <input
                                type="number"
                                value={
                                    formData.commission_terms.eligibility.max_tuition || ""
                                }
                                onChange={(e) =>
                                    handleNestedChange(
                                        "commission_terms.eligibility.max_tuition",
                                        e.target.value
                                    )
                                }
                                placeholder="Leave blank for unlimited"
                                step="0.01"
                                min="0"
                                className="form-control"
                            />
                        </div>
                    </div>

                    {/* Row 6: Checkboxes */}
                    <div className="form-row checkbox-row">
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                />
                                Active
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={
                                        formData.commission_terms.additional_rules
                                            .scholarship_deduction
                                    }
                                    onChange={(e) =>
                                        handleNestedChange(
                                            "commission_terms.additional_rules.scholarship_deduction",
                                            e.target.checked
                                        )
                                    }
                                />
                                Deduct Scholarship from Commission
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Optional description for this package"
                            rows="2"
                            className="form-control"
                        ></textarea>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Package"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCommissionPackageModal;
