import React, { useState, useEffect } from "react";
import { useStaffAssignment } from "./useStaffAssignment";
import { assignConsentRequestToStaff } from "./Queries";
import Swal from "sweetalert2";
import api from "../../../../api";
import { API_BASE_URL } from "../../../../Costants";

const API_URL = `${API_BASE_URL}/api`;

/**
 * DRY Reusable Staff Assignment Modal
 * Can be used in any operation/module that needs to assign items to staff
 */
export const StaffAssignmentModal = ({
    show,
    onHide,
    consentId,
    currentAssignee = null,
    onSuccess = null,
    title = "Assign to Staff",
    description = "Select a staff member to assign this request to",
}) => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(false);
    const [staffLoading, setStaffLoading] = useState(true);

    useEffect(() => {
        if (show) {
            loadStaffMembers();
        }
    }, [show]);

    const loadStaffMembers = async () => {
        try {
            setStaffLoading(true);
            // Fetch active staff/users who can be assigned
            const response = await api.get(`${API_URL}/unisync360-users/`, {
                params: { is_active: true },
            });
            
            let users = response.data.data?.results || response.data.data || [];
            
            // Ensure users have proper uid property
            users = users.map(user => ({
                ...user,
                uid: user.uid || user.id || user.guid  // Use uid, id, or guid whichever exists
            }));
            
            console.log("Loaded staff members:", users);
            setStaffMembers(users);
            
            // Pre-select current assignee
            if (currentAssignee) {
                const current = users.find(u => u.uid === currentAssignee.uid);
                if (current) setSelectedStaff(current);
            }
        } catch (error) {
            console.error("Error loading staff members:", error);
        } finally {
            setStaffLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedStaff) {
            alert("Please select a staff member");
            return;
        }

        try {
            setLoading(true);
            
            // Confirm assignment
            const result = await Swal.fire({
                title: "Assign to Staff?",
                text: `Are you sure you want to assign this to ${selectedStaff.first_name} ${selectedStaff.last_name}?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#0d6efd",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, assign it!",
                allowOutsideClick: false,
                allowEscapeKey: false,
            });

            if (!result.isConfirmed) {
                setLoading(false);
                return;
            }

            // Make API call
            const response = await assignConsentRequestToStaff(consentId, selectedStaff.uid);
            
            // Show success message
            await Swal.fire(
                "Success!",
                `Assigned to ${selectedStaff.first_name} ${selectedStaff.last_name}`,
                "success"
            );

            if (onSuccess) onSuccess(response.data);
            onHide();
        } catch (error) {
            console.error("Error assigning to staff:", error);
            await Swal.fire("Error!", "Failed to assign request to staff.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async () => {
        try {
            setLoading(true);

            const result = await Swal.fire({
                title: "Unassign Request?",
                text: `Are you sure you want to unassign this from ${currentAssignee ? `${currentAssignee.first_name} ${currentAssignee.last_name}` : "staff"}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, unassign it!",
            });

            if (!result.isConfirmed) {
                setLoading(false);
                return;
            }

            const response = await assignConsentRequestToStaff(consentId, null);
            
            Swal.fire("Success!", "Request unassigned successfully.", "success");

            if (onSuccess) onSuccess(response.data);
            onHide();
        } catch (error) {
            console.error("Error unassigning request:", error);
            Swal.fire("Error!", "Failed to unassign request.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className={`modal ${!loading ? 'd-block' : ''}`} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onHide}
                            disabled={loading}
                        ></button>
                    </div>

                    <div className="modal-body">
                        <p className="text-muted">{description}</p>

                        {currentAssignee && (
                            <div className="alert alert-info mb-3">
                                <strong>Currently Assigned To:</strong>{" "}
                                {currentAssignee.first_name} {currentAssignee.last_name}
                            </div>
                        )}

                        {staffLoading ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Select Staff Member</label>
                                <select
                                    className="form-select"
                                    value={selectedStaff ? selectedStaff.uid : ""}
                                    onChange={(e) => {
                                        if (e.target.value === "") {
                                            setSelectedStaff(null);
                                        } else {
                                            const selectedUid = e.target.value;
                                            const staff = staffMembers.find(s => s.uid === selectedUid);
                                            if (staff) {
                                                setSelectedStaff(staff);
                                                console.log("Staff selected:", staff.first_name, staff.last_name);
                                            }
                                        }
                                    }}
                                    disabled={loading || staffLoading}
                                >
                                    <option value="">-- Choose a staff member --</option>
                                    {staffMembers && staffMembers.length > 0 && staffMembers.map((staff) => (
                                        <option key={`option-${staff.uid}`} value={staff.uid}>
                                            {staff.first_name} {staff.last_name} ({staff.email})
                                        </option>
                                    ))}
                                    {(!staffMembers || staffMembers.length === 0) && (
                                        <option disabled>No staff members available</option>
                                    )}
                                </select>
                                </div>
                                {selectedStaff && (
                                <div className="alert alert-success mb-0">
                                    <i className="bx bx-check-circle"></i> Selected: <strong>{selectedStaff.first_name} {selectedStaff.last_name}</strong>
                                </div>
                                )}
                                </>
                                )}
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

                        {currentAssignee && (
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleUnassign}
                                disabled={loading || staffLoading}
                            >
                                {loading ? "Processing..." : "Unassign"}
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAssign}
                            disabled={!selectedStaff || loading || staffLoading}
                        >
                            {loading ? "Assigning..." : "Assign"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
