import React, { useState, useEffect } from "react";
import "animate.css";
import { AssetContext } from "../../../../utils/context";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import { AssetModal } from "./Modal";
import { deleteAsset } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import { hasAccess } from "../../../../hooks/AccessHandler";
import { useSelector } from "react-redux";

export const AssetListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const navigate = useNavigate();
    const user = useSelector((state) => state.userReducer?.data);

    const handleDelete = async (asset) => {
        if (!asset) {
            Swal.fire("Error!", "Unable to select this asset.", "error");
            return;
        }

        try {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: `You're about to delete asset: ${asset.asset_tag}`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!",
            });

            if (confirmation.isConfirmed) {
                const result = await deleteAsset(asset.uid);
                if (result.status === 200 || result.status === 8000) {
                    Swal.fire(
                        "Deleted!",
                        "The asset has been deleted successfully.",
                        "success"
                    );
                    setTableRefresh((prev) => prev + 1);
                } else {
                    Swal.fire("Error!", result.message || "Failed to delete asset", "error");
                }
            }
        } catch (error) {
            console.error("Error deleting asset:", error);
            Swal.fire(
                "Error!",
                "Unable to delete asset. Please try again or contact support.",
                "error"
            );
        }
    };
    return (
        <AssetContext.Provider
            value={{
                selectedObj,
                setSelectedObj,
                tableRefresh,
                setTableRefresh,
            }}
        >
            <BreadCumb pageList={["Assets", "List"]} />
            <PaginatedTable
                fetchPath="/assets"
                title="List of Assets"
                columns={[
                    {
                        key: "asset_tag",
                        label: "Asset Tag",
                        className: "fw-bold",
                        style: { width: "140px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <i className="bx bx-desktop text-primary me-2 fs-5"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <span
                                        className="text-primary cursor-pointer fw-semibold"
                                        onClick={() =>
                                            hasAccess(user, [
                                                ["view_asset", "add_asset", "change_asset"]
                                            ])
                                                ? navigate(`/ict-assets/assets/${row.uid}`)
                                                : null
                                        }
                                    >
                                        {row.asset_tag || "-"}
                                    </span>
                                    {row.barcode && (
                                        <small className="d-block text-muted fs-12">
                                            📋 {row.barcode}
                                        </small>
                                    )}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "serial_number",
                        label: "Serial No.",
                        className: "text-center",
                        style: { width: "140px" },
                        render: (row) => (
                            <div>
                                {row.serial_number ? (
                                    <span className="badge bg-light text-dark border">
                                        {row.serial_number}
                                    </span>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "model",
                        label: "Model & Type",
                        className: "text-left",
                        style: { width: "200px" },
                        render: (row) => (
                            <div>
                                <div className="fw-medium text-dark">{row.model || "-"}</div>
                                {row.asset_type_name && (
                                    <small className="text-muted d-block fs-12">
                                        {row.asset_type_name}
                                    </small>
                                )}
                            </div>
                        ),
                    },
                    // Uncomment if you want purchase and manufacture details 
                    // {
                    //     key: "manufacturer",
                    //     label: "Manufacturer",
                    //     className: "text-left",
                    //     style: { width: "150px" },
                    //     render: (row) => (
                    //         <div>
                    //             {row.manufacturer_name ? (
                    //                 <span className="text-dark">{row.manufacturer_name}</span>
                    //             ) : (
                    //                 <span className="text-muted">-</span>
                    //             )}
                    //         </div>
                    //     ),
                    // },
                    // {
                    //   key: "purchase_info",
                    //   label: "Purchase Info",
                    //   className: "text-center",
                    //   style: { width: "180px" },
                    //   render: (row) => (
                    //     <div className="text-center">
                    //       <div className="fw-medium text-dark">
                    //         {row.purchase_cost ? (
                    //           <span className="text-success">
                    //             TSH{Number(row.purchase_cost).toLocaleString()}
                    //           </span>
                    //         ) : (
                    //           <span className="text-muted">-</span>
                    //         )}
                    //       </div>
                    //       <small className="text-muted d-block fs-12">
                    //         {formatDate(row.purchase_date, "DD/MM/YYYY") || "No date"}
                    //       </small>
                    //     </div>
                    //   ),
                    // },
                    {
                        key: "warranty",
                        label: "Warranty Status",
                        className: "text-center",
                        style: { width: "160px" },
                        render: (row) => {
                            const warrantyDate = new Date(row.warranty_expiry);
                            const today = new Date();
                            const daysUntilExpiry = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));

                            let statusClass = "success";
                            let statusText = "Active";
                            let icon = "✓";

                            if (warrantyDate < today) {
                                statusClass = "danger";
                                statusText = "Expired";
                                icon = "⚠";
                            } else if (daysUntilExpiry <= 30) {
                                statusClass = "warning";
                                statusText = "Expiring Soon";
                                icon = "⚠";
                            }

                            return (
                                <div className="text-center">
                                    <span className={`badge bg-${statusClass} bg-opacity-10 text-${statusClass} border border-${statusClass} border-opacity-25`}>
                                        {icon} {statusText}
                                    </span>
                                    <small className="d-block text-muted fs-12 mt-1">
                                        {formatDate(row.warranty_expiry, "DD/MM/YYYY") || "No warranty"}
                                    </small>
                                </div>
                            );
                        },
                    },
                    {
                        key: "custodian",
                        label: "Custodian",
                        style: { width: "160px" },
                        render: (row) => (
                            <div>
                                {row.custodian_name ? (
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1 ms-2">
                                            <span className="text-dark fs-13">{row.custodian_name}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-muted">Unassigned</span>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "audit_status",
                        label: "Audit Status",
                        className: "text-center",
                        style: { width: "140px" },
                        render: (row) => {
                            const auditDate = new Date(row.last_audit_date);
                            const today = new Date();
                            const monthsSinceAudit = (today.getFullYear() - auditDate.getFullYear()) * 12 + (today.getMonth() - auditDate.getMonth());

                            let statusClass = "success";
                            let statusText = "Up to date";

                            if (!row.last_audit_date) {
                                statusClass = "secondary";
                                statusText = "Never audited";
                            } else if (monthsSinceAudit > 12) {
                                statusClass = "warning";
                                statusText = "Overdue";
                            } else if (monthsSinceAudit > 6) {
                                statusClass = "info";
                                statusText = "Due soon";
                            }

                            return (
                                <div className="text-center">
                                    <span className={`badge bg-${statusClass} bg-opacity-10 text-${statusClass} border border-${statusClass} border-opacity-25`}>
                                        {statusText}
                                    </span>
                                    {row.last_audit_date && (
                                        <small className="d-block text-muted fs-12 mt-1">
                                            {formatDate(row.last_audit_date, "DD/MM/YYYY")}
                                        </small>
                                    )}
                                </div>
                            );
                        },
                    },
                    {
                        key: "status",
                        label: "Asset Status",
                        className: "text-center",
                        style: { width: "130px" },
                        render: (row) => {
                            const statusConfig = {
                                active: { class: "success", icon: "✓", label: "Active" },
                                inactive: { class: "warning", icon: "⏸", label: "Inactive" },
                                in_repair: { class: "info", icon: "🔧", label: "In Repair" },
                                retired: { class: "secondary", icon: "📦", label: "Retired" },
                                lost: { class: "danger", icon: "🔍", label: "Lost" },
                                disposed: { class: "dark", icon: "🗑", label: "Disposed" }
                            };

                            const config = statusConfig[row.status] || { class: "secondary", icon: "?", label: row.status || "Unknown" };

                            return (
                                <span className={`badge bg-${config.class} bg-opacity-10 text-${config.class} border border-${config.class} border-opacity-25`}>
                                    {config.icon} {config.label}
                                </span>
                            );
                        },
                    },
                    {
                        key: "condition",
                        label: "Condition",
                        className: "text-center",
                        style: { width: "120px" },
                        render: (row) => {
                            const conditionConfig = {
                                new: { class: "success", label: "New" },
                                excellent: { class: "success", label: "Excellent" },
                                good: { class: "info", label: "Good" },
                                fair: { class: "warning", label: "Fair" },
                                poor: { class: "danger", label: "Poor" }
                            };

                            const config = conditionConfig[row.condition] || { class: "secondary", label: row.condition || "Unknown" };

                            return (
                                <span className={`badge bg-${config.class} bg-opacity-10 text-${config.class} border border-${config.class} border-opacity-25`}>
                                    {config.label}
                                </span>
                            );
                        },
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        style: { width: "120px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                <button
                                    aria-label="View"
                                    type="button"
                                    className="btn btn-sm btn-outline-info border-0"
                                    onClick={() => navigate(`/ict-assets/assets/${row.uid}`)}
                                    title="View Asset"
                                >
                                    <i className="bx bx-show"></i>
                                </button>
                                {hasAccess(user, [["change_asset"]]) && (
                                    <button
                                        aria-label="Edit"
                                        type="button"
                                        className="btn btn-sm btn-outline-primary border-0"
                                        onClick={() => {
                                            setSelectedObj(row);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#assetModal"
                                        title="Edit Asset"
                                    >
                                        <i className="bx bx-edit"></i>
                                    </button>
                                )}
                                {hasAccess(user, [["delete_asset"]]) && (
                                    <button
                                        aria-label="Delete"
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0"
                                        onClick={() => handleDelete(row)}
                                        title="Delete Asset"
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                )}
                            </div>
                        ),
                    },
                ]}
                //Paginated table top-right buttons 
                buttons={[
                    {
                        label: "Import Assets",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-success btn-sm me-2"
                                data-bs-toggle="modal"
                                data-bs-target="#assetImportModal"
                            >
                                <i className="bx bx-upload me-1"></i> Import
                            </button>
                        ),
                    },
                    {
                        label: "Add Asset",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setSelectedAsset(null)}
                                data-bs-toggle="modal"
                                data-bs-target="#assetModal"
                            >
                                <i className="bx bx-plus me-1"></i> Add Asset
                            </button>
                        ),
                    },
                ]}
                onSelect={(row) => {
                    setSelectedObj(row);
                }}
                isRefresh={tableRefresh}
                filterGroups={[
                    {
                        group: "status",
                        label: "Status",
                        placeholder: "Filter by Status",
                        options: [
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                            { value: "in_repair", label: "In Repair" },
                            { value: "retired", label: "Retired" },
                            { value: "lost", label: "Lost" },
                            { value: "disposed", label: "Disposed" }
                        ]
                    },
                    {
                        group: "condition",
                        label: "Condition",
                        placeholder: "Filter by Condition",
                        options: [
                            { value: "excellent", label: "Excellent" },
                            { value: "good", label: "Good" },
                            { value: "fair", label: "Fair" },
                            { value: "poor", label: "Poor" },
                            { value: "broken", label: "Broken" },
                            { value: "for_parts", label: "For Parts" }
                        ]
                    },
                    {
                        group: "warranty_status",
                        label: "Warranty",
                        placeholder: "Filter by Warranty",
                        options: [
                            { value: "active", label: "Warranty Active" },
                            { value: "expired", label: "Warranty Expired" },
                            { value: "expiring_soon", label: "Warranty Expiring Soon" },
                            { value: "none", label: "No Warranty" }
                        ]
                    },
                    {
                        group: "audit_status",
                        label: "Audit Status",
                        placeholder: "Filter by Audit",
                        options: [
                            { value: "up_to_date", label: "Audit Up to Date" },
                            { value: "due_soon", label: "Audit Due Soon" },
                            { value: "overdue", label: "Audit Overdue" },
                            { value: "never_audited", label: "Never Audited" }
                        ]
                    }
                ]}
            />
            <AssetModal />
        </AssetContext.Provider>
    );
};
