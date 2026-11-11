/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { User, Car, Shield, Globe, LogOut } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { activeRole, setActiveRole, currentUser, setCustomerView, setDriverView, setOwnerView } = useApp();

  const handleRoleSelect = (role: Role) => {
    setActiveRole(role);
    if (role === 'customer') {
      setCustomerView('home');
    } else if (role === 'driver') {
      setDriverView('dashboard');
    } else if (role === 'owner') {
      setOwnerView('overview');
    }
  };

  return (
    <div className="bg-[#171717] text-white border-b border-neutral-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Demo Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
            <span className="w-2.5 h-2.5 bg-[#FFD43B] rounded-sm inline-block"></span>
            <span>AUTOGO DEMO ENVIRONMENT</span>
          </div>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-neutral-400 hidden sm:inline">
            Active Persona:{' '}
            <strong className="text-white font-medium">
              {currentUser.name} ({activeRole === 'public' ? 'Public Guest' : activeRole.toUpperCase()})
            </strong>
          </span>
        </div>

        {/* The 3-way Role Switcher + Public Link */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => handleRoleSelect('public')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeRole === 'public'
                ? 'bg-[#FFD43B] text-[#171717] font-bold shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe size={13} />
            <span>Public Site</span>
          </button>

          <button
            onClick={() => handleRoleSelect('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeRole === 'customer'
                ? 'bg-[#FFD43B] text-[#171717] font-bold shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={13} />
            <span>Customer</span>
          </button>

          <button
            onClick={() => handleRoleSelect('driver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeRole === 'driver'
                ? 'bg-[#FFD43B] text-[#171717] font-bold shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Car size={13} />
            <span>Driver</span>
          </button>

          <button
            onClick={() => handleRoleSelect('owner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeRole === 'owner'
                ? 'bg-[#FFD43B] text-[#171717] font-bold shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield size={13} />
            <span>Owner</span>
          </button>
        </div>

        {/* Exit / Switch Account */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveRole('public')}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-[#FFD43B] transition-colors py-1 px-2 rounded hover:bg-white/5 cursor-pointer"
            title="Logout / Exit to Public Site"
          >
            <LogOut size={13} />
            <span className="hidden md:inline">Exit Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
