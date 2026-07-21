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
import * as dashboard from "@/features/dashboard";
import { DashboardPage } from "@/features/dashboard";
import { UserPage } from "@/features/user";
import { AdminPage } from "@/features/admin";
import { SuperAdminPage } from "@/features/superadmin";
import { TemplatePage } from "@/features/template";

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
      <dashboard.DashboardLayout>
        <TemplatePage />
      </dashboard.DashboardLayout>
    ),
    access: "protected",
    roles: ["USER", "ADMIN", "SUPERADMIN"],
    icon: FiAnchor,
    showInSidebar: true,
  },
  {
    path: "/users",
    label: "Utilisateurs",
    section: "Superadmin",
    element: (
      <dashboard.DashboardLayout>
        <UserPage />
      </dashboard.DashboardLayout>
    ),
    // Seul le SUPERADMIN peut manipuler et voir ce module
    roles: ["SUPERADMIN"],
    icon: FiUsers,
    showInSidebar: true,
  },
  {
    path: "/superadmin",
    label: "Superadmin",
    section: "Superadmin",
    element: (
      <dashboard.DashboardLayout>
        <SuperAdminPage />
      </dashboard.DashboardLayout>
    ),
    access: "superadmin",
    roles: ["SUPERADMIN"],
    icon: FiShield,
    showInSidebar: true,
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.showInSidebar);
