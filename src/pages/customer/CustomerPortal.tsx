/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../../components/common/InteractiveMap';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Booking } from '../../types';
import {
  MapPin,
  Compass,
  Clock,
  Users,
  Phone,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Car,
  User,
  ArrowRight,
  LogOut,
  Navigation,
  FileText,
  RotateCw,
  Home,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    customerView,
    setCustomerView,
    bookings,
    settings,
    createBooking,
    cancelBooking,
    rateBooking,
    calculateDistance,
    calculateFare,
    activeTrackingBookingId,
    setActiveTrackingBookingId,
    setActiveRole,
    addToast,
  } = useApp();

  // Booking Form State
  const [pickup, setPickup] = useState('Thanipadi Bus Stand');
  const [destination, setDestination] = useState('Thandarampet Market');
  const [passengers, setPassengers] = useState(1);
  const [pickupTime, setPickupTime] = useState('Now (Immediate)');

  // Rating Modal State
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [stars, setStars] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Cancel Confirmation State
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser.name || 'Arjun Kumar');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '9876543210');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || 'arjun.kumar@gmail.com');
  const [savedHome, setSavedHome] = useState('Thanipadi Bus Stand Road, Near Temple');
  const [savedWork, setSavedWork] = useState('Thandarampet Taluk Office & Market');

  // Customer's bookings (filter by Arjun's ID or phone)
  const myBookings = bookings.filter(
    (b) => b.customerId === currentUser.id || b.customerPhone === currentUser.phone
  );

  // Find currently active booking (in_progress, accepted, or requested)
  const activeBooking =
    bookings.find((b) => b.id === activeTrackingBookingId) ||
    myBookings.find((b) => b.status === 'in_progress' || b.status === 'accepted' || b.status === 'requested') ||
    bookings.find((b) => b.status === 'in_progress');

  const completedTrips = myBookings.filter((b) => b.status === 'completed');

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = calculateDistance(pickup, destination);
    const fare = calculateFare(dist);

    const newId = createBooking({
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      pickupLocation: pickup,
      destination,
      distanceKm: dist,
      estimatedDurationMin: Math.round(dist * 2.2),
      fare,
      passengerCount: passengers,
      pickupTime: pickupTime === 'Now (Immediate)' ? 'Immediate' : pickupTime,
    });

    setActiveTrackingBookingId(newId);
    setCustomerView('active_trip');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profile Updated', 'Your customer contact information has been saved.', 'success');
  };

  const handleConfirmCancel = () => {
    if (cancelTargetId) {
      cancelBooking(cancelTargetId, 'Cancelled by customer');
      setCancelTargetId(null);
    }
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingBooking) {
      rateBooking(ratingBooking.id, stars, feedbackText);
      setRatingBooking(null);
      setFeedbackText('');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] pb-28 sm:pb-32 lg:pb-16">
      {/* Customer Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FFD43B] border border-[#171717] rounded-xl flex items-center justify-center font-black text-sm text-[#171717]">
              A
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#171717]">
                AUTOGO CUSTOMER
              </div>
              <div className="text-[11px] text-neutral-500 hidden sm:block">
                Logged in as {currentUser.name} ({currentUser.phone})
              </div>
            </div>
          </div>

          {/* Customer Tab Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'book', label: 'Book Auto' },
              { id: 'active_trip', label: 'Active Ride' },
              { id: 'history', label: 'Ride History' },
              { id: 'profile', label: 'Profile' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCustomerView(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  customerView === tab.id
                    ? 'bg-[#171717] text-white'
                    : 'text-neutral-600 hover:text-[#171717] hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* VIEW 1: CUSTOMER DASHBOARD (HOME) */}
        {customerView === 'home' && (
          <div className="space-y-8">
            {/* Welcome banner & Stats */}
            <div className="border border-[#171717] rounded-3xl p-6 sm:p-8 bg-neutral-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  <span>Welcome Back</span>
                  <span>·</span>
                  <span>Thandarampet / Thanipadi Pass</span>
                </div>
                <h1 className="text-3xl font-black text-[#171717] tracking-tight">
                  Hello, {currentUser.name}!
                </h1>
                <p className="text-sm text-neutral-600 mt-1 max-w-lg">
                  Need a quick ride to Thandarampet Market, Sathanur Dam, or Thiruvannamalai? Book from our dedicated 4-auto fleet with zero surge pricing.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white border border-[#171717] rounded-2xl p-4 shrink-0 shadow-sm">
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Completed Rides</div>
                  <div className="text-2xl font-black text-[#171717] font-mono tabular-nums">
                    {completedTrips.length}
                  </div>
                </div>
                <div className="w-[1px] h-10 bg-neutral-200"></div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Saved Fares</div>
                  <div className="text-2xl font-black text-[#171717] font-mono tabular-nums">
                    ₹{completedTrips.reduce((acc, t) => acc + (t.fare || 0), 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Ride Alert / Preview */}
            {activeBooking && (activeBooking.status === 'requested' || activeBooking.status === 'accepted' || activeBooking.status === 'in_progress') && (
              <div className="bg-[#FFD43B]/20 border-2 border-[#171717] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FFD43B] border border-[#171717] rounded-xl flex items-center justify-center text-[#171717] font-bold shrink-0">
                    <Car size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-[#171717] text-white px-2 py-0.5 rounded">
                        {activeBooking.status === 'requested' ? 'SEARCHING DRIVER' : activeBooking.status === 'accepted' ? 'DRIVER EN ROUTE' : 'RIDE IN PROGRESS'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-neutral-600">
                        {activeBooking.id}
                      </span>
                    </div>
                    <div className="text-base font-bold text-[#171717] mt-1">
                      {activeBooking.pickupLocation} → {activeBooking.destination}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {activeBooking.driverName ? `Driver: ${activeBooking.driverName} (${activeBooking.vehicleReg})` : 'Assigning nearest available auto...'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTrackingBookingId(activeBooking.id);
                    setCustomerView('active_trip');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Open Live Tracking Map</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Quick Booking Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <div className="border border-[#171717] rounded-3xl p-6 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                    <h2 className="text-lg font-bold text-[#171717]">Quick Ride Dispatch</h2>
                    <span className="text-xs font-mono text-neutral-500">Meter Rate ₹{settings.perKmRate}/km</span>
                  </div>

                  <form onSubmit={handleCreateBooking} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Pickup Location
                        </label>
                        <select
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-neutral-50 border border-[#171717]/30 rounded-xl focus:outline-none"
                        >
                          {settings.serviceAreas.map((area) => (
                            <option key={area} value={area} disabled={area === destination}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Drop Destination
                        </label>
                        <select
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-neutral-50 border border-[#171717]/30 rounded-xl focus:outline-none"
                        >
                          {settings.serviceAreas.map((area) => (
                            <option key={area} value={area} disabled={area === pickup}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Passenger Count
                        </label>
                        <select
                          value={passengers}
                          onChange={(e) => setPassengers(Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm bg-neutral-50 border border-[#171717]/30 rounded-xl focus:outline-none"
                        >
                          <option value={1}>1 Person</option>
                          <option value={2}>2 Persons</option>
                          <option value={3}>3 Persons (Max)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Schedule Time
                        </label>
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-neutral-50 border border-[#171717]/30 rounded-xl focus:outline-none"
                        >
                          <option value="Now (Immediate)">Now (Immediate)</option>
                          <option value="In 15 Mins">In 15 Mins</option>
                          <option value="In 30 Mins">In 30 Mins</option>
                        </select>
                      </div>
                    </div>

                    {/* Fare Summary */}
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-500">Distance</span>
                        <div className="text-sm font-bold text-[#171717] font-mono tabular-nums">
                          {calculateDistance(pickup, destination)} km
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-500">Est. Time</span>
                        <div className="text-sm font-bold text-[#171717] font-mono tabular-nums">
                          {Math.round(calculateDistance(pickup, destination) * 2.2)} mins
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-neutral-500">Calculated Meter Fare</span>
                        <div className="text-xl font-black text-[#171717] font-mono tabular-nums">
                          ₹{calculateFare(calculateDistance(pickup, destination))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Request Auto Now</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Saved Locations / Short Cuts */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-[#171717] rounded-3xl p-6 bg-white">
                  <h3 className="text-sm font-bold text-[#171717] mb-3 uppercase tracking-wider">
                    Favorite Trips
                  </h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPickup('Thanipadi Bus Stand');
                        setDestination('Thandarampet Market');
                      }}
                      className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-[#171717] transition-all bg-white flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#171717]">Thanipadi → Thandarampet Market</div>
                        <div className="text-[11px] text-neutral-500">Thanipadi to Thandarampet Market (11.5 km)</div>
                      </div>
                      <span className="text-xs font-bold font-mono text-neutral-600 group-hover:text-[#171717]">
                        ₹220
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPickup('Thandarampet Market');
                        setDestination('Sathanur Dam');
                      }}
                      className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-[#171717] transition-all bg-white flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#171717]">Taluk Hub → Sathanur Dam</div>
                        <div className="text-[11px] text-neutral-500">Thandarampet to Sathanur Dam (16.2 km)</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-600 group-hover:text-[#171717]">
                        ₹295
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPickup('Thanipadi Bus Stand');
                        setDestination('Thiruvannamalai Town');
                      }}
                      className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-[#171717] transition-all bg-white flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#171717]">District Town Highway Express</div>
                        <div className="text-[11px] text-neutral-500">Thanipadi to Thiruvannamalai Town (28.0 km)</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-600 group-hover:text-[#171717]">
                        ₹490
                      </span>
                    </button>
                  </div>
                </div>

                {/* Fleet Status Note */}
                <div className="border border-neutral-200 rounded-3xl p-6 bg-neutral-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171717] mb-1">
                    <ShieldCheck size={16} />
                    <span>AUTOGO Fleet Assurance</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    All 4 autos in our fleet are equipped with calibrated digital fare meters, emergency SOS buttons, and GPS tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Trips Table */}
            <div className="border border-[#171717] rounded-3xl p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#171717]">Recent Trips History</h3>
                <button
                  onClick={() => setCustomerView('history')}
                  className="text-xs font-bold text-[#171717] hover:underline cursor-pointer"
                >
                  View All ({myBookings.length})
                </button>
              </div>

              {myBookings.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No trips recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase">
                        <th className="pb-3">Ride ID</th>
                        <th className="pb-3">Route</th>
                        <th className="pb-3">Date/Time</th>
                        <th className="pb-3">Driver</th>
                        <th className="pb-3 text-right">Fare</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {myBookings.slice(0, 5).map((trip) => (
                        <tr key={trip.id} className="hover:bg-neutral-50">
                          <td className="py-3 font-mono font-bold text-xs text-[#171717]">
                            {trip.id}
                          </td>
                          <td className="py-3 font-medium">
                            {trip.pickupLocation} → {trip.destination}
                          </td>
                          <td className="py-3 text-neutral-500 text-xs">
                            {trip.createdAt}
                          </td>
                          <td className="py-3 text-xs">
                            {trip.driverName ? `${trip.driverName} (${trip.vehicleReg})` : 'Unassigned'}
                          </td>
                          <td className="py-3 text-right font-mono font-bold tabular-nums">
                            ₹{trip.fare}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                trip.status === 'completed'
                                  ? 'bg-[#171717] text-[#FFD43B]'
                                  : trip.status === 'in_progress'
                                  ? 'bg-[#FFD43B] text-[#171717]'
                                  : trip.status === 'cancelled'
                                  ? 'bg-neutral-200 text-neutral-700'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}
                            >
                              {trip.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {trip.status === 'completed' && !trip.rating && (
                              <button
                                onClick={() => setRatingBooking(trip)}
                                className="text-xs font-semibold text-[#171717] underline hover:text-neutral-700 cursor-pointer"
                              >
                                Rate
                              </button>
                            )}
                            {(trip.status === 'in_progress' || trip.status === 'accepted' || trip.status === 'requested') && (
                              <button
                                onClick={() => {
                                  setActiveTrackingBookingId(trip.id);
                                  setCustomerView('active_trip');
                                }}
                                className="text-xs font-bold text-[#171717] underline hover:text-neutral-700 cursor-pointer"
                              >
                                Track
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: BOOK AUTO (DETAILED WORKFLOW) */}
        {customerView === 'book' && (
          <div className="max-w-2xl mx-auto border border-[#171717] rounded-3xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Step-by-Step Booking</span>
              <h2 className="text-2xl font-black text-[#171717] tracking-tight mt-1">
                Book Your Auto-Rickshaw
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Fill in pickup and drop points to calculate verified meter distance and confirm your ride.
              </p>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-5">
              {/* Step 1 & 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                    Step 1: Pickup Location
                  </label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-neutral-50 border border-[#171717] rounded-xl focus:outline-none font-medium"
                  >
                    {settings.serviceAreas.map((area) => (
                      <option key={area} value={area} disabled={area === destination}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                    Step 2: Destination Drop Point
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-neutral-50 border border-[#171717] rounded-xl focus:outline-none font-medium"
                  >
                    {settings.serviceAreas.map((area) => (
                      <option key={area} value={area} disabled={area === pickup}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Fare Calculation */}
              <div className="bg-neutral-50 border border-neutral-300 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Step 3 &amp; 4: Distance &amp; Upfront Meter Estimate
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white border border-neutral-200 rounded-xl p-3">
                    <div className="text-xs text-neutral-500">Route Distance</div>
                    <div className="text-lg font-bold text-[#171717] font-mono tabular-nums">
                      {calculateDistance(pickup, destination)} km
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-3">
                    <div className="text-xs text-neutral-500">Duration</div>
                    <div className="text-lg font-bold text-[#171717] font-mono tabular-nums">
                      {Math.round(calculateDistance(pickup, destination) * 2.2)} mins
                    </div>
                  </div>
                  <div className="bg-[#FFD43B] border border-[#171717] rounded-xl p-3">
                    <div className="text-xs text-[#171717] font-semibold">Total Fare</div>
                    <div className="text-xl font-black text-[#171717] font-mono tabular-nums">
                      ₹{calculateFare(calculateDistance(pickup, destination))}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 leading-tight">
                  Calculation rule: Base fare ₹{settings.baseFare} + ₹{settings.perKmRate}/km (Min. fare ₹{settings.minimumFare}). No surge fee applied.
                </div>
              </div>

              {/* Passenger and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Number of Passengers
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none"
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 Persons</option>
                    <option value={3}>3 Persons (Max)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Pickup Time
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none"
                  >
                    <option value="Now (Immediate)">Now (Immediate)</option>
                    <option value="In 15 Mins">In 15 Mins</option>
                    <option value="In 30 Mins">In 30 Mins</option>
                    <option value="In 1 Hour">In 1 Hour</option>
                  </select>
                </div>
              </div>

              {/* Step 5: Confirm Booking */}
              <button
                type="submit"
                className="w-full py-4 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Step 5: Confirm &amp; Dispatch Auto</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: LIVE TRACKING (INTERACTIVE SIMULATED GPS MAP) */}
        {customerView === 'active_trip' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Live Ride Navigation</span>
                <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                  {activeBooking ? `Ride ${activeBooking.id}` : 'Active Auto Tracking'}
                </h2>
              </div>

              {activeBooking && (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      activeBooking.status === 'in_progress'
                        ? 'bg-[#FFD43B] text-[#171717] border-[#171717]'
                        : activeBooking.status === 'completed'
                        ? 'bg-[#171717] text-[#FFD43B] border-[#171717]'
                        : 'bg-neutral-100 text-[#171717] border-neutral-300'
                    }`}
                  >
                    STATUS: {activeBooking.status.toUpperCase()}
                  </span>
                  {(activeBooking.status === 'requested' || activeBooking.status === 'accepted') && (
                    <button
                      onClick={() => setCancelTargetId(activeBooking.id)}
                      className="px-3 py-1 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:border-[#171717] cursor-pointer"
                    >
                      Cancel Ride
                    </button>
                  )}
                </div>
              )}
            </div>

            {activeBooking ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Interactive Map */}
                <div className="lg:col-span-8">
                  <InteractiveMap
                    mode="tracking"
                    booking={activeBooking}
                    heightClass="h-[460px]"
                  />
                  <div className="mt-2 text-[11px] text-neutral-400 text-center font-mono">
                    * The auto marker moves along the predefined Thiruvannamalai regional network using simulated GPS data.
                  </div>
                </div>

                {/* Right: Ride Details & Driver Card */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Driver Card */}
                  <div className="border border-[#171717] rounded-3xl p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 rounded-full flex items-center justify-center font-bold text-lg text-[#171717]">
                          🛺
                        </div>
                        <div>
                          <div className="font-bold text-[#171717] text-base">
                            {activeBooking.driverName || 'Finding Nearest Driver...'}
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">
                            {activeBooking.vehicleReg || 'Assigning Vehicle'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold bg-[#FFD43B] text-[#171717] px-2 py-0.5 rounded">
                        <Star size={12} fill="#171717" />
                        <span>4.9</span>
                      </div>
                    </div>

                    {/* Driver Call Button */}
                    {activeBooking.driverPhone && (
                      <button
                        onClick={() => alert(`Calling driver ${activeBooking.driverName} at ${activeBooking.driverPhone}`)}
                        className="w-full py-2.5 px-4 bg-white text-[#171717] border border-[#171717] rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 cursor-pointer mb-4"
                      >
                        <Phone size={14} />
                        <span>Call Driver ({activeBooking.driverPhone})</span>
                      </button>
                    )}

                    {/* Route Details */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="text-neutral-500 font-medium">Pickup Spot</div>
                        <div className="font-bold text-[#171717] text-sm mt-0.5">
                          {activeBooking.pickupLocation}
                        </div>
                      </div>

                      <div className="w-full h-[1px] bg-neutral-100"></div>

                      <div>
                        <div className="text-neutral-500 font-medium">Destination</div>
                        <div className="font-bold text-[#171717] text-sm mt-0.5">
                          {activeBooking.destination}
                        </div>
                      </div>

                      <div className="w-full h-[1px] bg-neutral-100"></div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <div className="text-neutral-500">Trip Distance</div>
                          <div className="font-mono font-bold text-sm text-[#171717]">
                            {activeBooking.distanceKm} km
                          </div>
                        </div>
                        <div>
                          <div className="text-neutral-500">Meter Fare</div>
                          <div className="font-mono font-bold text-sm text-[#171717]">
                            ₹{activeBooking.fare}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-neutral-500">Payment Mode</div>
                        <div className="font-bold text-[#171717] uppercase">
                          {activeBooking.paymentMethod} ({activeBooking.paymentStatus})
                        </div>
                      </div>
                    </div>

                    {/* Switch role hint for testing */}
                    <div className="mt-5 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                      <strong>Demo Tip:</strong> Switch to the <strong>Driver role</strong> from the top bar to accept this ride or step through the trip workflow.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-neutral-200 rounded-3xl bg-neutral-50">
                <Car size={36} className="mx-auto text-neutral-400 mb-3" />
                <h3 className="text-lg font-bold text-[#171717]">No Active Trip Found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
                  You don't have any ongoing auto ride right now. Book a ride or check your previous trip history.
                </p>
                <button
                  onClick={() => setCustomerView('book')}
                  className="px-5 py-2.5 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors cursor-pointer"
                >
                  Book an Auto Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: RIDE HISTORY */}
        {customerView === 'history' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Archived Trips</span>
              <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                My Ride History
              </h2>
            </div>

            <div className="border border-[#171717] rounded-3xl overflow-hidden bg-white">
              {myBookings.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No trips booked under this account yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase">
                        <th className="px-5 py-3.5">Booking ID</th>
                        <th className="px-5 py-3.5">Pickup → Drop</th>
                        <th className="px-5 py-3.5">Distance</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Driver &amp; Auto</th>
                        <th className="px-5 py-3.5 text-right">Fare</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5 text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {myBookings.map((trip) => (
                        <tr key={trip.id} className="hover:bg-neutral-50">
                          <td className="px-5 py-4 font-mono font-bold text-xs text-[#171717]">
                            {trip.id}
                          </td>
                          <td className="px-5 py-4 font-medium text-xs">
                            <span className="font-semibold text-[#171717]">{trip.pickupLocation}</span>
                            <span className="text-neutral-400 mx-1.5">→</span>
                            <span className="text-neutral-700">{trip.destination}</span>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs tabular-nums">
                            {trip.distanceKm} km
                          </td>
                          <td className="px-5 py-4 text-xs text-neutral-500">
                            {trip.createdAt}
                          </td>
                          <td className="px-5 py-4 text-xs">
                            {trip.driverName ? `${trip.driverName} (${trip.vehicleReg})` : '—'}
                          </td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-xs tabular-nums text-[#171717]">
                            ₹{trip.fare}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                trip.status === 'completed'
                                  ? 'bg-[#171717] text-[#FFD43B]'
                                  : trip.status === 'cancelled'
                                  ? 'bg-neutral-200 text-neutral-700'
                                  : 'bg-[#FFD43B] text-[#171717]'
                              }`}
                            >
                              {trip.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {trip.rating ? (
                              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#171717]">
                                <Star size={13} fill="#FFD43B" stroke="#171717" />
                                <span>{trip.rating}/5</span>
                              </div>
                            ) : trip.status === 'completed' ? (
                              <button
                                onClick={() => setRatingBooking(trip)}
                                className="px-2.5 py-1 text-xs font-semibold bg-[#FFD43B] text-[#171717] rounded-lg border border-[#171717] hover:bg-[#ebd436] cursor-pointer"
                              >
                                Rate
                              </button>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: CUSTOMER PROFILE */}
        {customerView === 'profile' && (
          <div className="max-w-2xl mx-auto border border-[#171717] rounded-3xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Account Details</span>
              <h2 className="text-2xl font-black text-[#171717] tracking-tight mt-1">
                Customer Profile
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Manage your contact details and default Thandarampet / Thanipadi pickup addresses.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Number (Primary for Driver Call)
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Saved Home Address
                </label>
                <input
                  type="text"
                  value={savedHome}
                  onChange={(e) => setSavedHome(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Saved Work / Office
                </label>
                <input
                  type="text"
                  value={savedWork}
                  onChange={(e) => setSavedWork(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveRole('public')}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:border-[#171717] flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Log Out to Public Site</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FFD43B] text-[#171717] font-bold text-xs rounded-xl border border-[#171717] hover:bg-[#ebd436] transition-colors cursor-pointer shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* RATING MODAL */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-[#171717] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Rate Your Driver</h3>
                <p className="text-xs text-neutral-500">Trip {ratingBooking.id} · {ratingBooking.driverName}</p>
              </div>
              <button
                onClick={() => setRatingBooking(null)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      fill={star <= stars ? '#FFD43B' : 'transparent'}
                      stroke="#171717"
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Feedback comments (Optional)
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="How was the punctuality and cleanliness of the auto?"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-[#171717] resize-none h-24"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] cursor-pointer"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION DIALOG */}
      <ConfirmationModal
        isOpen={!!cancelTargetId}
        title="Cancel Auto Booking"
        message="Are you sure you want to cancel this booking? If a driver is en route, they will be freed for other passengers."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTargetId(null)}
      />

      {/* MOBILE BOTTOM NAVIGATION (Icon and Name) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#171717] py-1.5 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'book', label: 'Book', icon: Car },
            { id: 'active_trip', label: 'Ride', icon: Navigation, badge: activeBooking?.status === 'in_progress' || activeBooking?.status === 'accepted' },
            { id: 'history', label: 'History', icon: History },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = customerView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCustomerView(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative cursor-pointer ${
                  active
                    ? 'bg-[#FFD43B] text-[#171717] font-black'
                    : 'text-neutral-500 hover:text-[#171717]'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-bold mt-1 tracking-tight">{tab.label}</span>
                {tab.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#171717]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
