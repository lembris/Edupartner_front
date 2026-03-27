import React from 'react';
import ProtectedRoute from "../../../components/wrapper/ProtectedRoute";

// Dashboard
import ClinicDashboardPage from "../../../pages/services/CLINIC360/dashboard/ClinicDashboardPage.jsx";

// Patients
import { PatientListPage } from "../../../pages/services/CLINIC360/patients/PatientListPage.jsx";
import { PatientDetailPage } from "../../../pages/services/CLINIC360/patients/PatientDetailPage.jsx";

// Operations
import { OperationsPage } from "../../../pages/services/CLINIC360/operations/OperationsPage.jsx";

// Queue
import { QueueBoardPage } from "../../../pages/services/CLINIC360/queue/QueueBoardPage.jsx";

// Clinic360 permissions
const clinic360Permissions = {
    // Dashboard - All authenticated users
    dashboard: ["view_dashboard"],
    
    // All Clinic360 roles
    roles: [
        "admin",
        "doctor",
        "nurse",
        "receptionist"
    ],
    
    // Patient Management
    patient: {
        view: ["view_patient"],
        create: ["add_patient"],
        edit: ["change_patient"],
        delete: ["delete_patient"],
        viewDetails: ["view_patient"],
    },
    
    // Visit Management
    visit: {
        view: ["view_visit"],
        create: ["add_visit"],
        edit: ["change_visit"],
        delete: ["delete_visit"],
        viewDetails: ["view_visit"],
    },
    
    // Vital Signs Management
    vital: {
        view: ["view_vital"],
        create: ["add_vital"],
        edit: ["change_vital"],
        delete: ["delete_vital"],
        viewDetails: ["view_vital"],
    },
    
    // Diagnosis Management
    diagnosis: {
        view: ["view_diagnosis"],
        create: ["add_diagnosis"],
        edit: ["change_diagnosis"],
        delete: ["delete_diagnosis"],
        viewDetails: ["view_diagnosis"],
    },
    
    // Consultation Management
    consultation: {
        view: ["view_consultation"],
        create: ["add_consultation"],
        edit: ["change_consultation"],
        delete: ["delete_consultation"],
        viewDetails: ["view_consultation"],
    },
    
    // Lab Order Management
    labOrder: {
        view: ["view_laborder"],
        create: ["add_laborder"],
        edit: ["change_laborder"],
        delete: ["delete_laborder"],
        viewDetails: ["view_laborder"],
    },
    
    // Prescription Management
    prescription: {
        view: ["view_prescription"],
        create: ["add_prescription"],
        edit: ["change_prescription"],
        delete: ["delete_prescription"],
        viewDetails: ["view_prescription"],
    },
    
    // Queue Management
    queue: {
        viewStation: ["view_queuestation"],
        createStation: ["add_queuestation"],
        editStation: ["change_queuestation"],
        deleteStation: ["delete_queuestation"],
        viewEntry: ["view_queueentry"],
        createEntry: ["add_queueentry"],
        editEntry: ["change_queueentry"],
        deleteEntry: ["delete_queueentry"],
        viewToken: ["view_queuetoken"],
        createToken: ["add_queuetoken"],
        editToken: ["change_queuetoken"],
        deleteToken: ["delete_queuetoken"],
    },
    
    // Insurance Management
    insurance: {
        viewProvider: ["view_insuranceprovider"],
        createProvider: ["add_insuranceprovider"],
        editProvider: ["change_insuranceprovider"],
        deleteProvider: ["delete_insuranceprovider"],
        viewPlan: ["view_insuranceplan"],
        createPlan: ["add_insuranceplan"],
        editPlan: ["change_insuranceplan"],
        deletePlan: ["delete_insuranceplan"],
        viewPolicy: ["view_insurancepolicy"],
        createPolicy: ["add_insurancepolicy"],
        editPolicy: ["change_insurancepolicy"],
        deletePolicy: ["delete_insurancepolicy"],
        viewClaim: ["view_insuranceclaim"],
        createClaim: ["add_insuranceclaim"],
        editClaim: ["change_insuranceclaim"],
        deleteClaim: ["delete_insuranceclaim"],
        viewPreAuth: ["view_preauthorization"],
        createPreAuth: ["add_preauthorization"],
        editPreAuth: ["change_preauthorization"],
        deletePreAuth: ["delete_preauthorization"],
    },
    
    // Billing Management
    billing: {
        viewPayment: ["view_payment"],
        createPayment: ["add_payment"],
        editPayment: ["change_payment"],
        deletePayment: ["delete_payment"],
    },
    
    // Configuration Management
    configuration: {
        viewCodeFormat: ["view_codeformat"],
        createCodeFormat: ["add_codeformat"],
        editCodeFormat: ["change_codeformat"],
        deleteCodeFormat: ["delete_codeformat"],
    }
};

