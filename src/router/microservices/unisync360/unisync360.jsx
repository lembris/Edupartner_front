import ProtectedRoute from "../../../components/wrapper/ProtectedRoute";

import { UnisyncDashboardPage } from "../../../pages/services/unisync360/dashboard/UnisyncDashboardPage.jsx";
import { UniversityListPage } from "../../../pages/services/unisync360/institutions/universities/UniversityListPage.jsx";
import { UniversityDetailsPage } from "../../../pages/services/unisync360/institutions/universities/UniversityDetailsPage.jsx";
import { SchoolListPage } from "../../../pages/services/unisync360/institutions/schools/SchoolListPage.jsx";
import { SchoolDetailsPage } from "../../../pages/services/unisync360/institutions/schools/SchoolDetailsPage.jsx";
import { CourseListPage } from "../../../pages/services/unisync360/academics/courses/CourseListPage.jsx";
import { CourseDetailsPage } from "../../../pages/services/unisync360/academics/courses/CourseDetailsPage.jsx";
import { CourseCategoryListPage } from "../../../pages/services/unisync360/academics/courses/categories/CourseCategoryListPage.jsx";
import { CourseLevelListPage } from "../../../pages/services/unisync360/academics/courses/levels/CourseLevelListPage.jsx";
import { UniversityCourseListPage } from "../../../pages/services/unisync360/academics/courses/universities/UniversityCourseListPage.jsx";
import { UniversityCourseDetailsPage } from "../../../pages/services/unisync360/academics/courses/universities/UniversityCourseDetailsPage.jsx";
import { StudentListPage } from "../../../pages/services/unisync360/students/StudentListPage.jsx";
import { StudentDetailsPage } from "../../../pages/services/unisync360/students/StudentDetailsPage.jsx";
import AIInsightsPage from "../../../pages/services/unisync360/students/ai/AIInsightsPage.jsx";
import { StudentSourceListPage } from "../../../pages/services/unisync360/students/source/StudentSourceListPage.jsx";
import { StudentStatusListPage } from "../../../pages/services/unisync360/students/status/StudentStatusListPage.jsx";

// Consent Management
import { ConsentListPage } from "../../../pages/services/unisync360/consent/ConsentListPage.jsx";
import { ConsentDetailsPage } from "../../../pages/services/unisync360/consent/ConsentDetailsPage.jsx";
import { PublicConsentRequestPage } from "../../../pages/services/unisync360/consent/PublicConsentRequestPage.jsx";
import { ServiceSetupListPage } from "../../../pages/services/unisync360/consent-services/ServiceSetupListPage.jsx";
import { ServiceSetupDetailsPage } from "../../../pages/services/unisync360/consent-services/ServiceSetupDetailsPage.jsx";
import { CourseAllocationListPage } from "../../../pages/services/unisync360/applications/course-allocations/CourseAllocationListPage.jsx";
import { CourseAllocationDetailsPage } from "../../../pages/services/unisync360/applications/course-allocations/CourseAllocationDetailsPage.jsx";
import { DocumentRequirementListPage } from "../../../pages/services/unisync360/applications/documents/DocumentRequirementListPage.jsx";
import { CourseComparisonPage } from "../../../pages/services/unisync360/comparison/CourseComparisonPage.jsx";
import { RecommendationEngineListPage } from "../../../pages/services/unisync360/recommendations/RecommendationEngineListPage.jsx";
import { RecommendedCourseListPage } from "../../../pages/services/unisync360/recommendations/RecommendedCourseListPage.jsx";
import { WeightConfigListPage } from "../../../pages/services/unisync360/recommendations/WeightConfigListPage.jsx";
import { GenerateRecommendationsPage } from "../../../pages/services/unisync360/recommendations/GenerateRecommendationsPage.jsx";

