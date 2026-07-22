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
import { EmployeePage } from "@/features/employee";
import { UsersPage } from "@/features/users";
import { AdminPage } from "@/features/admin";
import { SuperAdminPage } from "@/features/superadmin";
import { TemplatePage } from "@/features/template";

// NOTE : le backend n'a plus de "role" (ADMIN/USER/SUPERADMIN). Chaque route
// déclare désormais la permission (module, action) requise, vérifiée contre
// user.permissions (voir RoleGuard.jsx). Une route sans "requiredPermission"
// est accessible à tout employé connecté (hasAppAccess + isActive suffisent).
//
// ⚠️ Les valeurs de "module" ci-dessous doivent correspondre exactement aux
// clés de APP_MODULES côté backend (src/common/utils/constants.js). Je n'ai
// que EMPLOYEES et USERS confirmés ; DASHBOARD/TEMPLATE/SUPERADMIN sont à
// adapter selon votre fichier constants.js réel.
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
    requiredPermission: null, // accessible à tout employé connecté
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
    requiredPermission: null, // accessible à tout employé connecté
    icon: FiAnchor,
    showInSidebar: true,
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
    // Correspond au module "employees" côté backend (fiches RH)
    requiredPermission: { module: "EMPLOYEES", action: "READ" },
    icon: FiUsers,
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
    // Correspond au module "users" côté backend (gestion de l'accès applicatif)
    requiredPermission: { module: "USERS", action: "READ" },
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
    // À adapter : quel module protège cette page côté backend ?
    requiredPermission: { module: "SUPERADMIN", action: "READ" },
    icon: FiShield,
    showInSidebar: true,
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.showInSidebar);
