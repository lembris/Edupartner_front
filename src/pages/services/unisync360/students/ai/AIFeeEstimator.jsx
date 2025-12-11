import React, { useState } from 'react';
import { getAIFeeEstimation } from './AIQueries';
import FormikSelect from '../../../../../components/ui-templates/form-components/FormikSelect';
import { Formik, Form, Field } from 'formik';

const AIFeeEstimator = ({ studentId, studentName }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleEstimate = async (values) => {
        if (!values.university_course) {
            setError('Please select a university course');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await getAIFeeEstimation({
                student_uid: studentId,
                course_uid: values.university_course,
                duration_years: parseInt(values.duration_years) || 1,
            });

            if (response.status === 8000) {
                setResult(response.data);
            } else {
                setError(response.message || 'Failed to estimate fees');
            }
        } catch (err) {
            setError('Failed to get fee estimation');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount, currency = 'USD') => {
        if (!amount && amount !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-success text-white d-flex align-items-center">
                <i className="bx bx-calculator fs-4 me-2"></i>
                <h6 className="mb-0">AI Fee Estimator</h6>
            </div>
            <div className="card-body">
                <Formik
                    initialValues={{ university_course: '', duration_years: '1' }}
                    onSubmit={handleEstimate}
                >
                    {({ values, setFieldValue }) => (
                        <Form>
                            <div className="row g-3 mb-3">
                                <div className="col-md-8">
                                    <FormikSelect
                                        name="university_course"
                                        label="Select University Course"
                                        url="/unisync360-academic/university-courses/"
                                        containerClass="mb-0"
                                        filters={{ page: 1, page_size: 100, paginated: true }}
                                        mapOption={(item) => ({
                                            value: item.uid,
                                            label: `${item.course_name} - ${item.university_name}`
                                        })}
                                        formatOptionLabel={(option) => (
                                            <div>
                                                <span className="fw-medium">{option.label?.split(' - ')[0]}</span>
                                                <small className="d-block text-muted">{option.label?.split(' - ')[1]}</small>
                                            </div>
                                        )}
                                        placeholder="Search courses..."
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small">Duration (Years)</label>
                                    <Field as="select" name="duration_years" className="form-select">
                                        <option value="1">1 Year</option>
                                        <option value="2">2 Years</option>
                                        <option value="3">3 Years</option>
                                        <option value="4">4 Years</option>
                                        <option value="5">5 Years</option>
                                    </Field>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-success btn-sm w-100"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-dollar me-1"></i>
                                        Estimate Costs
                                    </>
                                )}
                            </button>
                        </Form>
                    )}
                </Formik>

                {error && (
                    <div className="alert alert-danger mt-3 small py-2">
                        <i className="bx bx-error-circle me-1"></i> {error}
                    </div>
                )}

                {result && (
                    <div className="mt-4 animate__animated animate__fadeIn">
                        {/* Course/University Info */}
                        <div className="mb-3 text-center">
                            {result.course && (
                                <>
                                    <h6 className="mb-1">{result.course.name}</h6>
                                    {result.course.level && (
                                        <span className="badge bg-primary mb-1">{result.course.level}</span>
                                    )}
                                </>
                            )}
                            {result.university && (
                                <small className="text-muted d-block">
                                    <i className="bx bx-buildings me-1"></i>
                                    {result.university.name}
                                    {result.university.country && ` • ${result.university.country}`}
                                </small>
                            )}
                        </div>

                        {/* Total Cost */}
                        <div className="text-center bg-success bg-opacity-10 rounded p-3 mb-3">
                            <small className="text-muted d-block">Total Estimated Cost</small>
                            <h3 className="text-success mb-0">
                                {formatCurrency(result.total_estimated_cost, result.currency)}
                            </h3>
                            <small className="text-muted">
                                for {result.duration_years} year(s)
                            </small>
                        </div>

                        {/* Cost Breakdown */}
                        <h6 className="small fw-bold mb-2">
                            <i className="bx bx-list-ul me-1"></i> Cost Breakdown
                        </h6>
                        <div className="list-group list-group-flush small mb-3">
                            {result.breakdown?.tuition_total > 0 && (
                                <div className="list-group-item d-flex justify-content-between px-0 py-2">
                                    <span><i className="bx bx-book-open me-1 text-primary"></i> Tuition (Total)</span>
                                    <strong>{formatCurrency(result.breakdown.tuition_total, result.currency)}</strong>
                                </div>
                            )}
                            {result.breakdown?.living_cost_total > 0 && (
                                <div className="list-group-item d-flex justify-content-between px-0 py-2">
                                    <span><i className="bx bx-home me-1 text-info"></i> Living Expenses</span>
                                    <strong>{formatCurrency(result.breakdown.living_cost_total, result.currency)}</strong>
                                </div>
                            )}
                            {result.breakdown?.health_insurance_total > 0 && (
                                <div className="list-group-item d-flex justify-content-between px-0 py-2">
                                    <span><i className="bx bx-plus-medical me-1 text-danger"></i> Health Insurance</span>
                                    <strong>{formatCurrency(result.breakdown.health_insurance_total, result.currency)}</strong>
                                </div>
                            )}
                            {result.breakdown?.travel_expenses > 0 && (
                                <div className="list-group-item d-flex justify-content-between px-0 py-2">
                                    <span><i className="bx bx-plane me-1 text-warning"></i> Travel Expenses</span>
                                    <strong>{formatCurrency(result.breakdown.travel_expenses, result.currency)}</strong>
                                </div>
                            )}
                            {result.breakdown?.visa_fees > 0 && (
                                <div className="list-group-item d-flex justify-content-between px-0 py-2">
                                    <span><i className="bx bx-id-card me-1 text-secondary"></i> Visa Fees</span>
                                    <strong>{formatCurrency(result.breakdown.visa_fees, result.currency)}</strong>
                                </div>
                            )}
                            {result.breakdown?.application_fee > 0 && (
                                <div className="list-group-item d-flex justify-content-between px-0 py-2">
                                    <span><i className="bx bx-file me-1 text-primary"></i> Application Fee</span>
                                    <strong>{formatCurrency(result.breakdown.application_fee, result.currency)}</strong>
                                </div>
                            )}
                            {result.breakdown?.miscellaneous > 0 && (
                                <div className="list-group-item d-flex justify-content-between px-0 py-2">
                                    <span><i className="bx bx-package me-1 text-dark"></i> Miscellaneous</span>
                                    <strong>{formatCurrency(result.breakdown.miscellaneous, result.currency)}</strong>
                                </div>
                            )}
                        </div>

                        {/* Monthly/Annual Breakdown */}
                        <div className="bg-light rounded p-2 small mb-3">
                            <div className="row g-2">
                                {result.breakdown?.living_cost_per_month > 0 && (
                                    <div className="col-6">
                                        <small className="text-muted d-block">Monthly Living</small>
                                        <span className="fw-bold">{formatCurrency(result.breakdown.living_cost_per_month, result.currency)}</span>
                                    </div>
                                )}
                                {result.breakdown?.tuition_per_year > 0 && (
                                    <div className="col-6">
                                        <small className="text-muted d-block">Annual Tuition</small>
                                        <span className="fw-bold">{formatCurrency(result.breakdown.tuition_per_year, result.currency)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget Analysis (if student has preference) */}
                        {result.budget_analysis && (
                            <div className={`alert alert-${result.budget_analysis.within_budget ? 'success' : 'warning'} py-2 small`}>
                                <i className={`bx bx-${result.budget_analysis.within_budget ? 'check-circle' : 'info-circle'} me-1`}></i>
                                {result.budget_analysis.within_budget 
                                    ? 'This option is within your budget!'
                                    : `Budget range: ${formatCurrency(result.budget_analysis.student_budget_min)} - ${formatCurrency(result.budget_analysis.student_budget_max)}`
                                }
                            </div>
                        )}

                        {/* Notes */}
                        {result.notes && result.notes.length > 0 && (
                            <div className="mt-3 small text-muted border-top pt-2">
                                <i className="bx bx-info-circle me-1"></i>
                                <span>{result.notes[0]}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIFeeEstimator;
