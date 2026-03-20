import { useState } from "react";
import Swal from "sweetalert2";
import { assignConsentRequestToStaff, unassignConsentRequest } from "./Queries";

/**
 * DRY Hook for Staff Assignment
 * Handles assignment logic that can be reused across any operation/module
 */
export const useStaffAssignment = (onSuccess = null) => {
    const [assignmentLoading, setAssignmentLoading] = useState(false);

    const assignToStaff = async (consentId, staffMember) => {
        try {
            setAssignmentLoading(true);

            const result = await Swal.fire({
                title: "Assign to Staff?",
                text: `Are you sure you want to assign this to ${staffMember.first_name} ${staffMember.last_name}?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#0d6efd",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, assign it!",
            });

            if (!result.isConfirmed) {
                return null;
            }

            const response = await assignConsentRequestToStaff(consentId, staffMember.uid);
            
            Swal.fire(
                "Success!",
                `Assigned to ${staffMember.first_name} ${staffMember.last_name}`,
                "success"
            );

            if (onSuccess) onSuccess(response.data);
            return response.data;
        } catch (error) {
            console.error("Error assigning to staff:", error);
            Swal.fire("Error!", "Failed to assign request to staff.", "error");
            throw error;
        } finally {
            setAssignmentLoading(false);
        }
    };

    const unassign = async (consentId, staffName = "staff") => {
        try {
            setAssignmentLoading(true);

            const result = await Swal.fire({
                title: "Unassign Request?",
                text: `Are you sure you want to unassign this from ${staffName}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, unassign it!",
            });

            if (!result.isConfirmed) {
                return null;
            }

            const response = await unassignConsentRequest(consentId);
            
            Swal.fire("Success!", "Request unassigned successfully.", "success");

            if (onSuccess) onSuccess(response.data);
            return response.data;
        } catch (error) {
            console.error("Error unassigning request:", error);
            Swal.fire("Error!", "Failed to unassign request.", "error");
            throw error;
        } finally {
            setAssignmentLoading(false);
        }
    };

    return {
        assignToStaff,
        unassign,
        assignmentLoading,
    };
};