// Accounts
import { ChartOfAccountsListPage } from "../../../pages/services/unisync360/accounts/ChartOfAccountsListPage.jsx";
import { TransactionsListPage } from "../../../pages/services/unisync360/accounts/TransactionsListPage.jsx";
import { TransactionDetailsPage } from "../../../pages/services/unisync360/accounts/TransactionDetailsPage.jsx";
import { PaymentsListPage } from "../../../pages/services/unisync360/accounts/PaymentsListPage.jsx";
import { InvoicesListPage } from "../../../pages/services/unisync360/accounts/InvoicesListPage.jsx";
import { InvoiceDetailsPage } from "../../../pages/services/unisync360/accounts/InvoiceDetailsPage.jsx";
import { FinancialReportsPage } from "../../../pages/services/unisync360/accounts/FinancialReportsPage.jsx";

// User Management
import { UserListPage } from "../../../pages/services/unisync360/users/UserListPage.jsx";
import { RoleListPage } from "../../../pages/services/unisync360/roles/RoleListPage.jsx";
import { PermissionListPage } from "../../../pages/services/unisync360/permissions/PermissionListPage.jsx";

// Site Settings
import SiteSettingsPage from "../../../pages/services/unisync360/site/SiteSettingsPage.jsx";

// User Manual
import { UserManualPage } from "../../../pages/services/unisync360/usermanual/UserManualPage.jsx";
import { LeadLancerUserManualPage } from "../../../pages/services/unisync360/lead-lancer/LeadLancerUserManualPage.jsx";

// Commission Portal & Management
import { CommissionsListPage } from "../../../pages/services/unisync360/commissions/CommissionsListPage.jsx";
import { CommissionPackagesListPage } from "../../../pages/services/unisync360/commission-packages/CommissionPackagesListPage.jsx";
import { LeadLancerListPage } from "../../../pages/services/unisync360/lead-lancer/LeadLancerListPage.jsx";
import { ExternalCounselorDashboard } from "../../../pages/services/unisync360/commission-portal/ExternalCounselorDashboard.jsx";

// Lead Lancer Portal Components
import { LeadLancerPortalDashboard } from "../../../pages/services/unisync360/lead-lancer/LeadLancerPortalDashboard.jsx";
import { MyStudentsList } from "../../../pages/services/unisync360/lead-lancer/MyStudentsList.jsx";
import { UniversityCourseCatalog } from "../../../pages/services/unisync360/lead-lancer/UniversityCourseCatalog.jsx";

// Location Management (Country, Region, District, Ward)
import { CountryListPage } from "../../../pages/services/unisync360/locations/countries/CountryListPage.jsx";
import { CountryDetailsPage } from "../../../pages/services/unisync360/locations/countries/CountryDetailsPage.jsx";
import { RegionListPage } from "../../../pages/services/unisync360/locations/regions/RegionListPage.jsx";
import { RegionDetailsPage } from "../../../pages/services/unisync360/locations/regions/RegionDetailsPage.jsx";
import { DistrictListPage } from "../../../pages/services/unisync360/locations/districts/DistrictListPage.jsx";
import { DistrictDetailsPage } from "../../../pages/services/unisync360/locations/districts/DistrictDetailsPage.jsx";
import { WardListPage } from "../../../pages/services/unisync360/locations/wards/WardListPage.jsx";
import { WardDetailsPage } from "../../../pages/services/unisync360/locations/wards/WardDetailsPage.jsx";

