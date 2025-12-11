// TargetProgress.jsx - Target Progress with Visual Progress Bars
import React, { useEffect, useState } from "react";
import { commissionPortalService } from "./Queries.jsx";
import { formatCurrency } from "../../../../utils/formatters.js";

export const TargetProgress = () => {
    const [loading, setLoading] = useState(true);
    const [targetData, setTargetData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [badges, setBadges] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [progressRes, leaderboardRes, badgesRes] = await Promise.all([
                commissionPortalService.getTargetProgress(),
                commissionPortalService.getLeaderboard({ period: "monthly" }),
                commissionPortalService.getBadges(),
            ]);
            setTargetData(progressRes?.data);
            setLeaderboard(leaderboardRes?.data || []);
            setBadges(badgesRes?.data || []);
        } catch (error) {
            console.error("Error fetching target data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return "success";
        if (percentage >= 75) return "primary";
        if (percentage >= 50) return "warning";
        return "danger";
    };

    return (
        <div className="mt-4">
            <div className="row g-4">
                {/* Current Target */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bx bx-target-lock me-2"></i>
                                Current Target
                            </h5>
                            {targetData?.on_track ? (
                                <span className="badge bg-success">
                                    <i className="bx bx-trending-up me-1"></i>
                                    On Track
                                </span>
                            ) : (
                                <span className="badge bg-warning">
                                    <i className="bx bx-trending-down me-1"></i>
                                    Behind Schedule
                                </span>
                            )}
                        </div>
                        <div className="card-body">
                            {targetData?.current_target ? (
                                <>
                                    {/* Target Period Info */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h6 className="text-muted mb-1">Target Period</h6>
                                            <p className="mb-0">
                                                {targetData.current_target.period_type?.toUpperCase()} Target
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <h6 className="text-muted mb-1">Days Remaining</h6>
                                            <h3 className={`mb-0 ${targetData.days_remaining <= 5 ? 'text-danger' : 'text-primary'}`}>
                                                {targetData.days_remaining}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Student Target */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-semibold">Student Registration Target</span>
                                            <span>
                                                <strong>{targetData.students_achieved}</strong> / {targetData.student_target}
                                            </span>
                                        </div>
                                        <div className="progress" style={{ height: "12px" }}>
                                            <div
                                                className={`progress-bar bg-${getProgressColor(targetData.student_progress_percentage)}`}
                                                style={{ width: `${Math.min(targetData.student_progress_percentage, 100)}%` }}
                                            >
                                                {targetData.student_progress_percentage >= 10 && (
                                                    <span>{targetData.student_progress_percentage}%</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                            <small className="text-muted">0</small>
                                            <small className={`text-${getProgressColor(targetData.student_progress_percentage)}`}>
                                                {targetData.student_progress_percentage}% Complete
                                            </small>
                                            <small className="text-muted">{targetData.student_target}</small>
                                        </div>
                                    </div>

                                    {/* Commission Target */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-semibold">Commission Target</span>
                                            <span>
                                                <strong>{formatCurrency(targetData.commission_achieved)}</strong> / {formatCurrency(targetData.commission_target)}
                                            </span>
                                        </div>
                                        <div className="progress" style={{ height: "12px" }}>
                                            <div
                                                className={`progress-bar bg-${getProgressColor(targetData.commission_progress_percentage)}`}
                                                style={{ width: `${Math.min(targetData.commission_progress_percentage, 100)}%` }}
                                            >
                                                {targetData.commission_progress_percentage >= 10 && (
                                                    <span>{targetData.commission_progress_percentage}%</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                            <small className="text-muted">0</small>
                                            <small className={`text-${getProgressColor(targetData.commission_progress_percentage)}`}>
                                                {targetData.commission_progress_percentage}% Complete
                                            </small>
                                            <small className="text-muted">{formatCurrency(targetData.commission_target)}</small>
                                        </div>
                                    </div>

                                    {/* Bonus Info */}
                                    {targetData.current_target.bonus_amount > 0 && (
                                        <div className="alert alert-success mb-0">
                                            <i className="bx bx-gift me-2"></i>
                                            <strong>Bonus:</strong> Earn {formatCurrency(targetData.current_target.bonus_amount)} bonus upon achieving this target!
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-target-lock text-muted" style={{ fontSize: "4rem" }}></i>
                                    <h5 className="mt-3">No Active Target</h5>
                                    <p className="text-muted">
                                        You don't have an active target set for the current period.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Badges & Achievements */}
                <div className="col-lg-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bx bx-medal me-2"></i>
                                My Badges
                            </h5>
                        </div>
                        <div className="card-body">
                            {badges.length > 0 ? (
                                <div className="row g-3">
                                    {badges.slice(0, 6).map((badge) => (
                                        <div key={badge.uid} className="col-6">
                                            <div className="text-center p-2 bg-light rounded">
                                                <i className={`bx ${getBadgeIcon(badge.badge_type)} text-warning`} style={{ fontSize: "2rem" }}></i>
                                                <p className="mb-0 small mt-1">{badge.badge_name}</p>
                                                <small className="text-muted">+{badge.points_awarded} pts</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-medal text-muted" style={{ fontSize: "3rem" }}></i>
                                    <p className="text-muted mb-0 mt-2">No badges earned yet</p>
                                    <small className="text-muted">Register students to earn badges!</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bx bx-trophy me-2 text-warning"></i>
                                Monthly Leaderboard
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Recruiter</th>
                                            <th>Students</th>
                                            <th>Commission</th>
                                            <th>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.length > 0 ? (
                                            leaderboard.map((entry, index) => (
                                                <tr key={entry.uid || index}>
                                                    <td>
                                                        {entry.rank <= 3 ? (
                                                            <span className={`badge bg-${getRankColor(entry.rank)}`}>
                                                                {entry.rank === 1 && <i className="bx bx-trophy me-1"></i>}
                                                                #{entry.rank}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">#{entry.rank}</span>
                                                        )}
                                                        {entry.rank_change !== 0 && (
                                                            <small className={`ms-1 ${entry.rank_change > 0 ? 'text-success' : 'text-danger'}`}>
                                                                {entry.rank_change > 0 ? '↑' : '↓'}
                                                            </small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-sm me-2">
                                                                <span className="avatar-initial rounded-circle bg-label-primary">
                                                                    {entry.recruiter_details?.name?.charAt(0) || "?"}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <strong>{entry.recruiter_details?.name}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {entry.recruiter_details?.employee_id}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{entry.total_students}</td>
                                                    <td>{formatCurrency(entry.total_commission)}</td>
                                                    <td>
                                                        <span className="badge bg-label-primary">
                                                            {entry.total_points} pts
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4">
                                                    <p className="text-muted mb-0">No leaderboard data available</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Functions
const getBadgeIcon = (type) => {
    const icons = {
        first_student: "bx-star",
        ten_students: "bxs-star",
        fifty_students: "bxs-crown",
        hundred_students: "bx-medal",
        first_commission: "bx-dollar",
        target_achieved: "bx-bullseye",
        quarterly_champion: "bx-trophy",
        top_performer: "bx-trending-up",
        consistent_performer: "bx-line-chart",
        rising_star: "bx-rocket",
    };
    return icons[type] || "bx-badge";
};

const getRankColor = (rank) => {
    if (rank === 1) return "warning";
    if (rank === 2) return "secondary";
    if (rank === 3) return "danger";
    return "primary";
};

export default TargetProgress;
