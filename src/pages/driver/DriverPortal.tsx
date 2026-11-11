/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../../components/common/InteractiveMap';
import { Booking } from '../../types';
import {
  Car,
  DollarSign,
  Navigation,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ChevronRight,
  Shield,
  Star,
  ArrowRight,
  CreditCard,
  User,
  Power,
  RotateCcw,
} from 'lucide-react';

export const DriverPortal: React.FC = () => {
  const {
    currentUser,
    driverView,
    setDriverView,
    drivers,
    vehicles,
    bookings,
    acceptBooking,
    rejectBooking,
    updateTripStatus,
    confirmPayment,
    toggleDriverAvailability,
    setActiveRole,
    addToast,
  } = useApp();

  // Selected payment method in completion dialog
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('upi');

  // Identify Kumar's driver profile & vehicle
  const currentDriver = drivers.find((d) => d.fullName.toLowerCase().includes('kumar')) || drivers[0];
  const assignedVehicle = vehicles.find((v) => v.id === currentDriver?.assignedVehicleId) || vehicles[0];

  const isOnline = currentDriver?.availability === 'online';

  // Driver's active booking (in_progress, accepted, arrived, or requested if assigned)
  const activeTrip = bookings.find(
    (b) =>
      (b.driverId === currentDriver?.id || (!b.driverId && b.status === 'requested')) &&
      (b.status === 'accepted' || b.status === 'arrived' || b.status === 'in_progress')
  );

  // Incoming unaccepted requests (only visible if driver is ONLINE)
  const incomingRequests = isOnline
    ? bookings.filter((b) => b.status === 'requested')
    : [];

  // Completed trips for Kumar
  const driverCompletedTrips = bookings.filter(
    (b) => (b.driverId === currentDriver?.id || b.driverName === currentDriver?.fullName) && b.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-white text-[#171717] pb-24">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFD43B] border border-[#171717] rounded-xl flex items-center justify-center font-black text-sm text-[#171717]">
              🛺
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-[#171717] flex items-center gap-2">
                <span>{currentDriver?.fullName || 'Kumar'}</span>
                <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                  {assignedVehicle?.registrationNumber}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500">
                Driver Rating: ★ {currentDriver?.rating || 4.9} · Bajaj RE Compact
              </div>
            </div>
          </div>

          {/* Large Online / Offline Toggle */}
          <button
            onClick={() => toggleDriverAvailability(currentDriver.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isOnline
                ? 'bg-[#FFD43B] text-[#171717] border-[#171717]'
                : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
            }`}
          >
            <Power size={14} className={isOnline ? 'text-[#171717]' : 'text-neutral-500'} />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* VIEW 1: DRIVER DASHBOARD */}
        {driverView === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                <div className="text-xs font-semibold text-neutral-500">Today's Earnings</div>
                <div className="text-2xl font-black text-[#171717] font-mono tabular-nums mt-1">
                  ₹{currentDriver?.todayEarnings || 820}
                </div>
              </div>

              <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                <div className="text-xs font-semibold text-neutral-500">Today's Trips</div>
                <div className="text-2xl font-black text-[#171717] font-mono tabular-nums mt-1">
                  {driverCompletedTrips.length}
                </div>
              </div>

              <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                <div className="text-xs font-semibold text-neutral-500">Weekly Total</div>
                <div className="text-2xl font-black text-[#171717] font-mono tabular-nums mt-1">
                  ₹{currentDriver?.weeklyEarnings || 5940}
                </div>
              </div>

              <div className="p-4 border border-[#171717] rounded-2xl bg-white shadow-sm">
                <div className="text-xs font-semibold text-neutral-500">Fleet Auto</div>
                <div className="text-sm font-bold text-[#171717] font-mono mt-2 truncate">
                  {assignedVehicle?.registrationNumber}
                </div>
              </div>
            </div>

            {/* Offline Notification Warning */}
            {!isOnline && (
              <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-2xl flex items-center justify-between gap-3">
                <div className="text-xs text-neutral-700">
                  <strong>You are currently OFFLINE.</strong> You will not receive any passenger booking requests until you toggle online.
                </div>
                <button
                  onClick={() => toggleDriverAvailability(currentDriver.id)}
                  className="px-3.5 py-1.5 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] shrink-0 cursor-pointer"
                >
                  Go Online
                </button>
              </div>
            )}

            {/* Active Trip Workflow Box */}
            {activeTrip ? (
              <div className="border-2 border-[#171717] rounded-3xl p-6 bg-white shadow-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-[#FFD43B] text-[#171717] px-2.5 py-1 rounded-md">
                      ACTIVE RIDE · {activeTrip.status.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-600">
                      {activeTrip.id}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-neutral-500">Fare Amount</div>
                    <div className="text-lg font-black text-[#171717] font-mono tabular-nums">
                      ₹{activeTrip.fare}
                    </div>
                  </div>
                </div>

                {/* Map Preview of Route */}
                <InteractiveMap mode="tracking" booking={activeTrip} heightClass="h-[220px]" />

                {/* Passenger Info & Action Row */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 font-medium">Passenger Details</div>
                    <div className="text-sm font-bold text-[#171717] flex items-center gap-2">
                      <User size={15} />
                      <span>{activeTrip.customerName}</span>
                    </div>
                    <div className="text-xs text-neutral-600 font-mono">
                      Phone: {activeTrip.customerPhone} · {activeTrip.passengerCount} Passenger(s)
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Calling passenger ${activeTrip.customerName} at ${activeTrip.customerPhone}`)}
                    className="w-full sm:w-auto px-4 py-2 bg-white text-[#171717] border border-[#171717] rounded-xl text-xs font-bold hover:bg-neutral-100 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Phone size={14} />
                    <span>Call Passenger</span>
                  </button>
                </div>

                {/* Location Stops */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 border border-neutral-200 rounded-xl bg-white">
                    <div className="text-neutral-500 font-semibold flex items-center gap-1.5 mb-1">
                      <MapPin size={13} className="text-[#FFD43B]" />
                      <span>Pickup Spot</span>
                    </div>
                    <div className="font-bold text-[#171717] text-sm">
                      {activeTrip.pickupLocation}
                    </div>
                  </div>

                  <div className="p-3 border border-neutral-200 rounded-xl bg-white">
                    <div className="text-neutral-500 font-semibold flex items-center gap-1.5 mb-1">
                      <Navigation size={13} className="text-[#171717]" />
                      <span>Destination Drop</span>
                    </div>
                    <div className="font-bold text-[#171717] text-sm">
                      {activeTrip.destination}
                    </div>
                  </div>
                </div>

                {/* STEP-BY-STEP TRIP WORKFLOW BUTTONS */}
                <div className="pt-2">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Trip Progression Steps:
                  </div>

                  {activeTrip.status === 'accepted' && (
                    <button
                      onClick={() => updateTripStatus(activeTrip.id, 'arrived')}
                      className="w-full py-4 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 size={18} />
                      <span>Step 2: Arrived at Pickup Location</span>
                    </button>
                  )}

                  {activeTrip.status === 'arrived' && (
                    <button
                      onClick={() => updateTripStatus(activeTrip.id, 'in_progress')}
                      className="w-full py-4 px-4 bg-[#171717] text-[#FFD43B] font-bold text-sm rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Navigation size={18} />
                      <span>Step 3: Passenger Boarded — Start Trip</span>
                    </button>
                  )}

                  {activeTrip.status === 'in_progress' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => updateTripStatus(activeTrip.id, 'completed')}
                        className="w-full py-4 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 size={18} />
                        <span>Step 4: Reach Destination &amp; Complete Trip</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Waiting / Incoming Requests View */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#171717]">
                    Incoming Booking Requests ({incomingRequests.length})
                  </h3>
                  <button
                    onClick={() => addToast('Refreshed', 'Checking nearby dispatch queue.', 'info')}
                    className="text-xs font-semibold text-neutral-600 hover:text-[#171717] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Refresh Queue</span>
                  </button>
                </div>

                {incomingRequests.length === 0 ? (
                  <div className="p-10 border border-neutral-200 rounded-3xl bg-neutral-50 text-center">
                    <Car size={32} className="mx-auto text-neutral-400 mb-2" />
                    <div className="text-sm font-bold text-[#171717]">No Pending Requests Right Now</div>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                      {isOnline
                        ? 'You are online. When a customer books an auto in Thanipadi, Thandarampet, or Sathanur Dam, it will appear here instantly.'
                        : 'You are currently offline. Switch online to receive rides.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="border-2 border-[#171717] rounded-2xl p-5 bg-white shadow-sm space-y-3 animate-in fade-in"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold bg-[#171717] text-[#FFD43B] px-2 py-0.5 rounded">
                            {req.id}
                          </span>
                          <span className="text-lg font-black text-[#171717] font-mono tabular-nums">
                            ₹{req.fare}
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-[#171717]">
                            {req.customerName}
                          </div>
                          <div className="text-xs text-neutral-600 mt-0.5">
                            {req.pickupLocation} → {req.destination}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
                          <span>Est. Distance: {req.distanceKm} km</span>
                          <span>·</span>
                          <span>Time: {req.pickupTime}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            onClick={() => rejectBooking(req.id)}
                            className="py-2.5 px-3 bg-white text-neutral-700 font-bold text-xs rounded-xl border border-neutral-300 hover:border-[#171717] transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => acceptBooking(req.id, currentDriver.id)}
                            className="py-2.5 px-3 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors cursor-pointer shadow-sm"
                          >
                            Accept Ride
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: NEW REQUESTS TAB */}
        {driverView === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#171717]">Booking Requests</h2>
            {!isOnline ? (
              <div className="p-6 border border-neutral-200 rounded-2xl bg-neutral-50 text-center">
                <div className="text-sm font-bold text-[#171717]">You are Offline</div>
                <p className="text-xs text-neutral-500 mt-1 mb-4">
                  Turn your availability online to view and accept incoming rides.
                </p>
                <button
                  onClick={() => toggleDriverAvailability(currentDriver.id)}
                  className="px-4 py-2 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] cursor-pointer"
                >
                  Turn Online
                </button>
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="p-8 border border-neutral-200 rounded-2xl bg-white text-center text-sm text-neutral-500">
                No active booking requests in dispatch queue.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="border border-[#171717] rounded-2xl p-5 bg-white space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-[#171717]">{req.id}</span>
                      <span className="font-mono font-bold text-base text-[#171717]">₹{req.fare}</span>
                    </div>
                    <div className="text-sm font-bold">{req.pickupLocation} → {req.destination}</div>
                    <div className="text-xs text-neutral-500">Passenger: {req.customerName} ({req.customerPhone})</div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => rejectBooking(req.id)}
                        className="flex-1 py-2 bg-white text-neutral-700 font-bold text-xs rounded-xl border border-neutral-300"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => acceptBooking(req.id, currentDriver.id)}
                        className="flex-1 py-2 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717]"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: MY TRIPS */}
        {driverView === 'trips' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#171717]">My Completed Trips</h2>
            <div className="border border-[#171717] rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Passenger</th>
                    <th className="px-4 py-3 text-right">Fare</th>
                    <th className="px-4 py-3 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {driverCompletedTrips.map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold">{t.id}</td>
                      <td className="px-4 py-3 text-xs font-medium">{t.pickupLocation} → {t.destination}</td>
                      <td className="px-4 py-3 text-xs">{t.customerName}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-xs tabular-nums">₹{t.fare}</td>
                      <td className="px-4 py-3 text-right text-xs uppercase font-semibold text-neutral-600">
                        {t.paymentMethod}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: EARNINGS */}
        {driverView === 'earnings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#171717]">Driver Earnings Breakdown</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border border-[#171717] rounded-2xl bg-white">
                <div className="text-xs font-semibold text-neutral-500">Today's Total</div>
                <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                  ₹{currentDriver?.todayEarnings || 820}
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">
                  From {driverCompletedTrips.length} completed trips
                </div>
              </div>

              <div className="p-5 border border-[#171717] rounded-2xl bg-white">
                <div className="text-xs font-semibold text-neutral-500">This Week</div>
                <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                  ₹{currentDriver?.weeklyEarnings || 5940}
                </div>
                <div className="text-[11px] text-neutral-500 mt-2">Paid out every Monday</div>
              </div>

              <div className="p-5 border border-[#171717] rounded-2xl bg-[#FFD43B]/20 border-[#171717]">
                <div className="text-xs font-semibold text-neutral-700">Average Fare</div>
                <div className="text-3xl font-black text-[#171717] font-mono tabular-nums mt-1">
                  ₹{Math.round((currentDriver?.todayEarnings || 820) / Math.max(1, driverCompletedTrips.length))}
                </div>
                <div className="text-[11px] text-neutral-600 mt-2">Per auto trip</div>
              </div>
            </div>

            <div className="border border-[#171717] rounded-2xl p-5 bg-white">
              <h3 className="text-sm font-bold text-[#171717] mb-3 uppercase tracking-wider">
                Trip-Wise Ledger
              </h3>
              <div className="divide-y divide-neutral-100">
                {driverCompletedTrips.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#171717]">{t.pickupLocation} → {t.destination}</div>
                      <div className="text-neutral-500 mt-0.5">{t.createdAt} · ID: {t.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#171717]">₹{t.fare}</div>
                      <div className="text-[11px] text-neutral-500 uppercase">{t.paymentMethod}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: PROFILE */}
        {driverView === 'profile' && (
          <div className="border border-[#171717] rounded-2xl p-6 bg-white space-y-4">
            <h2 className="text-xl font-bold text-[#171717]">Driver Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Name</span>
                <span className="font-bold text-[#171717]">{currentDriver?.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Mobile Phone</span>
                <span className="font-mono text-[#171717]">{currentDriver?.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Commercial License</span>
                <span className="font-mono text-[#171717]">{currentDriver?.licenseNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Assigned Auto</span>
                <span className="font-bold text-[#171717]">{assignedVehicle?.registrationNumber} ({assignedVehicle?.model})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Driver Rating</span>
                <span className="font-bold text-[#171717]">★ {currentDriver?.rating} (5.0 max)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-500">Fleet Member Since</span>
                <span className="text-[#171717]">{currentDriver?.joinedDate}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setActiveRole('public')}
                className="w-full py-2.5 bg-neutral-100 text-[#171717] font-bold text-xs rounded-xl border border-neutral-300 hover:border-[#171717] cursor-pointer"
              >
                Exit Driver Portal to Public Site
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Tab Bar for Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#171717] py-1.5 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {[
            { id: 'dashboard', label: 'Home', icon: Car },
            { id: 'requests', label: 'Requests', icon: Clock, badge: incomingRequests.length },
            { id: 'trips', label: 'Trips', icon: Navigation },
            { id: 'earnings', label: 'Earnings', icon: DollarSign },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = driverView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDriverView(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition-all relative cursor-pointer ${
                  active ? 'bg-[#FFD43B] text-[#171717] font-black' : 'text-neutral-500 hover:text-[#171717]'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                <span className="mt-1 tracking-tight">{tab.label}</span>
                {!!tab.badge && tab.badge > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[#171717] text-[#FFD43B] text-[9px] flex items-center justify-center font-mono font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
