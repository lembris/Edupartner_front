import React from 'react';
import { BiDashboardPage } from "../../../pages/services/BUSINESS-INTELLIGENCE/dashboard/BiDashboardPage";
import { AccountsListPage } from "../../../pages/services/BUSINESS-INTELLIGENCE/accounts/AccountsListPage";
import { AccountDetailPage } from "../../../pages/services/BUSINESS-INTELLIGENCE/accounts/AccountDetailPage";
import { ComparePage } from "../../../pages/services/BUSINESS-INTELLIGENCE/accounts/ComparePage";
import ProtectedRoute from "../../../components/wrapper/ProtectedRoute";

const biPermissions = {
    dashboard: ["view_dashboard"],
    roles: [
        "admin",
        "BI_Manager",
        "BI_Analyst",
        "Marketing_User",
        "ReadOnly_User",
    ],
};

export const businessIntelligenceRoutes = [
    {
        path: "/bi/dashboard",
        element: (
            <ProtectedRoute
                requiredPermissions={biPermissions.dashboard}
                requiredRoles={biPermissions.roles}
            >
                <BiDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/bi/accounts",
        element: (
            <ProtectedRoute
                requiredPermissions={biPermissions.dashboard}
                requiredRoles={biPermissions.roles}
            >
                <AccountsListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/bi/accounts/:uid",
        element: (
            <ProtectedRoute
                requiredPermissions={biPermissions.dashboard}
                requiredRoles={biPermissions.roles}
            >
                <AccountDetailPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/bi/compare",
        element: (
            <ProtectedRoute
                requiredPermissions={biPermissions.dashboard}
                requiredRoles={biPermissions.roles}
            >
                <ComparePage />
            </ProtectedRoute>
        ),
    },
];
