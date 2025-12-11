import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";
import BreadCumb from "../../../../layouts/BreadCumb";
import PaginatedTable from "../../../../components/ui-templates/PaginatedTable";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import showToast from "../../../../helpers/ToastHelper";
import { accountService, platformService, sectorService } from "../BiQueries";

export const AccountsListPage = () => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [tableRefresh, setTableRefresh] = useState(0);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [sectors, setSectors] = useState([]);
    const tableRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadFilters();
    }, []);

    const loadFilters = async () => {
        try {
            const [platRes, sectRes] = await Promise.all([
                platformService.getAll(),
                sectorService.getAll(),
            ]);
            setPlatforms(platRes.data || []);
            setSectors(sectRes.data || []);
        } catch (err) {
            console.error("Error loading filters:", err);
        }
    };

    const handleDelete = async (account) => {
        const confirmation = await Swal.fire({
            title: "Delete Account?",
            text: `Remove @${account.username} from tracking?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirmation.isConfirmed) {
            try {
                await accountService.delete(account.uid);
                showToast("success", "Account removed successfully");
                setTableRefresh((prev) => prev + 1);
            } catch (error) {
                Swal.fire("Error!", "Failed to delete account", "error");
            }
        }
    };

    const handleRefresh = () => {
        setTableRefresh((prev) => prev + 1);
        showToast("info", "Data refreshed");
    };

    const handleCompare = () => {
        if (selectedAccounts.length < 2) {
            showToast("warning", "Select at least 2 accounts to compare");
            return;
        }
        if (selectedAccounts.length > 10) {
            showToast("warning", "Maximum 10 accounts can be compared");
            return;
        }

        const uids = selectedAccounts.map((a) => a.uid).join(",");
        navigate(`/bi/compare?accounts=${uids}`);
    };

    const formatNumber = (num) => {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    return (
        <>
            <BreadCumb pageList={["Business Intelligence", "Accounts"]} />

            {selectedAccounts.length > 0 && (
                <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <i className="bx bx-check-square me-2"></i>
                        <strong>{selectedAccounts.length}</strong> account(s) selected
                    </div>
                    <div className="btn-group">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={handleCompare}
                            disabled={selectedAccounts.length < 2}
                        >
                            <i className="bx bx-git-compare me-1"></i> Compare
                        </button>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedAccounts([])}
                        >
                            <i className="bx bx-x"></i> Clear
                        </button>
                    </div>
                </div>
            )}

            <PaginatedTable
                ref={tableRef}
                fetchPath="/bi-accounts"
                title="Business Accounts"
                onDataFetched={(data) => setTableData(data)}
                columns={[
                    {
                        key: "select",
                        label: (
                            <input
                                type="checkbox"
                                className="form-check-input"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedAccounts(tableData);
                                    } else {
                                        setSelectedAccounts([]);
                                    }
                                }}
                                checked={selectedAccounts.length === tableData.length && tableData.length > 0}
                            />
                        ),
                        style: { width: "40px" },
                        render: (row) => (
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedAccounts.some((a) => a.uid === row.uid)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedAccounts([...selectedAccounts, row]);
                                    } else {
                                        setSelectedAccounts(selectedAccounts.filter((a) => a.uid !== row.uid));
                                    }
                                }}
                            />
                        ),
                    },
                    {
                        key: "account",
                        label: "Account",
                        style: { width: "250px" },
                        render: (row) => (
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    {row.profile_picture_url ? (
                                        <img
                                            src={row.profile_picture_url}
                                            alt={row.username}
                                            className="rounded-circle"
                                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                            onError={(e) => {
                                                e.target.src = "/assets/img/avatars/default.png";
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                                            style={{ width: "40px", height: "40px" }}
                                        >
                                            {row.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <span
                                        className="text-primary cursor-pointer fw-semibold"
                                        onClick={() => navigate(`/bi/accounts/${row.uid}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        @{row.username}
                                    </span>
                                    {row.is_verified && (
                                        <i className="bx bxs-badge-check text-primary ms-1"></i>
                                    )}
                                    {row.display_name && (
                                        <small className="d-block text-muted">{row.display_name}</small>
                                    )}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "platform",
                        label: "Platform",
                        style: { width: "120px" },
                        render: (row) => (
                            <span className="badge bg-light text-dark border">
                                <i className={`bx bxl-${row.platform_name?.toLowerCase()} me-1`}></i>
                                {row.platform_name}
                            </span>
                        ),
                    },
                    {
                        key: "sector",
                        label: "Sector",
                        style: { width: "140px" },
                        render: (row) => (
                            row.sector_name ? (
                                <span className="badge bg-info bg-opacity-10 text-info">
                                    {row.sector_name}
                                </span>
                            ) : (
                                <span className="text-muted">-</span>
                            )
                        ),
                    },
                    {
                        key: "followers",
                        label: "Followers",
                        style: { width: "120px" },
                        className: "text-center",
                        render: (row) => (
                            <div>
                                <span className="fw-bold text-primary">
                                    {formatNumber(row.follower_count)}
                                </span>
                            </div>
                        ),
                    },
                    {
                        key: "activity_status",
                        label: "Status",
                        style: { width: "110px" },
                        className: "text-center",
                        render: (row) => {
                            const statusConfig = {
                                active: { class: "success", label: "Active" },
                                inactive: { class: "warning", label: "Inactive" },
                                dormant: { class: "secondary", label: "Dormant" },
                                unknown: { class: "info", label: "Unknown" },
                            };
                            const config = statusConfig[row.activity_status] || statusConfig.unknown;
                            return (
                                <span className={`badge bg-${config.class}`}>
                                    {config.label}
                                </span>
                            );
                        },
                    },
                    {
                        key: "last_scraped",
                        label: "Last Updated",
                        style: { width: "130px" },
                        render: (row) => (
                            row.last_scraped_at ? (
                                <small className="text-muted">
                                    {formatDate(row.last_scraped_at, "DD/MM/YYYY HH:mm")}
                                </small>
                            ) : (
                                <small className="text-muted">Never</small>
                            )
                        ),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        style: { width: "100px" },
                        className: "text-center",
                        render: (row) => (
                            <div className="btn-group">
                                <button
                                    className="btn btn-sm btn-outline-info border-0"
                                    onClick={() => navigate(`/bi/accounts/${row.uid}`)}
                                    title="View Details"
                                >
                                    <i className="bx bx-show"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-primary border-0"
                                    onClick={async () => {
                                        showToast("info", "Refreshing account data...");
                                        try {
                                            await accountService.fetch(
                                                row.platform_name?.toLowerCase(),
                                                row.username,
                                                { forceRefresh: true, async: false }
                                            );
                                            showToast("success", "Account refreshed!");
                                            setTableRefresh((prev) => prev + 1);
                                        } catch (err) {
                                            showToast("error", "Failed to refresh");
                                        }
                                    }}
                                    title="Refresh Data"
                                >
                                    <i className="bx bx-refresh"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger border-0"
                                    onClick={() => handleDelete(row)}
                                    title="Delete"
                                >
                                    <i className="bx bx-trash"></i>
                                </button>
                            </div>
                        ),
                    },
                ]}
                buttons={[
                    {
                        label: "Refresh",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm me-2"
                                onClick={handleRefresh}
                            >
                                <i className="bx bx-refresh me-1"></i> Refresh
                            </button>
                        ),
                    },
                    {
                        label: "Compare",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-info btn-sm me-2"
                                onClick={handleCompare}
                                disabled={selectedAccounts.length < 2}
                            >
                                <i className="bx bx-git-compare me-1"></i> Compare
                            </button>
                        ),
                    },
                    {
                        label: "Fetch Account",
                        render: () => (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#fetchAccountModal"
                            >
                                <i className="bx bx-plus me-1"></i> Fetch Account
                            </button>
                        ),
                    },
                ]}
                onSelect={(row) => setSelectedObj(row)}
                isRefresh={tableRefresh}
                filterGroups={[
                    {
                        group: "platform",
                        label: "Platform",
                        placeholder: "Filter by Platform",
                        options: platforms.map((p) => ({
                            value: p.uid,
                            label: p.display_name,
                        })),
                    },
                    {
                        group: "sector",
                        label: "Sector",
                        placeholder: "Filter by Sector",
                        options: sectors.map((s) => ({
                            value: s.uid,
                            label: s.name,
                        })),
                    },
                    {
                        group: "activity_status",
                        label: "Status",
                        placeholder: "Filter by Status",
                        options: [
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                            { value: "dormant", label: "Dormant" },
                            { value: "unknown", label: "Unknown" },
                        ],
                    },
                    {
                        group: "is_verified",
                        label: "Verified",
                        placeholder: "Filter by Verification",
                        options: [
                            { value: "true", label: "Verified Only" },
                            { value: "false", label: "Non-Verified" },
                        ],
                    },
                ]}
            />

            {/* Fetch Account Modal */}
            <FetchAccountModal
                platforms={platforms}
                sectors={sectors}
                onSuccess={() => setTableRefresh((prev) => prev + 1)}
            />
        </>
    );
};

// Fetch Account Modal
const FetchAccountModal = ({ platforms, sectors, onSuccess }) => {
    const [platform, setPlatform] = useState("instagram");
    const [username, setUsername] = useState("");
    const [sector, setSector] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            Swal.fire("Error", "Please enter a username", "error");
            return;
        }

        setLoading(true);
        try {
            const result = await accountService.fetch(platform, username.trim(), {
                sector: sector || null,
                async: false,
            });

            if (result.status === "success") {
                Swal.fire("Success", "Account fetched successfully!", "success");
                setUsername("");
                setSector("");
                document.querySelector("#fetchAccountModal .btn-close")?.click();
                onSuccess?.();
            } else {
                Swal.fire("Error", result.message || "Failed to fetch account", "error");
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Failed to fetch account", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade" id="fetchAccountModal" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Fetch Business Account</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Platform</label>
                                <select
                                    className="form-select"
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                >
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <div className="input-group">
                                    <span className="input-group-text">@</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Sector (Optional)</label>
                                <select
                                    className="form-select"
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                >
                                    <option value="">-- Select Sector --</option>
                                    {sectors.map((s) => (
                                        <option key={s.uid} value={s.uid}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-download me-1"></i>
                                        Fetch Account
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

export default AccountsListPage;
