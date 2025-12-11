import React, { useState, useEffect } from 'react';
import { getAIRiskAssessment } from './AIQueries';

const AIRiskAssessment = ({ studentId, studentName }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchRiskAssessment();
    }, [studentId]);

    const fetchRiskAssessment = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAIRiskAssessment(studentId);
            if (response.status === 8000) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to assess risks');
            }
        } catch (err) {
            setError('Failed to fetch risk assessment');
        } finally {
            setLoading(false);
        }
    };

    const getRiskLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'critical': return 'dark';
            default: return 'secondary';
        }
    };

    const getRiskLevelIcon = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'bx-shield-quarter';
            case 'medium': return 'bx-shield-x';
            case 'high': return 'bx-error';
            case 'critical': return 'bx-error-alt';
            default: return 'bx-shield';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'low': return 'info';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-danger text-white d-flex align-items-center">
                    <i className="bx bx-shield-alt-2 fs-4 me-2"></i>
                    <h6 className="mb-0">AI Risk Assessment</h6>
                </div>
                <div className="card-body text-center py-4">
                    <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                    <p className="small text-muted mb-0 mt-2">Analyzing risks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-danger text-white d-flex align-items-center">
                    <i className="bx bx-shield-alt-2 fs-4 me-2"></i>
                    <h6 className="mb-0">AI Risk Assessment</h6>
                </div>
                <div className="card-body">
                    <div className="alert alert-light mb-0 small">
                        <i className="bx bx-info-circle me-1"></i> {error}
                    </div>
                </div>
            </div>
        );
    }

    const riskLevel = data?.risk_level || 'unknown';
    const riskFactors = data?.risk_factors || [];
    const recommendations = data?.recommendations || [];
    const scores = data?.scores || {};
    const hasPrediction = data?.has_prediction || false;
    const courseInfo = data?.course_info;

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <i className="bx bx-shield-alt-2 fs-4 me-2"></i>
                    <h6 className="mb-0">AI Risk Assessment</h6>
                </div>
                <button className="btn btn-sm btn-light" onClick={fetchRiskAssessment}>
                    <i className="bx bx-refresh"></i>
                </button>
            </div>
            <div className="card-body">
                {/* Overall Risk Indicator */}
                <div className="text-center mb-3">
                    <div className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${getRiskLevelColor(riskLevel)} bg-opacity-10`} style={{ width: '70px', height: '70px' }}>
                        <i className={`bx ${getRiskLevelIcon(riskLevel)} fs-1 text-${getRiskLevelColor(riskLevel)}`}></i>
                    </div>
                    <h5 className={`mb-0 mt-2 text-${getRiskLevelColor(riskLevel)} text-capitalize`}>
                        {riskLevel} Risk
                    </h5>
                    {hasPrediction && data?.confidence_level && (
                        <small className="text-muted">Confidence: {Math.round(data.confidence_level)}%</small>
                    )}
                </div>

                {/* Prediction Scores */}
                {hasPrediction && Object.keys(scores).length > 0 && (
                    <div className="row g-2 mb-3">
                        {scores.admission_chance !== undefined && (
                            <div className="col-4 text-center">
                                <div className="bg-primary bg-opacity-10 rounded p-2">
                                    <small className="d-block text-muted">Admission</small>
                                    <span className="fw-bold text-primary">{Math.round(scores.admission_chance)}%</span>
                                </div>
                            </div>
                        )}
                        {scores.visa_success_probability !== undefined && (
                            <div className="col-4 text-center">
                                <div className="bg-info bg-opacity-10 rounded p-2">
                                    <small className="d-block text-muted">Visa</small>
                                    <span className="fw-bold text-info">{Math.round(scores.visa_success_probability)}%</span>
                                </div>
                            </div>
                        )}
                        {scores.graduation_probability !== undefined && (
                            <div className="col-4 text-center">
                                <div className="bg-success bg-opacity-10 rounded p-2">
                                    <small className="d-block text-muted">Graduation</small>
                                    <span className="fw-bold text-success">{Math.round(scores.graduation_probability)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Course Info (if available) */}
                {courseInfo && (
                    <div className="bg-light rounded p-2 mb-3 text-center small">
                        <span className="fw-medium">{courseInfo.course_name}</span>
                        <span className="text-muted d-block">{courseInfo.university}</span>
                    </div>
                )}

                {/* Risk Factors */}
                {riskFactors.length > 0 && (
                    <div className="mb-3">
                        <small className="fw-bold d-block mb-2">
                            <i className="bx bx-flag me-1 text-danger"></i>
                            Risk Factors ({riskFactors.length})
                        </small>
                        <div className="list-group list-group-flush small" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {riskFactors.map((factor, idx) => (
                                <div key={idx} className={`list-group-item px-0 py-2 border-start border-4 border-${getSeverityColor(factor.severity)} ps-2`}>
                                    <div className="d-flex align-items-start justify-content-between">
                                        <span>{factor.factor}</span>
                                        <span className={`badge bg-${getSeverityColor(factor.severity)}`}>
                                            {factor.severity}
                                        </span>
                                    </div>
                                    {factor.score && (
                                        <small className="text-muted">Score: {factor.score}/10</small>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Risks State */}
                {riskFactors.length === 0 && (
                    <div className="text-center py-3 bg-success bg-opacity-10 rounded">
                        <i className="bx bx-check-shield fs-3 text-success"></i>
                        <p className="small text-success mb-0 mt-1">No significant risks detected</p>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-top">
                        <button 
                            className="btn btn-sm btn-link text-decoration-none p-0 w-100 text-start"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <i className={`bx bx-chevron-${showDetails ? 'up' : 'down'} me-1`}></i>
                            <small className="fw-bold text-primary">
                                Recommendations ({recommendations.length})
                            </small>
                        </button>
                        
                        {showDetails && (
                            <div className="mt-2 animate__animated animate__fadeIn">
                                <ul className="mb-0 ps-3 small">
                                    {recommendations.slice(0, 5).map((rec, idx) => (
                                        <li key={idx} className="mb-1">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIRiskAssessment;
