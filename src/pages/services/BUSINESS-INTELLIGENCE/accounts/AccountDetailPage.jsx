import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import { accountService } from "../BiQueries";
import { formatDate } from "../../../../helpers/DateFormater";
import Swal from "sweetalert2";
import showToast from "../../../../helpers/ToastHelper";

export const AccountDetailPage = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAccountData();
    }, [uid]);

    const fetchAccountData = async () => {
        try {
            setLoading(true);
            const [accRes, trendRes] = await Promise.all([
                accountService.getOne(uid),
                accountService.getTrends(uid, 30).catch(() => ({ data: { trends: [] } })),
            ]);
            setAccount(accRes.data);
            setTrends(trendRes.data?.trends || []);
        } catch (err) {
            console.error("Error fetching account:", err);
            Swal.fire("Error", "Failed to load account data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (!account) return;
        setRefreshing(true);
        try {
            await accountService.fetch(
                account.platform_name?.toLowerCase() || "instagram",
                account.username,
                { forceRefresh: true, async: false }
            );
            showToast("success", "Account data refreshed!");
            fetchAccountData();
        } catch (err) {
            showToast("error", "Failed to refresh account");
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = async () => {
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
                await accountService.delete(uid);
                showToast("success", "Account removed");
                navigate("/bi/accounts");
            } catch (err) {
                Swal.fire("Error", "Failed to delete account", "error");
            }
        }
    };

    const formatNumber = (num) => {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="alert alert-danger m-3">
                <i className="bx bx-error-circle me-2"></i>
                Account not found
            </div>
        );
    }

    return (
        <>
            <BreadCumb pageList={["Business Intelligence", "Accounts", `@${account.username}`]} />

            <div className="row">
                {/* Profile Card */}
                <div className="col-lg-4 col-md-12 mb-4">
                    <div className="card">
                        <div className="card-body text-center">
                            {account.profile_picture_url ? (
                                <img
                                    src={account.profile_picture_url}
                                    alt={account.username}
                                    className="rounded-circle mb-3"
                                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                                    onError={(e) => {
                                        e.target.src = "/assets/img/avatars/default.png";
                                    }}
                                />
                            ) : (
                                <div
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mx-auto mb-3"
                                    style={{ width: "120px", height: "120px", fontSize: "48px" }}
                                >
                                    {account.username?.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <h4 className="mb-1">
                                @{account.username}
                                {account.is_verified && (
                                    <i className="bx bxs-badge-check text-primary ms-2"></i>
                                )}
                            </h4>

                            {account.display_name && (
                                <p className="text-muted mb-2">{account.display_name}</p>
                            )}

                            <span className="badge bg-light text-dark border mb-3">
                                <i className={`bx bxl-${account.platform_name?.toLowerCase()} me-1`}></i>
                                {account.platform_name}
                            </span>

                            {account.sector_name && (
                                <span className="badge bg-info ms-2 mb-3">{account.sector_name}</span>
                            )}

                            <div className="d-flex justify-content-center gap-2 mt-3">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                >
                                    {refreshing ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <i className="bx bx-refresh"></i>
                                    )}
                                </button>
                                <a
                                    href={account.profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary btn-sm"
                                >
                                    <i className="bx bx-link-external"></i>
                                </a>
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={handleDelete}
                                >
                                    <i className="bx bx-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bio Card */}
                    {account.bio && (
                        <div className="card mt-3">
                            <div className="card-header">
                                <h6 className="mb-0">Bio</h6>
                            </div>
                            <div className="card-body">
                                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                                    {account.bio}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="card mt-3">
                        <div className="card-header">
                            <h6 className="mb-0">Contact Information</h6>
                        </div>
                        <div className="card-body">
                            {account.website && (
                                <div className="mb-2">
                                    <i className="bx bx-globe text-primary me-2"></i>
                                    <a href={account.website} target="_blank" rel="noopener noreferrer">
                                        {account.website}
                                    </a>
                                </div>
                            )}
                            {account.email && (
                                <div className="mb-2">
                                    <i className="bx bx-envelope text-primary me-2"></i>
                                    <a href={`mailto:${account.email}`}>{account.email}</a>
                                </div>
                            )}
                            {account.phone && (
                                <div className="mb-2">
                                    <i className="bx bx-phone text-primary me-2"></i>
                                    {account.phone}
                                </div>
                            )}
                            {(account.city || account.country) && (
                                <div className="mb-2">
                                    <i className="bx bx-map text-primary me-2"></i>
                                    {[account.city, account.country].filter(Boolean).join(", ")}
                                </div>
                            )}
                            {!account.website && !account.email && !account.phone && !account.city && (
                                <p className="text-muted mb-0">No contact info available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats & Details */}
                <div className="col-lg-8 col-md-12">
                    {/* Key Metrics */}
                    <div className="row mb-4">
                        <div className="col-sm-4 mb-3">
                            <div className="card bg-primary text-white h-100">
                                <div className="card-body text-center">
                                    <h2 className="mb-1">{formatNumber(account.follower_count)}</h2>
                                    <small>Followers</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-4 mb-3">
                            <div className="card bg-info text-white h-100">
                                <div className="card-body text-center">
                                    <h2 className="mb-1">{formatNumber(account.following_count)}</h2>
                                    <small>Following</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-4 mb-3">
                            <div className="card bg-success text-white h-100">
                                <div className="card-body text-center">
                                    <h2 className="mb-1">{formatNumber(account.post_count)}</h2>
                                    <small>Posts</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="mb-0">Engagement Metrics</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <h4 className="text-primary mb-1">
                                            {account.engagement_rate?.toFixed(2) || 0}%
                                        </h4>
                                        <small className="text-muted">Engagement Rate</small>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <h4 className="text-success mb-1">
                                            {formatNumber(account.avg_likes_per_post || 0)}
                                        </h4>
                                        <small className="text-muted">Avg Likes/Post</small>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 bg-light rounded">
                                        <h4 className="text-info mb-1">
                                            {formatNumber(account.avg_comments_per_post || 0)}
                                        </h4>
                                        <small className="text-muted">Avg Comments/Post</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Info */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="mb-0">Activity Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <table className="table table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="text-muted">Activity Status</td>
                                                <td>
                                                    <span className={`badge bg-${getStatusColor(account.activity_status)}`}>
                                                        {account.activity_status}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Business Type</td>
                                                <td className="text-capitalize">{account.business_type || "-"}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Business Model</td>
                                                <td className="text-uppercase">{account.business_model || "-"}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Verified</td>
                                                <td>
                                                    {account.is_verified ? (
                                                        <span className="text-success">
                                                            <i className="bx bx-check"></i> Yes
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">No</span>
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6">
                                    <table className="table table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="text-muted">First Post</td>
                                                <td>
                                                    {account.first_post_date
                                                        ? formatDate(account.first_post_date, "DD/MM/YYYY")
                                                        : "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Last Post</td>
                                                <td>
                                                    {account.last_post_date
                                                        ? formatDate(account.last_post_date, "DD/MM/YYYY")
                                                        : "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Avg Posts/Week</td>
                                                <td>{account.avg_posts_per_week?.toFixed(1) || "-"}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Response Time</td>
                                                <td>
                                                    {account.response_time_hours
                                                        ? `${account.response_time_hours}h`
                                                        : "-"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Source Info */}
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">Data Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <span className="text-muted">Data Source:</span>{" "}
                                        <span className="badge bg-light text-dark">{account.data_source}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="text-muted">Scrape Count:</span> {account.scrape_count}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <span className="text-muted">Last Scraped:</span>{" "}
                                        {account.last_scraped_at
                                            ? formatDate(account.last_scraped_at, "DD/MM/YYYY HH:mm")
                                            : "Never"}
                                    </p>
                                    <p className="mb-2">
                                        <span className="text-muted">Needs Refresh:</span>{" "}
                                        {account.needs_refresh ? (
                                            <span className="badge bg-warning">Yes</span>
                                        ) : (
                                            <span className="badge bg-success">No</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const getStatusColor = (status) => {
    const colors = {
        active: "success",
        inactive: "warning",
        dormant: "secondary",
        unknown: "info",
    };
    return colors[status] || "primary";
};

export default AccountDetailPage;
