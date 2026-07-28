import { FiAnchor } from "react-icons/fi";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserTie, FaTruck, FaUserLock } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { FaUsers } from "react-icons/fa6";
import * as dashboard from "@/features/dashboard";
import { DashboardPage } from "@/features/dashboard";
import { EmployeePage } from "@/features/employee";
import { UsersPage } from "@/features/users";
import { CompanyStructurePage } from "@/features/companyStructure";
import { TemplatePage } from "@/features/template";
import { ClientPage } from "@/features/client";
import { DriverPage } from "@/features/driver";

export const appRoutes = [
  {
    path: "/dashboard",
    label: "Dashboard",
    section: "Administration",
    element: (
      <dashboard.DashboardLayout>
        <DashboardPage />
      </dashboard.DashboardLayout>
    ),
    requiredPermission: null,
    icon: MdSpaceDashboard,
    showInSidebar: true,
  },
  {
    path: "/template",
    label: "Template",
    section: "Général",
    element: (
      <dashboard.DashboardLayout>
        <TemplatePage />
      </dashboard.DashboardLayout>
    ),
    requiredPermission: null,
    icon: FiAnchor,
    showInSidebar: false,
  },
  {
    path: "/employees",
    label: "Employés",
    section: "Administration",
    element: (
      <dashboard.DashboardLayout>
        <EmployeePage />
      </dashboard.DashboardLayout>
    ),
    requiredPermission: { module: "EMPLOYEES", action: "READ" },
    icon: FaUsers,
    showInSidebar: true,
  },
  {
    path: "/client",
    label: "Client",
    section: "Commercial",
    element: (
      <dashboard.DashboardLayout>
        <ClientPage />
      </dashboard.DashboardLayout>
    ),
    requiredPermission: { module: "CLIENT", action: "READ" },
    icon: FaUserTie,
    showInSidebar: true,
  },
  {
    path: "/driver",
    label: "chauffeur",
    section: "Commercial",
    element: (
      <dashboard.DashboardLayout>
        <DriverPage />
      </dashboard.DashboardLayout>
    ),
    requiredPermission: { module: "DRIVER", action: "READ" },
    icon: FaTruck,
    showInSidebar: true,
  },
  {
    path: "/users",
    label: "Utilisateurs",
    section: "Superadmin",
    element: (
      <dashboard.DashboardLayout>
        <UsersPage />
      </dashboard.DashboardLayout>
    ),
    requiredPermission: { module: "USERS", action: "READ" },
    icon: FaUserLock,
    showInSidebar: true,
  },
  {
    path: "/company-structure",
    label: "Structure",
    section: "Administration",
    element: (
      <dashboard.DashboardLayout>
        <CompanyStructurePage />
      </dashboard.DashboardLayout>
    ),
    requiredPermission: { module: "COMPANY_STRUCTURE", action: "READ" },
    icon: IoIosSettings,
    showInSidebar: true,
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.showInSidebar);
