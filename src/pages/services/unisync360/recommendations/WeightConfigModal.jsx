import React, { useState, useMemo } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createWeightConfig, updateWeightConfig } from "./Queries";
import showToast from "../../../../helpers/ToastHelper";
import GlobalModal from "../../../../components/modal/GlobalModal";

export const WeightConfigModal = ({ show, selectedObj, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);

    const initialValues = useMemo(() => ({
        budget_weight: selectedObj?.budget_weight ?? 25,
        academic_weight: selectedObj?.academic_weight ?? 30,
        country_preference_weight: selectedObj?.country_preference_weight ?? 15,
        career_alignment_weight: selectedObj?.career_alignment_weight ?? 20,
        lifestyle_weight: selectedObj?.lifestyle_weight ?? 10,
        minimum_match_threshold: selectedObj?.minimum_match_threshold ?? 60,
        maximum_recommendations: selectedObj?.maximum_recommendations ?? 10,
        include_safety_options: selectedObj?.include_safety_options ?? true,
        include_reach_options: selectedObj?.include_reach_options ?? true,
        is_active: selectedObj?.is_active ?? true,
    }), [selectedObj]);

    const validationSchema = Yup.object().shape({
        budget_weight: Yup.number().min(0).max(100).required("Required"),
        academic_weight: Yup.number().min(0).max(100).required("Required"),
        country_preference_weight: Yup.number().min(0).max(100).required("Required"),
        career_alignment_weight: Yup.number().min(0).max(100).required("Required"),
        lifestyle_weight: Yup.number().min(0).max(100).required("Required"),
        minimum_match_threshold: Yup.number().min(0).max(100).required("Required"),
        maximum_recommendations: Yup.number().min(1).max(50).required("Required"),
    });

    const calculateTotal = (values) => {
        return parseFloat(values.budget_weight || 0) +
               parseFloat(values.academic_weight || 0) +
               parseFloat(values.country_preference_weight || 0) +
               parseFloat(values.career_alignment_weight || 0) +
               parseFloat(values.lifestyle_weight || 0);
    };

    const handleSubmit = async (values, { setErrors }) => {
        const total = calculateTotal(values);
        if (total !== 100) {
            showToast(`Weights must sum to 100%. Current sum: ${total}%`, "error");
            return;
        }

        try {
            setLoading(true);
            let response;
            if (selectedObj?.uid) {
                response = await updateWeightConfig(selectedObj.uid, values);
            } else {
                response = await createWeightConfig(values);
            }

            if (response.status === 8000 || response.uid) {
                showToast(
                    selectedObj?.uid ? "Configuration updated successfully!" : "Configuration created successfully!",
                    "success"
                );
                if (onClose) onClose();
                if (onSuccess) onSuccess();
            } else {
                showToast(response.message || "Operation failed", "error");
                if (response.errors) {
                    setErrors(response.errors);
                }
            }
        } catch (error) {
            console.error("Error saving configuration:", error);
            showToast("Failed to save configuration. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const WeightSlider = ({ name, label, color, values, setFieldValue }) => (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">{label}</label>
                <span className={`badge bg-${color}`}>{values[name]}%</span>
            </div>
            <Field
                type="range"
                name={name}
                className="form-range"
                min="0"
                max="100"
                step="5"
                onChange={(e) => {
                    setFieldValue(name, parseInt(e.target.value));
                }}
            />
            <div className="progress" style={{ height: '4px' }}>
                <div className={`progress-bar bg-${color}`} style={{ width: `${values[name]}%` }}></div>
            </div>
        </div>
    );

    return (
        <GlobalModal
            show={show}
            onClose={onClose}
            title={<><i className="bx bx-slider-alt me-2"></i>{selectedObj?.uid ? "Edit Weight Configuration" : "New Weight Configuration"}</>}
            size="lg"
            onSubmit={handleSubmit}
            submitText={selectedObj?.uid ? "Update" : "Create"}
            loading={loading}
        >
            <Formik
                key={selectedObj?.uid || 'new'}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => {
                    const currentTotal = calculateTotal(values);
                    
                    return (
                        <>
                            <div className={`alert alert-${currentTotal === 100 ? 'success' : 'danger'} d-flex align-items-center justify-content-between mb-4`}>
                                <div>
                                    <i className={`bx bx-${currentTotal === 100 ? 'check-circle' : 'error-circle'} me-2`}></i>
                                    <strong>Total Weight:</strong> {currentTotal}%
                                </div>
                                {currentTotal !== 100 && (
                                    <span className="small">Must equal 100%</span>
                                )}
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="fw-bold mb-3">
                                        <i className="bx bx-bar-chart me-1"></i>
                                        Weight Distribution
                                    </h6>
                                    
                                    <WeightSlider name="budget_weight" label="Budget Match" color="success" values={values} setFieldValue={setFieldValue} />
                                    <WeightSlider name="academic_weight" label="Academic Match" color="primary" values={values} setFieldValue={setFieldValue} />
                                    <WeightSlider name="country_preference_weight" label="Country Preference" color="info" values={values} setFieldValue={setFieldValue} />
                                    <WeightSlider name="career_alignment_weight" label="Career Alignment" color="warning" values={values} setFieldValue={setFieldValue} />
                                    <WeightSlider name="lifestyle_weight" label="Lifestyle Match" color="secondary" values={values} setFieldValue={setFieldValue} />
                                </div>

                                <div className="col-md-6">
                                    <h6 className="fw-bold mb-3">
                                        <i className="bx bx-cog me-1"></i>
                                        Settings
                                    </h6>

                                    <div className="mb-3">
                                        <label className="form-label">Minimum Match Threshold (%)</label>
                                        <Field
                                            type="number"
                                            name="minimum_match_threshold"
                                            className="form-control"
                                            min="0"
                                            max="100"
                                        />
                                        <small className="text-muted">Only show recommendations above this score</small>
                                        <ErrorMessage name="minimum_match_threshold" component="div" className="text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Maximum Recommendations</label>
                                        <Field
                                            type="number"
                                            name="maximum_recommendations"
                                            className="form-control"
                                            min="1"
                                            max="50"
                                        />
                                        <small className="text-muted">Maximum number of courses to recommend</small>
                                        <ErrorMessage name="maximum_recommendations" component="div" className="text-danger small" />
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <Field
                                                type="checkbox"
                                                name="include_safety_options"
                                                className="form-check-input"
                                                id="include_safety_options"
                                            />
                                            <label className="form-check-label" htmlFor="include_safety_options">
                                                <strong>Include Safety Options</strong>
                                                <small className="d-block text-muted">Include courses with high admission probability</small>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <Field
                                                type="checkbox"
                                                name="include_reach_options"
                                                className="form-check-input"
                                                id="include_reach_options"
                                            />
                                            <label className="form-check-label" htmlFor="include_reach_options">
                                                <strong>Include Reach Options</strong>
                                                <small className="d-block text-muted">Include aspirational courses with lower admission probability</small>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <Field
                                                type="checkbox"
                                                name="is_active"
                                                className="form-check-input"
                                                id="is_active"
                                            />
                                            <label className="form-check-label" htmlFor="is_active">
                                                <strong>Active Configuration</strong>
                                                <small className="d-block text-muted">Use this configuration for recommendations</small>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    );
                }}
            </Formik>
        </GlobalModal>
    );
};

export default WeightConfigModal;
