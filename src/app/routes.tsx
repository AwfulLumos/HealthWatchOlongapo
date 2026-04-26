import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { ConsultationsPage } from "./pages/ConsultationsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PrescriptionsPage } from "./pages/PrescriptionsPage";
import { VitalSignsPage } from "./pages/VitalSignsPage";
import { StaffPage } from "./pages/StaffPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SysAdminRbacPage } from "./pages/SysAdminRbacPage";
import { SysAdminSecurityPage } from "./pages/SysAdminSecurityPage";
import { SysAdminAuditTrailPage } from "./pages/SysAdminAuditTrailPage";

// Protected Layout wrapper component
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "patients",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <PatientsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "consultations",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <ConsultationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointments",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <AppointmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "prescriptions",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <PrescriptionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "vital-signs",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <VitalSignsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "staff",
        element: (
          <ProtectedRoute allowedRoles={["Admin", "Employee"]}>
            <StaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "register",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <RegistrationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sysadmin/rbac",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <SysAdminRbacPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sysadmin/security",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <SysAdminSecurityPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sysadmin/audit-trail",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <SysAdminAuditTrailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);