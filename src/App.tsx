/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { ToastContainer } from './components/common/ToastContainer';
import { PublicWebsite } from './pages/public/PublicWebsite';
import { DemoLogin } from './pages/auth/DemoLogin';
import { CustomerPortal } from './pages/customer/CustomerPortal';
import { DriverPortal } from './pages/driver/DriverPortal';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';

const AppContent: React.FC = () => {
  const { activeRole, setActiveRole } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col font-sans">
      {/* Top Demo Bar & Role Switcher */}
      <RoleSwitcherBar />

      {/* Main Viewport Router based on Active Role */}
      <div className="flex-1 flex flex-col">
        {activeRole === 'public' && (
          <PublicWebsite onOpenLogin={() => setIsLoginModalOpen(true)} />
        )}

        {activeRole === 'customer' && <CustomerPortal />}

        {activeRole === 'driver' && <DriverPortal />}

        {activeRole === 'owner' && <OwnerDashboard />}
      </div>

      {/* Login Modal / Overlay when triggered from Public Site */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <DemoLogin
              onSuccess={() => setIsLoginModalOpen(false)}
              onCancel={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
