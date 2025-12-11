import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "animate.css";
import { dashboardService, platformService, sectorService, accountService } from "../BiQueries";
import Swal from "sweetalert2";

export const BiDashboardPage = () => {
    const user = useSelector((state) => state.userReducer?.data);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [platforms, setPlatforms] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [dashRes, platRes, sectRes] = await Promise.all([
                dashboardService.getDashboard(),
                platformService.getAll(),
                sectorService.getAll(),
            ]);

            setDashboardData(dashRes.data);
            setPlatforms(platRes.data || []);
            setSectors(sectRes.data || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger mx-3 mt-3" role="alert">
                <div className="d-flex align-items-center">
                    <i className="bx bx-error-circle me-2"></i>
                    <div>
                        <h6 className="alert-heading mb-1">Failed to load dashboard</h6>
                        <p className="mb-0">{error}</p>
                    </div>
                </div>
                <button
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={fetchDashboardData}
                >
                    <i className="bx bx-refresh me-1"></i>
                    Retry
                </button>
            </div>
        );
    }

    const { accounts = {}, metrics = {}, tasks = {} } = dashboardData || {};

    return (
        <div className="container-fluid">
            {/* Welcome Card */}
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card bg-primary text-white">
                        <div className="d-flex align-items-end row">
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h4 className="card-title text-white mb-2">
                                        Business Intelligence Dashboard
                                    </h4>
                                    <p className="mb-3 opacity-75">
                                        Monitor and analyze social media business accounts across multiple platforms and sectors.
                                    </p>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <button
                                            className="btn btn-light btn-sm"
                                            onClick={() => navigate("/bi/accounts")}
                                        >
                                            <i className="bx bx-search me-1"></i>
                                            Browse Accounts
                                        </button>
                                        <button
                                            className="btn btn-outline-light btn-sm"
                                            data-bs-toggle="modal"
                                            data-bs-target="#fetchAccountModal"
                                        >
                                            <i className="bx bx-plus me-1"></i>
                                            Fetch New Account
                                        </button>
                                        <button
                                            className="btn btn-outline-light btn-sm"
                                            onClick={fetchDashboardData}
                                        >
                                            <i className="bx bx-refresh me-1"></i>
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 text-center d-none d-md-block">
                                <div className="card-body pb-0">
                                    <i className="bx bx-analyse" style={{ fontSize: "120px", opacity: 0.3 }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="row">
                {/* Total Accounts */}
                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-primary rounded p-2">
                                        <i className="bx bx-user text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Total Accounts</span>
                                    <h3 className="card-title mb-0">{accounts.total || 0}</h3>
                                    <small className="text-muted">
                                        {accounts.verified || 0} verified
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Followers */}
                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-success rounded p-2">
                                        <i className="bx bx-group text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Total Followers</span>
                                    <h3 className="card-title mb-0">
                                        {formatNumber(metrics.total_followers || 0)}
                                    </h3>
                                    <small className="text-muted">
                                        Across all accounts
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avg Engagement */}
                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-info rounded p-2">
                                        <i className="bx bx-trending-up text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Avg Engagement</span>
                                    <h3 className="card-title mb-0">
                                        {metrics.avg_engagement_rate || 0}%
                                    </h3>
                                    <small className="text-muted">
                                        Engagement rate
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Status */}
                <div className="col-sm-6 col-lg-3 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar flex-shrink-0">
                                    <div className="bg-warning rounded p-2">
                                        <i className="bx bx-task text-white"></i>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <span className="fw-medium d-block mb-1">Scrape Tasks</span>
                                    <h3 className="card-title mb-0">{tasks.pending || 0}</h3>
                                    <small className="text-success">
                                        {tasks.completed_today || 0} completed today
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform & Sector Stats */}
            <div className="row">
                {/* Platforms */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Accounts by Platform</h5>
                            <span className="badge bg-primary">{platforms.length} platforms</span>
                        </div>
                        <div className="card-body">
                            {Object.entries(accounts.by_platform || {}).length > 0 ? (
                                Object.entries(accounts.by_platform).map(([platform, count]) => (
                                    <div key={platform} className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                        <span className="fw-medium">
                                            <i className={`bx ${getPlatformIcon(platform)} me-2`}></i>
                                            {platform}
                                        </span>
                                        <span className="badge bg-primary">{count}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-data text-muted" style={{ fontSize: "48px" }}></i>
                                    <p className="text-muted mt-2">No platform data yet</p>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#fetchAccountModal"
                                    >
                                        Fetch First Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sectors */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Top Sectors</h5>
                            <a href="/bi/sectors" className="btn btn-sm btn-outline-primary">
                                View All
                            </a>
                        </div>
                        <div className="card-body">
                            {(accounts.by_sector || []).length > 0 ? (
                                accounts.by_sector.slice(0, 5).map((sector) => (
                                    <div key={sector.sector__uid} className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                        <div>
                                            <span className="fw-medium">{sector.sector__name}</span>
                                            <br />
                                            <small className="text-muted">
                                                {formatNumber(sector.total_followers || 0)} followers
                                            </small>
                                        </div>
                                        <span className="badge bg-success">{sector.count}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-category text-muted" style={{ fontSize: "48px" }}></i>
                                    <p className="text-muted mt-2">No sector data yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Status & Data Freshness */}
            <div className="row">
                {/* Activity Status */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Account Activity Status</h5>
                        </div>
                        <div className="card-body">
                            {Object.entries(accounts.by_status || {}).map(([status, count]) => (
                                <div key={status} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="fw-medium text-capitalize">{status}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="progress" style={{ height: "8px" }}>
                                        <div
                                            className={`progress-bar ${getStatusColor(status)}`}
                                            style={{ width: `${(count / (accounts.total || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Data Freshness */}
                <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Data Freshness</h5>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-6 mb-3">
                                    <div className="border rounded p-3">
                                        <div className="text-success display-6 fw-bold">
                                            {accounts.recently_updated || 0}
                                        </div>
                                        <small className="text-muted">Recently Updated</small>
                                        <br />
                                        <small className="text-success">(Last 24 hours)</small>
                                    </div>
                                </div>
                                <div className="col-6 mb-3">
                                    <div className="border rounded p-3">
                                        <div className="text-warning display-6 fw-bold">
                                            {accounts.needs_refresh || 0}
                                        </div>
                                        <small className="text-muted">Needs Refresh</small>
                                        <br />
                                        <small className="text-warning">(Stale data)</small>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info mb-0 mt-3">
                                <div className="d-flex align-items-center">
                                    <i className="bx bx-info-circle me-2"></i>
                                    <div>
                                        <small>
                                            {tasks.failed_today > 0 ? (
                                                <span className="text-danger">
                                                    {tasks.failed_today} task(s) failed today
                                                </span>
                                            ) : (
                                                "All scraping tasks running smoothly"
                                            )}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fetch Account Modal */}
            <FetchAccountModal onSuccess={fetchDashboardData} platforms={platforms} sectors={sectors} />
        </div>
    );
};

// Fetch Account Modal Component
const FetchAccountModal = ({ onSuccess, platforms, sectors }) => {
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
                                <small className="text-muted">
                                    Enter the account username without @ symbol
                                </small>
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

// Helper functions
const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
};

const getPlatformIcon = (platform) => {
    const icons = {
        Instagram: "bxl-instagram",
        Facebook: "bxl-facebook",
        TikTok: "bxl-tiktok",
        Twitter: "bxl-twitter",
        "Twitter/X": "bxl-twitter",
        YouTube: "bxl-youtube",
        LinkedIn: "bxl-linkedin",
    };
    return icons[platform] || "bx-globe";
};

const getStatusColor = (status) => {
    const colors = {
        active: "bg-success",
        inactive: "bg-secondary",
        dormant: "bg-warning",
        unknown: "bg-info",
    };
    return colors[status] || "bg-primary";
};

export default BiDashboardPage;
