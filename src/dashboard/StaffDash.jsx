import React, { useState } from 'react';
import DashboardHeader from './components/DashboardHeader';
import Sidebar from './components/Sidebar';
import DashboardFooter from './components/DashboardFooter';
import StaffDashboard from './components/StaffDashboard';

const StaffDash = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
      />
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      <StaffDashboard activeItem={activeItem} />
      <DashboardFooter />
    </div>
  );
};

export default StaffDash;