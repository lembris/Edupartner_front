import React, { useState, useEffect } from 'react';
import { getAICourseRecommendations } from './AIQueries';

const AICourseRecommendations = ({ studentId, studentName, onApplyCourse, onViewCourse }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [expandedCourse, setExpandedCourse] = useState(null);

    const handleApplyNow = (e, prediction) => {
        e.stopPropagation();
        if (onApplyCourse) {
            onApplyCourse(prediction.course?.uid);
        }
    };

    const handleViewDetails = (e, prediction) => {
        e.stopPropagation();
        if (onViewCourse) {
            onViewCourse(prediction.course?.uid);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [studentId]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAICourseRecommendations(studentId);
            if (response.status === 8000) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch recommendations');
            }
        } catch (err) {
            setError('Failed to fetch AI recommendations');
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'info';
        if (score >= 40) return 'warning';
        return 'danger';
    };

    const getConfidenceLabel = (score) => {
        if (score >= 80) return 'High Match';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Moderate';
        return 'Low Match';
    };

    const parseValue = (val) => {
        if (val === null || val === undefined) return null;
        if (typeof val === 'object' && val.parsedValue !== undefined) return val.parsedValue;
        if (typeof val === 'object' && val.source !== undefined) return parseFloat(val.source);
        return val;
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-gradient-primary text-white d-flex align-items-center">
                    <i className="bx bx-brain fs-4 me-2"></i>
                    <h5 className="mb-0">AI Course Recommendations</h5>
                </div>
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Analyzing student profile and predicting suitable courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-gradient-primary text-white d-flex align-items-center">
                    <i className="bx bx-brain fs-4 me-2"></i>
                    <h5 className="mb-0">AI Course Recommendations</h5>
                </div>
                <div className="card-body">
                    <div className="alert alert-warning d-flex align-items-center mb-0">
                        <i className="bx bx-info-circle me-2"></i>
                        <div>
                            <strong>Insufficient Data</strong>
                            <p className="mb-0 small">{error}. Please ensure the student has academic history and NECTA results.</p>
                        </div>
                    </div>
                    <button className="btn btn-outline-primary btn-sm mt-3" onClick={fetchRecommendations}>
                        <i className="bx bx-refresh me-1"></i> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="d-flex align-items-center">
                    <i className="bx bx-brain fs-4 me-2"></i>
                    <h5 className="mb-0">AI Course Recommendations</h5>
                </div>
                <button className="btn btn-sm btn-light" onClick={fetchRecommendations} title="Refresh">
                    <i className="bx bx-refresh"></i>
                </button>
            </div>
            <div className="card-body">
                {/* Student Academic Summary */}
                {data?.academic_summary && (
                    <div className="bg-light rounded p-3 mb-4">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <small className="text-muted d-block">Current GPA</small>
                                <span className="fw-bold fs-5">{data.academic_summary.gpa || 'N/A'}</span>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted d-block">Strong Subjects</small>
                                <div className="d-flex flex-wrap gap-1">
                                    {data.academic_summary.strong_subjects?.slice(0, 3).map((subject, idx) => (
                                        <span key={idx} className="badge bg-success">{subject}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted d-block">Model Confidence</small>
                                <div className="d-flex align-items-center">
                                    <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                        <div 
                                            className={`progress-bar bg-${getConfidenceColor(data.confidence_score)}`}
                                            style={{ width: `${data.confidence_score}%` }}
                                        ></div>
                                    </div>
                                    <span className="ms-2 fw-bold">{data.confidence_score}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommended Courses */}
                <h6 className="fw-bold mb-3">
                    <i className="bx bx-list-check me-1"></i> 
                    Top Recommended Courses ({data?.total_predictions || 0})
                </h6>
                
                {data?.predictions?.length > 0 ? (
                    <div className="row g-3">
                        {data.predictions.map((prediction, idx) => {
                            const matchScore = parseValue(prediction.scores?.overall_match) || 0;
                            const tuitionFee = parseValue(prediction.estimated_cost?.tuition_fee);
                            const totalCost = parseValue(prediction.estimated_cost?.total);
                            
                            return (
                                <div key={prediction.uid || idx} className="col-12">
                                    <div 
                                        className={`card border ${expandedCourse === idx ? 'border-primary' : ''} h-100`}
                                        onClick={() => setExpandedCourse(expandedCourse === idx ? null : idx)}
                                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className={`badge bg-${getConfidenceColor(matchScore)} me-2`}>
                                                            #{idx + 1}
                                                        </span>
                                                        <h6 className="mb-0">{prediction.course?.name}</h6>
                                                    </div>
                                                    <p className="text-muted mb-2 small">
                                                        <i className="bx bx-buildings me-1"></i>
                                                        {prediction.course?.university} • {prediction.course?.country}
                                                    </p>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        <span className="badge bg-label-info">
                                                            <i className="bx bx-target-lock me-1"></i>
                                                            {prediction.admission_probability?.toFixed(0)}% Admission
                                                        </span>
                                                        {tuitionFee && (
                                                            <span className="badge bg-label-success">
                                                                <i className="bx bx-dollar me-1"></i>
                                                                ${tuitionFee.toLocaleString()} Tuition
                                                            </span>
                                                        )}
                                                        {totalCost && (
                                                            <span className="badge bg-label-warning">
                                                                <i className="bx bx-wallet me-1"></i>
                                                                ${totalCost.toLocaleString()} Total
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className={`badge bg-${getConfidenceColor(matchScore)} fs-6 mb-2`}>
                                                        {matchScore.toFixed(0)}%
                                                    </div>
                                                    <div className="text-muted small">
                                                        {getConfidenceLabel(matchScore)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedCourse === idx && (
                                                <div className="mt-3 pt-3 border-top animate__animated animate__fadeIn">
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <h6 className="small fw-bold text-primary mb-2">
                                                                <i className="bx bx-check-circle me-1"></i>
                                                                Why This Course?
                                                            </h6>
                                                            <p className="small text-muted mb-0">
                                                                {prediction.recommendation_reason || 'Based on your academic profile and preferences.'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="small fw-bold text-primary mb-2">
                                                                <i className="bx bx-bar-chart me-1"></i>
                                                                Score Breakdown
                                                            </h6>
                                                            <div className="small">
                                                                {prediction.scores && Object.entries(prediction.scores)
                                                                    .filter(([key]) => key !== 'overall_match')
                                                                    .map(([key, value]) => {
                                                                        const score = parseValue(value) || 0;
                                                                        return (
                                                                            <div key={key} className="d-flex justify-content-between mb-1">
                                                                                <span className="text-capitalize">{key.replace(/_/g, ' ')}</span>
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="progress" style={{ width: '60px', height: '6px' }}>
                                                                                        <div 
                                                                                            className={`progress-bar bg-${getConfidenceColor(score)}`}
                                                                                            style={{ width: `${score}%` }}
                                                                                        ></div>
                                                                                    </div>
                                                                                    <span className="ms-2">{score.toFixed(0)}%</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <button 
                                                            className="btn btn-sm btn-primary me-2" 
                                                            onClick={(e) => handleApplyNow(e, prediction)}
                                                        >
                                                            <i className="bx bx-plus me-1"></i> Apply Now
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary" 
                                                            onClick={(e) => handleViewDetails(e, prediction)}
                                                        >
                                                            <i className="bx bx-info-circle me-1"></i> View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 bg-light rounded">
                        <i className="bx bx-search-alt fs-1 text-muted"></i>
                        <p className="text-muted mb-0 mt-2">No course recommendations available yet.</p>
                        <small className="text-muted">Add academic history to get AI-powered recommendations.</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AICourseRecommendations;

