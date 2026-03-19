import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { createConsentRequest, updateConsentRequest } from "./Queries";
import GlobalModal from "../../../../components/modal/GlobalModal";

const ConsentRequestModal = ({ show, onHide, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        emergency_full_name: "",
        emergency_phone: "",
        emergency_email: "",
        emergency_relationship: "",
        parent_name: "",
        additional_notes: ""
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    phone: "",
                    email: "",
                    date_of_birth: "",
                    emergency_full_name: "",
                    emergency_phone: "",
                    emergency_email: "",
                    emergency_relationship: "",
                    parent_name: "",
                    additional_notes: ""
                });
            }
            setErrors({});
        }
    }, [initialData, show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name?.trim()) {
            newErrors.first_name = "First name is required";
        }
        if (!formData.last_name?.trim()) {
            newErrors.last_name = "Last name is required";
        }
        if (!formData.phone?.trim()) {
            newErrors.phone = "Phone number is required";
        }
        if (!formData.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.emergency_full_name?.trim()) {
            newErrors.emergency_full_name = "Parent/Guardian name is required";
        }
        if (!formData.emergency_relationship?.trim()) {
            newErrors.emergency_relationship = "Please select a relationship";
        }
        if (!formData.emergency_phone?.trim()) {
            newErrors.emergency_phone = "Parent/Guardian phone is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            if (initialData?.uid) {
                await updateConsentRequest(initialData.uid, formData);
                Swal.fire("Success!", "Consent request updated successfully.", "success");
            } else {
                await createConsentRequest(formData);
                Swal.fire("Success!", "Consent request created successfully.", "success");
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving consent request:", error);
            Swal.fire("Error!", error.message || "Failed to save consent request.", "error");
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <>
            <div className="mb-3">
                <h6 className="fw-bold mb-3">Personal Information</h6>
                
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">First Name *</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        />
                        {errors.first_name && (
                            <div className="invalid-feedback d-block">{errors.first_name}</div>
                        )}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Middle Name</label>
                        <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name *</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        />
                        {errors.last_name && (
                            <div className="invalid-feedback d-block">{errors.last_name}</div>
                        )}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Phone *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        />
                        {errors.phone && (
                            <div className="invalid-feedback d-block">{errors.phone}</div>
                        )}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        />
                        {errors.email && (
                            <div className="invalid-feedback d-block">{errors.email}</div>
                        )}
                    </div>
                </div>
            </div>

            <hr />

            <div className="mb-3">
                <h6 className="fw-bold mb-3">Parent/Guardian Contact</h6>
                <p className="text-muted small mb-3">Please provide your parent or guardian's contact information</p>
                
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Parent/Guardian Name *</label>
                        <input
                            type="text"
                            name="emergency_full_name"
                            value={formData.emergency_full_name}
                            onChange={handleInputChange}
                            className={`form-control ${errors.emergency_full_name ? 'is-invalid' : ''}`}
                        />
                        {errors.emergency_full_name && (
                            <div className="invalid-feedback d-block">{errors.emergency_full_name}</div>
                        )}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Relationship *</label>
                        <select
                            name="emergency_relationship"
                            value={formData.emergency_relationship}
                            onChange={handleInputChange}
                            className={`form-control ${errors.emergency_relationship ? 'is-invalid' : ''}`}
                        >
                            <option value="">Select relationship</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                            <option value="Grandparent">Grandparent</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.emergency_relationship && (
                            <div className="invalid-feedback d-block">{errors.emergency_relationship}</div>
                        )}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Phone *</label>
                        <input
                            type="tel"
                            name="emergency_phone"
                            value={formData.emergency_phone}
                            onChange={handleInputChange}
                            className={`form-control ${errors.emergency_phone ? 'is-invalid' : ''}`}
                        />
                        {errors.emergency_phone && (
                            <div className="invalid-feedback d-block">{errors.emergency_phone}</div>
                        )}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="emergency_email"
                            value={formData.emergency_email}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            <hr />

            <div className="mb-3">
                <h6 className="fw-bold mb-3">Additional Information</h6>
                
                <div className="mb-3">
                    <label className="form-label">Parent/Guardian Name (if minor)</label>
                    <input
                        type="text"
                        name="parent_name"
                        value={formData.parent_name}
                        onChange={handleInputChange}
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                        rows={3}
                        name="additional_notes"
                        value={formData.additional_notes}
                        onChange={handleInputChange}
                        className="form-control"
                    />
                </div>
            </div>
        </>
    );

    return (
        <GlobalModal
            show={show}
            onClose={onHide}
            title={initialData?.uid ? "Edit Consent Request" : "New Consent Request"}
            size="lg"
            onSubmit={handleSubmit}
            submitText={initialData?.uid ? "Update" : "Save"}
            loading={loading}
        >
            {modalContent}
        </GlobalModal>
    );
};

export default ConsentRequestModal;
