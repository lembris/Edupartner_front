import React, { useState } from 'react';
import AICourseRecommendations from './AICourseRecommendations';
import AIEligibilityCheck from './AIEligibilityCheck';
import AIDeparturePlanner from './AIDeparturePlanner';
import AIDocumentChecker from './AIDocumentChecker';
import AIRiskAssessment from './AIRiskAssessment';
import AIFeeEstimator from './AIFeeEstimator';
import AIStudentSuccessScore from './AIStudentSuccessScore';

const AIInsightsDashboard = ({ studentId, studentName, onApplyCourse, onViewCourse }) => {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', label: 'Overview', icon: 'bx-grid-alt' },
        { id: 'courses', label: 'Course Predictions', icon: 'bx-brain' },
        { id: 'eligibility', label: 'Eligibility', icon: 'bx-check-shield' },
        { id: 'planner', label: 'Departure Plan', icon: 'bx-calendar-check' },
    ];

    return (
        <div className="ai-insights-dashboard">
            {/* Navigation Tabs */}
            <div className="border-bottom">
                <div className="d-flex flex-wrap">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`btn flex-fill rounded-0 py-3 border-0 ${
                                activeSection === section.id
                                    ? 'btn-primary'
                                    : 'btn-light'
                            }`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <i className={`bx ${section.icon} me-2`}></i>
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Section */}
            {activeSection === 'overview' && (
                <div className="animate__animated animate__fadeIn p-4">
                    {/* Quick Stats Row */}
                    <div className="row g-4 mb-4">
                        <div className="col-lg-4">
                            <AIStudentSuccessScore 
                                studentId={studentId} 
                                studentName={studentName} 
                            />
                        </div>
                        <div className="col-lg-4">
                            <AIDocumentChecker 
                                studentId={studentId} 
                                studentName={studentName} 
                            />
                        </div>
                        <div className="col-lg-4">
                            <AIRiskAssessment 
                                studentId={studentId} 
                                studentName={studentName} 
                            />
                        </div>
                    </div>

                    {/* Fee Estimator */}
                    <div className="row g-4">
                        <div className="col-12">
                            <AIFeeEstimator 
                                studentId={studentId} 
                                studentName={studentName} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Course Predictions Section */}
            {activeSection === 'courses' && (
                <div className="animate__animated animate__fadeIn p-4">
                    <AICourseRecommendations 
                        studentId={studentId} 
                        studentName={studentName}
                        onApplyCourse={onApplyCourse}
                        onViewCourse={onViewCourse}
                    />
                </div>
            )}

            {/* Eligibility Section */}
            {activeSection === 'eligibility' && (
                <div className="animate__animated animate__fadeIn p-4">
                    <AIEligibilityCheck 
                        studentId={studentId} 
                        studentName={studentName} 
                    />
                </div>
            )}

            {/* Departure Planner Section */}
            {activeSection === 'planner' && (
                <div className="animate__animated animate__fadeIn p-4">
                    <AIDeparturePlanner 
                        studentId={studentId} 
                        studentName={studentName} 
                    />
                </div>
            )}
        </div>
    );
};

export default AIInsightsDashboard;
