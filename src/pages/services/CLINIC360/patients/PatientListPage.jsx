import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { PatientModal } from "./PatientModal";
import { deletePatient } from "../Queries";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const PatientListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [tableData, setTableData] = useState([]);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (patient) => {
        if (!patient) return;

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete patient: ${patient.first_name} ${patient.last_name}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                await deletePatient(patient.uid);
                Swal.fire("Deleted!", "The Patient has been deleted successfully.", "success");
                setTableRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error deleting patient:", error);
            Swal.fire("Error!", "Unable to delete patient. Please try again or contact support.", "error");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedObj(null);
    };

    return (
        <>
            <BreadCumb pageList={["CLINIC360", "Patients", "List"]} />
            <PaginatedTable
                fetchPath="/clinic360-patients/"
                title="Patients"
                onDataFetched={(data) => setTableData(data)}
                columns={[
                    {
                        key: "patient_id",
                        label: "Patient ID",
                        render: (row) => (
                            <span className="badge bg-label-primary">{row.patient_id || "-"}</span>
                        ),
                    },
                    {
                        key: "name",
                        label: "Patient Name",
                        className: "fw-bold",
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="avatar avatar-sm me-2 bg-label-primary rounded-circle d-flex align-items-center justify-content-center">
                                    <span className="text-primary fw-bold">
                                        {row.first_name?.charAt(0)}{row.last_name?.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className="text-primary cursor-pointer fw-semibold"
                                        onClick={() => navigate(`/clinic360/patients/${row.uid}`)}
                                    >
                                        {row.first_name} {row.last_name}
                                    </span>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "phone",
                        label: "Phone",
                        render: (row) => <span>{row.phone || "-"}</span>,
                    },
                    {
                        key: "email",
                        label: "Email",
                        render: (row) => <span className="text-muted">{row.email || "-"}</span>,
                    },
                    {
                        key: "gender",
                        label: "Gender",
                        render: (row) => (
                            <span className={`badge bg-${row.gender === 'M' ? 'info' : row.gender === 'F' ? 'warning' : 'secondary'}`}>
                                {row.gender === 'M' ? 'Male' : row.gender === 'F' ? 'Female' : row.gender || '-'}
                            </span>
                        ),
                    },
                    {
                        key: "patient_type",
                        label: "Type",
                        render: (row) => (
                            <span className={`badge bg-${
                                row.patient_type === 'VIP' ? 'warning' :
                                row.patient_type === 'INSURANCE' ? 'success' :
                                row.patient_type === 'CORPORATE' ? 'info' :
                                row.patient_type === 'STAFF' ? 'secondary' : 'primary'
                            }`}>
                                {row.patient_type || '-'}
                            </span>
                        ),
                    },
                    {
                        key: "created_at",
                        label: "Registered",
                        render: (row) => (
                            <span>{row.created_at ? formatDate(row.created_at) : "-"}</span>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "View",
                        icon: "bx bx-show",
                        onClick: (row) => navigate(`/clinic360/patients/${row.uid}`),
                        className: "btn-outline-secondary",
                    },
                    {
                        label: "Edit",
                        icon: "bx bx-edit",
                        onClick: (row) => {
                            setSelectedObj(row);
                            setShowModal(true);
                        },
                        condition: () => hasAccess(user, ["change_patient"]),
                        className: "btn-outline-primary text-primary",
                    },
                    {
                        label: "Delete",
                        icon: "bx bx-trash",
                        onClick: (row) => handleDelete(row),
                        condition: () => hasAccess(user, ["delete_patient"]),
                        className: "btn-outline-danger",
                    },
                ]}
                user={user}
                fixedActions={true}
                buttons={[
                    {
                        label: "Add Patient",
                        render: () => (
                            hasAccess(user, ["add_patient"]) && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setSelectedObj(null);
                                        setShowModal(true);
                                    }}
                                    title="Add new Patient"
                                >
                                    <i className="bx bx-plus me-1"></i> Add Patient
                                </button>
                            )
                        ),
                    },
                ]}
                isRefresh={tableRefresh}
            />

            {showModal && (
                <PatientModal
                    selectedObj={selectedObj}
                    onClose={handleCloseModal}
                    onSuccess={() => {
                        setTableRefresh((prev) => prev + 1);
                        handleCloseModal();
                    }}
                />
            )}
        </>
    );
};