const unisync360Permissions = {
    // Dashboard - All authenticated users
    dashboard: ["view_dashboard"],

    // All UniSync360 roles
    roles: [
        "unisync360_super_admin",
        "unisync360_facilitation_officer",
        "unisync360_accountant",
        "unisync360_counselor",
        "unisync360_external_counselor",
        "unisync360_lead_lancer",
    ],

    // Read-only roles
    readOnlyRoles: ["unisync360_external_counselor", "unisync360_lead_lancer"],

    // Institution Management (Universities & Schools)
    institution: {
        // University Base
        view: ["view_university"],
        create: ["add_university"],
        edit: ["change_university"],
        delete: ["delete_university"],
        viewDetails: ["view_university"],

        // University Courses
        viewCourse: ["view_universitycourse"],
        addCourse: ["add_universitycourse"],
        changeCourse: ["change_universitycourse"],
        deleteCourse: ["delete_universitycourse"],

        // University Accommodations
        viewAccommodation: ["view_universityaccommodation"],
        addAccommodation: ["add_universityaccommodation"],
        changeAccommodation: ["change_universityaccommodation"],
        deleteAccommodation: ["delete_universityaccommodation"],

        // University Gallery
        viewGallery: ["view_universitygallery"],
        addGallery: ["add_universitygallery"],
        changeGallery: ["change_universitygallery"],
        deleteGallery: ["delete_universitygallery"],

        // University Partnerships
        viewPartnership: ["view_universitypartnership"],
        addPartnership: ["add_universitypartnership"],
        changePartnership: ["change_universitypartnership"],
        deletePartnership: ["delete_universitypartnership"],

        // University Requirements
        viewRequirements: ["view_universityrequirements"],
        addRequirements: ["add_universityrequirements"],
        changeRequirements: ["change_universityrequirements"],
        deleteRequirements: ["delete_universityrequirements"],

        // University Expenses
        viewExpense: ["view_universityexpense"],
        addExpense: ["add_universityexpense"],
        changeExpense: ["change_universityexpense"],
        deleteExpense: ["delete_universityexpense"],
    },

    // School Management
    school: {
        // School Base
        view: ["view_school"],
        create: ["add_school"],
        edit: ["change_school"],
        delete: ["delete_school"],
        viewDetails: ["view_school"],

        // NECTA School Details
        viewNectaDetail: ["view_nectaschooldetail"],
        addNectaDetail: ["add_nectaschooldetail"],
        changeNectaDetail: ["change_nectaschooldetail"],
        deleteNectaDetail: ["delete_nectaschooldetail"],
    },

    // Academic Programs (Courses, Categories, Levels)
    academics: {
        // Course Base
        view: ["view_course"],
        create: ["add_course"],
        edit: ["change_course"],
        delete: ["delete_course"],
        viewDetails: ["view_course"],

        // Course Categories
        viewCategory: ["view_coursecategory"],
        addCategory: ["add_coursecategory"],
        changeCategory: ["change_coursecategory"],
        deleteCategory: ["delete_coursecategory"],

        // Course Levels
        viewLevel: ["view_courselevel"],
        addLevel: ["add_courselevel"],
        changeLevel: ["change_courselevel"],
        deleteLevel: ["delete_courselevel"],

        // University Courses
        viewUniversityCourse: ["view_universitycourse"],
        addUniversityCourse: ["add_universitycourse"],
        changeUniversityCourse: ["change_universitycourse"],
        deleteUniversityCourse: ["delete_universitycourse"],

        // Course Allocations
        viewAllocation: ["view_courseallocation"],
        addAllocation: ["add_courseallocation"],
        changeAllocation: ["change_courseallocation"],
        deleteAllocation: ["delete_courseallocation"],
        approveAllocation: ["approve_courseallocation"],

        // Course Recommendations
        viewRecommendationEngine: ["view_courserecommendationengine"],
        addRecommendationEngine: ["add_courserecommendationengine"],
        changeRecommendationEngine: ["change_courserecommendationengine"],
        deleteRecommendationEngine: ["delete_courserecommendationengine"],

        // Recommended Courses
        viewRecommendedCourse: ["view_recommendedcourse"],
        addRecommendedCourse: ["add_recommendedcourse"],
        changeRecommendedCourse: ["change_recommendedcourse"],
        deleteRecommendedCourse: ["delete_recommendedcourse"],
    },

    // Student Management
    student: {
        // Student Base
        view: ["view_student"],
        create: ["add_student"],
        edit: ["change_student"],
        delete: ["delete_student"],
        viewDetails: ["view_student"],

        // Student Academic History
        viewAcademicHistory: ["view_studentacademichistory"],
        addAcademicHistory: ["add_studentacademichistory"],
        changeAcademicHistory: ["change_studentacademichistory"],
        deleteAcademicHistory: ["delete_studentacademichistory"],

        // Student Documents
        viewDocument: ["view_studentdocument"],
        addDocument: ["add_studentdocument"],
        changeDocument: ["change_studentdocument"],
        deleteDocument: ["delete_studentdocument"],

        // Student Expense
        viewExpense: ["view_studentexpense"],
        addExpense: ["add_studentexpense"],
        changeExpense: ["change_studentexpense"],
        deleteExpense: ["delete_studentexpense"],

        // Student Preference Profile
        viewPreference: ["view_studentpreferenceprofile"],
        addPreference: ["add_studentpreferenceprofile"],
        changePreference: ["change_studentpreferenceprofile"],
        deletePreference: ["delete_studentpreferenceprofile"],

        // Student Source
        viewSource: ["view_studentsource"],
        addSource: ["add_studentsource"],
        changeSource: ["change_studentsource"],
        deleteSource: ["delete_studentsource"],

        // Student Status
        viewStatus: ["view_studentstatus"],
        addStatus: ["add_studentstatus"],
        changeStatus: ["change_studentstatus"],
        deleteStatus: ["delete_studentstatus"],

        // Student Journey Milestone
        viewJourneyMilestone: ["view_studentjourneymilestone"],
        addJourneyMilestone: ["add_studentjourneymilestone"],
        changeJourneyMilestone: ["change_studentjourneymilestone"],
        deleteJourneyMilestone: ["delete_studentjourneymilestone"],

        // Student Alert
        viewAlert: ["view_studentalert"],
        addAlert: ["add_studentalert"],
        changeAlert: ["change_studentalert"],
        deleteAlert: ["delete_studentalert"],

        // Student Contact
        viewContact: ["view_studentcontact"],
        addContact: ["add_studentcontact"],
        changeContact: ["change_studentcontact"],
        deleteContact: ["delete_studentcontact"],

        // Student Contract
        viewContract: ["view_studentcontract"],
        addContract: ["add_studentcontract"],
        changeContract: ["change_studentcontract"],
        deleteContract: ["delete_studentcontract"],

        // Agent Commission
        viewAgentCommission: ["view_agentcommission"],
        addAgentCommission: ["add_agentcommission"],
        changeAgentCommission: ["change_agentcommission"],
        deleteAgentCommission: ["delete_agentcommission"],

        // Commission Payment
        viewCommissionPayment: ["view_commissionpayment"],
        addCommissionPayment: ["add_commissionpayment"],
        changeCommissionPayment: ["change_commissionpayment"],
        deleteCommissionPayment: ["delete_commissionpayment"],

        // Student Commission Status
        viewCommissionStatus: ["view_studentcommissionstatus"],
        addCommissionStatus: ["add_studentcommissionstatus"],
        changeCommissionStatus: ["change_studentcommissionstatus"],
        deleteCommissionStatus: ["delete_studentcommissionstatus"],

        // Commission (Fallback/Legacy)
        viewCommission: ["view_commission"],
        addCommission: ["add_commission"],
        changeCommission: ["change_commission"],
        deleteCommission: ["delete_commission"],

        // Student Success Prediction
        viewSuccessPrediction: ["view_studentsuccessprediction"],
        addSuccessPrediction: ["add_studentsuccessprediction"],
        changeSuccessPrediction: ["change_studentsuccessprediction"],
        deleteSuccessPrediction: ["delete_studentsuccessprediction"],

        // NECTA Student Result
        viewNectaResult: ["view_nectastudentresult"],
        addNectaResult: ["add_nectastudentresult"],
        changeNectaResult: ["change_nectastudentresult"],
        deleteNectaResult: ["delete_nectastudentresult"],

        // Recruiter Student
        viewRecruiterStudent: ["view_recruiterstudent"],
        addRecruiterStudent: ["add_recruiterstudent"],
        changeRecruiterStudent: ["change_recruiterstudent"],
        deleteRecruiterStudent: ["delete_recruiterstudent"],
    },

    // Application Processing (Course Allocations, Documents)
    application: {
        // Course Allocations
        viewAllocation: ["view_courseallocation"],
        createAllocation: ["add_courseallocation"],
        editAllocation: ["change_courseallocation"],
        deleteAllocation: ["delete_courseallocation"],
        approveAllocation: ["approve_courseallocation"],

        // Document Requirements
        viewDocument: ["view_documentrequirement"],
        addDocument: ["add_documentrequirement"],
        changeDocument: ["change_documentrequirement"],
        deleteDocument: ["delete_documentrequirement"],

        // Document Verification
        verifyDocument: ["verify_studentdocument"],
        verifyStudentDocument: ["verify_studentdocument"],
    },

    // Recommendations
    recommendation: {
        // Recommendation Engine
        viewEngine: ["view_courserecommendationengine"],
        addEngine: ["add_courserecommendationengine"],
        changeEngine: ["change_courserecommendationengine"],
        deleteEngine: ["delete_courserecommendationengine"],

        // Recommended Courses
        viewRecommended: ["view_recommendedcourse"],
        addRecommended: ["add_recommendedcourse"],
        changeRecommended: ["change_recommendedcourse"],
        deleteRecommended: ["delete_recommendedcourse"],

        // Weight Config
        viewWeight: ["view_recommendationweightconfig"],
        addWeight: ["add_recommendationweightconfig"],
        changeWeight: ["change_recommendationweightconfig"],
        deleteWeight: ["delete_recommendationweightconfig"],

        // Generate Recommendations
        view: ["view_recommendation"],
        generate: ["add_recommendation"],
    },

    // Financial Management (Accounts)
    accounting: {
        // Account Type
        viewAccountType: ["view_accounttype"],
        addAccountType: ["add_accounttype"],
        changeAccountType: ["change_accounttype"],
        deleteAccountType: ["delete_accounttype"],

        // Chart of Accounts (using courseallocation as placeholder for now)
        viewChart: ["view_accounttype"],
        editChart: ["change_accounttype"],

        // Transactions
        viewTransactions: ["view_accounttype"],

        // Payments
        viewPayments: ["view_accounttype"],
        editPayments: ["change_accounttype"],

        // Invoices
        viewInvoices: ["view_accounttype"],
        editInvoices: ["change_accounttype"],

        // Reports
        viewReports: ["view_accounttype"],
    },

    // Location Management (Country, Region, District, Ward)
    location: {
        // Country
        viewCountry: ["view_country"],
        addCountry: ["add_country"],
        changeCountry: ["change_country"],
        deleteCountry: ["delete_country"],

        // Region
        viewRegion: ["view_region"],
        addRegion: ["add_region"],
        changeRegion: ["change_region"],
        deleteRegion: ["delete_region"],

        // District
        viewDistrict: ["view_district"],
        addDistrict: ["add_district"],
        changeDistrict: ["change_district"],
        deleteDistrict: ["delete_district"],

        // Ward
        viewWard: ["view_ward"],
        addWard: ["add_ward"],
        changeWard: ["change_ward"],
        deleteWard: ["delete_ward"],
    },

    // Commission Management (Agent Commissions, Packages, Targets, Payments, Predictions)
    commission: {
        // Agent Commission
        viewAgentCommission: ["view_agentcommission"],
        addAgentCommission: ["add_agentcommission"],
        changeAgentCommission: ["change_agentcommission"],
        deleteAgentCommission: ["delete_agentcommission"],

        // Commission Package
        viewPackage: ["view_commissionpackage"],
        addPackage: ["add_commissionpackage"],
        changePackage: ["change_commissionpackage"],
        deletePackage: ["delete_commissionpackage"],

        // Commission Target
        viewTarget: ["view_commissiontarget"],
        addTarget: ["add_commissiontarget"],
        changeTarget: ["change_commissiontarget"],
        deleteTarget: ["delete_commissiontarget"],

        // Commission Payment
        viewPayment: ["view_commissionpayment"],
        addPayment: ["add_commissionpayment"],
        changePayment: ["change_commissionpayment"],
        deletePayment: ["delete_commissionpayment"],

        // Commission Prediction
        viewPrediction: ["view_commissionprediction"],
        addPrediction: ["add_commissionprediction"],
        changePrediction: ["change_commissionprediction"],
        deletePrediction: ["delete_commissionprediction"],

        // Bulk Operations
        viewAll: ["view_agentcommission", "view_commissionpackage", "view_commissiontarget", "view_commissionpayment", "view_commissionprediction"],
        createAll: ["add_agentcommission", "add_commissionpackage", "add_commissiontarget", "add_commissionpayment", "add_commissionprediction"],
        editAll: ["change_agentcommission", "change_commissionpackage", "change_commissiontarget", "change_commissionpayment", "change_commissionprediction"],
        deleteAll: ["delete_agentcommission", "delete_commissionpackage", "delete_commissiontarget", "delete_commissionpayment", "delete_commissionprediction"],
    },

    // User Management (Admin Only)
    admin: {
        // Permission Management
        viewPermissions: ["view_permission"],
        addPermissions: ["add_permission"],
        editPermissions: ["change_permission"],
        deletePermissions: ["delete_permission"],
        viewSystemPermission: ["can_view_system_permission"],
        assignUserPermission: ["assign_user_permission"],

        // Group/Role Management
        viewRoles: ["view_group"],
        addRoles: ["add_group"],
        editRoles: ["change_group"],
        deleteRoles: ["delete_group"],

        // User Management
        viewUsers: ["view_user"],
        addUsers: ["add_user"],
        editUsers: ["change_user"],
        deleteUsers: ["delete_user"],
    },

    // Service Management (Service Setup, Consents)
    service: {
        // Service Setup
        viewSetup: ["view_consentservice"],
        addSetup: ["add_consentservice"],
        changeSetup: ["change_consentservice"],
        deleteSetup: ["delete_consentservice"],
        viewSetupDetails: ["view_consentservice"],

        // Consent Management
        viewConsent: ["view_student"],
        addConsent: ["add_student"],
        changeConsent: ["change_student"],
        deleteConsent: ["delete_student"],
        viewConsentDetails: ["view_student"],
    },

    // Site Settings Management
    siteSettings: {
        view: ["view_sitesetting"],
        add: ["add_sitesetting"],
        change: ["change_sitesetting"],
        delete: ["delete_sitesetting"],
    },
}


