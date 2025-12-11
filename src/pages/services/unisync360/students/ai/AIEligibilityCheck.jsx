import React, { useState, useEffect } from 'react';
import { checkAIEligibility } from './AIQueries';
import FormikSelect from '../../../../../components/ui-templates/form-components/FormikSelect';
import { Formik, Form, Field } from 'formik';

const AIEligibilityCheck = ({ studentId, studentName }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCheckEligibility = async (values) => {
        setLoading(true);
        setError(null);
        setResult(null);
        
        try {
            const response = await checkAIEligibility({
                student_uid: studentId,
                country_uid: values.country || null,
                university_uid: values.university || null,
                course_uid: values.program || null,
            });
            
            if (response.status === 8000) {
                setResult(response.data);
            } else {
                setError(response.message || 'Failed to check eligibility');
            }
        } catch (err) {
            setError('Failed to check eligibility');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PASS': return { icon: 'bx-check-circle', color: 'success' };
            case 'FAIL': return { icon: 'bx-x-circle', color: 'danger' };
            case 'WARNING': return { icon: 'bx-error', color: 'warning' };
            default: return { icon: 'bx-question-mark', color: 'secondary' };
        }
    };

    const getOverallStatusColor = (overallEligible) => {
        if (overallEligible === true) return 'success';
        if (overallEligible === false) return 'danger';
        return 'warning';
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-gradient-info text-white d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                <i className="bx bx-check-shield fs-4 me-2"></i>
                <h5 className="mb-0">AI Eligibility Check</h5>
            </div>
            <div className="card-body">
                <Formik
                    initialValues={{ country: '', university: '', program: '' }}
                    onSubmit={handleCheckEligibility}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <FormikSelect
                                        name="country"
                                        label="Target Country"
                                        url="/countries/"
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 200, paginated: true }}
                                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                                        placeholder="Select Country"
                                        onChange={(option) => {
                                            setFieldValue('country', option?.value || '');
                                            setFieldValue('university', '');
                                        }}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <FormikSelect
                                        name="university"
                                        label="Target University"
                                        url="/unisync360-institutions/universities/"
                                        containerClass="mb-0"
                                        filters={{ 
                                            page: 1, 
                                            page_size: 100, 
                                            paginated: true,
                                            ...(values.country && { country: values.country })
                                        }}
                                        mapOption={(item) => ({ value: item.uid, label: item.name })}
                                        placeholder="Select University"
                                        isDisabled={!values.country}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <FormikSelect
                                        name="program"
                                        label="Target Program"
                                        url="/unisync360-academic/university-courses/"
                                        containerClass="mb-0"
                                        filters={{ 
                                            page: 1, 
                                            page_size: 100, 
                                            paginated: true,
                                            ...(values.university && { university: values.university })
                                        }}
                                        mapOption={(item) => ({ value: item.uid, label: item.course_name })}
                                        placeholder="Select Program"
                                        isDisabled={!values.university}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Analyzing Eligibility...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-analyse me-1"></i>
                                        Check Eligibility
                                    </>
                                )}
                            </button>
                        </Form>
                    )}
                </Formik>

                {error && (
                    <div className="alert alert-danger mt-4 d-flex align-items-center">
                        <i className="bx bx-error-circle me-2"></i>
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-4 animate__animated animate__fadeIn">
                        {/* Overall Status */}
                        <div className={`alert alert-${getOverallStatusColor(result.overall_eligible)} d-flex align-items-center justify-content-between mb-4`}>
                            <div className="d-flex align-items-center">
                                <i className={`bx ${result.overall_eligible ? 'bx-check-circle' : 'bx-x-circle'} fs-3 me-3`}></i>
                                <div>
                                    <h5 className="mb-0">
                                        {result.overall_eligible ? 'Eligible' : 'Not Eligible'}
                                    </h5>
                                    <small>Overall eligibility assessment for {studentName}</small>
                                </div>
                            </div>
                            <div className="text-end">
                                <span className="fs-4 fw-bold">{result.confidence_score}%</span>
                                <small className="d-block">Confidence</small>
                            </div>
                        </div>

                        {/* Detailed Checks */}
                        <div className="row g-4">
                            {result.checks?.map((check, idx) => {
                                const status = getStatusIcon(check.status);
                                return (
                                    <div key={idx} className="col-md-6">
                                        <div className={`card border-${status.color} h-100`}>
                                            <div className={`card-header bg-${status.color} bg-opacity-10 border-bottom-0`}>
                                                <div className="d-flex align-items-center">
                                                    <i className={`bx ${status.icon} text-${status.color} fs-4 me-2`}></i>
                                                    <h6 className="mb-0">{check.category}</h6>
                                                    <span className={`badge bg-${status.color} ms-auto`}>
                                                        {check.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <p className="mb-3 text-muted small">{check.message}</p>
                                                
                                                {check.details && check.details.length > 0 && (
                                                    <ul className="list-unstyled mb-0 small">
                                                        {check.details.map((detail, i) => (
                                                            <li key={i} className="mb-1 d-flex align-items-start">
                                                                <i className={`bx bx-${detail.met ? 'check text-success' : 'x text-danger'} me-2 mt-1`}></i>
                                                                <span>{detail.requirement}: <strong>{detail.student_value || 'N/A'}</strong></span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {check.recommendations && check.recommendations.length > 0 && (
                                                    <div className="mt-3 pt-3 border-top">
                                                        <small className="text-primary fw-bold">
                                                            <i className="bx bx-bulb me-1"></i>
                                                            Recommendations:
                                                        </small>
                                                        <ul className="mb-0 small ps-3 mt-1">
                                                            {check.recommendations.map((rec, i) => (
                                                                <li key={i}>{rec}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Actions */}
                        {result.action_items && result.action_items.length > 0 && (
                            <div className="mt-4 p-3 bg-light rounded">
                                <h6 className="fw-bold mb-3">
                                    <i className="bx bx-task me-1"></i>
                                    Required Actions to Improve Eligibility
                                </h6>
                                <div className="row g-2">
                                    {result.action_items.map((action, idx) => (
                                        <div key={idx} className="col-md-6">
                                            <div className="d-flex align-items-start bg-white p-2 rounded border">
                                                <span className={`badge bg-${action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'info'} me-2`}>
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <span className="small">{action.action}</span>
                                                    {action.deadline && (
                                                        <small className="text-muted d-block">
                                                            <i className="bx bx-calendar me-1"></i>
                                                            {action.deadline}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIEligibilityCheck;
