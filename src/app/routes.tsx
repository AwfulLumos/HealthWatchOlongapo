import { createBrowserRouter, Navigate, Link, useRouteError, isRouteErrorResponse } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { PatientProfilePage } from "./pages/PatientProfilePage";
import { ConsultationsPage } from "./pages/ConsultationsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PrescriptionsPage } from "./pages/PrescriptionsPage";
import { VitalSignsPage } from "./pages/VitalSignsPage";
import { StaffPage } from "./pages/StaffPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SysAdminRbacPage } from "./pages/SysAdminRbacPage";
import { SysAdminSecurityPage } from "./pages/SysAdminSecurityPage";
import { SysAdminAuditTrailPage } from "./pages/SysAdminAuditTrailPage";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

// User-friendly clinical Error Boundary
function RouteErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {is404 ? "Clinical Page Not Found" : "System Notification"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {is404
              ? "The requested page or clinical record URL could not be resolved in the health network."
              : "An unexpected UI error occurred. Please return to the dashboard."}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Link
            to="/dashboard"
            className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/patients"
            className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Patients
          </Link>
        </div>
      </div>
    </div>
  );
}

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
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    errorElement: <RouteErrorBoundary />,
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
        path: "patients/:id",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <PatientProfilePage />
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
        path: "vitals",
        element: <Navigate to="/vital-signs" replace />,
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