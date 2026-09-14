import { FiAnchor, FiClipboard } from "react-icons/fi";
import {
  MdDirectionsBoat,
  MdLocationOn,
  MdSpaceDashboard,
  MdViewModule,
} from "react-icons/md";
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
import { ModulePage } from "@/features/module";
import { LoadingPlansPage } from "@/features/loadingPlans";
import { ShipPage } from "@/features/ship";
import { PortPage } from "@/features/ports";
import { VoyagePage } from "@/features/voyages";

const withDashboardLayout = (page) => (
  <dashboard.DashboardLayout>{page}</dashboard.DashboardLayout>
);

export const appRoutes = [
  {
    path: "/dashboard",
    label: "Dashboard",
    section: "Administration",
    element: withDashboardLayout(<DashboardPage />),
    requiredPermission: null,
    icon: MdSpaceDashboard,
    showInSidebar: true,
  },
  {
    path: "/template",
    label: "Template",
    section: "Général",
    element: withDashboardLayout(<TemplatePage />),
    requiredPermission: null,
    icon: FiAnchor,
    showInSidebar: false,
  },
  {
    path: "/employees",
    label: "Employés",
    section: "Administration",
    element: withDashboardLayout(<EmployeePage />),
    requiredPermission: { module: "EMPLOYEES", action: "READ" },
    icon: FaUsers,
    showInSidebar: true,
  },
  {
    path: "/client",
    label: "Client",
    section: "Commercial",
    element: withDashboardLayout(<ClientPage />),
    requiredPermission: { module: "CLIENT", action: "READ" },
    icon: FaUserTie,
    showInSidebar: true,
  },
  {
    path: "/driver",
    label: "Transporteurs",
    section: "Logistique",
    element: withDashboardLayout(<DriverPage />),
    requiredPermission: { module: "DRIVER", action: "READ" },
    icon: FaTruck,
    showInSidebar: true,
  },
  {
    path: "/ship",
    label: "Navires",
    section: "Logistique",
    element: withDashboardLayout(<ShipPage />),
    requiredPermission: { module: "SHIP", action: "READ" },
    icon: MdDirectionsBoat,
    showInSidebar: true,
  },
  {
    path: "/ports",
    label: "Ports",
    section: "Logistique",
    element: withDashboardLayout(<PortPage />),
    requiredPermission: { module: "PORTS", action: "READ" },
    icon: MdLocationOn,
    showInSidebar: true,
  },
  {
    path: "/voyages",
    label: "Voyages",
    section: "Logistique",
    element: withDashboardLayout(<VoyagePage />),
    requiredPermission: { module: "VOYAGES", action: "READ" },
    icon: FiAnchor,
    showInSidebar: true,
  },
  {
    path: "/loading-plans",
    label: "Plans de chargement",
    section: "Logistique",
    element: withDashboardLayout(<LoadingPlansPage />),
    requiredPermission: { module: "LOADING_PLANS", action: "READ" },
    icon: FiClipboard,
    showInSidebar: true,
  },
  {
    path: "/users",
    label: "Utilisateurs",
    section: "Superadmin",
    element: withDashboardLayout(<UsersPage />),
    requiredPermission: { module: "USERS", action: "READ" },
    icon: FaUserLock,
    showInSidebar: true,
  },
  {
    path: "/module",
    label: "Modules",
    section: "Superadmin",
    element: withDashboardLayout(<ModulePage />),
    requiredPermission: { module: "MODULE", action: "READ" },
    icon: MdViewModule,
    showInSidebar: true,
  },
  {
    path: "/company-structure",
    label: "Structure",
    section: "Administration",
    element: withDashboardLayout(<CompanyStructurePage />),
    requiredPermission: { module: "COMPANY_STRUCTURE", action: "READ" },
    icon: IoIosSettings,
    showInSidebar: true,
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.showInSidebar);
