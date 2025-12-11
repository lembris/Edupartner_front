import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import { accountService } from "../BiQueries";
import Swal from "sweetalert2";

export const ComparePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accountsParam = searchParams.get("accounts");
        if (accountsParam) {
            const uids = accountsParam.split(",");
            fetchComparison(uids);
        } else {
            Swal.fire("Error", "No accounts selected for comparison", "error");
            navigate("/bi/accounts");
        }
    }, [searchParams]);

    const fetchComparison = async (uids) => {
        try {
            setLoading(true);
            const result = await accountService.compare(uids);
            setComparison(result.data);
        } catch (err) {
            console.error("Comparison error:", err);
            Swal.fire("Error", "Failed to load comparison data", "error");
        } finally {
            setLoading(false);
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

    if (!comparison || !comparison.accounts?.length) {
        return (
            <div className="alert alert-danger m-3">
                <i className="bx bx-error-circle me-2"></i>
                No comparison data available
            </div>
        );
    }

    const { accounts, metrics } = comparison;

    return (
        <>
            <BreadCumb pageList={["Business Intelligence", "Accounts", "Compare"]} />

            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="bx bx-git-compare me-2"></i>
                        Comparing {accounts.length} Accounts
                    </h5>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate("/bi/accounts")}
                    >
                        <i className="bx bx-arrow-back me-1"></i>
                        Back to Accounts
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h4 className="mb-1">{formatNumber(metrics.max_followers)}</h4>
                            <small>Max Followers</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h4 className="mb-1">{formatNumber(Math.round(metrics.avg_followers))}</h4>
                            <small>Avg Followers</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h4 className="mb-1">{metrics.max_engagement?.toFixed(2)}%</h4>
                            <small>Max Engagement</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                            <h4 className="mb-1">{metrics.avg_engagement?.toFixed(2)}%</h4>
                            <small>Avg Engagement</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    {accounts.map((acc) => (
                                        <th key={acc.uid} className="text-center">
                                            <div className="d-flex flex-column align-items-center">
                                                {acc.profile_picture_url ? (
                                                    <img
                                                        src={acc.profile_picture_url}
                                                        alt={acc.username}
                                                        className="rounded-circle mb-2"
                                                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mb-2"
                                                        style={{ width: "40px", height: "40px" }}
                                                    >
                                                        {acc.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span
                                                    className="text-primary cursor-pointer"
                                                    onClick={() => navigate(`/bi/accounts/${acc.uid}`)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    @{acc.username}
                                                </span>
                                                {acc.is_verified && (
                                                    <i className="bx bxs-badge-check text-primary"></i>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="fw-medium">Platform</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            <span className="badge bg-light text-dark">
                                                {acc.platform_name}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr className="table-primary">
                                    <td className="fw-medium">Followers</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center fw-bold">
                                            {formatNumber(acc.follower_count)}
                                            {acc.follower_count === metrics.max_followers && (
                                                <i className="bx bx-crown text-warning ms-1"></i>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Following</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {formatNumber(acc.following_count)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Posts</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {formatNumber(acc.post_count)}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="table-success">
                                    <td className="fw-medium">Engagement Rate</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center fw-bold">
                                            {acc.engagement_rate?.toFixed(2)}%
                                            {acc.engagement_rate === metrics.max_engagement && (
                                                <i className="bx bx-crown text-warning ms-1"></i>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Avg Likes/Post</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {formatNumber(acc.avg_likes_per_post)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Avg Comments/Post</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {formatNumber(acc.avg_comments_per_post)}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Status</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            <span className={`badge bg-${getStatusColor(acc.activity_status)}`}>
                                                {acc.activity_status}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Verified</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {acc.is_verified ? (
                                                <i className="bx bx-check text-success fs-4"></i>
                                            ) : (
                                                <i className="bx bx-x text-danger fs-4"></i>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Posts/Week</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {acc.avg_posts_per_week?.toFixed(1) || "-"}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Website</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {acc.website ? (
                                                <a href={acc.website} target="_blank" rel="noopener noreferrer">
                                                    <i className="bx bx-link-external"></i>
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="fw-medium">Location</td>
                                    {accounts.map((acc) => (
                                        <td key={acc.uid} className="text-center">
                                            {[acc.city, acc.country].filter(Boolean).join(", ") || "-"}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
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

export default ComparePage;
