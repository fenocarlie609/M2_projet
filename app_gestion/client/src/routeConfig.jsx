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
import { DashboardLayout } from "./layouts/DashboardLayout";
import Dashbord from "./pages/admin/Dashbord";
import Template from "./pages/user/Template";
import SuperAdmin from "./pages/superadmin/SuperAdmin";

export const appRoutes = [
  {
    path: "/dashboard",
    label: "Dashboard",
    section: "Administration",
    element: (
      <DashboardLayout>
        <Dashbord />
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
    element: <Template />,
    access: "protected",
    roles: ["USER", "ADMIN", "SUPERADMIN"],
    icon: FiAnchor,
    showInSidebar: true,
  },
  {
    path: "/superadmin",
    label: "Superadmin",
    section: "Superadmin",
    element: <SuperAdmin />,
    access: "superadmin",
    roles: ["SUPERADMIN"],
    icon: FiShield,
    showInSidebar: true,
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.showInSidebar);
