import React from "react";
import LeadClonerDashboard from "../../../pages/services/LEAD-CLONER/dashboard/LeadClonerDashboard";
import LeadResults from "../../../pages/services/LEAD-CLONER/results/LeadResults";

const leadClonerRoutes = [
    {
        path: "/lead-cloner/dashboard",
        element: <LeadClonerDashboard />,
    },
    {
        path: "/lead-cloner/results/:uid",
        element: <LeadResults />,
    },
];

export default leadClonerRoutes;