// Role constants for cleaner route definitions
const ROLES = {
    ALL_STAFF: ["admin", "doctor", "nurse", "receptionist"],
    CLINICAL_STAFF: ["admin", "doctor", "nurse"],
    DOCTOR_ONLY: ["admin", "doctor"],
    RECEPTIONIST: ["admin", "receptionist"],
    ADMIN_ONLY: ["admin"],
    ADMIN_ACCOUNTANT: ["admin", "accountant"]
};

export const clinic360Routes = [
    // Overview
    {
        path: "/clinic360",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.dashboard}
                requiredRoles={ROLES.ALL_STAFF}
            >
                <ClinicDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/dashboard",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.dashboard}
                requiredRoles={ROLES.ALL_STAFF}
            >
                <ClinicDashboardPage />
            </ProtectedRoute>
        ),
    },
    
    // Patients
    {
        path: "/clinic360/patients",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.patient.view}
                requiredRoles={ROLES.ALL_STAFF}
            >
                <PatientListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/patients/:uid",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.patient.viewDetails}
                requiredRoles={ROLES.ALL_STAFF}
            >
                <PatientDetailPage />
            </ProtectedRoute>
        ),
    },
    
    // Operations
    {
        path: "/clinic360/operations",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.patient.view}
                requiredRoles={ROLES.ALL_STAFF}
            >
                <OperationsPage />
            </ProtectedRoute>
        ),
    },
    
    // Visits
    {
        path: "/clinic360/visits",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.visit.view}
                requiredRoles={ROLES.CLINICAL_STAFF}
            >
                <div>Visit List - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    
    // Clinical
    {
        path: "/clinic360/vitals",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.vital.view}
                requiredRoles={ROLES.CLINICAL_STAFF}
            >
                <div>Vital Signs List - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/diagnoses",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.diagnosis.view}
                requiredRoles={ROLES.DOCTOR_ONLY}
            >
                <div>Diagnosis List - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/consultations",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.consultation.view}
                requiredRoles={ROLES.DOCTOR_ONLY}
            >
                <div>Consultation List - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/lab-orders",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.labOrder.view}
                requiredRoles={ROLES.CLINICAL_STAFF}
            >
                <div>Lab Order List - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/prescriptions",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.prescription.view}
                requiredRoles={ROLES.DOCTOR_ONLY}
            >
                <div>Prescription List - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    
    // Queue Management
    {
        path: "/clinic360/queue-stations",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.queue.viewStation}
                requiredRoles={ROLES.RECEPTIONIST}
            >
                <div>Queue Stations - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/queue-board",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.queue.viewEntry}
                requiredRoles={ROLES.ALL_STAFF}
            >
                <QueueBoardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/queue-tokens",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.queue.viewToken}
                requiredRoles={ROLES.RECEPTIONIST}
            >
                <div>Queue Tokens - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    
    // Insurance
    {
        path: "/clinic360/insurance-providers",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.insurance.viewProvider}
                requiredRoles={ROLES.ADMIN_ONLY}
            >
                <div>Insurance Providers - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/insurance-plans",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.insurance.viewPlan}
                requiredRoles={ROLES.ADMIN_ONLY}
            >
                <div>Insurance Plans - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/insurance-policies",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.insurance.viewPolicy}
                requiredRoles={ROLES.ADMIN_ONLY}
            >
                <div>Insurance Policies - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/insurance-claims",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.insurance.viewClaim}
                requiredRoles={ROLES.ADMIN_ONLY}
            >
                <div>Insurance Claims - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    {
        path: "/clinic360/pre-authorizations",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.insurance.viewPreAuth}
                requiredRoles={ROLES.ADMIN_ONLY}
            >
                <div>Pre-Authorizations - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    
    // Billing
    {
        path: "/clinic360/payments",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.billing.viewPayment}
                requiredRoles={ROLES.ADMIN_ACCOUNTANT}
            >
                <div>Payments - Coming Soon</div>
            </ProtectedRoute>
        ),
    },
    
    // Configuration
    {
        path: "/clinic360/code-formats",
        element: (
            <ProtectedRoute
                requiredPermissions={clinic360Permissions.configuration.viewCodeFormat}
                requiredRoles={ROLES.ADMIN_ONLY}
            >
                <div>Code Formats - Coming Soon</div>
            </ProtectedRoute>
        ),
    }
];

export default clinic360Routes;
