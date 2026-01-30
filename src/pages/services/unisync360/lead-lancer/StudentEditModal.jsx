// StudentEditModal.jsx - Modal for editing student information
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { commissionPortalService } from "../commission-portal/Queries.jsx";

export const StudentEditModal = ({ show, onHide, student, onSuccess }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        status: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                first_name: student.student_details?.first_name || "",
                last_name: student.student_details?.last_name || "",
                email: student.student_details?.personal_email || "",
                phone: student.student_details?.personal_phone || "",
                status: student.student_details?.status || "",
            });
        }
    }, [student, show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please fill in all required fields",
            });
            return;
        }

        try {
            setLoading(true);
            await commissionPortalService.updateStudentStatus(student.uid, {
                status: formData.status,
            });

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Student information updated successfully",
                timer: 2000,
            });

            onSuccess();
        } catch (error) {
            console.error("Error updating student:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.detail || "Failed to update student",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title">Edit Student Information</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onHide}
                            disabled={loading}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">First Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        disabled
                                        placeholder="Enter first name"
                                    />
                                    <small className="text-muted">
                                        (Read-only - Contact admin to change)
                                    </small>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Last Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        disabled
                                        placeholder="Enter last name"
                                    />
                                    <small className="text-muted">
                                        (Read-only - Contact admin to change)
                                    </small>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled
                                        placeholder="Enter email"
                                    />
                                    <small className="text-muted">
                                        (Read-only - Contact admin to change)
                                    </small>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Phone *</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled
                                        placeholder="Enter phone"
                                    />
                                    <small className="text-muted">
                                        (Read-only - Contact admin to change)
                                    </small>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Student Status *</label>
                                    <select
                                        className="form-select"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="completed">Completed</option>
                                        <option value="withdrawn">Withdrawn</option>
                                        <option value="deferred">Deferred</option>
                                    </select>
                                    <small className="text-muted d-block mt-2">
                                        <strong>Status Guide:</strong>
                                        <ul className="mb-0 ps-3">
                                            <li>
                                                <strong>Active:</strong> Student is currently studying
                                            </li>
                                            <li>
                                                <strong>Inactive:</strong> Student is not currently
                                                enrolled
                                            </li>
                                            <li>
                                                <strong>Completed:</strong> Student finished their
                                                course
                                            </li>
                                            <li>
                                                <strong>Withdrawn:</strong> Student left the course
                                            </li>
                                        </ul>
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onHide}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
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
                                        <i className="bx bx-save me-2"></i>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentEditModal;
