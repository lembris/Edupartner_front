import React, { useState, useEffect } from 'react';
import { getAIDocumentCheck } from './AIQueries';

const AIDocumentChecker = ({ studentId, studentName }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDocumentCheck();
    }, [studentId]);

    const fetchDocumentCheck = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAIDocumentCheck(studentId);
            if (response.status === 8000) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to check documents');
            }
        } catch (err) {
            setError('Failed to fetch document check');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return 'success';
            case 'submitted': return 'info';
            case 'pending': return 'warning';
            case 'missing': return 'danger';
            case 'expired': return 'danger';
            case 'expiring_soon': return 'warning';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return 'bx-check-circle';
            case 'submitted': return 'bx-upload';
            case 'pending': return 'bx-time';
            case 'missing': return 'bx-x-circle';
            case 'expired': return 'bx-error-circle';
            case 'expiring_soon': return 'bx-alarm';
            default: return 'bx-file';
        }
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-info text-white d-flex align-items-center">
                    <i className="bx bx-folder-open fs-4 me-2"></i>
                    <h6 className="mb-0">AI Document Checker</h6>
                </div>
                <div className="card-body text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <p className="small text-muted mb-0 mt-2">Scanning documents...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-info text-white d-flex align-items-center">
                    <i className="bx bx-folder-open fs-4 me-2"></i>
                    <h6 className="mb-0">AI Document Checker</h6>
                </div>
                <div className="card-body">
                    <div className="alert alert-light mb-0 small">
                        <i className="bx bx-info-circle me-1"></i> {error}
                    </div>
                </div>
            </div>
        );
    }

    const summary = data?.summary || {};
    const completeness = summary.completion_percentage || 0;
    const submittedCount = summary.total_submitted || 0;
    const pendingCount = summary.pending_verification || 0;
    const missingCount = summary.total_missing || 0;

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <i className="bx bx-folder-open fs-4 me-2"></i>
                    <h6 className="mb-0">AI Document Checker</h6>
                </div>
                <button className="btn btn-sm btn-light" onClick={fetchDocumentCheck}>
                    <i className="bx bx-refresh"></i>
                </button>
            </div>
            <div className="card-body">
                {/* Completeness Score */}
                <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                        <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: '80px',
                                height: '80px',
                                background: `conic-gradient(
                                    var(--bs-${completeness >= 80 ? 'success' : completeness >= 50 ? 'warning' : 'danger'}) ${completeness * 3.6}deg,
                                    #e9ecef ${completeness * 3.6}deg
                                )`
                            }}
                        >
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                <span className="fw-bold fs-5">{completeness}%</span>
                            </div>
                        </div>
                    </div>
                    <p className="small text-muted mt-2 mb-0">Document Completeness</p>
                </div>

                {/* Quick Stats */}
                <div className="row g-2 mb-3">
                    <div className="col-4 text-center">
                        <div className="bg-success bg-opacity-10 rounded p-2">
                            <span className="fw-bold text-success">{submittedCount}</span>
                            <small className="d-block text-muted">Submitted</small>
                        </div>
                    </div>
                    <div className="col-4 text-center">
                        <div className="bg-warning bg-opacity-10 rounded p-2">
                            <span className="fw-bold text-warning">{pendingCount}</span>
                            <small className="d-block text-muted">Pending</small>
                        </div>
                    </div>
                    <div className="col-4 text-center">
                        <div className="bg-danger bg-opacity-10 rounded p-2">
                            <span className="fw-bold text-danger">{missingCount}</span>
                            <small className="d-block text-muted">Missing</small>
                        </div>
                    </div>
                </div>

                {/* Missing Documents Alert */}
                {data?.missing_documents && data.missing_documents.length > 0 && (
                    <div className="alert alert-danger py-2 mb-3">
                        <small className="fw-bold d-block mb-1">
                            <i className="bx bx-error-circle me-1"></i>
                            Missing Documents ({data.missing_documents.length}):
                        </small>
                        <ul className="mb-0 ps-3 small">
                            {data.missing_documents.slice(0, 3).map((doc, idx) => (
                                <li key={idx}>
                                    {doc.name}
                                    {doc.is_required && <span className="badge bg-danger ms-1" style={{fontSize: '9px'}}>Required</span>}
                                </li>
                            ))}
                            {data.missing_documents.length > 3 && (
                                <li className="text-muted">+{data.missing_documents.length - 3} more</li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Expired Documents Alert */}
                {data?.expired_documents && data.expired_documents.length > 0 && (
                    <div className="alert alert-warning py-2 mb-3">
                        <small className="fw-bold d-block mb-1">
                            <i className="bx bx-alarm me-1"></i>
                            Expired Documents:
                        </small>
                        <ul className="mb-0 ps-3 small">
                            {data.expired_documents.map((doc, idx) => (
                                <li key={idx}>
                                    {doc.name} <span className="text-muted">(expired: {doc.expiry_date})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Submitted Documents List */}
                {data?.submitted_documents && data.submitted_documents.length > 0 && (
                    <div>
                        <small className="fw-bold text-muted d-block mb-2">Submitted Documents:</small>
                        <div className="list-group list-group-flush small" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {data.submitted_documents.map((doc, idx) => (
                                <div key={idx} className="list-group-item px-0 py-2 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <i className={`bx ${getStatusIcon(doc.verification_status)} text-${getStatusColor(doc.verification_status)} me-2`}></i>
                                        <span>{doc.name}</span>
                                    </div>
                                    <span className={`badge bg-${getStatusColor(doc.verification_status)}`}>
                                        {doc.verification_status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Verification */}
                {data?.pending_verification && data.pending_verification.length > 0 && (
                    <div className="mt-3 pt-3 border-top">
                        <small className="fw-bold text-warning d-block mb-2">
                            <i className="bx bx-time me-1"></i>
                            Pending Verification ({data.pending_verification.length}):
                        </small>
                        {data.pending_verification.slice(0, 3).map((doc, idx) => (
                            <div key={idx} className="d-flex align-items-center mb-1 small">
                                <i className="bx bx-file text-warning me-2"></i>
                                <span>{doc.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIDocumentChecker;
