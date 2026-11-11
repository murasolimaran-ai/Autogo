/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  User,
  Car,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  RotateCw,
  Sparkles,
  KeyRound,
  FileBadge,
} from 'lucide-react';

interface DemoLoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialRole?: Role;
}

export const DemoLogin: React.FC<DemoLoginProps> = ({
  onSuccess,
  onCancel,
  initialRole = 'customer',
}) => {
  const {
    setActiveRole,
    setCurrentUser,
    setCustomerView,
    setDriverView,
    setOwnerView,
    registerCustomer,
    loginCustomerWithPhone,
    loginDriverWithPassword,
    registerDriverAccount,
    drivers,
    addToast,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<Role>(initialRole === 'public' ? 'customer' : initialRole);

  // Customer Mode: 'login' | 'register' | 'otp'
  const [customerMode, setCustomerMode] = useState<'login' | 'register' | 'otp'>('login');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('9876543210');
  const [custEmail, setCustEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpTimerActive, setIsOtpTimerActive] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Driver Mode: 'login' | 'register'
  const [driverMode, setDriverMode] = useState<'login' | 'register'>('login');
  const [driverPhone, setDriverPhone] = useState('9876543211');
  const [driverPassword, setDriverPassword] = useState('autogo123');
  const [showDriverPassword, setShowDriverPassword] = useState(false);
  const [driverError, setDriverError] = useState<string | null>(null);

  // Driver Registration Form
  const [newDrvName, setNewDrvName] = useState('');
  const [newDrvPhone, setNewDrvPhone] = useState('');
  const [newDrvLicense, setNewDrvLicense] = useState('');
  const [newDrvPassword, setNewDrvPassword] = useState('autogo123');

  // OTP Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isOtpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsOtpTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isOtpTimerActive, otpTimer]);

  const startOtpCountdown = () => {
    setOtpTimer(30);
    setIsOtpTimerActive(true);
  };

  // Step 1: Customer submits Phone to receive OTP
  const handleCustomerSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custPhone || custPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpError(null);
    setOtpValue('');
    setCustomerMode('otp');
    startOtpCountdown();
    addToast('OTP Sent', `Verification code 1234 sent to +91 ${custPhone}`, 'info');
  };

  // Step 2: Customer enters OTP and verifies
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpValue.trim() !== '1234') {
      setOtpError('Invalid OTP code. Please enter the demo code 1234.');
      return;
    }

    setOtpError(null);
    setActiveRole('customer');
    setCustomerView('home');

    if (custName.trim()) {
      // Register new customer
      registerCustomer({
        name: custName.trim(),
        phone: custPhone.trim(),
        email: custEmail.trim() || undefined,
      });
    } else {
      // Sign in existing
      loginCustomerWithPhone(custPhone.trim(), 'Arjun Kumar');
    }

    if (onSuccess) onSuccess();
  };

  const handleResendOtp = () => {
    startOtpCountdown();
    setOtpError(null);
    addToast('New Code Sent', 'Use demo verification code 1234', 'info');
  };

  // Driver Login
  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDriverError(null);
    const result = loginDriverWithPassword(driverPhone, driverPassword);
    if (!result.success) {
      setDriverError(result.error || 'Login failed.');
      return;
    }

    setActiveRole('driver');
    setDriverView('dashboard');
    if (onSuccess) onSuccess();
  };

  // Driver Registration
  const handleDriverRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrvName || !newDrvPhone || !newDrvLicense) {
      setDriverError('Please fill in all required driver details.');
      return;
    }

    registerDriverAccount({
      fullName: newDrvName,
      phone: newDrvPhone,
      licenseNumber: newDrvLicense,
      password: newDrvPassword || 'autogo123',
    });

    setActiveRole('driver');
    setDriverView('dashboard');
    if (onSuccess) onSuccess();
  };

  // Owner Login
  const handleOwnerLogin = () => {
    setActiveRole('owner');
    setOwnerView('overview');
    addToast('Admin Signed In', 'Welcome to Owner Fleet Console.', 'success');
    if (onSuccess) onSuccess();
  };

  return (
    <div className="bg-white text-[#171717] rounded-3xl border-2 border-[#171717] p-6 sm:p-8 shadow-2xl max-w-lg w-full mx-auto animate-in zoom-in-95">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 bg-[#FFD43B] border border-[#171717] rounded-xl flex items-center justify-center font-black text-lg text-[#171717]">
            A
          </div>
          <span className="text-2xl font-black tracking-tight text-[#171717]">
            AUTOGO
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#171717]">
          {selectedRole === 'customer'
            ? customerMode === 'otp'
              ? 'Verify Mobile OTP'
              : customerMode === 'register'
              ? 'New Customer Registration'
              : 'Customer Sign In'
            : selectedRole === 'driver'
            ? driverMode === 'register'
              ? 'Driver Onboarding'
              : 'Driver Portal Access'
            : 'Owner Admin Desk'}
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          {selectedRole === 'customer'
            ? 'Instant OTP verification for Thandarampet, Thanipadi & regional rides'
            : selectedRole === 'driver'
            ? 'Sign in with driver mobile number and password'
            : 'Owner management desk for 4 operational autos'}
        </p>
      </div>

      {/* Primary Role Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('customer');
            setCustomerMode('login');
          }}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            selectedRole === 'customer'
              ? 'bg-[#FFD43B] border-[#171717] text-[#171717] shadow-sm'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-[#171717]'
          }`}
        >
          <User size={16} className="mb-1 text-[#171717]" />
          <span>Customer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('driver');
            setDriverMode('login');
          }}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            selectedRole === 'driver'
              ? 'bg-[#FFD43B] border-[#171717] text-[#171717] shadow-sm'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-[#171717]'
          }`}
        >
          <Car size={16} className="mb-1 text-[#171717]" />
          <span>Driver</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('owner')}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            selectedRole === 'owner'
              ? 'bg-[#FFD43B] border-[#171717] text-[#171717] shadow-sm'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-[#171717]'
          }`}
        >
          <Shield size={16} className="mb-1 text-[#171717]" />
          <span>Owner</span>
        </button>
      </div>

      {/* ----------------- 1. CUSTOMER EXPERIENCE ----------------- */}
      {selectedRole === 'customer' && (
        <div className="space-y-4">
          {/* Sub-tabs: Login vs Register (only when not in OTP mode) */}
          {customerMode !== 'otp' && (
            <div className="flex border border-neutral-200 rounded-xl p-1 bg-neutral-50 mb-3">
              <button
                type="button"
                onClick={() => setCustomerMode('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  customerMode === 'login'
                    ? 'bg-white text-[#171717] shadow-sm border border-neutral-200'
                    : 'text-neutral-500 hover:text-[#171717]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('register')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  customerMode === 'register'
                    ? 'bg-white text-[#171717] shadow-sm border border-neutral-200'
                    : 'text-neutral-500 hover:text-[#171717]'
                }`}
              >
                Register New Customer
              </button>
            </div>
          )}

          {/* Form: Customer Login / Register */}
          {customerMode !== 'otp' ? (
            <form onSubmit={handleCustomerSendOtp} className="space-y-3.5">
              {customerMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="e.g. Priya Sundaram"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Mobile Number (OTP Verification) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-neutral-500 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                    required
                  />
                </div>
              </div>

              {customerMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-3 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>
              )}

              {otpError && (
                <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                  {otpError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
              >
                <span>Send 4-Digit Verification Code</span>
                <ArrowRight size={16} />
              </button>

              {/* Demo auto-fill option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCustPhone('9876543210');
                    setCustName('Arjun Kumar');
                    setCustomerMode('otp');
                    startOtpCountdown();
                    setOtpValue('1234');
                  }}
                  className="text-xs text-neutral-600 hover:text-[#171717] underline cursor-pointer"
                >
                  Quick Demo: Fill Arjun Kumar (9876543210)
                </button>
              </div>
            </form>
          ) : (
            /* OTP VERIFICATION VIEW */
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-center">
                <div className="text-xs text-neutral-500">
                  Code sent to <strong className="text-[#171717] font-mono">+91 {custPhone}</strong>
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFD43B]/30 border border-[#171717]/20 text-xs font-semibold text-[#171717]">
                  <KeyRound size={12} />
                  <span>Fixed Demo OTP: <strong>1234</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-center text-neutral-700 mb-2 uppercase tracking-wider">
                  Enter 4-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  placeholder="1234"
                  value={otpValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtpValue(val);
                    if (val.length === 4) {
                      setOtpError(null);
                    }
                  }}
                  className="w-48 mx-auto block text-center tracking-[1em] text-2xl font-mono font-black py-3 bg-white border-2 border-[#171717] rounded-2xl focus:outline-none"
                />
              </div>

              {otpError && (
                <div className="p-2 text-center bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                  {otpError}
                </div>
              )}

              {/* Timer & Resend Button */}
              <div className="flex items-center justify-between text-xs px-2">
                <span className="text-neutral-500 font-mono">
                  {isOtpTimerActive ? `Resend in ${otpTimer}s` : 'Code expired'}
                </span>
                <button
                  type="button"
                  disabled={isOtpTimerActive}
                  onClick={handleResendOtp}
                  className="font-bold text-[#171717] underline disabled:opacity-30 disabled:no-underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCw size={12} />
                  <span>Resend OTP</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerMode('login')}
                  className="py-2.5 px-3 bg-white text-neutral-700 font-bold text-xs rounded-xl border border-neutral-300 hover:border-[#171717] cursor-pointer"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-3 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] cursor-pointer shadow-sm"
                >
                  Verify &amp; Enter
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOtpValue('1234');
                  setOtpError(null);
                }}
                className="w-full text-center text-xs text-neutral-500 hover:text-[#171717] py-1 cursor-pointer"
              >
                Auto-fill Code (1234)
              </button>
            </form>
          )}
        </div>
      )}

      {/* ----------------- 2. DRIVER EXPERIENCE ----------------- */}
      {selectedRole === 'driver' && (
        <div className="space-y-4">
          <div className="flex border border-neutral-200 rounded-xl p-1 bg-neutral-50 mb-2">
            <button
              type="button"
              onClick={() => setDriverMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                driverMode === 'login'
                  ? 'bg-white text-[#171717] shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-[#171717]'
              }`}
            >
              Driver Login
            </button>
            <button
              type="button"
              onClick={() => setDriverMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                driverMode === 'register'
                  ? 'bg-white text-[#171717] shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-[#171717]'
              }`}
            >
              Join As Driver
            </button>
          </div>

          {driverMode === 'login' ? (
            <form onSubmit={handleDriverLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Driver Mobile Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="tel"
                    placeholder="9876543211"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Password (Default: autogo123)
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type={showDriverPassword ? 'text' : 'password'}
                    placeholder="autogo123"
                    value={driverPassword}
                    onChange={(e) => setDriverPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDriverPassword(!showDriverPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-[#171717]"
                  >
                    {showDriverPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {driverError && (
                <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                  {driverError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Login to Driver Console</span>
                <ArrowRight size={16} />
              </button>

              {/* 1-Click Driver Presets */}
              <div className="pt-2">
                <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 text-center">
                  1-Click Select Fleet Driver
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {drivers.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDriverPhone(d.phone);
                        setDriverPassword('autogo123');
                        setDriverError(null);
                      }}
                      className="p-2 rounded-xl border border-neutral-200 hover:border-[#171717] bg-white text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-[#171717]">{d.fullName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {d.assignedVehicleReg || 'Auto'} · {d.phone}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* DRIVER REGISTRATION FORM */
            <form onSubmit={handleDriverRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manikandan P"
                  value={newDrvName}
                  onChange={(e) => setNewDrvName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="9876543215"
                  value={newDrvPhone}
                  onChange={(e) => setNewDrvPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Commercial Badge / License Number *
                </label>
                <input
                  type="text"
                  placeholder="TN-21-2022-0099887"
                  value={newDrvLicense}
                  onChange={(e) => setNewDrvLicense(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  placeholder="autogo123"
                  value={newDrvPassword}
                  onChange={(e) => setNewDrvPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none"
                />
              </div>

              {driverError && (
                <div className="p-2 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                  {driverError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-all cursor-pointer shadow-sm"
              >
                Complete Driver Registration
              </button>
            </form>
          )}
        </div>
      )}

      {/* ----------------- 3. OWNER EXPERIENCE ----------------- */}
      {selectedRole === 'owner' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Fleet Scope</span>
              <span className="font-bold text-[#171717]">4 Dedicated Auto-Rickshaws</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Admin Account</span>
              <span className="font-mono text-[#171717]">admin@autogo.demo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Privileges</span>
              <span className="font-semibold text-[#171717]">Full Fleet, Driver &amp; Fare Control</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOwnerLogin}
            className="w-full py-3.5 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Enter Owner Admin Portal</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Footer / Cancel */}
      {onCancel && (
        <div className="mt-5 pt-4 border-t border-neutral-100 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-[#171717] font-semibold cursor-pointer"
          >
            Cancel &amp; Return to Public Website
          </button>
        </div>
      )}
    </div>
  );
};
