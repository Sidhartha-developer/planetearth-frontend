import React from "react";
import {
  LayoutDashboard,
  UserPlus,
  Package,
  Wrench,
  Database,
  Users,
  ClipboardList,
  HardHat,
  Sun,
  FileText,
  MessageSquareQuote,

} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Menus by role
const adminMenu = [
  {
    icon: ClipboardList,
    label: "Leads",
    path: "/admin-leadboard",
  },

  {
    icon: HardHat,
    label: "Installations",
    path: "/admin-installation",
  },

  {
    icon: Sun,
    label: "PM KUSUM",
    path: "/admin-pm-kusum",
  },

  {
    icon: FileText,
    label: "Blogs",
    path: "/admin-blogs",
  },

  {
    icon: MessageSquareQuote,
    label: "Testimonials",
    path: "/admin-testimonials",
  },
];

    // { icon: Database, label: "AMC Data", path: "/admin-amc" },
    // { icon: Users, label: "Client Data", path: "/admin-client" },
    // { icon: Package, label: "Warehouse", path: "/admin-warehouse" },


  const staffMenu = [
    { icon: UserPlus, label: "Leads", path: "/staff-leadboard" },
  ];

  const serviceMenu = [
    { icon: Wrench, label: "Installation Pipeline", path: "/admin-installation" },
    { icon: Database, label: "AMC Data", path: "/admin-amc" },
  ];

  // Role-based menu selection
  const role = user?.role?.toLowerCase();
  let menuItems = [];

  if (role === "admin" || role === "office") {
    menuItems = adminMenu;
  } else if (role === "staff") {
    menuItems = staffMenu;
  } else if (role === "service" || role === "chiranjeevi") {
    menuItems = serviceMenu;
  }

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${
  sidebarOpen
    ? "w-64 translate-x-0"
    : "w-0 -translate-x-full lg:translate-x-0 lg:w-64"
}

                    bg-gradient-to-b from-blue-50 via-white to-orange-50
                    border-r border-blue-100 shadow-sm`}
      >
        <nav className="p-4 h-full overflow-y-auto">

          {/* Section Label */}
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider px-3 mb-5">
            Main Menu
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group w-full flex items-center gap-3
                            px-4 py-3 rounded-xl mb-2
                            transition-all duration-300
                  ${
                    isActive
                      ? `
                        bg-gradient-to-r from-orange-400 to-blue-500
                        text-white
                        shadow-[0_10px_30px_rgba(59,130,246,0.35),0_0_20px_rgba(251,146,60,0.45)]
                      `
                      : `
                        text-gray-800
                        hover:bg-gradient-to-r hover:from-orange-100 hover:to-blue-100
                        hover:shadow-md
                      `
                  }`}
              >
                {/* Icon */}
                <div
                  className={`transition-all duration-300
                    ${
                      isActive
                        ? "text-white"
                        : "text-blue-600 group-hover:text-orange-600"
                    }`}
                >
                  <Icon size={20} />
                </div>

                {/* Label */}
                <span className="text-sm font-semibold tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
