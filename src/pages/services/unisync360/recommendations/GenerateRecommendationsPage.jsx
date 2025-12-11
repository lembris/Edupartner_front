import React, { useState } from "react";
import "animate.css";
import { useNavigate } from "react-router-dom";
import BreadCumb from "../../../../layouts/BreadCumb";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { generateRecommendations, CLIMATE_OPTIONS, CITY_SIZE_OPTIONS, QUALIFICATION_LEVELS, getScoreColor } from "./Queries";
import FormikSelect from "../../../../components/ui-templates/form-components/FormikSelect";
import showToast from "../../../../helpers/ToastHelper";

export const GenerateRecommendationsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [step, setStep] = useState(1);

    const initialValues = {
        student: "",
        budget_range_min: 5000,
        budget_range_max: 50000,
        preferred_currencies: ["USD"],
        gpa: "",
        qualification_level: "high_school",
        exam_results: {},
        country_priorities: [],
        course_interests: [],
        university_ranking_min: "",
        university_ranking_max: "",
        preferred_duration_min: 12,
        preferred_duration_max: 48,
        intake_preferences: [],
        climate_preference: "any",
        city_size_preference: "any",
        work_while_studying: false,
        post_study_work_opportunities: false,
        model_version: "1.0",
        recommendation_confidence: 0,
    };

    const validationSchema = Yup.object().shape({
        student: Yup.string().required("Student is required"),
        budget_range_min: Yup.number().required("Minimum budget is required").min(0),
        budget_range_max: Yup.number().required("Maximum budget is required").min(0),
        qualification_level: Yup.string().required("Qualification level is required"),
        preferred_duration_min: Yup.number().required("Required").min(1),
        preferred_duration_max: Yup.number().required("Required").min(1),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                gpa: values.gpa ? parseFloat(values.gpa) : null,
                university_ranking_min: values.university_ranking_min ? parseInt(values.university_ranking_min) : null,
                university_ranking_max: values.university_ranking_max ? parseInt(values.university_ranking_max) : null,
            };

            const response = await generateRecommendations(payload);
            
            if (response.status === 8000 || response.data) {
                setResult(response.data);
                showToast("Recommendations generated successfully!", "success");
            } else {
                showToast(response.message || "Failed to generate recommendations", "error");
            }
        } catch (error) {
            console.error("Error generating recommendations:", error);
            showToast("Failed to generate recommendations", "error");
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const intakeOptions = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CNY', 'JPY'];

    return (
        <>
            <BreadCumb pageList={["Recommendations", "Generate Recommendations"]} />
            
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex align-items-center">
                                <i className="bx bx-brain fs-4 me-2"></i>
                                <h5 className="mb-0">AI Course Recommendation Generator</h5>
                            </div>
                        </div>
                        <div className="card-body">
                            {result ? (
                                <div className="animate__animated animate__fadeIn">
                                    <div className="alert alert-success d-flex align-items-center justify-content-between mb-4">
                                        <div>
                                            <i className="bx bx-check-circle me-2 fs-4"></i>
                                            <strong>Recommendations Generated!</strong>
                                            <span className="ms-2">
                                                Found {result.recommendation_count || 0} matching courses
                                            </span>
                                        </div>
                                        <div>
                                            <button 
                                                className="btn btn-sm btn-success me-2"
                                                onClick={() => navigate(`/unisync360/recommendations/recommended-courses?engine=${result.uid}`)}
                                            >
                                                <i className="bx bx-show me-1"></i> View Results
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => setResult(null)}
                                            >
                                                <i className="bx bx-plus me-1"></i> Generate Another
                                            </button>
                                        </div>
                                    </div>

                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <div className="card bg-light h-100">
                                                <div className="card-body text-center">
                                                    <i className="bx bx-user fs-1 text-primary mb-2"></i>
                                                    <h6>Student</h6>
                                                    <p className="mb-0 fw-bold">{result.student_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light h-100">
                                                <div className="card-body text-center">
                                                    <i className="bx bx-target-lock fs-1 text-success mb-2"></i>
                                                    <h6>Confidence Score</h6>
                                                    <p className="mb-0 fw-bold fs-4">{result.recommendation_confidence}%</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light h-100">
                                                <div className="card-body text-center">
                                                    <i className="bx bx-list-check fs-1 text-info mb-2"></i>
                                                    <h6>Courses Found</h6>
                                                    <p className="mb-0 fw-bold fs-4">{result.recommendation_count || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ values, setFieldValue, isSubmitting }) => (
                                        <Form>
                                            {/* Step Indicators */}
                                            <div className="d-flex justify-content-center mb-4">
                                                {[1, 2, 3].map((s) => (
                                                    <div key={s} className="d-flex align-items-center">
                                                        <div 
                                                            className={`rounded-circle d-flex align-items-center justify-content-center cursor-pointer ${step >= s ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                                            style={{ width: '40px', height: '40px' }}
                                                            onClick={() => setStep(s)}
                                                        >
                                                            {s}
                                                        </div>
                                                        {s < 3 && (
                                                            <div className={`mx-2 ${step > s ? 'bg-primary' : 'bg-light'}`} style={{ width: '60px', height: '3px' }}></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Step 1: Student & Budget */}
                                            {step === 1 && (
                                                <div className="animate__animated animate__fadeIn">
                                                    <h6 className="fw-bold mb-4">
                                                        <i className="bx bx-user me-2"></i>
                                                        Student & Budget Information
                                                    </h6>
                                                    <div className="row g-3">
                                                        <FormikSelect
                                                            name="student"
                                                            label="Select Student *"
                                                            url="/unisync360-students/"
                                                            containerClass="col-md-6 mb-3"
                                                            placeholder="Search and select student..."
                                                            mapOption={(item) => ({
                                                                value: item.uid,
                                                                label: `${item.first_name} ${item.last_name}`,
                                                                ...item
                                                            })}
                                                        />

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Qualification Level *</label>
                                                            <Field as="select" name="qualification_level" className="form-select">
                                                                {QUALIFICATION_LEVELS.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </Field>
                                                        </div>

                                                        <div className="col-md-4 mb-3">
                                                            <label className="form-label">Minimum Budget (USD) *</label>
                                                            <Field type="number" name="budget_range_min" className="form-control" />
                                                            <ErrorMessage name="budget_range_min" component="div" className="text-danger small" />
                                                        </div>

                                                        <div className="col-md-4 mb-3">
                                                            <label className="form-label">Maximum Budget (USD) *</label>
                                                            <Field type="number" name="budget_range_max" className="form-control" />
                                                            <ErrorMessage name="budget_range_max" component="div" className="text-danger small" />
                                                        </div>

                                                        <div className="col-md-4 mb-3">
                                                            <label className="form-label">GPA (Optional)</label>
                                                            <Field type="number" name="gpa" className="form-control" step="0.01" min="0" max="4" placeholder="e.g., 3.5" />
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <label className="form-label">Preferred Currencies</label>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {currencyOptions.map((currency) => (
                                                                    <label key={currency} className="form-check form-check-inline">
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="preferred_currencies"
                                                                            value={currency}
                                                                            className="form-check-input"
                                                                        />
                                                                        <span className="form-check-label">{currency}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Academic Preferences */}
                                            {step === 2 && (
                                                <div className="animate__animated animate__fadeIn">
                                                    <h6 className="fw-bold mb-4">
                                                        <i className="bx bx-book me-2"></i>
                                                        Academic & Course Preferences
                                                    </h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Course Interests</label>
                                                            <FieldArray name="course_interests">
                                                                {({ push, remove }) => (
                                                                    <div>
                                                                        <div className="input-group mb-2">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                placeholder="e.g., Computer Science"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        e.preventDefault();
                                                                                        if (e.target.value.trim()) {
                                                                                            push(e.target.value.trim());
                                                                                            e.target.value = '';
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-outline-primary"
                                                                                onClick={(e) => {
                                                                                    const input = e.target.previousSibling;
                                                                                    if (input.value.trim()) {
                                                                                        push(input.value.trim());
                                                                                        input.value = '';
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Add
                                                                            </button>
                                                                        </div>
                                                                        <div className="d-flex flex-wrap gap-1">
                                                                            {values.course_interests.map((interest, idx) => (
                                                                                <span key={idx} className="badge bg-primary">
                                                                                    {interest}
                                                                                    <i className="bx bx-x ms-1 cursor-pointer" onClick={() => remove(idx)}></i>
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </FieldArray>
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Preferred Intake Months</label>
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {intakeOptions.map((month) => (
                                                                    <label key={month} className="form-check form-check-inline">
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="intake_preferences"
                                                                            value={month}
                                                                            className="form-check-input"
                                                                        />
                                                                        <span className="form-check-label small">{month.slice(0, 3)}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3 mb-3">
                                                            <label className="form-label">Min Duration (Months) *</label>
                                                            <Field type="number" name="preferred_duration_min" className="form-control" min="1" />
                                                        </div>

                                                        <div className="col-md-3 mb-3">
                                                            <label className="form-label">Max Duration (Months) *</label>
                                                            <Field type="number" name="preferred_duration_max" className="form-control" min="1" />
                                                        </div>

                                                        <div className="col-md-3 mb-3">
                                                            <label className="form-label">Min University Ranking</label>
                                                            <Field type="number" name="university_ranking_min" className="form-control" placeholder="e.g., 1" />
                                                        </div>

                                                        <div className="col-md-3 mb-3">
                                                            <label className="form-label">Max University Ranking</label>
                                                            <Field type="number" name="university_ranking_max" className="form-control" placeholder="e.g., 500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Lifestyle Preferences */}
                                            {step === 3 && (
                                                <div className="animate__animated animate__fadeIn">
                                                    <h6 className="fw-bold mb-4">
                                                        <i className="bx bx-world me-2"></i>
                                                        Lifestyle & Location Preferences
                                                    </h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Climate Preference</label>
                                                            <Field as="select" name="climate_preference" className="form-select">
                                                                {CLIMATE_OPTIONS.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </Field>
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">City Size Preference</label>
                                                            <Field as="select" name="city_size_preference" className="form-select">
                                                                {CITY_SIZE_OPTIONS.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </Field>
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <div className="form-check">
                                                                <Field type="checkbox" name="work_while_studying" className="form-check-input" id="work_while_studying" />
                                                                <label className="form-check-label" htmlFor="work_while_studying">
                                                                    <strong>Work While Studying</strong>
                                                                    <small className="d-block text-muted">Prefer countries that allow part-time work</small>
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6 mb-3">
                                                            <div className="form-check">
                                                                <Field type="checkbox" name="post_study_work_opportunities" className="form-check-input" id="post_study_work_opportunities" />
                                                                <label className="form-check-label" htmlFor="post_study_work_opportunities">
                                                                    <strong>Post-Study Work Visa</strong>
                                                                    <small className="d-block text-muted">Prefer countries with post-study work visas</small>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Navigation Buttons */}
                                            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => step > 1 ? setStep(step - 1) : navigate('/unisync360/recommendations/engines')}
                                                >
                                                    <i className="bx bx-arrow-back me-1"></i>
                                                    {step > 1 ? 'Previous' : 'Cancel'}
                                                </button>

                                                {step < 3 ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => setStep(step + 1)}
                                                    >
                                                        Next <i className="bx bx-arrow-to-right ms-1"></i>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        className="btn btn-success"
                                                        disabled={loading || isSubmitting}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bx bx-brain me-1"></i>
                                                                Generate Recommendations
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GenerateRecommendationsPage;
