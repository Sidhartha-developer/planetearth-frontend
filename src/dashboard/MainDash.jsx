import React, { useState } from 'react';
import DashboardHeader from './components/DashboardHeader';
import Sidebar from './components/Sidebar';
import DashboardLayout from './components/DashboardLayout';
import DashboardFooter from './components/DashboardFooter';

const MainDash = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div className="min-h-screen bg-[#050712] text-white relative">
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
      <DashboardLayout activeItem={activeItem} />
      <DashboardFooter />
    </div>
  );
};

export default MainDash;