export const unisync360Routes = [
    {
        path: "/unisync360/dashboard",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <UnisyncDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/institutions/universities/",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.institution.view}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <UniversityListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/institutions/universities/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.institution.viewDetails}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <UniversityDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/institutions/schools",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.school.view}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <SchoolListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/institutions/school/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.school.viewDetails}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <SchoolDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/courses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.academics.view}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_external_counselor"]}
            >
                <CourseListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/courses/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.academics.viewDetails}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_external_counselor"]}
            >
                <CourseDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/course-categories",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.academics.viewCategory}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <CourseCategoryListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/course-levels",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.academics.viewLevel}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <CourseLevelListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/university-courses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.academics.viewUniversityCourse}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_external_counselor"]}
            >
                <UniversityCourseListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/university-courses/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.academics.viewUniversityCourse}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_external_counselor"]}
            >
                <UniversityCourseDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students-sources",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.student.viewSource}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <StudentSourceListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students-statuses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.student.viewStatus}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <StudentStatusListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.student.view}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor", "unisync360_lead_lancer"]}
            >
                <StudentListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.student.viewDetails}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor", "unisync360_lead_lancer"]}
            >
                <StudentDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students/:uid/ai-insights",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.student.viewDetails}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor"]}
            >
                <AIInsightsPage />
            </ProtectedRoute>
        ),
    },

    // Consent Management Routes
    {
        path: "/unisync360/consent",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.service.viewConsent}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor", "unisync360_lead_lancer"]}
            >
                <ConsentListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/consent/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.service.viewConsentDetails}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor", "unisync360_lead_lancer"]}
            >
                <ConsentDetailsPage />
            </ProtectedRoute>
        ),
    },
    // Service Setup Route
    {
        path: "/unisync360/consent-service",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.service.view_consentservice}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor", "unisync360_lead_lancer"]}
            >
                <ServiceSetupListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/consent-service/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.service.viewSetupDetails}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor", "unisync360_lead_lancer"]}
            >
                <ServiceSetupDetailsPage />
            </ProtectedRoute>
        ),
    },

    {
        path: "/unisync360/applications/course-allocations",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.application.viewAllocation}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor"]}
            >
                <CourseAllocationListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/applications/course-allocations/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.application.viewAllocation}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor"]}
            >
                <CourseAllocationDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/analytics/course-comparison",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.academics.view}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor", "unisync360_external_counselor"]}
            >
                <CourseComparisonPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/applications/document-requirements",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.application.viewDocument}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_external_counselor"]}
            >
                <DocumentRequirementListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/engines",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.recommendation.viewEngine}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <RecommendationEngineListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/recommended-courses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.recommendation.viewRecommended}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", "unisync360_counselor"]}
            >
                <RecommendedCourseListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/weight-config",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.recommendation.viewWeight}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <WeightConfigListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/generate-recommendations",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.recommendation.generate}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer"]}
            >
                <GenerateRecommendationsPage />
            </ProtectedRoute>
        ),
    },
    // Accounts Routes
    {
        path: "/unisync360/accounts/chart-of-accounts",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.accounting.viewChart}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant"]}
            >
                <ChartOfAccountsListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/transactions",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.accounting.viewTransactions}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant", "unisync360_facilitation_officer"]}
            >
                <TransactionsListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/transactions/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.accounting.viewTransactions}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant", "unisync360_facilitation_officer"]}
            >
                <TransactionDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/payments",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.accounting.viewPayments}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant"]}
            >
                <PaymentsListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/invoices",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.accounting.viewInvoices}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant", "unisync360_facilitation_officer"]}
            >
                <InvoicesListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/invoices/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.accounting.viewInvoices}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant", "unisync360_facilitation_officer"]}
            >
                <InvoiceDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/reports",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.accounting.viewReports}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant", "unisync360_facilitation_officer"]}
            >
                <FinancialReportsPage />
            </ProtectedRoute>
        ),
    },
    // User Management Routes
    {
        path: "/unisync360/users",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.admin.viewUsers}
                requiredRoles={["unisync360_super_admin"]}
            >
                <UserListPage />
            </ProtectedRoute>
        ),
    },
    // Roles Management Route
    {
        path: "/unisync360/roles",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.admin.viewRoles}
                requiredRoles={["unisync360_super_admin"]}
            >
                <RoleListPage />
            </ProtectedRoute>
        ),
    },
    // Permissions Management Route
    {
        path: "/unisync360/permissions",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.admin.viewPermissions}
                requiredRoles={["unisync360_super_admin"]}
            >
                <PermissionListPage />
            </ProtectedRoute>
        ),
    },
    // User Manual Route
    {
        path: "/unisync360/user-manual",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <UserManualPage />
            </ProtectedRoute>
        ),
    },
    // Lead Lancer User Manual Route
    {
        path: "/unisync360/lead-lancer/user-manual",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={["unisync360_lead_lancer", "unisync360_external_counselor", ...unisync360Permissions.roles]}
            >
                <LeadLancerUserManualPage />
            </ProtectedRoute>
        ),
    },

    // Lead Lancer Portal - Dashboard (Primary Route)
    {
        path: "/unisync360/lead-lancer",
        element: (
            <ProtectedRoute
                requiredPermissions={[]}
                requiredRoles={["unisync360_lead_lancer", "unisync360_external_counselor", ...unisync360Permissions.roles]}
            >
                <LeadLancerPortalDashboard />
            </ProtectedRoute>
        ),
    },
    // Lead Lancer - My Students
    {
        path: "/unisync360/lead-lancer/my-students",
        element: (
            <ProtectedRoute
                requiredPermissions={[]}
                requiredRoles={["unisync360_lead_lancer", "unisync360_external_counselor", ...unisync360Permissions.roles]}
            >
                <MyStudentsList />
            </ProtectedRoute>
        ),
    },
    // Lead Lancer - University Courses Catalog
    {
        path: "/unisync360/lead-lancer/courses",
        element: (
            <ProtectedRoute
                requiredPermissions={[]}
                requiredRoles={["unisync360_lead_lancer", "unisync360_external_counselor", ...unisync360Permissions.roles]}
            >
                <UniversityCourseCatalog />
            </ProtectedRoute>
        ),
    },
    // Lead Lancer Management (Admin View) - keeping the old route
    {
        path: "/unisync360/lead-lancers",
        element: (
            <ProtectedRoute
                requiredPermissions={[]}
                requiredRoles={["unisync360_super_admin", "unisync360_facilitation_officer", ...unisync360Permissions.roles]}
            >
                <LeadLancerListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/external-counselor",
        element: (
            <ProtectedRoute
                requiredPermissions={[]}
                requiredRoles={["unisync360_external_counselor", ...unisync360Permissions.roles]}
            >
                <ExternalCounselorDashboard />
            </ProtectedRoute>
        ),
    },

    // Location Management Routes - Permission Based Access Only
    // Countries
    {
        path: "/unisync360/locations/countries",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewCountry}
                requiredRoles={[]}
            >
                <CountryListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/locations/countries/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewCountry}
                requiredRoles={[]}
            >
                <CountryDetailsPage />
            </ProtectedRoute>
        ),
    },

    // Regions
    {
        path: "/unisync360/locations/regions",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewRegion}
                requiredRoles={[]}
            >
                <RegionListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/locations/regions/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewRegion}
                requiredRoles={[]}
            >
                <RegionDetailsPage />
            </ProtectedRoute>
        ),
    },

    // Districts
    {
        path: "/unisync360/locations/districts",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewDistrict}
                requiredRoles={[]}
            >
                <DistrictListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/locations/districts/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewDistrict}
                requiredRoles={[]}
            >
                <DistrictDetailsPage />
            </ProtectedRoute>
        ),
    },

    // Commissions
    {
        path: "/unisync360/commissions",
        element: (
            <ProtectedRoute
                requiredPermissions={["view_commission"]}
                requiredRoles={["unisync360_super_admin", "unisync360_accountant", "unisync360_lead_lancer"]}
            >
                <CommissionsListPage />
            </ProtectedRoute>
        ),
    },

    // Commission Packages
    {
        path: "/unisync360/commission-packages",
        element: (
            <ProtectedRoute
                requiredPermissions={[]}
                requiredRoles={[]}
            >
                <CommissionPackagesListPage />
            </ProtectedRoute>
        ),
    },

    // Site Settings
    {
        path: "/unisync360/site",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.siteSettings.view}
                requiredRoles={["unisync360_super_admin"]}
            >
                <SiteSettingsPage />
            </ProtectedRoute>
        ),
    },

    // Wards
    {
        path: "/unisync360/locations/wards",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewWard}
                requiredRoles={[]}
            >
                <WardListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/locations/wards/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.location.viewWard}
                requiredRoles={[]}
            >
                <WardDetailsPage />
            </ProtectedRoute>
        ),
    },

    // PUBLIC ROUTE - Service Consent Request (No Authentication Required)
    {
        path: "/unisync360/service-consent",
        element: <PublicConsentRequestPage />,
    },
];

export default unisync360Routes; 
