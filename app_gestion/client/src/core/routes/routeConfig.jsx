import {
  FiGrid,
  FiAnchor,
  FiShield,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiCheckSquare,
  FiSettings,
  FiTruck,
} from "react-icons/fi";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserTie, FaTruck, FaUserLock } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { FaUsers, FaShield } from "react-icons/fa6";
import * as dashboard from "@/features/dashboard";
import { DashboardPage } from "@/features/dashboard";
import { EmployeePage } from "@/features/employee";
import { UsersPage } from "@/features/users";
import { CompanyStructurePage } from "@/features/companyStructure";
import { TemplatePage } from "@/features/template";
import { ClientPage } from "@/features/client";
import { DriverPage } from "@/features/driver";

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
    requiredPermission: null, // accessible à tout employé connecté
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
    // Correspond au module "employees" côté backend (fiches RH)
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
    // Correspond au module "users" côté backend (gestion de l'accès applicatif)
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
    // Correspond au module "users" côté backend (gestion de l'accès applicatif)
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
    // Correspond au module "users" côté backend (gestion de l'accès applicatif)
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
    // ⚠️ Module supposé "COMPANY_STRUCTURE" côté backend (EmployeePermission).
    // À confirmer/adapter selon votre constants.js réel.
    requiredPermission: { module: "COMPANY_STRUCTURE", action: "READ" },
    icon: IoIosSettings,
    showInSidebar: true,
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.showInSidebar);
