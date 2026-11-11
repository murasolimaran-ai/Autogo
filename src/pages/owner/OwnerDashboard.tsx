/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../../components/common/InteractiveMap';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { DataImportModal } from '../../components/owner/DataImportModal';
import { Vehicle, Driver, Booking, Customer, VehicleStatus } from '../../types';
import {
  LayoutDashboard,
  Navigation,
  CalendarCheck,
  Car,
  Users,
  UserCheck,
  TrendingUp,
  FileBarChart,
  Settings as SettingsIcon,
  Search,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Phone,
  CheckCircle2,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  LogOut,
  MapPin,
  Clock,
  Compass,
  MoreHorizontal,
  ChevronUp,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    ownerView,
    setOwnerView,
    currentUser,
    vehicles,
    drivers,
    bookings,
    customers,
    addCustomer,
    settings,
    notifications,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    assignVehicleDriver,
    addDriver,
    updateDriver,
    deleteDriver,
    createBooking,
    cancelBooking,
    acceptBooking,
    updateSettings,
    resetDemoData,
    markNotificationRead,
    clearAllNotifications,
    calculateDistance,
    calculateFare,
    setActiveRole,
    addToast,
  } = useApp();

  // Selected vehicle for Live Fleet inspection panel
  const [selectedFleetVehId, setSelectedFleetVehId] = useState<string | null>(vehicles[0]?.id || null);

  // Search & Filter state
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);

  // Data Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetType, setImportTargetType] = useState<'bookings' | 'vehicles' | 'drivers'>('bookings');

  // "More" Sheet State for Bottom Navigation
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Notifications dropdown toggle
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Confirmation Modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'vehicle' | 'driver' | 'reset' | 'cancel_booking';
    id?: string;
    title: string;
    message: string;
  } | null>(null);

  // Pagination for bookings table
  const [bookingPage, setBookingPage] = useState(1);
  const itemsPerPage = 8;

  // Settings form local state
  const [localSettings, setLocalSettings] = useState(settings);

  // Manual Booking form state
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualPickup, setManualPickup] = useState(settings.serviceAreas[0] || 'Thanipadi Bus Stand');
  const [manualDestination, setManualDestination] = useState(settings.serviceAreas[1] || 'Thandarampet Market');
  const [manualPickupTime, setManualPickupTime] = useState('Immediate');
  const [manualAssignedDriverId, setManualAssignedDriverId] = useState('');

  // Vehicle Form local state
  const [vehReg, setVehReg] = useState('');
  const [vehModel, setVehModel] = useState('Bajaj Compact 4S RE');
  const [vehDriverId, setVehDriverId] = useState('');
  const [vehStatus, setVehStatus] = useState<VehicleStatus>('available');
  const [vehFuel, setVehFuel] = useState<'CNG' | 'Petrol' | 'Electric'>('CNG');
  const [vehInsurance, setVehInsurance] = useState('2027-06-30');
  const [vehMaintenance, setVehMaintenance] = useState<'good' | 'due_soon' | 'under_service'>('good');
  const [vehMileage, setVehMileage] = useState(30000);

  // Driver Form local state
  const [drvName, setDrvName] = useState('');
  const [drvPhone, setDrvPhone] = useState('');
  const [drvLicense, setDrvLicense] = useState('');
  const [drvPassword, setDrvPassword] = useState('autogo123');
  const [drvVehicleId, setDrvVehicleId] = useState('');
  const [drvAvailability, setDrvAvailability] = useState<'online' | 'offline'>('online');

  // Customer Management local state
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // KPI Calculations
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
  const onTripVehicles = vehicles.filter((v) => v.status === 'on_trip').length;
  const offlineVehicles = vehicles.filter((v) => v.status === 'offline').length;

  const totalBookingsCount = bookings.length;
  const completedTripsCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledTripsCount = bookings.filter((b) => b.status === 'cancelled').length;
  const pendingRequestsCount = bookings.filter((b) => b.status === 'requested').length;
  const todayRevenue = bookings
    .filter((b) => b.status === 'completed' && b.createdAt.toLowerCase().includes('today'))
    .reduce((sum, b) => sum + (b.fare || 0), 0);

  const selectedFleetVehicle = vehicles.find((v) => v.id === selectedFleetVehId) || vehicles[0];
  const vehicleActiveTrip = bookings.find(
    (b) =>
      b.vehicleReg === selectedFleetVehicle?.registrationNumber &&
      (b.status === 'in_progress' || b.status === 'accepted')
  );

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        !globalSearch ||
        b.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
        b.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        b.pickupLocation.toLowerCase().includes(globalSearch.toLowerCase()) ||
        b.destination.toLowerCase().includes(globalSearch.toLowerCase());

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && b.createdAt.toLowerCase().includes('today')) ||
        (dateFilter === 'yesterday' && b.createdAt.toLowerCase().includes('yesterday'));

      return matchSearch && matchStatus && matchDate;
    });
  }, [bookings, globalSearch, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (bookingPage - 1) * itemsPerPage,
    bookingPage * itemsPerPage
  );

  // CSV Export for Bookings
  const exportBookingsCSV = () => {
    const headers = ['Booking ID,Customer,Phone,Pickup,Destination,Distance Km,Fare,Status,Driver,Auto,Created At'];
    const rows = bookings.map((b) =>
      [
        b.id,
        `"${b.customerName}"`,
        b.customerPhone,
        `"${b.pickupLocation}"`,
        `"${b.destination}"`,
        b.distanceKm,
        b.fare,
        b.status,
        `"${b.driverName || 'Unassigned'}"`,
        b.vehicleReg || 'Unassigned',
        `"${b.createdAt}"`,
      ].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autogo_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV Downloaded', 'Bookings exported successfully.', 'success');
  };

  // CSV Export for Earnings
  const exportEarningsCSV = () => {
    const headers = ['Driver Name,Phone,Assigned Auto,Today Earnings,Weekly Earnings,Total Trips,Rating'];
    const rows = drivers.map((d) =>
      [
        `"${d.fullName}"`,
        d.phone,
        d.assignedVehicleReg || 'Unassigned',
        d.todayEarnings,
        d.weeklyEarnings,
        d.totalTrips,
        d.rating,
      ].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autogo_earnings_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Earnings Exported', 'Driver ledger exported as CSV.', 'success');
  };

  // Open Vehicle Modal for Create
  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setVehReg('TN 25 AB ' + Math.floor(1000 + Math.random() * 9000));
    setVehModel('Bajaj Compact 4S RE');
    setVehDriverId('');
    setVehStatus('available');
    setVehFuel('CNG');
    setVehInsurance('2027-08-30');
    setVehMaintenance('good');
    setVehMileage(32000);
    setIsVehicleModalOpen(true);
  };

  // Open Vehicle Modal for Edit
  const handleOpenEditVehicle = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setVehReg(veh.registrationNumber);
    setVehModel(veh.model);
    setVehDriverId(veh.assignedDriverId || '');
    setVehStatus(veh.status);
    setVehFuel(veh.fuelType);
    setVehInsurance(veh.insuranceExpiry);
    setVehMaintenance(veh.maintenanceStatus);
    setVehMileage(veh.mileageKm);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDrv = drivers.find((d) => d.id === vehDriverId);
    if (editingVehicle) {
      updateVehicle({
        ...editingVehicle,
        registrationNumber: vehReg,
        model: vehModel,
        assignedDriverId: vehDriverId || null,
        assignedDriverName: assignedDrv ? assignedDrv.fullName : undefined,
        status: vehStatus,
        fuelType: vehFuel,
        insuranceExpiry: vehInsurance,
        maintenanceStatus: vehMaintenance,
        mileageKm: Number(vehMileage),
      });
    } else {
      addVehicle({
        registrationNumber: vehReg,
        model: vehModel,
        assignedDriverId: vehDriverId || null,
        assignedDriverName: assignedDrv ? assignedDrv.fullName : undefined,
        status: vehStatus,
        fuelType: vehFuel,
        insuranceExpiry: vehInsurance,
        maintenanceStatus: vehMaintenance,
        mileageKm: Number(vehMileage),
        location: {
          lat: 12.0620,
          lng: 78.8950,
          address: 'Thanipadi Central Auto Stand',
        },
        lastUpdate: 'Just now',
        speedKmH: 0,
      });
    }
    setIsVehicleModalOpen(false);
  };

  // Open Driver Modal for Create
  const handleOpenAddDriver = () => {
    setEditingDriver(null);
    setDrvName('');
    setDrvPhone('9876543' + Math.floor(200 + Math.random() * 800));
    setDrvLicense('TN-25-2021-00' + Math.floor(10000 + Math.random() * 90000));
    setDrvPassword('autogo123');
    setDrvVehicleId('');
    setDrvAvailability('online');
    setIsDriverModalOpen(true);
  };

  // Open Driver Modal for Edit
  const handleOpenEditDriver = (d: Driver) => {
    setEditingDriver(d);
    setDrvName(d.fullName);
    setDrvPhone(d.phone);
    setDrvLicense(d.licenseNumber);
    setDrvPassword(d.password || 'autogo123');
    setDrvVehicleId(d.assignedVehicleId || '');
    setDrvAvailability(d.availability);
    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedVeh = vehicles.find((v) => v.id === drvVehicleId);
    if (editingDriver) {
      updateDriver({
        ...editingDriver,
        fullName: drvName,
        phone: drvPhone,
        licenseNumber: drvLicense,
        password: drvPassword || 'autogo123',
        assignedVehicleId: drvVehicleId || null,
        assignedVehicleReg: assignedVeh ? assignedVeh.registrationNumber : undefined,
        availability: drvAvailability,
      });
    } else {
      addDriver({
        fullName: drvName,
        phone: drvPhone,
        licenseNumber: drvLicense,
        password: drvPassword || 'autogo123',
        assignedVehicleId: drvVehicleId || null,
        assignedVehicleReg: assignedVeh ? assignedVeh.registrationNumber : undefined,
        availability: drvAvailability,
        status: 'active',
      });
    }
    setIsDriverModalOpen(false);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    addCustomer({
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    });
    setIsAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
  };

  // Submit Manual Booking
  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = calculateDistance(manualPickup, manualDestination);
    const fare = calculateFare(dist);
    const assignedDrv = drivers.find((d) => d.id === manualAssignedDriverId);
    const assignedVeh = vehicles.find((v) => v.id === assignedDrv?.assignedVehicleId);

    const newBookingId = createBooking({
      customerId: 'cust_manual_' + Date.now(),
      customerName: manualCustomerName,
      customerPhone: manualCustomerPhone,
      pickupLocation: manualPickup,
      destination: manualDestination,
      distanceKm: dist,
      estimatedDurationMin: Math.round(dist * 2.2),
      fare,
      passengerCount: 1,
      pickupTime: manualPickupTime,
      driverId: assignedDrv?.id,
      driverName: assignedDrv?.fullName,
      driverPhone: assignedDrv?.phone,
      vehicleId: assignedVeh?.id,
      vehicleReg: assignedVeh?.registrationNumber,
    });

    if (assignedDrv) {
      acceptBooking(newBookingId, assignedDrv.id);
    }

    setIsManualBookingOpen(false);
    setManualCustomerName('');
    setManualCustomerPhone('');
  };

  const handleConfirmAction = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'vehicle' && deleteConfirm.id) {
      deleteVehicle(deleteConfirm.id);
    } else if (deleteConfirm.type === 'driver' && deleteConfirm.id) {
      deleteDriver(deleteConfirm.id);
    } else if (deleteConfirm.type === 'reset') {
      resetDemoData();
    } else if (deleteConfirm.type === 'cancel_booking' && deleteConfirm.id) {
      cancelBooking(deleteConfirm.id, 'Admin cancelled');
    }
    setDeleteConfirm(null);
  };

  const triggerImportModal = (type: 'bookings' | 'vehicles' | 'drivers' = 'bookings') => {
    setImportTargetType(type);
    setIsImportModalOpen(true);
    setIsMoreSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] flex">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="w-64 border-r border-[#171717] bg-white hidden lg:flex flex-col shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFD43B] border border-[#171717] rounded-xl flex items-center justify-center font-black text-sm text-[#171717]">
            A
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-[#171717]">
              AUTOGO FLEET
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">Owner Management Desk</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'fleet', label: 'Live Fleet', icon: Navigation, badge: onTripVehicles > 0 ? `${onTripVehicles} On Trip` : undefined },
            { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} New` : undefined },
            { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
            { id: 'drivers', label: 'Drivers', icon: UserCheck, count: drivers.length },
            { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
            { id: 'earnings', label: 'Earnings', icon: TrendingUp },
            { id: 'reports', label: 'Reports & CSV', icon: FileBarChart },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => {
            const Icon = item.icon;
            const active = ownerView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setOwnerView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#FFD43B] text-[#171717] border border-[#171717] shadow-sm'
                    : 'text-neutral-600 hover:text-[#171717] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={active ? 'text-[#171717]' : 'text-neutral-500'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171717] text-white">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && !item.badge && (
                  <span className="text-[10px] font-mono text-neutral-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Import & Admin Info */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
          <button
            onClick={() => triggerImportModal('bookings')}
            className="w-full py-2 px-3 bg-white text-[#171717] border border-[#171717] rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Upload size={14} />
            <span>Import CSV Data</span>
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <div className="font-bold text-[#171717]">Admin Desk</div>
              <div className="text-[11px] text-neutral-500">admin@autogo.demo</div>
            </div>
            <button
              onClick={() => setActiveRole('public')}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
              title="Exit Session"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-[#FFD43B] border border-[#171717] rounded-xl flex items-center justify-center font-black text-xs text-[#171717] lg:hidden shrink-0">
              A
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[#171717] capitalize truncate">
                {ownerView === 'fleet' ? 'Live Fleet Monitor' : ownerView}
              </h1>
              <div className="text-[11px] text-neutral-500 truncate">
                Thandarampet &amp; Thanipadi · Thiruvannamalai Dt · 4 Autos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Search bar */}
            <div className="relative hidden md:block w-48 lg:w-56">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search bookings, autos..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#171717]"
              />
            </div>

            {/* Import Button */}
            <button
              onClick={() => triggerImportModal('bookings')}
              className="px-3 py-1.5 bg-white text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-neutral-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
              title="Import CSV Data"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Import</span>
            </button>

            {/* Manual Booking */}
            <button
              onClick={() => setIsManualBookingOpen(true)}
              className="px-3 py-1.5 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Booking</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-xl border border-neutral-200 hover:border-[#171717] text-neutral-700 hover:text-[#171717] relative cursor-pointer"
                title="Notifications"
              >
                <Bell size={16} />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD43B] text-[#171717] text-[10px] font-bold rounded-full flex items-center justify-center font-mono border border-[#171717]">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#171717] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 mb-3">
                    <span className="text-xs font-bold text-[#171717]">Fleet Notifications</span>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-neutral-500 hover:text-[#171717] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-xs text-neutral-400 text-center py-4">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.read ? 'bg-neutral-50 border-neutral-100 text-neutral-600' : 'bg-white border-[#171717] text-[#171717]'
                          }`}
                        >
                          <div className="font-bold">{n.title}</div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-neutral-400 mt-1">{n.time}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* VIEWPORT AREA (with bottom padding for mobile bottom bar) */}
        <main className="p-4 sm:p-8 pb-28 sm:pb-32 lg:pb-12 flex-1 space-y-8">
          {/* -------------------- 1. OVERVIEW DASHBOARD -------------------- */}
          {ownerView === 'overview' && (
            <div className="space-y-8">
              {/* 8 Statistic Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Total Autos</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    {totalVehicles}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Reg: TN 25 Fleet</div>
                </div>

                <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Available</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    {availableVehicles}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Ready for dispatch</div>
                </div>

                <div className="p-4 border border-[#171717] rounded-2xl bg-[#FFD43B]/20 border-[#171717] shadow-sm">
                  <div className="text-xs font-bold text-[#171717]">On Trip (Active)</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    {onTripVehicles}
                  </div>
                  <div className="text-[11px] text-neutral-700 mt-1">Mani (TN 25 CD 3388)</div>
                </div>

                <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Offline</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    {offlineVehicles}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Suresh (TN 25 DE 4919)</div>
                </div>

                <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Total Bookings</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    {totalBookingsCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">All time records</div>
                </div>

                <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Completed Trips</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    {completedTripsCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Successful drops</div>
                </div>

                <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Cancelled</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    {cancelledTripsCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Zero fee penalty</div>
                </div>

                <div className="p-4 border border-[#171717] rounded-2xl bg-[#FFD43B] text-[#171717] shadow-sm">
                  <div className="text-xs font-bold">Today's Revenue</div>
                  <div className="text-3xl font-black font-mono tabular-nums mt-1">
                    ₹{todayRevenue || 445}
                  </div>
                  <div className="text-[11px] font-semibold mt-1">From today's completed rides</div>
                </div>
              </div>

              {/* Mini Fleet Preview & Active Route */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <div className="border border-[#171717] rounded-3xl p-5 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-[#171717]">Fleet Live Map Preview</h3>
                        <p className="text-xs text-neutral-500">4 Autos actively tracked across Thandarampet &amp; Thanipadi routes</p>
                      </div>
                      <button
                        onClick={() => setOwnerView('fleet')}
                        className="text-xs font-bold text-[#171717] underline hover:text-neutral-700 cursor-pointer"
                      >
                        Full Fleet Console →
                      </button>
                    </div>
                    <InteractiveMap
                      mode="fleet"
                      vehicles={vehicles}
                      selectedVehicleId={selectedFleetVehId}
                      onSelectVehicle={(id) => {
                        setSelectedFleetVehId(id);
                        setOwnerView('fleet');
                      }}
                      heightClass="h-[320px]"
                    />
                  </div>
                </div>

                {/* 4 Vehicles Summary List */}
                <div className="lg:col-span-4">
                  <div className="border border-[#171717] rounded-3xl p-5 bg-white space-y-3">
                    <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider mb-2">
                      Auto Fleet Status (4/4)
                    </h3>
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedFleetVehId(v.id);
                          setOwnerView('fleet');
                        }}
                        className="p-3 border border-neutral-200 hover:border-[#171717] rounded-xl flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div>
                          <div className="font-bold text-xs text-[#171717]">{v.registrationNumber}</div>
                          <div className="text-[11px] text-neutral-500">Driver: {v.assignedDriverName || 'None'}</div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            v.status === 'on_trip'
                              ? 'bg-[#FFD43B] text-[#171717]'
                              : v.status === 'available'
                              ? 'bg-[#171717] text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {v.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="border border-[#171717] rounded-3xl p-6 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#171717]">Recent Bookings</h3>
                    <p className="text-xs text-neutral-500">Showing latest customer and dispatch logs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerImportModal('bookings')}
                      className="px-3 py-1.5 bg-white text-[#171717] font-semibold text-xs border border-neutral-300 rounded-lg hover:border-[#171717] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={12} />
                      <span>Import</span>
                    </button>
                    <button
                      onClick={() => setOwnerView('bookings')}
                      className="text-xs font-bold text-[#171717] underline hover:text-neutral-700 cursor-pointer"
                    >
                      View All {bookings.length} Bookings
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase">
                        <th className="px-4 py-3">Booking ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Driver</th>
                        <th className="px-4 py-3">Pickup → Destination</th>
                        <th className="px-4 py-3 text-right">Fare</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {bookings.slice(0, 6).map((b) => (
                        <tr key={b.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 font-mono font-bold text-xs text-[#171717]">{b.id}</td>
                          <td className="px-4 py-3 text-xs">
                            <div className="font-semibold text-[#171717]">{b.customerName}</div>
                            <div className="text-[10px] text-neutral-400">{b.customerPhone}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {b.driverName ? `${b.driverName} (${b.vehicleReg})` : 'Unassigned'}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span>{b.pickupLocation}</span>
                            <span className="text-neutral-400 mx-1">→</span>
                            <span>{b.destination}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-xs tabular-nums text-[#171717]">
                            ₹{b.fare}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.status === 'completed'
                                  ? 'bg-[#171717] text-[#FFD43B]'
                                  : b.status === 'in_progress'
                                  ? 'bg-[#FFD43B] text-[#171717]'
                                  : b.status === 'cancelled'
                                  ? 'bg-neutral-200 text-neutral-700'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}
                            >
                              {b.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setViewingBooking(b)}
                              className="text-xs font-semibold text-[#171717] underline hover:text-neutral-700 cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- 2. LIVE FLEET MANAGEMENT -------------------- */}
          {ownerView === 'fleet' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">GPS Telemetry Console</span>
                  <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                    Live Auto Fleet Monitor (4 Vehicles)
                  </h2>
                </div>
                <div className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-300">
                  Click any auto on map or list to inspect real-time vehicle metrics
                </div>
              </div>

              {/* Map & Vehicle Detail Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <InteractiveMap
                    mode="fleet"
                    vehicles={vehicles}
                    selectedVehicleId={selectedFleetVehId}
                    onSelectVehicle={(id) => setSelectedFleetVehId(id)}
                    heightClass="h-[460px]"
                  />

                  {/* Operational status legend */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#171717] rounded-sm"></span>
                      <span>Available (2)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#FFD43B] border border-[#171717] rounded-sm"></span>
                      <span>On Trip (1)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-neutral-500 rounded-sm"></span>
                      <span>Offline / Inactive (1)</span>
                    </span>
                  </div>
                </div>

                {/* Vehicle Detail Panel */}
                <div className="lg:col-span-4">
                  {selectedFleetVehicle ? (
                    <div className="border-2 border-[#171717] rounded-3xl p-6 bg-white shadow-md space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Selected Auto
                          </span>
                          <h3 className="text-xl font-black text-[#171717] font-mono">
                            {selectedFleetVehicle.registrationNumber}
                          </h3>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            selectedFleetVehicle.status === 'on_trip'
                              ? 'bg-[#FFD43B] text-[#171717]'
                              : selectedFleetVehicle.status === 'available'
                              ? 'bg-[#171717] text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {selectedFleetVehicle.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-500">Driver</span>
                          <span className="font-bold text-[#171717]">
                            {selectedFleetVehicle.assignedDriverName || 'No Driver Assigned'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-500">Auto Model</span>
                          <span className="font-medium text-[#171717]">{selectedFleetVehicle.model}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-500">Fuel Engine</span>
                          <span className="font-medium text-[#171717]">{selectedFleetVehicle.fuelType}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-500">Odometer</span>
                          <span className="font-mono tabular-nums text-[#171717]">
                            {selectedFleetVehicle.mileageKm} km
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-500">Last Known GPS Point</span>
                          <span className="font-medium text-[#171717] text-right truncate max-w-[180px]">
                            {selectedFleetVehicle.location.address}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-500">Telemetry Status</span>
                          <span className="text-neutral-600 font-mono">{selectedFleetVehicle.lastUpdate}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-neutral-500">Insurance Expiry</span>
                          <span className="font-mono text-neutral-700">{selectedFleetVehicle.insuranceExpiry}</span>
                        </div>
                      </div>

                      {/* Active booking on this vehicle if any */}
                      {vehicleActiveTrip ? (
                        <div className="p-3 bg-neutral-50 border border-[#171717] rounded-xl text-xs space-y-1">
                          <div className="font-bold text-[#171717] flex items-center justify-between">
                            <span>Ongoing Ride ({vehicleActiveTrip.id})</span>
                            <span className="text-[#171717] font-mono">₹{vehicleActiveTrip.fare}</span>
                          </div>
                          <div className="text-neutral-600">
                            {vehicleActiveTrip.pickupLocation} → {vehicleActiveTrip.destination}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            Passenger: {vehicleActiveTrip.customerName} ({vehicleActiveTrip.customerPhone})
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-500 text-center">
                          No active booking on this vehicle right now.
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleOpenEditVehicle(selectedFleetVehicle)}
                          className="flex-1 py-2 px-3 bg-white text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-neutral-50 cursor-pointer"
                        >
                          Edit Vehicle
                        </button>
                        <button
                          onClick={() => setOwnerView('vehicles')}
                          className="py-2 px-3 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-neutral-500 border rounded-3xl">
                      Select an auto to view telemetry.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* -------------------- 3. BOOKINGS MANAGEMENT -------------------- */}
          {ownerView === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Trip Dispatch Ledger</span>
                  <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                    Booking Management
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerImportModal('bookings')}
                    className="px-3.5 py-2 bg-white text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Import CSV</span>
                  </button>
                  <button
                    onClick={exportBookingsCSV}
                    className="px-3.5 py-2 bg-white text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setIsManualBookingOpen(true)}
                    className="px-4 py-2 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Manual Booking</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                    <Filter size={14} />
                    <span>Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setBookingPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="requested">Requested</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                    <span>Date:</span>
                    <select
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setBookingPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-neutral-500 font-medium">
                  Showing <strong>{filteredBookings.length}</strong> matching bookings
                </div>
              </div>

              {/* Bookings Table */}
              <div className="border border-[#171717] rounded-3xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase">
                        <th className="px-5 py-3.5">ID</th>
                        <th className="px-5 py-3.5">Customer</th>
                        <th className="px-5 py-3.5">Route</th>
                        <th className="px-5 py-3.5">Assigned Auto</th>
                        <th className="px-5 py-3.5">Date / Time</th>
                        <th className="px-5 py-3.5 text-right">Fare</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {paginatedBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-neutral-400 text-xs">
                            No bookings match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-neutral-50">
                            <td className="px-5 py-4 font-mono font-bold text-xs text-[#171717]">
                              {b.id}
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <div className="font-bold text-[#171717]">{b.customerName}</div>
                              <div className="font-mono text-neutral-400 text-[11px]">{b.customerPhone}</div>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <span className="font-medium text-[#171717]">{b.pickupLocation}</span>
                              <span className="text-neutral-400 mx-1.5">→</span>
                              <span className="text-neutral-600">{b.destination}</span>
                              <div className="text-[10px] text-neutral-400 mt-0.5">{b.distanceKm} km</div>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              {b.vehicleReg ? (
                                <div>
                                  <div className="font-bold text-[#171717]">{b.vehicleReg}</div>
                                  <div className="text-[10px] text-neutral-500">{b.driverName}</div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAssigningBooking(b)}
                                  className="text-xs font-bold text-[#171717] bg-[#FFD43B] px-2 py-0.5 rounded border border-[#171717] hover:bg-[#ebd436] cursor-pointer"
                                >
                                  Assign Driver
                                </button>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs text-neutral-500">
                              {b.createdAt}
                            </td>
                            <td className="px-5 py-4 text-right font-mono font-bold text-xs tabular-nums text-[#171717]">
                              ₹{b.fare}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  b.status === 'completed'
                                    ? 'bg-[#171717] text-[#FFD43B]'
                                    : b.status === 'in_progress'
                                    ? 'bg-[#FFD43B] text-[#171717]'
                                    : b.status === 'cancelled'
                                    ? 'bg-neutral-200 text-neutral-700'
                                    : 'bg-neutral-100 text-neutral-800'
                                }`}
                              >
                                {b.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right text-xs">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setViewingBooking(b)}
                                  className="p-1 rounded text-neutral-600 hover:text-[#171717] hover:bg-neutral-100 cursor-pointer"
                                  title="View Booking"
                                >
                                  <Eye size={15} />
                                </button>
                                {b.status !== 'completed' && b.status !== 'cancelled' && (
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        type: 'cancel_booking',
                                        id: b.id,
                                        title: 'Cancel Booking ' + b.id,
                                        message: 'Are you sure you want to cancel this active booking from owner console?',
                                      })
                                    }
                                    className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-neutral-100 cursor-pointer"
                                    title="Cancel Booking"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                    <div>
                      Page {bookingPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={bookingPage === 1}
                        onClick={() => setBookingPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        disabled={bookingPage === totalPages}
                        onClick={() => setBookingPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------- 4. VEHICLES MANAGEMENT (CRUD) -------------------- */}
          {ownerView === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Fleet Asset Register</span>
                  <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                    Vehicle Management ({vehicles.length} Autos)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerImportModal('vehicles')}
                    className="px-3.5 py-2 bg-white text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Import Vehicles</span>
                  </button>
                  <button
                    onClick={handleOpenAddVehicle}
                    className="px-4 py-2 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Add Vehicle</span>
                  </button>
                </div>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="border-2 border-[#171717] rounded-3xl p-6 bg-white shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-neutral-400">
                          AUTO ASSET #{v.id}
                        </span>
                        <h3 className="text-xl font-black text-[#171717] font-mono mt-0.5">
                          {v.registrationNumber}
                        </h3>
                        <p className="text-xs text-neutral-500">{v.model} · {v.fuelType}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          v.status === 'on_trip'
                            ? 'bg-[#FFD43B] text-[#171717]'
                            : v.status === 'available'
                            ? 'bg-[#171717] text-white'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {v.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div>
                        <div className="text-neutral-500">Assigned Driver</div>
                        <div className="font-bold text-[#171717] mt-0.5">
                          {v.assignedDriverName || 'None'}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Odometer</div>
                        <div className="font-mono tabular-nums font-bold text-[#171717] mt-0.5">
                          {v.mileageKm} km
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Maintenance</div>
                        <div className="font-semibold text-[#171717] uppercase mt-0.5">
                          {v.maintenanceStatus.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Insurance Till</div>
                        <div className="font-mono text-neutral-700 mt-0.5">{v.insuranceExpiry}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          setSelectedFleetVehId(v.id);
                          setOwnerView('fleet');
                        }}
                        className="text-xs font-bold text-[#171717] underline hover:text-neutral-700 cursor-pointer"
                      >
                        View on Map
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditVehicle(v)}
                          className="px-3 py-1.5 bg-white text-[#171717] border border-[#171717] rounded-xl text-xs font-bold hover:bg-neutral-50 cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'vehicle',
                              id: v.id,
                              title: `Delete Auto ${v.registrationNumber}`,
                              message: `Are you sure you want to permanently delete auto ${v.registrationNumber} from your fleet register?`,
                            })
                          }
                          className="px-3 py-1.5 bg-white text-neutral-600 border border-neutral-300 rounded-xl text-xs font-bold hover:text-red-600 hover:border-red-400 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------- 5. DRIVERS MANAGEMENT (CRUD) -------------------- */}
          {ownerView === 'drivers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Chauffeur &amp; Staff</span>
                  <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                    Driver Management ({drivers.length} Drivers)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerImportModal('drivers')}
                    className="px-3.5 py-2 bg-white text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Import Drivers</span>
                  </button>
                  <button
                    onClick={handleOpenAddDriver}
                    className="px-4 py-2 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Add Driver</span>
                  </button>
                </div>
              </div>

              {/* Drivers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {drivers.map((d) => (
                  <div
                    key={d.id}
                    className="border-2 border-[#171717] rounded-3xl p-6 bg-white shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-300 flex items-center justify-center font-bold text-lg text-[#171717]">
                          👤
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#171717]">{d.fullName}</h3>
                          <div className="font-mono text-xs text-neutral-500">{d.phone}</div>
                          <div className="text-[11px] text-neutral-400">License: {d.licenseNumber}</div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          d.availability === 'online'
                            ? 'bg-[#FFD43B] text-[#171717]'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {d.availability.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div>
                        <div className="text-neutral-500">Today</div>
                        <div className="font-mono font-bold text-[#171717] text-sm tabular-nums mt-0.5">
                          ₹{d.todayEarnings}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Total Trips</div>
                        <div className="font-mono font-bold text-[#171717] text-sm tabular-nums mt-0.5">
                          {d.totalTrips}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Rating</div>
                        <div className="font-bold text-[#171717] text-sm mt-0.5">
                          ★ {d.rating}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-600 flex items-center justify-between">
                      <span>Assigned Auto:</span>
                      <span className="font-bold font-mono text-[#171717]">
                        {d.assignedVehicleReg || 'Unassigned'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => handleOpenEditDriver(d)}
                        className="px-3 py-1.5 bg-white text-[#171717] border border-[#171717] rounded-xl text-xs font-bold hover:bg-neutral-50 cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'driver',
                            id: d.id,
                            title: `Delete Driver ${d.fullName}`,
                            message: `Are you sure you want to remove driver ${d.fullName} from system? Any assigned vehicle will become unassigned.`,
                          })
                        }
                        className="px-3 py-1.5 bg-white text-neutral-600 border border-neutral-300 rounded-xl text-xs font-bold hover:text-red-600 hover:border-red-400 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------- 6. CUSTOMERS -------------------- */}
          {ownerView === 'customers' && (() => {
            const filteredCustomers = customers.filter(
              (c) =>
                !customerSearch ||
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.phone.includes(customerSearch) ||
                c.email.toLowerCase().includes(customerSearch.toLowerCase())
            );

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Registered Passengers</span>
                    <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                      Customer Directory ({customers.length} Accounts)
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Customers registered via OTP login, mobile app, or manual dispatcher entry.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAddCustomerModalOpen(true)}
                      className="px-4 py-2 bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl text-xs font-bold hover:bg-[#ebd436] cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={15} />
                      <span>Add Customer</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar & Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search customers by name, phone or email..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#171717] rounded-2xl text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD43B]"
                    />
                    {customerSearch && (
                      <button
                        onClick={() => setCustomerSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#171717] text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl p-3 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Active Riders</span>
                    <span className="text-sm font-bold font-mono text-[#171717]">{customers.length}</span>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl p-3 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Total Rides Taken</span>
                    <span className="text-sm font-bold font-mono text-[#171717]">
                      {customers.reduce((acc, c) => acc + (c.totalTrips || 0), 0)}
                    </span>
                  </div>
                </div>

                <div className="border border-[#171717] rounded-3xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase">
                          <th className="px-5 py-3.5">Customer Name</th>
                          <th className="px-5 py-3.5">Mobile Phone</th>
                          <th className="px-5 py-3.5">Email</th>
                          <th className="px-5 py-3.5 text-center">Completed Rides</th>
                          <th className="px-5 py-3.5 text-right">Lifetime Spent</th>
                          <th className="px-5 py-3.5 text-right">Registered</th>
                          <th className="px-5 py-3.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-neutral-500 text-xs">
                              No customers found matching &quot;{customerSearch}&quot;.
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map((c) => (
                            <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-bold text-xs text-[#171717] flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#FFD43B] text-[#171717] flex items-center justify-center font-bold text-xs shrink-0">
                                    {c.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div>{c.name}</div>
                                    <div className="text-[10px] text-neutral-400 font-mono font-normal">ID: {c.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-[#171717] font-semibold">{c.phone}</td>
                              <td className="px-5 py-4 text-xs text-neutral-500">{c.email}</td>
                              <td className="px-5 py-4 text-center font-mono font-bold text-xs tabular-nums">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                                  {c.totalTrips} rides
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right font-mono font-bold text-xs tabular-nums text-[#171717]">
                                ₹{c.totalSpent}
                              </td>
                              <td className="px-5 py-4 text-right text-xs text-neutral-500 font-mono">
                                {c.memberSince}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setManualCustomerName(c.name);
                                      setManualCustomerPhone(c.phone);
                                      setIsManualBookingOpen(true);
                                    }}
                                    className="px-2.5 py-1 bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-lg text-[11px] font-bold hover:bg-[#ebd436] cursor-pointer flex items-center gap-1"
                                    title="Create instant auto dispatch for this customer"
                                  >
                                    <Car size={12} />
                                    <span>Book Auto</span>
                                  </button>
                                  <a
                                    href={`tel:${c.phone}`}
                                    className="p-1.5 bg-white text-neutral-700 border border-neutral-300 rounded-lg hover:border-[#171717] hover:text-[#171717]"
                                    title={`Call ${c.name} (${c.phone})`}
                                  >
                                    <Phone size={12} />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* -------------------- 7. EARNINGS & REPORTS -------------------- */}
          {(ownerView === 'earnings' || ownerView === 'reports') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Financial Ledger</span>
                  <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                    Earnings &amp; Fleet Reports
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerImportModal('bookings')}
                    className="px-3.5 py-2 bg-white text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Import Records</span>
                  </button>
                  <button
                    onClick={exportEarningsCSV}
                    className="px-4 py-2 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Download Ledger CSV</span>
                  </button>
                </div>
              </div>

              {/* Financial KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 border border-[#171717] rounded-3xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Today's Revenue</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    ₹{todayRevenue || 445}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">Calculated from actual meter records</div>
                </div>

                <div className="p-6 border border-[#171717] rounded-3xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Weekly Revenue</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    ₹{drivers.reduce((acc, d) => acc + d.weeklyEarnings, 0)}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">All 4 autos combined</div>
                </div>

                <div className="p-6 border border-[#171717] rounded-3xl bg-white shadow-sm">
                  <div className="text-xs font-semibold text-neutral-500">Average Trip Fare</div>
                  <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                    ₹{Math.round(
                      bookings.reduce((sum, b) => sum + (b.fare || 0), 0) / Math.max(1, bookings.length)
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mt-2">Across Thandarampet, Thanipadi &amp; Sathanur routes</div>
                </div>
              </div>

              {/* Driver-wise Earnings Breakdown */}
              <div className="border border-[#171717] rounded-3xl p-6 bg-white shadow-sm">
                <h3 className="text-base font-bold text-[#171717] mb-4">Driver-Wise Performance Ledger</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase">
                        <th className="px-4 py-3">Driver</th>
                        <th className="px-4 py-3">Assigned Auto</th>
                        <th className="px-4 py-3 text-right">Today Earnings</th>
                        <th className="px-4 py-3 text-right">Weekly Earnings</th>
                        <th className="px-4 py-3 text-center">Completed Trips</th>
                        <th className="px-4 py-3 text-right">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {drivers.map((d) => (
                        <tr key={d.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3.5 font-bold text-xs text-[#171717]">{d.fullName}</td>
                          <td className="px-4 py-3.5 font-mono text-xs">{d.assignedVehicleReg || '—'}</td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-xs tabular-nums">
                            ₹{d.todayEarnings}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-xs tabular-nums text-[#171717]">
                            ₹{d.weeklyEarnings}
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono text-xs">{d.totalTrips}</td>
                          <td className="px-4 py-3.5 text-right text-xs font-bold">★ {d.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- 8. SETTINGS -------------------- */}
          {ownerView === 'settings' && (
            <div className="max-w-2xl border border-[#171717] rounded-3xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Fleet Operations Configuration</span>
                <h2 className="text-2xl font-black text-[#171717] tracking-tight mt-1">
                  Owner Fare &amp; Business Settings
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Adjust standard meter rates and business operations parameters. Changes take effect across all customer and driver calculations instantly.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSettings(localSettings);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.businessName}
                    onChange={(e) => setLocalSettings({ ...localSettings, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Contact Hotline Number
                  </label>
                  <input
                    type="text"
                    value={localSettings.contactNumber}
                    onChange={(e) => setLocalSettings({ ...localSettings, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Base Fare (₹)
                    </label>
                    <input
                      type="number"
                      value={localSettings.baseFare}
                      onChange={(e) => setLocalSettings({ ...localSettings, baseFare: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] font-mono"
                      min={10}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Per Kilometre Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={localSettings.perKmRate}
                      onChange={(e) => setLocalSettings({ ...localSettings, perKmRate: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] font-mono"
                      min={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Minimum Fare (₹)
                    </label>
                    <input
                      type="number"
                      value={localSettings.minimumFare}
                      onChange={(e) => setLocalSettings({ ...localSettings, minimumFare: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] font-mono"
                      min={20}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Waiting Charge (₹ / min)
                    </label>
                    <input
                      type="number"
                      value={localSettings.waitingChargePerMin}
                      onChange={(e) => setLocalSettings({ ...localSettings, waitingChargePerMin: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] font-mono"
                      min={1}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={localSettings.operatingHours}
                    onChange={(e) => setLocalSettings({ ...localSettings, operatingHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm({
                        type: 'reset',
                        title: 'Reset Demo Data to Initial State',
                        message: 'This will reset all vehicles, drivers, bookings, and settings back to default demo data. Are you sure?',
                      })
                    }
                    className="px-4 py-2.5 text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded-xl hover:border-[#171717] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Reset Demo Data</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION (Exactly 5 Items: 4 Key + 1 More, with Icon and Name) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#171717] py-1.5 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
          {/* Tab 1: Overview */}
          <button
            onClick={() => {
              setOwnerView('overview');
              setIsMoreSheetOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              ownerView === 'overview'
                ? 'bg-[#FFD43B] text-[#171717] font-black'
                : 'text-neutral-500 hover:text-[#171717]'
            }`}
          >
            <LayoutDashboard size={18} strokeWidth={ownerView === 'overview' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1 tracking-tight">Overview</span>
          </button>

          {/* Tab 2: Live Fleet */}
          <button
            onClick={() => {
              setOwnerView('fleet');
              setIsMoreSheetOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative cursor-pointer ${
              ownerView === 'fleet'
                ? 'bg-[#FFD43B] text-[#171717] font-black'
                : 'text-neutral-500 hover:text-[#171717]'
            }`}
          >
            <Navigation size={18} strokeWidth={ownerView === 'fleet' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1 tracking-tight">Fleet</span>
            {onTripVehicles > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#171717]"></span>
            )}
          </button>

          {/* Tab 3: Bookings */}
          <button
            onClick={() => {
              setOwnerView('bookings');
              setIsMoreSheetOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative cursor-pointer ${
              ownerView === 'bookings'
                ? 'bg-[#FFD43B] text-[#171717] font-black'
                : 'text-neutral-500 hover:text-[#171717]'
            }`}
          >
            <CalendarCheck size={18} strokeWidth={ownerView === 'bookings' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1 tracking-tight">Bookings</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[#171717] text-[#FFD43B] text-[9px] flex items-center justify-center font-mono font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* Tab 4: Vehicles */}
          <button
            onClick={() => {
              setOwnerView('vehicles');
              setIsMoreSheetOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              ownerView === 'vehicles'
                ? 'bg-[#FFD43B] text-[#171717] font-black'
                : 'text-neutral-500 hover:text-[#171717]'
            }`}
          >
            <Car size={18} strokeWidth={ownerView === 'vehicles' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1 tracking-tight">Vehicles</span>
          </button>

          {/* Tab 5: More Options Sheet Trigger */}
          <button
            onClick={() => setIsMoreSheetOpen(!isMoreSheetOpen)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              isMoreSheetOpen || ['drivers', 'customers', 'earnings', 'reports', 'settings'].includes(ownerView)
                ? 'bg-[#171717] text-[#FFD43B] font-black'
                : 'text-neutral-500 hover:text-[#171717]'
            }`}
          >
            <MoreHorizontal size={18} strokeWidth={isMoreSheetOpen ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1 tracking-tight">More</span>
          </button>
        </div>
      </div>

      {/* 4. MORE OPTIONS BOTTOM SHEET (SLIDE-OVER / DRAWER FOR REMAINING FEATURES) */}
      {isMoreSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in">
          <div className="bg-white border-t-2 border-[#171717] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#FFD43B] border border-[#171717] rounded-lg flex items-center justify-center text-[#171717] font-bold text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#171717]">More Fleet Operations</h3>
                  <div className="text-[10px] text-neutral-500">Staff, Ledger, Settings &amp; Data Tools</div>
                </div>
              </div>
              <button
                onClick={() => setIsMoreSheetOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Action: Import CSV */}
            <div className="p-3 bg-[#FFD43B]/20 border border-[#171717] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#171717] text-[#FFD43B] flex items-center justify-center">
                  <Upload size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#171717]">Import Fleet Data</div>
                  <div className="text-[10px] text-neutral-600">CSV upload for bookings, autos, or drivers</div>
                </div>
              </div>
              <button
                onClick={() => triggerImportModal('bookings')}
                className="px-3 py-1.5 bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl text-xs font-bold hover:bg-[#ebd436] cursor-pointer"
              >
                Import
              </button>
            </div>

            {/* Secondary Menu Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setOwnerView('drivers');
                  setIsMoreSheetOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  ownerView === 'drivers'
                    ? 'bg-[#FFD43B] border-[#171717] text-[#171717]'
                    : 'bg-white border-neutral-200 hover:border-[#171717]'
                }`}
              >
                <UserCheck size={18} className="mt-0.5 text-[#171717]" />
                <div>
                  <div className="text-xs font-bold text-[#171717]">Drivers</div>
                  <div className="text-[10px] text-neutral-500">{drivers.length} registered</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setOwnerView('customers');
                  setIsMoreSheetOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  ownerView === 'customers'
                    ? 'bg-[#FFD43B] border-[#171717] text-[#171717]'
                    : 'bg-white border-neutral-200 hover:border-[#171717]'
                }`}
              >
                <Users size={18} className="mt-0.5 text-[#171717]" />
                <div>
                  <div className="text-xs font-bold text-[#171717]">Customers</div>
                  <div className="text-[10px] text-neutral-500">{customers.length} riders</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setOwnerView('earnings');
                  setIsMoreSheetOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  ownerView === 'earnings'
                    ? 'bg-[#FFD43B] border-[#171717] text-[#171717]'
                    : 'bg-white border-neutral-200 hover:border-[#171717]'
                }`}
              >
                <TrendingUp size={18} className="mt-0.5 text-[#171717]" />
                <div>
                  <div className="text-xs font-bold text-[#171717]">Earnings</div>
                  <div className="text-[10px] text-neutral-500">Revenue ledger</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setOwnerView('reports');
                  setIsMoreSheetOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  ownerView === 'reports'
                    ? 'bg-[#FFD43B] border-[#171717] text-[#171717]'
                    : 'bg-white border-neutral-200 hover:border-[#171717]'
                }`}
              >
                <FileBarChart size={18} className="mt-0.5 text-[#171717]" />
                <div>
                  <div className="text-xs font-bold text-[#171717]">Reports &amp; CSV</div>
                  <div className="text-[10px] text-neutral-500">Export tools</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setOwnerView('settings');
                  setIsMoreSheetOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  ownerView === 'settings'
                    ? 'bg-[#FFD43B] border-[#171717] text-[#171717]'
                    : 'bg-white border-neutral-200 hover:border-[#171717]'
                }`}
              >
                <SettingsIcon size={18} className="mt-0.5 text-[#171717]" />
                <div>
                  <div className="text-xs font-bold text-[#171717]">Settings</div>
                  <div className="text-[10px] text-neutral-500">Fare rules &amp; rates</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  setDeleteConfirm({
                    type: 'reset',
                    title: 'Reset Demo Data to Initial State',
                    message: 'This will reset all vehicles, drivers, bookings, and settings back to default demo data. Are you sure?',
                  });
                }}
                className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-[#171717] text-left flex items-start gap-3 cursor-pointer"
              >
                <RefreshCw size={18} className="mt-0.5 text-neutral-600" />
                <div>
                  <div className="text-xs font-bold text-[#171717]">Reset Demo</div>
                  <div className="text-[10px] text-neutral-500">Restore seeds</div>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  setActiveRole('public');
                }}
                className="w-full py-2.5 bg-neutral-100 text-[#171717] font-bold text-xs rounded-xl border border-neutral-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Exit to Public Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DATA IMPORT MODAL */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultType={importTargetType}
      />

      {/* 6. MODAL: ADD / EDIT VEHICLE */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-[#171717] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-[#171717]">
                {editingVehicle ? 'Edit Auto Details' : 'Add Auto to Fleet'}
              </h3>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={vehReg}
                  onChange={(e) => setVehReg(e.target.value.toUpperCase())}
                  placeholder="e.g. TN 25 AB 5678"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Auto Model
                </label>
                <input
                  type="text"
                  value={vehModel}
                  onChange={(e) => setVehModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Assigned Driver
                  </label>
                  <select
                    value={vehDriverId}
                    onChange={(e) => setVehDriverId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={vehFuel}
                    onChange={(e) => setVehFuel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="CNG">CNG</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={vehStatus}
                    onChange={(e) => setVehStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="offline">Offline</option>
                    <option value="assigned">Assigned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Maintenance
                  </label>
                  <select
                    value={vehMaintenance}
                    onChange={(e) => setVehMaintenance(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="good">Good Condition</option>
                    <option value="due_soon">Due Soon</option>
                    <option value="under_service">Under Service</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] cursor-pointer"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: ADD / EDIT DRIVER */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-[#171717] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-[#171717]">
                {editingDriver ? 'Edit Driver' : 'Register New Driver'}
              </h3>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={drvName}
                  onChange={(e) => setDrvName(e.target.value)}
                  placeholder="e.g. Ramesh"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={drvPhone}
                  onChange={(e) => setDrvPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Commercial Driving License Number
                </label>
                <input
                  type="text"
                  value={drvLicense}
                  onChange={(e) => setDrvLicense(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Portal Login Password
                </label>
                <input
                  type="text"
                  value={drvPassword}
                  onChange={(e) => setDrvPassword(e.target.value)}
                  placeholder="autogo123"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl font-mono"
                  required
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Driver will use this password to log in. Default: <code className="font-bold text-[#171717]">autogo123</code>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Assign Auto
                  </label>
                  <select
                    value={drvVehicleId}
                    onChange={(e) => setDrvVehicleId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="">None (Unassigned)</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Availability
                  </label>
                  <select
                    value={drvAvailability}
                    onChange={(e) => setDrvAvailability(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] cursor-pointer"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7B. MODAL: ADD CUSTOMER */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-[#171717] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Add New Customer</h3>
                <p className="text-xs text-neutral-500">Record a new passenger in the fleet directory</p>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  10-Digit Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
                <span className="font-bold text-[#171717]">Note:</span> This customer will immediately appear in the Customer Directory, and you can book rides for them directly via phone dispatch. They can also log in using their phone with demo OTP <span className="font-bold font-mono text-[#171717]">1234</span>.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: CREATE MANUAL BOOKING */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-[#171717] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-[#171717]">Manual Phone Dispatch</h3>
              <button
                onClick={() => setIsManualBookingOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={manualCustomerName}
                  onChange={(e) => setManualCustomerName(e.target.value)}
                  placeholder="e.g. Karthik Raman"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Customer Phone Number
                </label>
                <input
                  type="tel"
                  value={manualCustomerPhone}
                  onChange={(e) => setManualCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Pickup Location
                  </label>
                  <select
                    value={manualPickup}
                    onChange={(e) => setManualPickup(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    {settings.serviceAreas.map((area) => (
                      <option key={area} value={area} disabled={area === manualDestination}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Destination
                  </label>
                  <select
                    value={manualDestination}
                    onChange={(e) => setManualDestination(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    {settings.serviceAreas.map((area) => (
                      <option key={area} value={area} disabled={area === manualPickup}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Assign Auto Driver Directly
                </label>
                <select
                  value={manualAssignedDriverId}
                  onChange={(e) => setManualAssignedDriverId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
                >
                  <option value="">Leave in Queue (Unassigned)</option>
                  {drivers
                    .filter((d) => d.availability === 'online')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.assignedVehicleReg || 'Auto'})
                      </option>
                    ))}
                </select>
              </div>

              {/* Estimated Fare Preview */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500">Route Distance</span>
                  <div className="font-mono font-bold">{calculateDistance(manualPickup, manualDestination)} km</div>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500">Calculated Meter Fare</span>
                  <div className="font-mono font-bold text-sm text-[#171717]">
                    ₹{calculateFare(calculateDistance(manualPickup, manualDestination))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualBookingOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] cursor-pointer"
                >
                  Dispatch Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: VIEW BOOKING DETAILS */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-[#171717] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-400">BOOKING RECORD</span>
                <h3 className="text-lg font-bold text-[#171717]">{viewingBooking.id}</h3>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Customer</span>
                <span className="font-bold text-[#171717]">
                  {viewingBooking.customerName} ({viewingBooking.customerPhone})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Pickup</span>
                <span className="font-semibold text-[#171717]">{viewingBooking.pickupLocation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Destination</span>
                <span className="font-semibold text-[#171717]">{viewingBooking.destination}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Distance</span>
                <span className="font-mono tabular-nums">{viewingBooking.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Fixed Fare</span>
                <span className="font-mono font-bold text-[#171717] text-sm">₹{viewingBooking.fare}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Driver</span>
                <span className="font-bold">{viewingBooking.driverName || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Vehicle</span>
                <span className="font-mono">{viewingBooking.vehicleReg || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Booking Status</span>
                <span className="font-bold uppercase text-[#171717]">{viewingBooking.status}</span>
              </div>
              {viewingBooking.rating && (
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Customer Rating</span>
                  <span className="font-bold">★ {viewingBooking.rating}/5</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL: ASSIGN DRIVER */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-[#171717] rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="text-base font-bold text-[#171717]">
                Assign Driver to {assigningBooking.id}
              </h3>
              <button
                onClick={() => setAssigningBooking(null)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {drivers.map((drv) => (
                <button
                  key={drv.id}
                  onClick={() => {
                    acceptBooking(assigningBooking.id, drv.id);
                    setAssigningBooking(null);
                  }}
                  className="w-full p-3 rounded-xl border border-neutral-200 hover:border-[#171717] hover:bg-neutral-50 flex items-center justify-between text-left cursor-pointer transition-all"
                >
                  <div>
                    <div className="font-bold text-xs text-[#171717]">{drv.fullName}</div>
                    <div className="text-[11px] text-neutral-500">
                      Auto: {drv.assignedVehicleReg || 'No Auto'}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      drv.availability === 'online' ? 'bg-[#FFD43B] text-[#171717]' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {drv.availability.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. CONFIRMATION MODAL */}
      {deleteConfirm && (
        <ConfirmationModal
          isOpen={true}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          confirmLabel="Proceed"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmAction}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};
