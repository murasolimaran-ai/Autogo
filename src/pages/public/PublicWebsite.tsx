/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ShieldCheck,
  Zap,
  Phone,
  Compass,
  CheckCircle2,
  Calendar,
  Star,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PublicWebsiteProps {
  onOpenLogin: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ onOpenLogin }) => {
  const {
    currentUser,
    settings,
    createBooking,
    calculateDistance,
    calculateFare,
    setActiveRole,
    setCustomerView,
    addToast,
  } = useApp();

  const [pickup, setPickup] = useState('Thanipadi Bus Stand');
  const [destination, setDestination] = useState('Thandarampet Market');
  const [passengers, setPassengers] = useState(1);
  const [pickupTime, setPickupTime] = useState('Now (Immediate)');
  const [fareEstimated, setFareEstimated] = useState<number | null>(null);
  const [distEstimated, setDistEstimated] = useState<number | null>(null);

  const handleEstimate = () => {
    const dist = calculateDistance(pickup, destination);
    const fare = calculateFare(dist);
    setDistEstimated(dist);
    setFareEstimated(fare);
  };

  const handleBookFromHero = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = calculateDistance(pickup, destination);
    const fare = calculateFare(dist);

    const bookingId = createBooking({
      customerId: currentUser?.role === 'customer' ? currentUser.id : 'cust_01',
      customerName: currentUser?.role === 'customer' ? currentUser.name : 'Arjun Kumar',
      customerPhone: currentUser?.role === 'customer' ? currentUser.phone || '9876543210' : '9876543210',
      pickupLocation: pickup,
      destination,
      distanceKm: dist,
      estimatedDurationMin: Math.round(dist * 2.2),
      fare,
      passengerCount: passengers,
      pickupTime: pickupTime === 'Now (Immediate)' ? 'Immediate' : pickupTime,
    });

    // Switch to customer active trip view
    setActiveRole('customer');
    setCustomerView('active_trip');
    addToast('Auto Requested!', `Booking ${bookingId} created. Finding nearest auto driver...`, 'success');
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] selection:bg-[#FFD43B] selection:text-[#171717]">
      {/* 3-Zone Header Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#171717]/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#FFD43B] border border-[#171717] rounded-lg flex items-center justify-center font-black text-base text-[#171717]">
              A
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#171717]">
              AUTOGO
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-700">
            <a href="#how-it-works" className="hover:text-[#171717] transition-colors whitespace-nowrap">
              How It Works
            </a>
            <a href="#why-autogo" className="hover:text-[#171717] transition-colors whitespace-nowrap">
              Why AutoGo
            </a>
            <a href="#services" className="hover:text-[#171717] transition-colors whitespace-nowrap">
              Our Services
            </a>
            <a href="#service-areas" className="hover:text-[#171717] transition-colors whitespace-nowrap">
              Service Areas
            </a>
            <a href="#contact" className="hover:text-[#171717] transition-colors whitespace-nowrap">
              Contact
            </a>
          </nav>

          {/* Zone 3: Primary Action & Login */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveRole(currentUser.role)}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl text-xs font-bold text-[#171717] cursor-pointer flex items-center gap-1.5"
                  title="Go to your dashboard"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FFD43B]"></span>
                  <span className="truncate max-w-[120px]">{currentUser.name}</span>
                </button>
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:text-[#171717] cursor-pointer"
                >
                  Switch
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 text-xs font-semibold text-[#171717] hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
            )}
            <a
              href="#book-card"
              className="px-4 py-2 text-xs font-bold bg-[#FFD43B] text-[#171717] border border-[#171717] rounded-xl hover:bg-[#ebd436] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Book an Auto
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-700">
              <span className="w-2 h-2 rounded-full bg-[#FFD43B]"></span>
              Thiruvannamalai Dt · Thandarampet, Thanipadi &amp; Surroundings
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#171717] leading-[1.08] text-balance">
              Your Ride. Your Time. Your Auto.
            </h1>

            <p className="text-lg text-neutral-600 max-w-xl leading-relaxed">
              Book your auto in seconds. Track your ride live. Reach your destination with ease — transparent meter pricing with zero surge penalties.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 max-w-md">
              <div>
                <div className="text-2xl font-black text-[#171717] font-mono tabular-nums">4</div>
                <div className="text-xs text-neutral-500 font-medium">Dedicated Autos</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#171717] font-mono tabular-nums">₹{settings.baseFare}</div>
                <div className="text-xs text-neutral-500 font-medium">Starting Fare</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#171717] font-mono tabular-nums">&lt; 3 min</div>
                <div className="text-xs text-neutral-500 font-medium">Avg Pickup Time</div>
              </div>
            </div>
          </div>

          {/* Right Hero Booking Card */}
          <div id="book-card" className="lg:col-span-5">
            <div className="bg-white border-2 border-[#171717] rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#171717]">Book Instant Auto</h3>
                  <p className="text-xs text-neutral-500">Live dispatch in Thanipadi &amp; Thandarampet</p>
                </div>
                <span className="text-[11px] font-bold bg-[#FFD43B] text-[#171717] px-2.5 py-1 rounded-md">
                  TN 25 FLEET
                </span>
              </div>

              <form onSubmit={handleBookFromHero} className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#171717]" />
                    <span>Pickup Location</span>
                  </label>
                  <select
                    value={pickup}
                    onChange={(e) => {
                      setPickup(e.target.value);
                      setFareEstimated(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#171717]/30 rounded-xl focus:outline-none focus:border-[#171717] font-medium"
                  >
                    {settings.serviceAreas.map((area) => (
                      <option key={area} value={area} disabled={area === destination}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                    <Compass size={13} className="text-[#171717]" />
                    <span>Destination</span>
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setFareEstimated(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#171717]/30 rounded-xl focus:outline-none focus:border-[#171717] font-medium"
                  >
                    {settings.serviceAreas.map((area) => (
                      <option key={area} value={area} disabled={area === pickup}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Passenger & Pickup Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <Users size={12} />
                      <span>Passengers</span>
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
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                      <Clock size={12} />
                      <span>Time</span>
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

                {/* Fare Estimation Feedback */}
                {fareEstimated !== null ? (
                  <div className="bg-neutral-50 border border-neutral-300 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-neutral-500 font-medium">Estimated Distance</div>
                      <div className="text-sm font-bold text-[#171717] font-mono tabular-nums">{distEstimated} km</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-neutral-500 font-medium">Fixed Meter Fare</div>
                      <div className="text-lg font-black text-[#171717] font-mono tabular-nums">₹{fareEstimated}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleEstimate}
                    className="w-full py-2 px-3 text-xs font-semibold text-[#171717] bg-white border border-[#171717] rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Estimate Fare First
                  </button>
                )}

                {/* Submit Booking */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-[#ebc434] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Book Auto Now</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 1. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-b border-neutral-100">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Simple 3-Step Process</span>
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            How AutoGo Works
          </h2>
          <p className="text-neutral-600 mt-2">
            No waiting at roadside stands, no bargaining. Direct connection with our verified fleet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-[#171717] rounded-2xl p-6 bg-white hover:border-[#FFD43B] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#FFD43B] flex items-center justify-center font-mono font-bold text-base mb-5">
              01
            </div>
            <h3 className="text-lg font-bold text-[#171717] mb-2">Set Pickup &amp; Destination</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Select your village or town hub across Thandarampet, Thanipadi, or Chengam. See transparent upfront distance and calculated meter pricing.
            </p>
          </div>

          <div className="border border-[#171717] rounded-2xl p-6 bg-white hover:border-[#FFD43B] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#FFD43B] flex items-center justify-center font-mono font-bold text-base mb-5">
              02
            </div>
            <h3 className="text-lg font-bold text-[#171717] mb-2">Instant Driver Dispatch</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              One of our 4 dedicated autos is dispatched immediately. Receive driver name, vehicle registration number, and live location.
            </p>
          </div>

          <div className="border border-[#171717] rounded-2xl p-6 bg-white hover:border-[#FFD43B] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#FFD43B] flex items-center justify-center font-mono font-bold text-base mb-5">
              03
            </div>
            <h3 className="text-lg font-bold text-[#171717] mb-2">Live Tracking &amp; Easy Pay</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Watch your auto arrive on the interactive map. Complete your trip comfortably and pay using UPI or cash at standard rates.
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE AUTOGO */}
      <section id="why-autogo" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-b border-neutral-100">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Transparent Transportation</span>
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            Why Choose AutoGo
          </h2>
          <p className="text-neutral-600 mt-2">
            Built for everyday villagers, traders, hospital visits, students, and travelers across Thiruvannamalai district.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border border-neutral-200 rounded-2xl hover:border-[#171717] transition-all bg-white">
            <div className="w-10 h-10 bg-[#FFD43B] text-[#171717] rounded-xl flex items-center justify-center mb-4 font-bold">
              ₹
            </div>
            <h4 className="text-base font-bold text-[#171717] mb-1">Zero Surge Charges</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Rain or peak hours, our fare rules remain fixed at ₹{settings.baseFare} base + ₹{settings.perKmRate}/km.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 rounded-2xl hover:border-[#171717] transition-all bg-white">
            <div className="w-10 h-10 bg-[#171717] text-[#FFD43B] rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-base font-bold text-[#171717] mb-1">Verified Local Drivers</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Experienced, polite drivers with verified police background records, commercial badges, and well-maintained autos.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 rounded-2xl hover:border-[#171717] transition-all bg-white">
            <div className="w-10 h-10 bg-[#FFD43B] text-[#171717] rounded-xl flex items-center justify-center mb-4 font-bold">
              GPS
            </div>
            <h4 className="text-base font-bold text-[#171717] mb-1">Live Route Tracking</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Share your live trip progress in real-time with family. Know exact arrival timestamps with zero guesswork.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 rounded-2xl hover:border-[#171717] transition-all bg-white">
            <div className="w-10 h-10 bg-[#171717] text-[#FFD43B] rounded-xl flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h4 className="text-base font-bold text-[#171717] mb-1">Dedicated Fleet of 4</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Unlike generic aggregators, our managed 4-auto fleet guarantees consistent cleanliness and high driver accountability.
            </p>
          </div>
        </div>
      </section>

      {/* 3. OUR SERVICES */}
      <section id="services" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-b border-neutral-100">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Tailored Mobility</span>
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            Our Transport Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-[#171717] rounded-2xl p-6 bg-white">
            <h3 className="text-lg font-bold text-[#171717] mb-2">Daily Market &amp; Taluk Commutes</h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Fast door-to-door transit between Thanipadi, Radhapuram, and Thandarampet Taluk administrative office and markets.
            </p>
            <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
              <span>Peak Hours: 06:30 AM – 10:30 AM</span>
            </div>
          </div>

          <div className="border border-[#171717] rounded-2xl p-6 bg-white">
            <h3 className="text-lg font-bold text-[#171717] mb-2">Sathanur Dam Excursions</h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Direct connection from Thanipadi &amp; Thandarampet to Sathanur Dam parks, picnic gardens, and scenic reservoir viewpoints.
            </p>
            <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
              <span>Available all 7 days a week</span>
            </div>
          </div>

          <div className="border border-[#171717] rounded-2xl p-6 bg-white">
            <h3 className="text-lg font-bold text-[#171717] mb-2">Town &amp; Temple Connections</h3>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Pre-book your connection to Thiruvannamalai temple, railway station, or Chengam bus terminus with guaranteed driver arrival.
            </p>
            <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
              <span>Advance booking up to 24 hrs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICE AREAS */}
      <section id="service-areas" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-b border-neutral-100">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Coverage Network</span>
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            Active Service Areas
          </h2>
          <p className="text-neutral-600 mt-2">
            Our 4 autos actively patrol and serve these six key hubs across the IT corridor.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {settings.serviceAreas.map((area, index) => (
            <div
              key={area}
              className="border border-[#171717] rounded-2xl p-4 text-center bg-white hover:bg-neutral-50 transition-colors"
            >
              <div className="text-xs font-mono font-bold text-neutral-400 mb-1">
                HUB 0{index + 1}
              </div>
              <div className="text-sm font-bold text-[#171717]">{area}</div>
              <div className="text-[11px] text-neutral-500 mt-2">Full Fleet Coverage</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-b border-neutral-100">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Verified Riders</span>
          <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            Customer Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
            <div className="flex items-center gap-1 text-[#171717] mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#FFD43B" stroke="#171717" />
              ))}
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed mb-4">
              &quot;Booking AutoGo from Thanipadi to Thandarampet market daily has saved me from waiting for crowded buses. Kumar anna is always right on time at my stand.&quot;
            </p>
            <div className="text-xs font-bold text-[#171717]">Arjun Kumar</div>
            <div className="text-[11px] text-neutral-500">Regular Passenger · Thanipadi</div>
          </div>

          <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
            <div className="flex items-center gap-1 text-[#171717] mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#FFD43B" stroke="#171717" />
              ))}
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed mb-4">
              &quot;Clean autos, upfront meter calculations, and quick arrival. Best local auto service in the Thandarampet taluk area.&quot;
            </p>
            <div className="text-xs font-bold text-[#171717]">Priya Sundaram</div>
            <div className="text-[11px] text-neutral-500">Resident · Thandarampet</div>
          </div>

          <div className="border border-neutral-200 rounded-2xl p-6 bg-white">
            <div className="flex items-center gap-1 text-[#171717] mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#FFD43B" stroke="#171717" />
              ))}
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed mb-4">
              &quot;Took an auto to Sathanur Dam on the weekend with family. Fixed meter price, smooth driving, and easy UPI payment.&quot;
            </p>
            <div className="text-xs font-bold text-[#171717]">Karthik Raman</div>
            <div className="text-[11px] text-neutral-500">Visitor · Sathanur Dam Route</div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT & HOURS */}
      <section id="contact" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-b border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Get In Touch</span>
            <h2 className="text-3xl font-extrabold text-[#171717] tracking-tight mt-1 mb-4">
              Fleet Operations Desk
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              Need immediate dispatch, corporate monthly billing, or assistance with a lost item? Our owner desk is directly accessible.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center font-bold">
                  <Phone size={15} />
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Dispatch Helpline</div>
                  <div className="font-bold text-[#171717]">{settings.contactNumber}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center font-bold">
                  <Clock size={15} />
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Operating Hours</div>
                  <div className="font-bold text-[#171717]">{settings.operatingHours}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 border border-[#171717] rounded-3xl p-8">
            <h3 className="text-xl font-bold text-[#171717] mb-2">Ready to Ride?</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Experience the difference with our dedicated 4-auto fleet. Book directly or test the interactive demo portals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#book-card"
                className="px-6 py-3 bg-[#FFD43B] text-[#171717] font-bold text-sm rounded-xl border border-[#171717] text-center hover:bg-[#ebc434] transition-colors"
              >
                Book Auto Now
              </a>
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-6 py-3 bg-white text-[#171717] font-bold text-sm rounded-xl border border-[#171717] hover:bg-neutral-100 transition-colors"
              >
                Access Demo Portals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUIET FOOTER */}
      <footer className="py-10 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="font-black text-[#171717]">AUTOGO</span>
          <span>·</span>
          <span>Smart Auto Booking &amp; Fleet Management</span>
        </div>
        <div>
          © {new Date().getFullYear()} AUTOGO Operations. All rights reserved. Thandarampet &amp; Thanipadi, Thiruvannamalai Dt.
        </div>
      </footer>
    </div>
  );
};
