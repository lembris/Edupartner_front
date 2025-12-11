import React, { useState, useEffect } from 'react';
import { getAIStudentSuccessScore } from './AIQueries';

const AIStudentSuccessScore = ({ studentId, studentName }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        fetchSuccessScore();
    }, [studentId]);

    const fetchSuccessScore = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAIStudentSuccessScore(studentId);
            if (response.status === 8000) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to calculate score');
            }
        } catch (err) {
            setError('Failed to fetch success score');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'info';
        if (score >= 40) return 'warning';
        return 'danger';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    const getScoreEmoji = (score) => {
        if (score >= 80) return '🌟';
        if (score >= 60) return '👍';
        if (score >= 40) return '📈';
        return '💪';
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header text-white d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <i className="bx bx-trophy fs-4 me-2"></i>
                    <h6 className="mb-0">AI Success Score</h6>
                </div>
                <div className="card-body text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <p className="small text-muted mb-0 mt-2">Calculating success probability...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header text-white d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <i className="bx bx-trophy fs-4 me-2"></i>
                    <h6 className="mb-0">AI Success Score</h6>
                </div>
                <div className="card-body">
                    <div className="alert alert-light mb-0 small">
                        <i className="bx bx-info-circle me-1"></i> {error}
                    </div>
                </div>
            </div>
        );
    }

    const overallScore = data?.overall_success_score || 0;
    const profileCompleteness = data?.profile_completeness || 0;
    const scoreBreakdown = data?.score_breakdown || {};
    const recommendations = data?.recommendations || [];
    const predictions = data?.predictions || [];
    const successLevel = data?.success_level || 'unknown';

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="d-flex align-items-center">
                    <i className="bx bx-trophy fs-4 me-2"></i>
                    <h6 className="mb-0">AI Success Score</h6>
                </div>
                <button className="btn btn-sm btn-light" onClick={fetchSuccessScore}>
                    <i className="bx bx-refresh"></i>
                </button>
            </div>
            <div className="card-body">
                {/* Main Score Circle */}
                <div className="text-center mb-3">
                    <div className="position-relative d-inline-block">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#e9ecef"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={`var(--bs-${getScoreColor(overallScore)})`}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${overallScore * 2.83} 283`}
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                            />
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle text-center">
                            <span className="fs-3 fw-bold">{Math.round(overallScore)}</span>
                            <span className="small d-block text-muted">/100</span>
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className={`badge bg-${getScoreColor(overallScore)} fs-6`}>
                            {getScoreEmoji(overallScore)} {getScoreLabel(overallScore)}
                        </span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <div className="bg-light rounded p-2 text-center">
                            <small className="text-muted d-block">Profile Complete</small>
                            <div className="d-flex align-items-center justify-content-center mt-1">
                                <span className={`fw-bold text-${getScoreColor(profileCompleteness)}`}>
                                    {Math.round(profileCompleteness)}%
                                </span>
                            </div>
                            <div className="progress mt-1" style={{ height: '4px' }}>
                                <div 
                                    className={`progress-bar bg-${getScoreColor(profileCompleteness)}`}
                                    style={{ width: `${profileCompleteness}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="bg-light rounded p-2 text-center">
                            <small className="text-muted d-block">Admission Ready</small>
                            <div className="d-flex align-items-center justify-content-center mt-1">
                                <span className={`fw-bold text-${getScoreColor(scoreBreakdown.admission_readiness || 0)}`}>
                                    {Math.round(scoreBreakdown.admission_readiness || 0)}%
                                </span>
                            </div>
                            <div className="progress mt-1" style={{ height: '4px' }}>
                                <div 
                                    className={`progress-bar bg-${getScoreColor(scoreBreakdown.admission_readiness || 0)}`}
                                    style={{ width: `${scoreBreakdown.admission_readiness || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown Toggle */}
                <button
                    className="btn btn-sm btn-link text-decoration-none p-0 w-100 text-start"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                >
                    <i className={`bx bx-chevron-${showBreakdown ? 'up' : 'down'} me-1`}></i>
                    <small className="fw-bold">Score Breakdown</small>
                </button>

                {showBreakdown && scoreBreakdown && Object.keys(scoreBreakdown).length > 0 && (
                    <div className="mt-2 small animate__animated animate__fadeIn">
                        {Object.entries(scoreBreakdown).map(([key, value], idx) => (
                            <div key={idx} className="mb-2">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className="fw-bold">{Math.round(value)}%</span>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div 
                                        className={`progress-bar bg-${getScoreColor(value)}`}
                                        style={{ width: `${value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Latest Predictions */}
                {predictions.length > 0 && (
                    <div className="mt-3">
                        <small className="fw-bold text-primary d-block mb-1">
                            <i className="bx bx-brain me-1"></i> Latest Prediction
                        </small>
                        <div className="bg-light rounded p-2 small">
                            <div className="fw-medium">{predictions[0].course?.name}</div>
                            <div className="text-muted">{predictions[0].course?.university}</div>
                            <div className="d-flex gap-2 mt-1">
                                <span className={`badge bg-${getScoreColor(predictions[0].scores?.admission_chance || 0)}`}>
                                    Admission: {Math.round(predictions[0].scores?.admission_chance || 0)}%
                                </span>
                                <span className={`badge bg-${getScoreColor(predictions[0].scores?.visa_success || 0)}`}>
                                    Visa: {Math.round(predictions[0].scores?.visa_success || 0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-3">
                        <small className="fw-bold text-warning d-block mb-1">
                            <i className="bx bx-bulb me-1"></i> Recommendations
                        </small>
                        <ul className="mb-0 ps-3 small">
                            {recommendations.slice(0, 3).map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Success Level Badge */}
                <div className="mt-3 pt-2 border-top text-center">
                    <span className={`badge bg-${successLevel === 'high' ? 'success' : successLevel === 'medium' ? 'warning' : 'danger'}`}>
                        <i className="bx bx-trending-up me-1"></i>
                        Success Level: {successLevel.charAt(0).toUpperCase() + successLevel.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AIStudentSuccessScore;
