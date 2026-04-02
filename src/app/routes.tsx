import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { ConsultationsPage } from "./pages/ConsultationsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PrescriptionsPage } from "./pages/PrescriptionsPage";
import { VitalSignsPage } from "./pages/VitalSignsPage";
import { StaffPage } from "./pages/StaffPage";
import { ReportsPage } from "./pages/ReportsPage";

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
      { path: "dashboard", element: <DashboardPage /> },
      { path: "patients", element: <PatientsPage /> },
      { path: "consultations", element: <ConsultationsPage /> },
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "prescriptions", element: <PrescriptionsPage /> },
      { path: "vital-signs", element: <VitalSignsPage /> },
      { path: "staff", element: <StaffPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
]);