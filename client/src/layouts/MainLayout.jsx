import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import QuickAddModal from '../components/QuickAddModal';
import JQuerySmartCalculator from '../components/JQuerySmartCalculator';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 992) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const handleTransactionAdded = () => {
    // Notify window for views listening to data changes
    window.dispatchEvent(new CustomEvent('fintrack_data_updated'));
  };

  return (
    <div className="d-flex min-vh-100 bg-main">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="d-flex flex-column flex-grow-1 min-vw-0">
        <Navbar
          onToggleSidebar={toggleSidebar}
          onQuickAddClick={() => setIsQuickAddOpen(true)}
        />

        <main className="flex-grow-1 p-3 p-md-4">
          <div className="container-fluid max-w-7xl">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />

      {/* jQuery Powered Floating Smart Calculator & Notification Banner */}
      <JQuerySmartCalculator />
    </div>
  );
};

export default MainLayout;
