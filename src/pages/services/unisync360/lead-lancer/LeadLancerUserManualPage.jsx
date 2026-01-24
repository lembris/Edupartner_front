import React, { useState } from "react";
import { Link } from "react-router-dom";
import "animate.css";

export const LeadLancerUserManualPage = () => {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [searchQuery, setSearchQuery] = useState("");

    const sections = [
        { id: "getting-started", title: "Getting Started", icon: "bx-rocket" },
        { id: "dashboard", title: "Dashboard", icon: "bx-grid-alt" },
        { id: "student-registration", title: "Student Registration", icon: "bx-user-plus" },
        { id: "commissions", title: "Commission Management", icon: "bx-dollar-circle" },
        { id: "applications", title: "Applications Tracking", icon: "bx-file-find" },
        { id: "communication", title: "Communication", icon: "bx-message-dots" },
        { id: "documents", title: "Document Management", icon: "bx-file" },
        { id: "reports", title: "Reports & Analytics", icon: "bx-bar-chart-alt-2" },
        { id: "payments", title: "Payment Tracking", icon: "bx-wallet" },
        { id: "profile", title: "Profile & Settings", icon: "bx-user-circle" },
        { id: "faq", title: "FAQ", icon: "bx-help-circle" },
        { id: "troubleshooting", title: "Troubleshooting", icon: "bx-wrench" },
    ];

    const filteredSections = sections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-warning text-dark">
                        <div className="card-body py-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <h2 className="text-dark mb-2">
                                        <i className="bx bx-book-open me-2"></i>
                                        Lead Lancer User Manual
                                    </h2>
                                    <p className="mb-0 opacity-75">
                                        Complete guide to using the Lead Lancer Commission Portal
                                    </p>
                                </div>
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-0">
                                            <i className="bx bx-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-0"
                                            placeholder="Search manual..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Sidebar Navigation */}
                <div className="col-lg-3 col-md-4">
                    <div className="card sticky-top" style={{ top: "80px" }}>
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bx bx-list-ul me-2"></i>
                                Contents
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="list-group list-group-flush" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                {filteredSections.map((section) => (
                                    <button
                                        key={section.id}
                                        className={`list-group-item list-group-item-action d-flex align-items-center ${activeSection === section.id ? "active" : ""}`}
                                        onClick={() => scrollToSection(section.id)}
                                    >
                                        <i className={`bx ${section.icon} me-2`}></i>
                                        {section.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-lg-9 col-md-8">
                    {/* Getting Started */}
                    <section id="getting-started" className="card mb-4 animate__animated animate__fadeIn">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-rocket text-warning me-2"></i>
                                1. Getting Started
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>1.1 Logging In</h5>
                            <ol className="mb-4">
                                <li>Open your web browser and navigate to the Lead Lancer Portal URL</li>
                                <li>Enter your <strong>Username/Email</strong> and <strong>Password</strong></li>
                                <li>Click <strong>Login</strong></li>
                                <li>You'll be directed to your dashboard</li>
                            </ol>
                            <div className="alert alert-info">
                                <i className="bx bx-info-circle me-2"></i>
                                <strong>Note:</strong> If you've forgotten your password, click "Forgot Password" on the login page.
                            </div>

                            <h5>1.2 Portal Overview</h5>
                            <p>The Lead Lancer Portal is designed to help you:</p>
                            <ul>
                                <li>Register and manage students</li>
                                <li>Track commission earnings</li>
                                <li>Monitor application progress</li>
                                <li>Manage communication with students</li>
                                <li>View reports and analytics</li>
                            </ul>

                            <h5>1.3 Main Navigation</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Menu Item</th>
                                            <th>Description</th>
                                            <th>Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><i className="bx bx-grid-alt"></i> Dashboard</td>
                                            <td>Your portal homepage</td>
                                            <td>View key metrics and quick actions</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-user-plus"></i> Register Student</td>
                                            <td>Add new students</td>
                                            <td>Onboard students to the system</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-user"></i> My Students</td>
                                            <td>View registered students</td>
                                            <td>Manage and track your students</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-dollar-circle"></i> Commissions</td>
                                            <td>Commission tracking</td>
                                            <td>View earnings and commission status</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-file-find"></i> Applications</td>
                                            <td>Track applications</td>
                                            <td>Monitor student applications</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-wallet"></i> Payments</td>
                                            <td>Payment history</td>
                                            <td>View payment records and invoices</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h5>1.4 User Profile & Role</h5>
                            <div className="alert alert-warning">
                                <i className="bx bx-info-circle me-2"></i>
                                <strong>Lead Lancer Role:</strong> You can register students, manage their applications, and track commissions based on successful enrollments.
                            </div>
                        </div>
                    </section>

                    {/* Dashboard */}
                    <section id="dashboard" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-grid-alt text-warning me-2"></i>
                                2. Dashboard Overview
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>2.1 Dashboard Widgets</h5>
                            <p>Your dashboard displays key metrics and quick statistics:</p>
                            <div className="row">
                                {[
                                    { name: "Total Students", desc: "Number of students you've registered", icon: "bx-user" },
                                    { name: "Pending Applications", desc: "Applications awaiting university response", icon: "bx-time" },
                                    { name: "Enrolled Students", desc: "Students successfully enrolled", icon: "bx-check-circle" },
                                    { name: "Commission Earned", desc: "Total commissions earned (month/year)", icon: "bx-dollar-circle" },
                                    { name: "Pending Payments", desc: "Payments awaiting processing", icon: "bx-wallet-alt" },
                                    { name: "Documents Pending", desc: "Student documents needing attention", icon: "bx-file-blank" },
                                ].map((widget, index) => (
                                    <div key={index} className="col-md-4 mb-3">
                                        <div className="border rounded p-3 h-100">
                                            <i className={`bx ${widget.icon} text-warning fs-4 mb-2`}></i>
                                            <h6 className="mb-1">{widget.name}</h6>
                                            <small className="text-muted">{widget.desc}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h5 className="mt-4">2.2 Quick Actions</h5>
                            <div className="d-flex flex-wrap gap-2">
                                <Link to="/unisync360/lead-lancer?action=register" className="btn btn-outline-warning btn-sm">
                                    <i className="bx bx-user-plus me-1"></i> Register Student
                                </Link>
                                <Link to="/unisync360/lead-lancer?tab=students" className="btn btn-outline-primary btn-sm">
                                    <i className="bx bx-user me-1"></i> View Students
                                </Link>
                                <Link to="/unisync360/lead-lancer?tab=commissions" className="btn btn-outline-success btn-sm">
                                    <i className="bx bx-dollar-circle me-1"></i> Commission
                                </Link>
                                <Link to="/unisync360/lead-lancer?tab=applications" className="btn btn-outline-info btn-sm">
                                    <i className="bx bx-file-find me-1"></i> Applications
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Student Registration */}
                    <section id="student-registration" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-user-plus text-warning me-2"></i>
                                3. Student Registration
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>3.1 Adding a New Student</h5>
                            <ol className="mb-4">
                                <li>Click <strong>Register Student</strong> button on dashboard</li>
                                <li>Fill in student personal information</li>
                                <li>Add contact details</li>
                                <li>Select intended destinations/programs</li>
                                <li>Click <strong>Register Student</strong></li>
                                <li>Student will be added to your roster</li>
                            </ol>

                            <h5>3.2 Required Information</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card bg-light mb-3">
                                        <div className="card-body">
                                            <h6><i className="bx bx-user me-2"></i>Personal Details</h6>
                                            <ul className="mb-0 small">
                                                <li>First Name *</li>
                                                <li>Last Name *</li>
                                                <li>Email Address *</li>
                                                <li>Phone Number *</li>
                                                <li>Date of Birth</li>
                                                <li>Nationality</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light mb-3">
                                        <div className="card-body">
                                            <h6><i className="bx bx-target-lock me-2"></i>Study Preferences</h6>
                                            <ul className="mb-0 small">
                                                <li>Preferred Countries *</li>
                                                <li>Study Level (Diploma, Bachelor, Master)</li>
                                                <li>Field of Study</li>
                                                <li>Budget Range</li>
                                                <li>Intended Intake Period</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h5>3.3 Student Status Workflow</h5>
                            <div className="bg-light p-3 rounded">
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                    <span className="badge bg-secondary">Inquiry</span>
                                    <i className="bx bx-right-arrow-alt"></i>
                                    <span className="badge bg-info">Registered</span>
                                    <i className="bx bx-right-arrow-alt"></i>
                                    <span className="badge bg-primary">Documents Submitted</span>
                                    <i className="bx bx-right-arrow-alt"></i>
                                    <span className="badge bg-warning">Applied</span>
                                    <i className="bx bx-right-arrow-alt"></i>
                                    <span className="badge bg-success">Offer Received</span>
                                    <i className="bx bx-right-arrow-alt"></i>
                                    <span className="badge bg-info">Enrolled</span>
                                </div>
                            </div>

                            <h5 className="mt-4">3.4 Managing Student Information</h5>
                            <ul>
                                <li>Click on a student name to view their profile</li>
                                <li>Edit student details from the profile page</li>
                                <li>Upload supporting documents</li>
                                <li>Track application progress</li>
                                <li>View commission status related to the student</li>
                            </ul>
                        </div>
                    </section>

                    {/* Commissions */}
                    <section id="commissions" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-dollar-circle text-warning me-2"></i>
                                4. Commission Management
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>4.1 Understanding Commissions</h5>
                            <p>Commissions are earned when students you've registered successfully enroll in courses. Commission amounts vary based on:</p>
                            <ul>
                                <li><strong>Course Fee:</strong> Higher fees = higher commission</li>
                                <li><strong>Commission Rate:</strong> Typically a percentage of course fees</li>
                                <li><strong>Enrollment Status:</strong> Commission triggered upon confirmed enrollment</li>
                            </ul>

                            <h5>4.2 Commission Status Breakdown</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Status</th>
                                            <th>Description</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="badge bg-info">Pending</span></td>
                                            <td>Student registered, awaiting enrollment confirmation</td>
                                            <td>Monitor application status</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-warning">Processing</span></td>
                                            <td>Enrollment confirmed, commission calculation in progress</td>
                                            <td>Monitor payment processing</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-success">Earned</span></td>
                                            <td>Commission calculated and ready for payment</td>
                                            <td>Track payment schedule</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-primary">Paid</span></td>
                                            <td>Commission has been paid to your account</td>
                                            <td>View payment details</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h5>4.3 Viewing Commission Details</h5>
                            <ol>
                                <li>Navigate to <strong>Commissions</strong> tab</li>
                                <li>View all commission records with status</li>
                                <li>Filter by status, date range, or student name</li>
                                <li>Click on a record to view detailed breakdown</li>
                                <li>Download commission report as PDF</li>
                            </ol>

                            <h5>4.4 Commission History</h5>
                            <p>Access detailed history of all your commissions including:</p>
                            <ul>
                                <li>Student name and ID</li>
                                <li>Course and institution details</li>
                                <li>Commission amount and calculation details</li>
                                <li>Payment date and method</li>
                                <li>Reference number for tracking</li>
                            </ul>
                        </div>
                    </section>

                    {/* Applications Tracking */}
                    <section id="applications" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-file-find text-warning me-2"></i>
                                5. Applications Tracking
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>5.1 Tracking Student Applications</h5>
                            <p>Monitor the progress of all student applications in one place:</p>
                            <ol>
                                <li>Click <strong>Applications</strong> tab on dashboard</li>
                                <li>View all student applications you've initiated</li>
                                <li>See current status of each application</li>
                                <li>Track deadlines and pending actions</li>
                            </ol>

                            <h5>5.2 Application Status Guide</h5>
                            <div className="row">
                                {[
                                    { status: "Draft", color: "secondary", desc: "Application not yet submitted to university" },
                                    { status: "Submitted", color: "info", desc: "Application sent to university, awaiting review" },
                                    { status: "Under Review", color: "primary", desc: "University is reviewing application" },
                                    { status: "Offer Received", color: "success", desc: "Conditional or unconditional offer from university" },
                                    { status: "Rejected", color: "danger", desc: "Application rejected by university" },
                                    { status: "Accepted & Enrolled", color: "success", desc: "Student accepted and enrolled in course" },
                                ].map((item, index) => (
                                    <div key={index} className="col-md-6 mb-3">
                                        <div className={`border-${item.color} border rounded p-3`}>
                                            <span className={`badge bg-${item.color} mb-2`}>{item.status}</span>
                                            <p className="small mb-0">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h5>5.3 Taking Action on Applications</h5>
                            <ul>
                                <li>Click on an application to view full details</li>
                                <li>Add or update supporting documents</li>
                                <li>Communicate with student about next steps</li>
                                <li>Track visa application status if applicable</li>
                                <li>Monitor payment status</li>
                            </ul>
                        </div>
                    </section>

                    {/* Communication */}
                    <section id="communication" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-message-dots text-warning me-2"></i>
                                6. Communication
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>6.1 Communication Options</h5>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6><i className="bx bx-phone me-2"></i>Direct Communication</h6>
                                    <ul className="small">
                                        <li>Contact students via phone or email</li>
                                        <li>Student contact details in their profile</li>
                                        <li>Log all communications in notes section</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6><i className="bx bx-envelope me-2"></i>System Messages</h6>
                                    <ul className="small">
                                        <li>Use system messaging for official updates</li>
                                        <li>Send document requests to students</li>
                                        <li>Track read receipts of messages</li>
                                    </ul>
                                </div>
                            </div>

                            <h5>6.2 Communication Log</h5>
                            <p>Every student profile includes a communication log where you can:</p>
                            <ul>
                                <li>Record call details and outcomes</li>
                                <li>Note email communications</li>
                                <li>Schedule follow-up reminders</li>
                                <li>Attach communication records/documents</li>
                            </ul>

                            <h5>6.3 Messaging Best Practices</h5>
                            <ul>
                                <li>Always maintain professional communication</li>
                                <li>Document all important discussions</li>
                                <li>Follow up within 24-48 hours</li>
                                <li>Keep students informed of progress</li>
                                <li>Provide clear guidance on next steps</li>
                            </ul>
                        </div>
                    </section>

                    {/* Documents */}
                    <section id="documents" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-file text-warning me-2"></i>
                                7. Document Management
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>7.1 Required Student Documents</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Document Type</th>
                                            <th>Purpose</th>
                                            <th>Required For</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Academic Transcripts</td>
                                            <td>Verification of academic standing</td>
                                            <td>All applications</td>
                                        </tr>
                                        <tr>
                                            <td>Identity Document</td>
                                            <td>Passport or ID copy</td>
                                            <td>Enrollment, visa</td>
                                        </tr>
                                        <tr>
                                            <td>Language Test Scores</td>
                                            <td>IELTS, TOEFL, etc.</td>
                                            <td>International programs</td>
                                        </tr>
                                        <tr>
                                            <td>Medical Certificate</td>
                                            <td>Health verification</td>
                                            <td>Visa application</td>
                                        </tr>
                                        <tr>
                                            <td>Police Clearance</td>
                                            <td>Background check</td>
                                            <td>Visa application</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h5>7.2 Uploading Documents</h5>
                            <ol>
                                <li>Go to student profile</li>
                                <li>Click <strong>Documents</strong> tab</li>
                                <li>Click <strong>+ Upload Document</strong></li>
                                <li>Select document type</li>
                                <li>Choose file and upload</li>
                                <li>Document will be scanned and verified</li>
                            </ol>

                            <h5>7.3 Document Checklist</h5>
                            <p>Each student has a customized document checklist based on their application. Mark documents as:</p>
                            <ul>
                                <li><strong>Pending:</strong> Not yet submitted</li>
                                <li><strong>Submitted:</strong> Uploaded and pending review</li>
                                <li><strong>Verified:</strong> Checked and approved</li>
                                <li><strong>Expired:</strong> Needs renewal</li>
                            </ul>
                        </div>
                    </section>

                    {/* Reports & Analytics */}
                    <section id="reports" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-bar-chart-alt-2 text-warning me-2"></i>
                                8. Reports & Analytics
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>8.1 Available Reports</h5>
                            <div className="row mb-4">
                                {[
                                    { 
                                        title: "Student Summary", 
                                        desc: "Total students, registrations, status breakdown",
                                        icon: "bx-file-blank"
                                    },
                                    { 
                                        title: "Application Report", 
                                        desc: "Application status, universities applied, outcomes",
                                        icon: "bx-file-find"
                                    },
                                    { 
                                        title: "Commission Report", 
                                        desc: "Earnings, pending commissions, payment history",
                                        icon: "bx-dollar-circle"
                                    },
                                    { 
                                        title: "Enrollment Report", 
                                        desc: "Enrolled students, courses, institutions",
                                        icon: "bx-file-import"
                                    },
                                ].map((report, index) => (
                                    <div key={index} className="col-md-6 mb-3">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <i className={`bx ${report.icon} fs-3 text-warning mb-2`}></i>
                                                <h6 className="mb-2">{report.title}</h6>
                                                <small className="text-muted">{report.desc}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h5>8.2 Exporting Reports</h5>
                            <ol>
                                <li>Navigate to desired report section</li>
                                <li>Set date range and filters</li>
                                <li>Click <strong>Generate Report</strong></li>
                                <li>View report on screen or download as PDF</li>
                                <li>Export as Excel for further analysis</li>
                            </ol>
                        </div>
                    </section>

                    {/* Payments */}
                    <section id="payments" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-wallet text-warning me-2"></i>
                                9. Payment Tracking
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>9.1 Payment Status</h5>
                            <p>Track payments related to student registrations and commissions:</p>
                            <ul>
                                <li><strong>Registration Fees:</strong> Fees paid by students for registration</li>
                                <li><strong>Commission Payments:</strong> Payments for successful enrollments</li>
                                <li><strong>Refunds:</strong> Any refund or reversal records</li>
                            </ul>

                            <h5>9.2 Viewing Payment History</h5>
                            <ol>
                                <li>Click <strong>Payments</strong> tab</li>
                                <li>View all payments made by your students</li>
                                <li>Filter by student, date, or status</li>
                                <li>Click payment to view receipt</li>
                                <li>Download payment confirmation</li>
                            </ol>

                            <h5>9.3 Payment Methods</h5>
                            <div className="alert alert-info">
                                <strong>Supported Payment Methods:</strong>
                                <ul className="small mb-0 mt-2">
                                    <li>Bank Transfer</li>
                                    <li>Mobile Money (M-Pesa, others)</li>
                                    <li>Online Payment Gateway</li>
                                    <li>Check/Cheque</li>
                                    <li>Cash (with receipts)</li>
                                </ul>
                            </div>

                            <h5>9.4 Commission Payment Schedule</h5>
                            <p>Commissions are typically processed:</p>
                            <ul>
                                <li>Within 30 days of enrollment confirmation</li>
                                <li>Monthly batches processed on the 15th and 30th</li>
                                <li>Payment method: Bank transfer to registered account</li>
                                <li>You'll receive email notification when payment is processed</li>
                            </ul>
                        </div>
                    </section>

                    {/* Profile & Settings */}
                    <section id="profile" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-user-circle text-warning me-2"></i>
                                10. Profile & Settings
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>10.1 Managing Your Profile</h5>
                            <ol>
                                <li>Click profile icon in top right corner</li>
                                <li>Select <strong>My Profile</strong></li>
                                <li>Update your personal information</li>
                                <li>Add or update profile photo</li>
                                <li>Save changes</li>
                            </ol>

                            <h5>10.2 Account Settings</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <h6><i className="bx bx-key me-2"></i>Password & Security</h6>
                                    <ul className="small">
                                        <li>Change password regularly</li>
                                        <li>Enable two-factor authentication</li>
                                        <li>Review login history</li>
                                        <li>Manage active sessions</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6><i className="bx bx-wallet me-2"></i>Payment Details</h6>
                                    <ul className="small">
                                        <li>Add bank account for commission transfers</li>
                                        <li>Update phone number for SMS notifications</li>
                                        <li>Set email preferences</li>
                                        <li>Configure payment notifications</li>
                                    </ul>
                                </div>
                            </div>

                            <h5>10.3 Notification Preferences</h5>
                            <p>Control how you receive notifications:</p>
                            <ul>
                                <li>Email notifications for new students</li>
                                <li>SMS alerts for commission updates</li>
                                <li>Application status changes</li>
                                <li>Payment processing notifications</li>
                                <li>System maintenance alerts</li>
                            </ul>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="faq" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-help-circle text-warning me-2"></i>
                                11. Frequently Asked Questions
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="accordion" id="faqAccordion">
                                {[
                                    {
                                        q: "How do I register a new student?",
                                        a: "Click 'Register Student' on the dashboard, fill in their details, select study preferences, and click 'Register'. The student will be added to your roster."
                                    },
                                    {
                                        q: "When do I earn commissions?",
                                        a: "You earn commissions when a student you registered successfully enrolls in a course. The commission is calculated based on the course fee and commission rate."
                                    },
                                    {
                                        q: "How often are commissions paid?",
                                        a: "Commissions are typically processed monthly, usually on the 15th and 30th of each month, via bank transfer."
                                    },
                                    {
                                        q: "Can I edit a student's information after registration?",
                                        a: "Yes, click on the student's profile and edit their information. Some fields may be locked after certain actions have occurred."
                                    },
                                    {
                                        q: "What should I do if a student's application is rejected?",
                                        a: "Contact the student immediately, discuss alternative universities/courses, and help them apply to backup options. No commission is earned for rejected applications."
                                    },
                                    {
                                        q: "How can I track my earnings?",
                                        a: "Visit the Commissions tab on your dashboard to view all earnings, pending commissions, and payment history."
                                    },
                                    {
                                        q: "What documents do students need to submit?",
                                        a: "Required documents vary by university and program but typically include academic transcripts, ID, language test scores, medical certificate, and police clearance."
                                    },
                                    {
                                        q: "Can I download a report of my activity?",
                                        a: "Yes, go to Reports section, select the report type, set date range, and download as PDF or Excel."
                                    },
                                ].map((item, index) => (
                                    <div key={index} className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button
                                                className="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#faq${index}`}
                                            >
                                                {item.q}
                                            </button>
                                        </h2>
                                        <div id={`faq${index}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">{item.a}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Troubleshooting */}
                    <section id="troubleshooting" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-wrench text-warning me-2"></i>
                                12. Troubleshooting
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>12.1 Common Issues</h5>
                            <div className="accordion" id="troubleshootingAccordion">
                                {[
                                    {
                                        issue: "Cannot Login",
                                        solutions: [
                                            "Verify username/email and password are correct",
                                            "Check if Caps Lock is on",
                                            "Clear browser cache and cookies",
                                            "Try a different browser",
                                            "Click 'Forgot Password' if unsure"
                                        ]
                                    },
                                    {
                                        issue: "Student Registration Failed",
                                        solutions: [
                                            "Ensure all required fields are filled",
                                            "Check email address is valid",
                                            "Verify student isn't already registered",
                                            "Try again or contact support"
                                        ]
                                    },
                                    {
                                        issue: "Document Upload Failed",
                                        solutions: [
                                            "Check file size (max 10MB)",
                                            "Verify file format is supported (PDF, JPG, PNG)",
                                            "Check internet connection",
                                            "Try a different browser"
                                        ]
                                    },
                                    {
                                        issue: "Commission Not Showing",
                                        solutions: [
                                            "Verify student has enrolled successfully",
                                            "Check if 30 days have passed since enrollment",
                                            "Verify enrollment status in applications tab",
                                            "Contact support if issue persists"
                                        ]
                                    },
                                    {
                                        issue: "Cannot See Student Profile",
                                        solutions: [
                                            "Verify you registered this student",
                                            "Check if student account is active",
                                            "Refresh the page",
                                            "Check user permissions"
                                        ]
                                    },
                                ].map((item, index) => (
                                    <div key={index} className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button
                                                className="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#issue${index}`}
                                            >
                                                <i className="bx bx-error-circle text-warning me-2"></i>
                                                {item.issue}
                                            </button>
                                        </h2>
                                        <div id={`issue${index}`} className="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                                            <div className="accordion-body">
                                                <ul className="mb-0">
                                                    {item.solutions.map((solution, idx) => (
                                                        <li key={idx}>{solution}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h5 className="mt-4">12.2 Getting Support</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card bg-warning text-dark">
                                        <div className="card-body text-center">
                                            <i className="bx bx-support fs-1 mb-2"></i>
                                            <h6 className="text-dark">Technical Support</h6>
                                            <p className="small mb-0">Contact system administrator for technical issues</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-info text-white">
                                        <div className="card-body text-center">
                                            <i className="bx bx-bug fs-1 mb-2"></i>
                                            <h6 className="text-white">Report an Issue</h6>
                                            <p className="small mb-0">Use the feedback form in Settings menu</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <p className="mb-1">
                                <strong>Lead Lancer Portal User Manual</strong> - Version 1.0
                            </p>
                            <small className="text-muted">Last Updated: December 2024</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadLancerUserManualPage;
