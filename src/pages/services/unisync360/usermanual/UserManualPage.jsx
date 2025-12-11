import React, { useState } from "react";
import { Link } from "react-router-dom";
import "animate.css";

export const UserManualPage = () => {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [searchQuery, setSearchQuery] = useState("");

    const sections = [
        { id: "getting-started", title: "Getting Started", icon: "bx-rocket" },
        { id: "dashboard", title: "Dashboard", icon: "bx-grid-alt" },
        { id: "students", title: "Student Management", icon: "bx-user" },
        { id: "institutions", title: "Institutions", icon: "bx-building" },
        { id: "academics", title: "Academic Programs", icon: "bx-book" },
        { id: "applications", title: "Applications", icon: "bx-file" },
        { id: "finance", title: "Financial Management", icon: "bx-dollar" },
        { id: "ai-features", title: "AI Features", icon: "bx-brain" },
        { id: "crm", title: "CRM & Communication", icon: "bx-message-dots" },
        { id: "reports", title: "Reports & Analytics", icon: "bx-bar-chart-alt-2" },
        { id: "bulk-import", title: "Bulk Import", icon: "bx-upload" },
        { id: "user-admin", title: "User Administration", icon: "bx-cog" },
        { id: "shortcuts", title: "Keyboard Shortcuts", icon: "bx-keyboard" },
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
                    <div className="card bg-primary text-white">
                        <div className="card-body py-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <h2 className="text-white mb-2">
                                        <i className="bx bx-book-open me-2"></i>
                                        UniSync360 User Manual
                                    </h2>
                                    <p className="mb-0 opacity-75">
                                        Complete guide to using the UniSync360 Student Management Platform
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
                                <i className="bx bx-rocket text-primary me-2"></i>
                                1. Getting Started
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>1.1 Logging In</h5>
                            <ol className="mb-4">
                                <li>Open your web browser and navigate to the UniSync360 URL</li>
                                <li>Enter your <strong>Username</strong> and <strong>Password</strong></li>
                                <li>Click <strong>Login</strong></li>
                            </ol>
                            <div className="alert alert-info">
                                <i className="bx bx-info-circle me-2"></i>
                                <strong>Note:</strong> If you've forgotten your password, contact your system administrator.
                            </div>

                            <h5>1.2 Navigation Overview</h5>
                            <p>The main navigation menu is located on the left sidebar:</p>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Icon</th>
                                            <th>Menu Item</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><i className="bx bx-grid-alt"></i></td>
                                            <td>Dashboard</td>
                                            <td>Overview and key metrics</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-user"></i></td>
                                            <td>Students</td>
                                            <td>Student management</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-building"></i></td>
                                            <td>Institutions</td>
                                            <td>Universities and schools</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-book"></i></td>
                                            <td>Academics</td>
                                            <td>Courses and programs</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-file"></i></td>
                                            <td>Applications</td>
                                            <td>Application processing</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-dollar"></i></td>
                                            <td>Accounts</td>
                                            <td>Financial management</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-brain"></i></td>
                                            <td>AI Insights</td>
                                            <td>AI-powered recommendations</td>
                                        </tr>
                                        <tr>
                                            <td><i className="bx bx-bar-chart-alt-2"></i></td>
                                            <td>Analytics</td>
                                            <td>Reports and comparisons</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h5>1.3 User Roles</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Role</th>
                                            <th>Access Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="badge bg-primary">Counselor</span></td>
                                            <td>Manage assigned students, create applications, view dashboards</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-info">Senior Counselor</span></td>
                                            <td>All counselor permissions + team oversight</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-success">Manager</span></td>
                                            <td>Full access to all modules + team management</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-warning">Finance Officer</span></td>
                                            <td>Financial management, invoicing, payments</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-danger">Administrator</span></td>
                                            <td>Full system access + user management</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Dashboard */}
                    <section id="dashboard" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-grid-alt text-primary me-2"></i>
                                2. Dashboard Overview
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>2.1 Accessing the Dashboard</h5>
                            <p>Click <strong>Dashboard</strong> in the sidebar to view your personalized dashboard.</p>

                            <h5>2.2 Key Metrics Cards</h5>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <ul>
                                        <li><strong>Total Students</strong> - Active students in the system</li>
                                        <li><strong>Pending Applications</strong> - Applications awaiting action</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <ul>
                                        <li><strong>This Month's Revenue</strong> - Financial performance</li>
                                        <li><strong>Conversion Rate</strong> - Inquiry to enrollment ratio</li>
                                    </ul>
                                </div>
                            </div>

                            <h5>2.3 Available Widgets</h5>
                            <div className="row">
                                {[
                                    { name: "AI Recommendations", desc: "AI-suggested actions for students", icon: "bx-bulb" },
                                    { name: "Task Management", desc: "Your pending tasks and deadlines", icon: "bx-task" },
                                    { name: "Upcoming Deadlines", desc: "Application and visa deadlines", icon: "bx-calendar" },
                                    { name: "Student Metrics", desc: "Student statistics and trends", icon: "bx-line-chart" },
                                    { name: "Revenue Chart", desc: "Financial performance graphs", icon: "bx-dollar-circle" },
                                    { name: "Application Status", desc: "Pipeline overview", icon: "bx-git-branch" },
                                ].map((widget, index) => (
                                    <div key={index} className="col-md-4 mb-3">
                                        <div className="border rounded p-3 h-100">
                                            <i className={`bx ${widget.icon} text-primary fs-4 mb-2`}></i>
                                            <h6 className="mb-1">{widget.name}</h6>
                                            <small className="text-muted">{widget.desc}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h5 className="mt-4">2.4 Quick Actions</h5>
                            <div className="d-flex flex-wrap gap-2">
                                <Link to="/unisync360/students" className="btn btn-outline-primary btn-sm">
                                    <i className="bx bx-user-plus me-1"></i> Add Student
                                </Link>
                                <Link to="/unisync360/institutions/universities/" className="btn btn-outline-info btn-sm">
                                    <i className="bx bx-building me-1"></i> Universities
                                </Link>
                                <Link to="/unisync360/academics/courses" className="btn btn-outline-success btn-sm">
                                    <i className="bx bx-book me-1"></i> Courses
                                </Link>
                                <Link to="/unisync360/accounts/invoices" className="btn btn-outline-warning btn-sm">
                                    <i className="bx bx-receipt me-1"></i> Invoices
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Student Management */}
                    <section id="students" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-user text-primary me-2"></i>
                                3. Student Management
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>3.1 Viewing Students</h5>
                            <ol>
                                <li>Navigate to <strong>Students</strong> in the sidebar</li>
                                <li>Use the search bar to find specific students</li>
                                <li>Apply filters: Status, Assigned Counselor, Nationality, Date Range</li>
                            </ol>

                            <h5>3.2 Adding a New Student</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card bg-light mb-3">
                                        <div className="card-body">
                                            <h6><i className="bx bx-user me-2"></i>Personal Information</h6>
                                            <ul className="mb-0 small">
                                                <li>First Name, Middle Name, Last Name</li>
                                                <li>Date of Birth, Gender</li>
                                                <li>Nationality, Marital Status</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light mb-3">
                                        <div className="card-body">
                                            <h6><i className="bx bx-phone me-2"></i>Contact Information</h6>
                                            <ul className="mb-0 small">
                                                <li>Personal Email, Phone Number</li>
                                                <li>WhatsApp Number, Address</li>
                                                <li>Emergency Contact Details</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h5>3.3 Student Profile Tabs</h5>
                            <div className="accordion" id="studentTabsAccordion">
                                {[
                                    { tab: "Overview", content: "Personal details summary, current status, assigned counselor, quick actions" },
                                    { tab: "Academics", content: "Academic history, previous qualifications, NECTA results, transcripts" },
                                    { tab: "Documents", content: "Required documents checklist, upload new documents, verification status" },
                                    { tab: "Finance", content: "Invoice history, payment records, outstanding balance, statement of account" },
                                    { tab: "Applications", content: "Course applications, application status, university responses" },
                                    { tab: "Communication", content: "Communication log, scheduled appointments, notes and reminders" },
                                ].map((item, index) => (
                                    <div key={index} className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button 
                                                className="accordion-button collapsed" 
                                                type="button" 
                                                data-bs-toggle="collapse" 
                                                data-bs-target={`#tab${index}`}
                                            >
                                                {item.tab} Tab
                                            </button>
                                        </h2>
                                        <div id={`tab${index}`} className="accordion-collapse collapse" data-bs-parent="#studentTabsAccordion">
                                            <div className="accordion-body">{item.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h5 className="mt-4">3.4 Student Status Workflow</h5>
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
                                    <span className="badge bg-info">Visa Applied</span>
                                    <i className="bx bx-right-arrow-alt"></i>
                                    <span className="badge bg-success">Enrolled</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Institutions */}
                    <section id="institutions" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-building text-primary me-2"></i>
                                4. Institution Management
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>4.1 Managing Universities</h5>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6>Viewing Universities</h6>
                                    <ol>
                                        <li>Navigate to <strong>Institutions → Universities</strong></li>
                                        <li>Use filters: Country, Status, Partnership Status</li>
                                        <li>Click on a university to view details</li>
                                    </ol>
                                </div>
                                <div className="col-md-6">
                                    <h6>Adding a University</h6>
                                    <ol>
                                        <li>Click <strong>+ Add University</strong></li>
                                        <li>Fill in: Name, Code, Country, Website, Contact</li>
                                        <li>Set partnership and scholarship info</li>
                                        <li>Click <strong>Save University</strong></li>
                                    </ol>
                                </div>
                            </div>

                            <h5>4.2 Managing Schools</h5>
                            <p>Schools represent secondary institutions (for NECTA tracking).</p>
                            <ul>
                                <li>Name and Registration Number</li>
                                <li>Region and District</li>
                                <li>Ownership Type (Government, Private, Religious)</li>
                                <li>Level (O-Level, A-Level, Both)</li>
                            </ul>

                            <div className="d-flex gap-2 mt-3">
                                <Link to="/unisync360/institutions/universities/" className="btn btn-primary btn-sm">
                                    <i className="bx bx-building me-1"></i> View Universities
                                </Link>
                                <Link to="/unisync360/institutions/schools" className="btn btn-outline-primary btn-sm">
                                    <i className="bx bx-school me-1"></i> View Schools
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Academic Programs */}
                    <section id="academics" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-book text-primary me-2"></i>
                                5. Academic Programs
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="card h-100 border-primary">
                                        <div className="card-header bg-primary text-white">
                                            <h6 className="mb-0">Course Categories</h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="small">Organize courses into hierarchical categories like Engineering, Business, Medicine, etc.</p>
                                            <Link to="/unisync360/academics/course-categories" className="btn btn-sm btn-outline-primary">
                                                Manage Categories
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="card h-100 border-info">
                                        <div className="card-header bg-info text-white">
                                            <h6 className="mb-0">Course Levels</h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="small">Define academic levels: Foundation, Certificate, Diploma, Bachelor's, Master's, PhD.</p>
                                            <Link to="/unisync360/academics/course-levels" className="btn btn-sm btn-outline-info">
                                                Manage Levels
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="card h-100 border-success">
                                        <div className="card-header bg-success text-white">
                                            <h6 className="mb-0">University Courses</h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="small">Link courses to universities with pricing, intakes, and scholarship info.</p>
                                            <Link to="/unisync360/academics/university-courses" className="btn btn-sm btn-outline-success">
                                                Manage Courses
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info mt-3">
                                <i className="bx bx-info-circle me-2"></i>
                                <strong>Note:</strong> Course codes are auto-generated based on category and level (e.g., ENG-BSC-001).
                            </div>
                        </div>
                    </section>

                    {/* Applications */}
                    <section id="applications" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-file text-primary me-2"></i>
                                6. Application Processing
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>6.1 Creating a Course Allocation</h5>
                            <ol>
                                <li>Open student profile</li>
                                <li>Go to <strong>Applications</strong> tab</li>
                                <li>Click <strong>+ New Application</strong></li>
                                <li>Select University Course, Intake Period, Priority</li>
                                <li>Click <strong>Submit Application</strong></li>
                            </ol>

                            <h5>6.2 Application Status Workflow</h5>
                            <div className="row text-center mb-4">
                                {[
                                    { status: "Pending", color: "secondary", icon: "bx-time" },
                                    { status: "Submitted", color: "info", icon: "bx-send" },
                                    { status: "Under Review", color: "warning", icon: "bx-search" },
                                    { status: "Decision", color: "primary", icon: "bx-check-double" },
                                ].map((item, index) => (
                                    <div key={index} className="col-3">
                                        <div className={`border border-${item.color} rounded p-3`}>
                                            <i className={`bx ${item.icon} fs-3 text-${item.color}`}></i>
                                            <p className="mb-0 small mt-2">{item.status}</p>
                                        </div>
                                        {index < 3 && <i className="bx bx-right-arrow-alt fs-4 text-muted mt-2"></i>}
                                    </div>
                                ))}
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <div className="card bg-success text-white">
                                        <div className="card-body text-center">
                                            <i className="bx bx-check-circle fs-1"></i>
                                            <h6>Approved</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-warning">
                                        <div className="card-body text-center">
                                            <i className="bx bx-time-five fs-1"></i>
                                            <h6>Waitlisted</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-danger text-white">
                                        <div className="card-body text-center">
                                            <i className="bx bx-x-circle fs-1"></i>
                                            <h6>Rejected</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Financial Management */}
                    <section id="finance" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-dollar text-primary me-2"></i>
                                7. Financial Management
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h5>7.1 Chart of Accounts</h5>
                                    <p>View account hierarchy by type:</p>
                                    <ul>
                                        <li><span className="badge bg-success">Assets</span></li>
                                        <li><span className="badge bg-danger">Liabilities</span></li>
                                        <li><span className="badge bg-info">Equity</span></li>
                                        <li><span className="badge bg-primary">Revenue</span></li>
                                        <li><span className="badge bg-warning">Expenses</span></li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h5>7.2 Creating Invoices</h5>
                                    <ol>
                                        <li>Navigate to <strong>Accounts → Invoices</strong></li>
                                        <li>Click <strong>+ New Invoice</strong></li>
                                        <li>Select Student</li>
                                        <li>Add line items with quantities and prices</li>
                                        <li>Set due date and terms</li>
                                        <li>Click <strong>Save Invoice</strong></li>
                                    </ol>
                                </div>
                            </div>

                            <h5>7.3 Invoice Actions</h5>
                            <div className="btn-group mb-4">
                                <button className="btn btn-outline-primary btn-sm">
                                    <i className="bx bx-envelope me-1"></i> Send Invoice
                                </button>
                                <button className="btn btn-outline-secondary btn-sm">
                                    <i className="bx bx-printer me-1"></i> Print Invoice
                                </button>
                                <button className="btn btn-outline-success btn-sm">
                                    <i className="bx bx-check me-1"></i> Mark as Paid
                                </button>
                                <button className="btn btn-outline-danger btn-sm">
                                    <i className="bx bx-x me-1"></i> Cancel
                                </button>
                            </div>

                            <h5>7.4 Financial Reports</h5>
                            <div className="row">
                                {[
                                    { name: "Income Statement", desc: "Revenue and expenses" },
                                    { name: "Balance Sheet", desc: "Assets, liabilities, equity" },
                                    { name: "Student Statement", desc: "Individual student account" },
                                    { name: "Aged Receivables", desc: "Outstanding payments" },
                                ].map((report, index) => (
                                    <div key={index} className="col-md-3 mb-2">
                                        <div className="card bg-light h-100">
                                            <div className="card-body p-2 text-center">
                                                <i className="bx bx-file fs-3 text-primary"></i>
                                                <h6 className="small mb-0">{report.name}</h6>
                                                <small className="text-muted">{report.desc}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3">
                                <Link to="/unisync360/accounts/reports" className="btn btn-primary btn-sm">
                                    <i className="bx bx-bar-chart-alt-2 me-1"></i> View Reports
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* AI Features */}
                    <section id="ai-features" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-brain text-primary me-2"></i>
                                8. AI-Powered Features
                            </h4>
                        </div>
                        <div className="card-body">
                            <p>UniSync360 includes powerful AI features to enhance student counseling and decision-making.</p>
                            
                            <div className="row">
                                {[
                                    { 
                                        title: "Course Recommendations", 
                                        icon: "bx-bulb", 
                                        color: "primary",
                                        desc: "AI analyzes academic background, budget, country preferences, and career goals to suggest best-fit courses."
                                    },
                                    { 
                                        title: "Eligibility Check", 
                                        icon: "bx-check-shield", 
                                        color: "success",
                                        desc: "Verify if a student qualifies for specific courses based on admission requirements."
                                    },
                                    { 
                                        title: "Pre-Departure Planning", 
                                        icon: "bx-plane-take-off", 
                                        color: "info",
                                        desc: "Generate comprehensive departure checklists: documents, visa, travel, health, accommodation."
                                    },
                                    { 
                                        title: "Document Check", 
                                        icon: "bx-file-find", 
                                        color: "warning",
                                        desc: "AI-assisted document completeness verification with expiry warnings."
                                    },
                                    { 
                                        title: "Risk Assessment", 
                                        icon: "bx-shield-quarter", 
                                        color: "danger",
                                        desc: "Evaluate application success probability based on academic fit, financial capacity, and visa likelihood."
                                    },
                                    { 
                                        title: "Success Score", 
                                        icon: "bx-trophy", 
                                        color: "success",
                                        desc: "Predict student success likelihood (0-100) based on multiple factors."
                                    },
                                ].map((feature, index) => (
                                    <div key={index} className="col-md-6 mb-3">
                                        <div className={`card border-${feature.color} h-100`}>
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className={`avatar avatar-sm bg-${feature.color} rounded me-2`}>
                                                        <i className={`bx ${feature.icon} text-white`}></i>
                                                    </div>
                                                    <h6 className="mb-0">{feature.title}</h6>
                                                </div>
                                                <p className="small text-muted mb-0">{feature.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="alert alert-primary mt-3">
                                <i className="bx bx-info-circle me-2"></i>
                                Access AI features from the student profile <strong>AI Insights</strong> tab or from <strong>Recommendations</strong> menu.
                            </div>
                        </div>
                    </section>

                    {/* CRM & Communication */}
                    <section id="crm" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-message-dots text-primary me-2"></i>
                                9. CRM & Communication
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <h5>9.1 Communication Log</h5>
                                    <p>Record all student interactions:</p>
                                    <div className="d-flex flex-wrap gap-2">
                                        <span className="badge bg-primary"><i className="bx bx-phone me-1"></i> Phone Call</span>
                                        <span className="badge bg-info"><i className="bx bx-envelope me-1"></i> Email</span>
                                        <span className="badge bg-success"><i className="bx bxl-whatsapp me-1"></i> WhatsApp</span>
                                        <span className="badge bg-warning"><i className="bx bx-user me-1"></i> In-Person</span>
                                        <span className="badge bg-secondary"><i className="bx bx-video me-1"></i> Video Call</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-4">
                                    <h5>9.2 Scheduling Appointments</h5>
                                    <ol className="small">
                                        <li>Navigate to <strong>Students → Appointments</strong></li>
                                        <li>Click <strong>+ Schedule Appointment</strong></li>
                                        <li>Select Student, Type, Date/Time, Duration</li>
                                        <li>Add notes and click <strong>Schedule</strong></li>
                                    </ol>
                                </div>
                            </div>

                            <h5>9.3 Task Management</h5>
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Priority</th>
                                            <th>Description</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="badge bg-danger">High</span></td>
                                            <td>Urgent tasks requiring immediate attention</td>
                                            <td>Mark as In Progress / Completed</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-warning">Medium</span></td>
                                            <td>Important but not urgent tasks</td>
                                            <td>Mark as In Progress / Completed</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge bg-info">Low</span></td>
                                            <td>Tasks that can wait</td>
                                            <td>Mark as In Progress / Completed</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Reports & Analytics */}
                    <section id="reports" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-bar-chart-alt-2 text-primary me-2"></i>
                                10. Reports & Analytics
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {[
                                    { title: "Course Comparison", desc: "Compare courses across universities (fees, duration, requirements)", link: "/unisync360/analytics/course-comparison" },
                                    { title: "University Comparison", desc: "Compare rankings, fees, available courses, intake periods", link: "/unisync360/institutions/universities/" },
                                    { title: "Application Trends", desc: "Applications over time, popular destinations, conversion rates", link: "/unisync360/applications/course-allocations" },
                                    { title: "Financial Reports", desc: "Income statement, balance sheet, aged receivables", link: "/unisync360/accounts/reports" },
                                ].map((report, index) => (
                                    <div key={index} className="col-md-6 mb-3">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6>{report.title}</h6>
                                                <p className="small text-muted mb-2">{report.desc}</p>
                                                <Link to={report.link} className="btn btn-sm btn-outline-primary">
                                                    View Report
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Bulk Import */}
                    <section id="bulk-import" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-upload text-primary me-2"></i>
                                11. Bulk Import
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>11.1 Import Process</h5>
                            <div className="row text-center mb-4">
                                {[
                                    { step: "1", title: "Download Template", icon: "bx-download" },
                                    { step: "2", title: "Fill Data", icon: "bx-edit" },
                                    { step: "3", title: "Upload File", icon: "bx-upload" },
                                    { step: "4", title: "Review & Import", icon: "bx-check-circle" },
                                ].map((item, index) => (
                                    <div key={index} className="col-3">
                                        <div className="border rounded p-3">
                                            <div className="avatar avatar-md bg-primary rounded-circle mx-auto mb-2">
                                                <span className="text-white">{item.step}</span>
                                            </div>
                                            <i className={`bx ${item.icon} fs-3 text-primary`}></i>
                                            <p className="mb-0 small mt-2">{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h5>11.2 Supported Import Types</h5>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                <span className="badge bg-primary fs-6"><i className="bx bx-user me-1"></i> Students</span>
                                <span className="badge bg-info fs-6"><i className="bx bx-building me-1"></i> Universities</span>
                                <span className="badge bg-success fs-6"><i className="bx bx-school me-1"></i> Schools</span>
                                <span className="badge bg-warning fs-6"><i className="bx bx-book me-1"></i> University Courses</span>
                            </div>

                            <h5>11.3 Handling Import Errors</h5>
                            <ol>
                                <li>Open the import job</li>
                                <li>Go to <strong>Errors</strong> tab</li>
                                <li>View error details (row number, field name, error message)</li>
                                <li>Download error report</li>
                                <li>Fix issues in source file</li>
                                <li>Re-import corrected rows</li>
                            </ol>
                        </div>
                    </section>

                    {/* User Administration */}
                    <section id="user-admin" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-cog text-primary me-2"></i>
                                12. User Administration
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-warning">
                                <i className="bx bx-lock me-2"></i>
                                <strong>Administrators Only:</strong> User management features are restricted to administrator accounts.
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <h5>12.1 Managing Users</h5>
                                    <ul>
                                        <li>Navigate to <strong>Settings → Users</strong></li>
                                        <li>View all system users</li>
                                        <li>Filter by role or status</li>
                                        <li>Click <strong>+ Add User</strong> to create new user</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h5>12.2 Role Assignment</h5>
                                    <ul>
                                        <li>Open user profile</li>
                                        <li>Click <strong>Manage Roles</strong></li>
                                        <li>Select appropriate roles</li>
                                        <li>Click <strong>Save</strong></li>
                                    </ul>
                                </div>
                            </div>

                            <h5>12.3 Password Management</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <h6><i className="bx bx-key me-2"></i>Admin Reset</h6>
                                            <ol className="small mb-0">
                                                <li>Open user profile</li>
                                                <li>Click <strong>Reset Password</strong></li>
                                                <li>Enter new password</li>
                                                <li>Click <strong>Confirm</strong></li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <h6><i className="bx bx-user-circle me-2"></i>Self-Service</h6>
                                            <ol className="small mb-0">
                                                <li>Click profile icon (top right)</li>
                                                <li>Select <strong>Change Password</strong></li>
                                                <li>Enter current and new password</li>
                                                <li>Click <strong>Update</strong></li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <Link to="/unisync360/users" className="btn btn-primary btn-sm">
                                    <i className="bx bx-user-plus me-1"></i> Manage Users
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Keyboard Shortcuts */}
                    <section id="shortcuts" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-keyboard text-primary me-2"></i>
                                13. Keyboard Shortcuts
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Shortcut</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
                                            <td>Save current form</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Ctrl</kbd> + <kbd>N</kbd></td>
                                            <td>New record</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
                                            <td>Search / Find</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Esc</kbd></td>
                                            <td>Close modal / dialog</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Enter</kbd></td>
                                            <td>Submit form</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Troubleshooting */}
                    <section id="troubleshooting" className="card mb-4">
                        <div className="card-header bg-light">
                            <h4 className="card-title mb-0">
                                <i className="bx bx-wrench text-primary me-2"></i>
                                14. Troubleshooting
                            </h4>
                        </div>
                        <div className="card-body">
                            <h5>14.1 Common Issues</h5>
                            <div className="accordion" id="troubleshootingAccordion">
                                {[
                                    { 
                                        issue: "Cannot Login", 
                                        solutions: [
                                            "Verify username and password are correct",
                                            "Check if account is active",
                                            "Clear browser cache and cookies",
                                            "Contact administrator if locked out"
                                        ]
                                    },
                                    { 
                                        issue: "Page Not Loading", 
                                        solutions: [
                                            "Check internet connection",
                                            "Refresh the page (Ctrl + F5)",
                                            "Try a different browser",
                                            "Clear browser cache"
                                        ]
                                    },
                                    { 
                                        issue: "Upload Failed", 
                                        solutions: [
                                            "Check file size (max 10MB typically)",
                                            "Verify file format is supported",
                                            "Try compressing large files",
                                            "Check internet connection"
                                        ]
                                    },
                                    { 
                                        issue: "Data Not Saving", 
                                        solutions: [
                                            "Check required fields are filled",
                                            "Look for validation error messages",
                                            "Refresh and try again",
                                            "Check internet connection"
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

                            <h5 className="mt-4">14.2 Error Messages</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Error</th>
                                            <th>Solution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>Session Expired</code></td>
                                            <td>Log in again</td>
                                        </tr>
                                        <tr>
                                            <td><code>Permission Denied</code></td>
                                            <td>Contact administrator for access</td>
                                        </tr>
                                        <tr>
                                            <td><code>Record Not Found</code></td>
                                            <td>Record may have been deleted</td>
                                        </tr>
                                        <tr>
                                            <td><code>Validation Error</code></td>
                                            <td>Check input data format</td>
                                        </tr>
                                        <tr>
                                            <td><code>Server Error</code></td>
                                            <td>Wait and retry, contact support if persists</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h5 className="mt-4">14.3 Getting Help</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card bg-primary text-white">
                                        <div className="card-body text-center">
                                            <i className="bx bx-support fs-1 mb-2"></i>
                                            <h6 className="text-white">Technical Support</h6>
                                            <p className="small mb-0">Contact your system administrator</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-info text-white">
                                        <div className="card-body text-center">
                                            <i className="bx bx-bug fs-1 mb-2"></i>
                                            <h6 className="text-white">Report a Bug</h6>
                                            <p className="small mb-0">Use the feedback form in Settings</p>
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
                                <strong>UniSync360 User Manual</strong> - Version 1.0
                            </p>
                            <small className="text-muted">Last Updated: December 2024</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManualPage;
