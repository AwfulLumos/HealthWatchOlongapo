import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { ConsultationsPage } from "./pages/ConsultationsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PrescriptionsPage } from "./pages/PrescriptionsPage";
import { VitalSignsPage } from "./pages/VitalSignsPage";
import { StaffPage } from "./pages/StaffPage";
import { ReportsPage } from "./pages/ReportsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "dashboard", Component: DashboardPage },
      { path: "patients", Component: PatientsPage },
      { path: "consultations", Component: ConsultationsPage },
      { path: "appointments", Component: AppointmentsPage },
      { path: "prescriptions", Component: PrescriptionsPage },
      { path: "vital-signs", Component: VitalSignsPage },
      { path: "staff", Component: StaffPage },
      { path: "reports", Component: ReportsPage },
    ],
  },
]);
