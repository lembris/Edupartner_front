import React, { useState, useEffect } from 'react';
import { getAIDeparturePlan, regenerateAIDeparturePlan, updateDepartureChecklistItem } from './AIQueries';
import showToast from '../../../../../helpers/ToastHelper';

const AIDeparturePlanner = ({ studentId, studentName }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [expandedPhase, setExpandedPhase] = useState(0);
    const [updatingItems, setUpdatingItems] = useState({});

    useEffect(() => {
        fetchDeparturePlan();
    }, [studentId]);

    const fetchDeparturePlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAIDeparturePlan(studentId);
            if (response.status === 8000) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch departure plan');
            }
        } catch (err) {
            setError('Failed to fetch AI departure plan');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await regenerateAIDeparturePlan(studentId);
            if (response.status === 8000) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to regenerate plan');
            }
        } catch (err) {
            setError('Failed to regenerate departure plan');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleChecklistItem = async (itemUid, currentCompleted) => {
        setUpdatingItems(prev => ({ ...prev, [itemUid]: true }));
        try {
            const response = await updateDepartureChecklistItem(itemUid, {
                completed: !currentCompleted
            });
            
            if (response.status === 8000) {
                // Update local state
                setData(prevData => ({
                    ...prevData,
                    checklist: prevData.checklist.map(item => 
                        item.uid === itemUid 
                            ? { ...item, completed: !currentCompleted, completed_date: response.data.completed_date }
                            : item
                    ),
                    progress: {
                        ...prevData.progress,
                        completed: !currentCompleted 
                            ? prevData.progress.completed + 1 
                            : prevData.progress.completed - 1,
                        percentage: ((!currentCompleted 
                            ? prevData.progress.completed + 1 
                            : prevData.progress.completed - 1) / prevData.progress.total) * 100
                    }
                }));
                showToast('success', `Item marked as ${!currentCompleted ? 'completed' : 'pending'}`);
            } else {
                showToast('error', response.message || 'Failed to update item');
            }
        } catch (err) {
            showToast('error', 'Failed to update checklist item');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemUid]: false }));
        }
    };

    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'documents': return 'bx-file';
            case 'visa': return 'bx-id-card';
            case 'travel': return 'bx-plane-take-off';
            case 'health': return 'bx-plus-medical';
            case 'accommodation': return 'bx-home';
            case 'finance': return 'bx-wallet';
            case 'essentials': return 'bx-package';
            default: return 'bx-check-square';
        }
    };

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'documents': return 'primary';
            case 'visa': return 'info';
            case 'travel': return 'success';
            case 'health': return 'danger';
            case 'accommodation': return 'warning';
            case 'finance': return 'secondary';
            case 'essentials': return 'dark';
            default: return 'primary';
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'secondary';
        }
    };

    const parseValue = (val) => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'object' && val.parsedValue !== undefined) return val.parsedValue;
        if (typeof val === 'object' && val.source !== undefined) return parseFloat(val.source);
        return val;
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-gradient-warning text-white d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <i className="bx bx-calendar-check fs-4 me-2"></i>
                    <h5 className="mb-0">AI Pre-Departure Planner</h5>
                </div>
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Generating personalized departure plan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-gradient-warning text-white d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <i className="bx bx-calendar-check fs-4 me-2"></i>
                    <h5 className="mb-0">AI Pre-Departure Planner</h5>
                </div>
                <div className="card-body">
                    <div className="alert alert-warning d-flex align-items-center mb-0">
                        <i className="bx bx-info-circle me-2"></i>
                        <div>
                            <strong>Plan Not Available</strong>
                            <p className="mb-0 small">{error}</p>
                        </div>
                    </div>
                    <button className="btn btn-outline-primary btn-sm mt-3" onClick={fetchDeparturePlan}>
                        <i className="bx bx-refresh me-1"></i> Retry
                    </button>
                </div>
            </div>
        );
    }

    const progressPercentage = parseValue(data?.progress?.percentage);

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div className="d-flex align-items-center">
                    <i className="bx bx-calendar-check fs-4 me-2"></i>
                    <h5 className="mb-0">AI Pre-Departure Planner</h5>
                </div>
                <div>
                    <button className="btn btn-sm btn-light" onClick={handleRegenerate} title="Regenerate Plan">
                        <i className="bx bx-revision me-1"></i> Regenerate
                    </button>
                </div>
            </div>
            <div className="card-body">
                {/* Destination Info */}
                {data?.destination && (
                    <div className="bg-light rounded p-3 mb-4">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <small className="text-muted d-block">
                                    <i className="bx bx-buildings me-1"></i> University
                                </small>
                                <span className="fw-bold">{data.destination.university || 'N/A'}</span>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted d-block">
                                    <i className="bx bx-globe me-1"></i> Country
                                </small>
                                <span className="fw-bold">{data.destination.country || 'N/A'}</span>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted d-block">
                                    <i className="bx bx-book me-1"></i> Course
                                </small>
                                <span className="fw-bold">{data.course_details?.course_name || 'N/A'}</span>
                                {data.course_details?.intake_period && (
                                    <span className="badge bg-primary ms-2">{data.course_details.intake_period}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {data?.progress && (
                    <div className="mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            <small className="text-muted">Overall Progress</small>
                            <small className="fw-bold">
                                {data.progress.completed}/{data.progress.total} tasks ({progressPercentage}%)
                            </small>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                            <div 
                                className={`progress-bar ${progressPercentage >= 70 ? 'bg-success' : progressPercentage >= 40 ? 'bg-warning' : 'bg-danger'}`}
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Checklist Section */}
                <h6 className="fw-bold mb-3">
                    <i className="bx bx-list-check me-1"></i>
                    Pre-Departure Checklist
                </h6>
                
                {data?.checklist?.length > 0 ? (
                    <div className="list-group list-group-flush mb-4">
                        {data.checklist.map((item, idx) => {
                            const isUpdating = updatingItems[item.uid];
                            return (
                                <div key={item.uid || idx} className="list-group-item d-flex align-items-start p-3 border rounded mb-2">
                                    <div className="form-check me-3">
                                        {isUpdating ? (
                                            <div className="spinner-border spinner-border-sm text-primary" style={{ width: '20px', height: '20px' }}></div>
                                        ) : (
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => handleToggleChecklistItem(item.uid, item.completed)}
                                                style={{ 
                                                    width: '20px', 
                                                    height: '20px',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-start justify-content-between">
                                            <div>
                                                <h6 className={`mb-1 ${item.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                                                    <i className={`bx ${getCategoryIcon(item.category)} me-2 text-${getCategoryColor(item.category)}`}></i>
                                                    {item.item}
                                                </h6>
                                                {item.notes && (
                                                    <p className="mb-0 small text-muted">
                                                        <i className="bx bx-info-circle me-1"></i>
                                                        {item.notes}
                                                    </p>
                                                )}
                                                {item.completed && item.completed_date && (
                                                    <small className="text-success">
                                                        <i className="bx bx-check-double me-1"></i>
                                                        Completed: {new Date(item.completed_date).toLocaleDateString()}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="d-flex gap-2">
                                                <span className={`badge bg-${getPriorityBadge(item.priority)}`}>
                                                    {item.priority}
                                                </span>
                                                <span className={`badge bg-${item.completed ? 'success' : 'secondary'}`}>
                                                    {item.completed ? 'Done' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 bg-light rounded mb-4">
                        <i className="bx bx-list-ul fs-1 text-muted"></i>
                        <p className="text-muted mb-0 mt-2">No checklist items available.</p>
                    </div>
                )}

                {/* Timeline Section */}
                <h6 className="fw-bold mb-3">
                    <i className="bx bx-time-five me-1"></i>
                    Departure Timeline
                </h6>

                {data?.timeline?.length > 0 ? (
                    <div className="accordion" id="timelineAccordion">
                        {data.timeline.map((phase, idx) => {
                            const isExpanded = expandedPhase === idx;
                            
                            return (
                                <div key={idx} className="accordion-item border mb-2 rounded overflow-hidden">
                                    <h2 className="accordion-header">
                                        <button
                                            className={`accordion-button ${!isExpanded ? 'collapsed' : ''}`}
                                            type="button"
                                            onClick={() => setExpandedPhase(isExpanded ? -1 : idx)}
                                        >
                                            <div className="d-flex align-items-center w-100">
                                                <div className="avatar avatar-sm bg-primary rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                    <span className="text-white fw-bold">{idx + 1}</span>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-0">{phase.phase}</h6>
                                                    <small className="text-muted">
                                                        {phase.tasks?.length || 0} tasks
                                                    </small>
                                                </div>
                                                <div className="me-3">
                                                    <span className="badge bg-label-primary">
                                                        <i className="bx bx-calendar me-1"></i>
                                                        {phase.weeks_before} weeks before
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    </h2>
                                    <div className={`accordion-collapse collapse ${isExpanded ? 'show' : ''}`}>
                                        <div className="accordion-body">
                                            <ul className="list-unstyled mb-0">
                                                {phase.tasks?.map((task, taskIdx) => (
                                                    <li key={taskIdx} className="d-flex align-items-center py-2 border-bottom">
                                                        <i className="bx bx-chevron-right text-primary me-2"></i>
                                                        <span>{task}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 bg-light rounded">
                        <i className="bx bx-calendar fs-1 text-muted"></i>
                        <p className="text-muted mb-0 mt-2">No timeline available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIDeparturePlanner;
