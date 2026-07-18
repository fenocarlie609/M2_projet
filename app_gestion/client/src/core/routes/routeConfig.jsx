import {
  FiGrid,
  FiAnchor,
  FiShield,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiCheckSquare,
  FiSettings,
} from "react-icons/fi";
import { DashboardLayout } from "../../features/dashboard";
import { DashboardPage } from "../../features/dashboard";
import { UserPage } from "../../features/user";
import { AdminPage } from "../../features/admin";
import { SuperAdminPage } from "../../features/superadmin";
import { TemplatePage } from "../../features/template";

export const appRoutes = [
  {
    path: "/dashboard",
    label: "Dashboard",
    section: "Administration",
    element: (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    ),
    access: "admin",
    roles: ["ADMIN", "SUPERADMIN"],
    icon: FiGrid,
    showInSidebar: true,
  },
  {
    path: "/template",
    label: "Template",
    section: "Général",
    element: (
      <DashboardLayout>
        <TemplatePage />
      </DashboardLayout>
    ),
    access: "protected",
    roles: ["USER", "ADMIN", "SUPERADMIN"],
    icon: FiAnchor,
    showInSidebar: true,
  },
  {
    path: "/superadmin",
    label: "Superadmin",
    section: "Superadmin",
    element: (
      <DashboardLayout>
        <SuperAdminPage />
      </DashboardLayout>
    ),
    access: "superadmin",
    roles: ["SUPERADMIN"],
    icon: FiShield,
    showInSidebar: true,
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.showInSidebar);
