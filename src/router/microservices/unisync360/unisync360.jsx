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

// User Manual
import { UserManualPage } from "../../../pages/services/unisync360/usermanual/UserManualPage.jsx";

// Commission Portal
import { LeadLancerDashboard } from "../../../pages/services/unisync360/commission-portal/LeadLancerDashboard.jsx";
import { ExternalCounselorDashboard } from "../../../pages/services/unisync360/commission-portal/ExternalCounselorDashboard.jsx";

const unisync360Permissions = {
    dashboard: ["view_dashboard"],
    roles: [
        "ICT_Superuser",
        "admin",
        "ICT_Manager",
        "ICT_Technician",
        "ICT_Auditor",
        "Department_User",
        "ReadOnly_User",
    ],
    readOnlyRoles: ["admin", "ReadOnly_User"],
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
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <UniversityListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/institutions/universities/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <UniversityDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/institutions/schools",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <SchoolListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/institutions/school/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <SchoolDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/courses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <CourseListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/courses/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <CourseDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/course-categories",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <CourseCategoryListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/course-levels",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <CourseLevelListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/university-courses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <UniversityCourseListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/academics/university-courses/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <UniversityCourseDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students-sources",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <StudentSourceListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students-statuses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <StudentStatusListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <StudentListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <StudentDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/students/:uid/ai-insights",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <AIInsightsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/applications/course-allocations",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <CourseAllocationListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/applications/course-allocations/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <CourseAllocationDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/analytics/course-comparison",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <CourseComparisonPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/applications/document-requirements",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <DocumentRequirementListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/engines",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <RecommendationEngineListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/recommended-courses",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <RecommendedCourseListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/weight-config",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <WeightConfigListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/recommendations/generate-recommendations",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
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
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <ChartOfAccountsListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/transactions",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <TransactionsListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/transactions/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <TransactionDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/payments",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <PaymentsListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/invoices",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <InvoicesListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/invoices/:id",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
            >
                <InvoiceDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/accounts/reports",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={unisync360Permissions.roles}
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
                requiredPermissions={["view_user"]}
                requiredRoles={unisync360Permissions.roles}
            >
                <UserListPage />
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
    // Commission Portal Routes (Lead Lancer & External Counselor)
    {
        path: "/unisync360/commission-portal",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={[...unisync360Permissions.roles, "unisync360_lead_lancer", "unisync360_external_counselor"]}
            >
                <LeadLancerDashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/lead-lancer",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={["unisync360_lead_lancer", "unisync360_external_counselor", ...unisync360Permissions.roles]}
            >
                <LeadLancerDashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unisync360/external-counselor",
        element: (
            <ProtectedRoute
                requiredPermissions={unisync360Permissions.dashboard}
                requiredRoles={["unisync360_external_counselor", ...unisync360Permissions.roles]}
            >
                <ExternalCounselorDashboard />
            </ProtectedRoute>
        ),
    },
]
