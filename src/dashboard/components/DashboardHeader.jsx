import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X, Bell, User, ChevronDown } from "lucide-react";
import { getProfile } from "../../api/userapi";
import { logout } from "../../redux/rAuth/Actions";
import Logo from "../../assets/Services/logo.png";

const DashboardHeader = ({
  sidebarOpen,
  setSidebarOpen,
  userMenuOpen,
  setUserMenuOpen,
}) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const user = await getProfile(token);
        setProfile(user);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16
                       bg-white/90 backdrop-blur-md
                       border-b border-blue-100
                       shadow-sm">
      <div className="flex items-center justify-between h-full px-6">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-blue-50 transition lg:hidden"
          >
            {sidebarOpen ? (
              <X size={22} className="text-blue-600" />
            ) : (
              <Menu size={22} className="text-blue-600" />
            )}
          </button>

          <img src={Logo} alt="Planet Earth" className="h-9 object-contain" />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg
                       hover:bg-orange-50 transition"
          >
            <Bell size={22} className="text-orange-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          {/* USER MENU */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg
                         hover:bg-blue-50 transition"
            >
              <div className="hidden md:block text-right leading-tight">
                <p className="text-sm font-semibold text-gray-900">
                  {loading ? "Loading..." : profile?.name || "User"}
                </p>
                <p className="text-xs text-blue-600 capitalize">
                  {profile?.role || "role"}
                </p>
              </div>

              {/* AVATAR */}
              <div className="w-10 h-10 rounded-full
                              flex items-center justify-center
                              bg-gradient-to-br from-orange-400 to-blue-500
                              shadow-[0_0_0_3px_rgba(59,130,246,0.25),0_0_20px_rgba(251,146,60,0.35)]">
                <User size={20} className="text-white" />
              </div>

              <ChevronDown size={16} className="text-gray-500 hidden md:block" />
            </button>

            {/* DROPDOWN */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56
                              bg-white rounded-xl
                              border border-blue-100
                              shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-gray-900">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.email || "email"}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left
                             text-red-600 hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
