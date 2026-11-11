/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vehicle, Booking } from '../../types';
import { Navigation, ZoomIn, ZoomOut, RotateCcw, Compass, Phone } from 'lucide-react';

interface InteractiveMapProps {
  mode: 'tracking' | 'fleet';
  booking?: Booking;
  vehicles?: Vehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicleId: string) => void;
  heightClass?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mode,
  booking,
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle,
  heightClass = 'h-[440px]',
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Route path coordinates across Thiruvannamalai District network (SVG ViewBox 0 0 800 500)
  // Thanipadi (220, 390) -> Radhapuram (310, 330) -> Thandarampet (420, 260) -> Veraiyur (550, 200) -> Thiruvannamalai Town (680, 130)
  // Sathanur Dam (260, 170) -> Chengam (100, 210) -> Vanapuram (490, 380)
  const waypoints = [
    { name: 'Thanipadi Bus Stand', x: 220, y: 390 },
    { name: 'Radhapuram Junction', x: 310, y: 330 },
    { name: 'Thandarampet Market', x: 420, y: 260 },
    { name: 'Veraiyur Cross Road', x: 550, y: 200 },
    { name: 'Thiruvannamalai Town', x: 680, y: 130 },
    { name: 'Sathanur Dam', x: 260, y: 170 },
    { name: 'Chengam Town', x: 100, y: 210 },
    { name: 'Vanapuram Market', x: 490, y: 380 },
  ];

  // Calculate coordinates for booking pickup and destination
  const getPoint = (name?: string, fallbackX = 420, fallbackY = 260) => {
    if (!name) return { x: fallbackX, y: fallbackY };
    const found = waypoints.find(w => w.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(w.name.toLowerCase()));
    if (found) return { x: found.x, y: found.y };
    if (name.includes('Thanipadi')) return { x: 220, y: 390 };
    if (name.includes('Radhapuram')) return { x: 310, y: 330 };
    if (name.includes('Thandarampet')) return { x: 420, y: 260 };
    if (name.includes('Veraiyur')) return { x: 550, y: 200 };
    if (name.includes('Thiruvannamalai')) return { x: 680, y: 130 };
    if (name.includes('Sathanur')) return { x: 260, y: 170 };
    if (name.includes('Chengam')) return { x: 100, y: 210 };
    if (name.includes('Vanapuram')) return { x: 490, y: 380 };
    return { x: fallbackX, y: fallbackY };
  };

  const pickupPt = getPoint(booking?.pickupLocation, 220, 390);
  const destPt = getPoint(booking?.destination, 420, 260);

  // Current progress between pickup and destination for simulated auto
  const progressPercent = Math.min(100, Math.max(0, booking?.currentProgress ?? 35));
  const t = progressPercent / 100;
  // Linear or slight bezier curve interpolation
  const currentAutoX = pickupPt.x + (destPt.x - pickupPt.x) * t;
  const currentAutoY = pickupPt.y + (destPt.y - pickupPt.y) * t;

  // Bearing angle calculation
  const angleDeg = Math.atan2(destPt.y - pickupPt.y, destPt.x - pickupPt.x) * (180 / Math.PI);

  // Position coordinates for fleet vehicles
  const getVehicleCoordinates = (v: Vehicle, index: number) => {
    if (v.registrationNumber === 'TN 25 AB 1001') {
      return { x: 220, y: 390 }; // Thanipadi Central Stand
    }
    if (v.registrationNumber === 'TN 25 BC 2042') {
      return { x: 420, y: 260 }; // Thandarampet Taluk Hub
    }
    if (v.registrationNumber === 'TN 25 CD 3388') {
      return { x: 330, y: 310 }; // SH-9A on trip
    }
    if (v.registrationNumber === 'TN 25 DE 4919') {
      return { x: 260, y: 170 }; // Sathanur Dam Stand
    }
    return { x: 200 + index * 100, y: 250 + (index % 2) * 50 };
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#F9F9F9] border border-[#171717] rounded-2xl overflow-hidden select-none`}>
      {/* Top Map Overlays */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="bg-[#171717] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#FFD43B]"></span>
          DEMO LIVE TRACKING
        </span>
        <span className="bg-white/90 backdrop-blur-sm text-[#171717] text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#171717]/20 shadow-sm">
          Thiruvannamalai Dt · Thandarampet &amp; Thanipadi
        </span>
      </div>

      {/* Map Controls (+ - reset) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white border border-[#171717] rounded-xl shadow-md p-1">
        <button
          onClick={() => setZoomLevel(z => Math.min(1.6, z + 0.15))}
          className="w-8 h-8 flex items-center justify-center text-[#171717] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoomLevel(z => Math.max(0.85, z - 0.15))}
          className="w-8 h-8 flex items-center justify-center text-[#171717] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="w-8 h-8 flex items-center justify-center text-[#171717] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Bottom Route Status HUD (Tracking Mode) */}
      {mode === 'tracking' && booking && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 bg-white border border-[#171717] rounded-xl p-3 shadow-lg flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <span>{booking.vehicleReg || 'TN 21 AB 1234'}</span>
              <span>·</span>
              <span>{booking.driverName || 'Driver Assigned'}</span>
            </div>
            <div className="text-sm font-bold text-[#171717] truncate mt-0.5">
              {progressPercent >= 100
                ? 'Arrived at destination'
                : progressPercent > 80
                ? 'Approaching destination (2 mins)'
                : `Heading to ${booking.destination} · ${Math.round((1 - progressPercent / 100) * booking.distanceKm * 10) / 10} km left`}
            </div>
          </div>
          {booking.driverPhone && (
            <a
              href={`tel:${booking.driverPhone}`}
              onClick={(e) => {
                e.preventDefault();
                alert(`Calling Driver ${booking.driverName} at ${booking.driverPhone} (Simulated)`);
              }}
              className="px-3 py-1.5 bg-[#FFD43B] text-[#171717] font-semibold text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#ebc434] transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <Phone size={13} />
              <span>Call</span>
            </a>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EFEFEF" strokeWidth="1" />
          </pattern>
          {/* Filter for clean marker drop shadow */}
          <filter id="marker-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Map Base Canvas */}
        <rect width="800" height="500" fill="#FDFDFD" />
        <rect width="800" height="500" fill="url(#grid)" />

        {/* Sathanur Reservoir & Thenpennai River subtle regional representation */}
        <path
          d="M 210 10 Q 240 70 255 130 Q 270 170 250 220 Q 230 270 260 330 T 300 490 L 280 500 L 210 500 Z"
          fill="#F0F7FA"
          stroke="#DCEAF0"
          strokeWidth="1.5"
        />
        <text x="245" y="85" fill="#9FB5C1" fontSize="10" fontWeight="700" letterSpacing="2" transform="rotate(-70, 245, 85)">
          SATHANUR RESERVOIR / THENPENNAI RIVER
        </text>

        {/* Major Arterial Roads */}
        {/* SH-9A State Highway Spine: Thanipadi -> Radhapuram -> Thandarampet -> Veraiyur -> Thiruvannamalai */}
        <path
          d="M 220 390 L 310 330 L 420 260 L 550 200 L 680 130"
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 220 390 L 310 330 L 420 260 L 550 200 L 680 130"
          fill="none"
          stroke="#171717"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 220 390 L 310 330 L 420 260 L 550 200 L 680 130"
          fill="none"
          stroke="#FFD43B"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Thandarampet - Sathanur Dam Tourist Road */}
        <path
          d="M 420 260 L 260 170"
          fill="none"
          stroke="#D4D4D4"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 420 260 L 260 170"
          fill="none"
          stroke="#525252"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Sathanur Dam - Chengam Highway Link */}
        <path
          d="M 260 170 L 100 210"
          fill="none"
          stroke="#525252"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Thanipadi - Chengam Western Rural Link */}
        <path
          d="M 220 390 L 140 300 L 100 210"
          fill="none"
          stroke="#525252"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Vanapuram Agricultural Corridor */}
        <path
          d="M 220 390 Q 350 430 490 380 L 420 260"
          fill="none"
          stroke="#737373"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Thiruvannamalai Girivalam / Depot Loop */}
        <path
          d="M 680 130 C 700 100 740 110 730 150 C 720 180 670 170 680 130"
          fill="none"
          stroke="#D4D4D4"
          strokeWidth="3"
        />

        {/* Landmark Nodes & Labels */}
        {waypoints.map((pt, i) => (
          <g key={i} className="cursor-default">
            <circle cx={pt.x} cy={pt.y} r="5" fill="#171717" />
            <circle cx={pt.x} cy={pt.y} r="2.5" fill="#FFFFFF" />
            <rect
              x={pt.x - 4}
              y={pt.y + 8}
              width={pt.name.length * 6.6}
              height="16"
              rx="4"
              fill="#FFFFFF"
              stroke="#E5E5E5"
              strokeWidth="1"
            />
            <text
              x={pt.x}
              y={pt.y + 20}
              fill="#171717"
              fontSize="10"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              {pt.name}
            </text>
          </g>
        ))}

        {/* ----------------- TRACKING MODE SPECIFIC RENDERS ----------------- */}
        {mode === 'tracking' && (
          <g>
            {/* Active Ride Route Polyline */}
            <line
              x1={pickupPt.x}
              y1={pickupPt.y}
              x2={destPt.x}
              y2={destPt.y}
              stroke="#171717"
              strokeWidth="4"
              strokeDasharray="6 4"
            />

            {/* Travelled Route Segment in Yellow */}
            <line
              x1={pickupPt.x}
              y1={pickupPt.y}
              x2={currentAutoX}
              y2={currentAutoY}
              stroke="#FFD43B"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Pickup Marker (Yellow Flag Pin) */}
            <g transform={`translate(${pickupPt.x}, ${pickupPt.y})`} filter="url(#marker-shadow)">
              <circle cx="0" cy="0" r="14" fill="#FFD43B" stroke="#171717" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#171717" fontSize="11" fontWeight="800">
                P
              </text>
              <g transform="translate(0, -22)">
                <rect x="-35" y="-14" width="70" height="18" rx="4" fill="#171717" />
                <text x="0" y="-1" textAnchor="middle" fill="#FFD43B" fontSize="9" fontWeight="700">
                  PICKUP
                </text>
              </g>
            </g>

            {/* Destination Marker (Black Pin) */}
            <g transform={`translate(${destPt.x}, ${destPt.y})`} filter="url(#marker-shadow)">
              <circle cx="0" cy="0" r="14" fill="#171717" stroke="#FFFFFF" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
                D
              </text>
              <g transform="translate(0, -22)">
                <rect x="-35" y="-14" width="70" height="18" rx="4" fill="#171717" />
                <text x="0" y="-1" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">
                  DROP
                </text>
              </g>
            </g>

            {/* Simulated Live Auto Marker with Rickshaw Vector */}
            <g
              transform={`translate(${currentAutoX}, ${currentAutoY}) rotate(${angleDeg})`}
              filter="url(#marker-shadow)"
              className="transition-all duration-1000 ease-linear"
            >
              {/* Outer Pulse Ring */}
              <circle cx="0" cy="0" r="22" fill="#FFD43B" fillOpacity="0.3">
                <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Auto Base Chassis */}
              <rect x="-14" y="-10" width="28" height="20" rx="6" fill="#171717" stroke="#FFD43B" strokeWidth="2" />
              {/* Auto Hood (Yellow Canopy) */}
              <rect x="-8" y="-7" width="16" height="14" rx="3" fill="#FFD43B" />
              {/* Front Windshield */}
              <rect x="7" y="-5" width="4" height="10" rx="1" fill="#FFFFFF" />
              {/* 3 Wheels (1 front, 2 rear) */}
              <rect x="9" y="-2" width="5" height="4" rx="1" fill="#171717" />
              <rect x="-13" y="-12" width="6" height="3" rx="1" fill="#171717" />
              <rect x="-13" y="9" width="6" height="3" rx="1" fill="#171717" />
            </g>

            {/* Floating Registration Label next to Auto */}
            <g transform={`translate(${currentAutoX + 24}, ${currentAutoY - 14})`}>
              <rect x="0" y="-12" width="94" height="24" rx="4" fill="#FFFFFF" stroke="#171717" strokeWidth="1.5" />
              <text x="6" y="4" fill="#171717" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                🛺 {booking?.vehicleReg || 'TN 21 AB 1234'}
              </text>
            </g>
          </g>
        )}

        {/* ----------------- FLEET MANAGEMENT MULTI-AUTO MODE ----------------- */}
        {mode === 'fleet' && (
          <g>
            {vehicles.map((veh, index) => {
              const coords = getVehicleCoordinates(veh, index);
              const isSelected = selectedVehicleId === veh.id;

              // Color based on status
              const isAvailable = veh.status === 'available';
              const isOnTrip = veh.status === 'on_trip';
              const isOffline = veh.status === 'offline';

              return (
                <g
                  key={veh.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectVehicle?.(veh.id)}
                  filter="url(#marker-shadow)"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle cx="0" cy="0" r="26" fill="none" stroke="#FFD43B" strokeWidth="3" strokeDasharray="4 2" />
                  )}

                  {/* Operational Status Dot Halo */}
                  {isOnTrip && (
                    <circle cx="0" cy="0" r="20" fill="#FFD43B" fillOpacity="0.25">
                      <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Vehicle Body Box */}
                  <rect
                    x="-18"
                    y="-14"
                    width="36"
                    height="28"
                    rx="8"
                    fill={isOffline ? '#525252' : isAvailable ? '#171717' : '#171717'}
                    stroke={isOnTrip ? '#FFD43B' : isAvailable ? '#FFFFFF' : '#A3A3A3'}
                    strokeWidth="2"
                  />

                  {/* Auto Icon Silhouette */}
                  <rect x="-8" y="-7" width="16" height="14" rx="3" fill={isOnTrip ? '#FFD43B' : isAvailable ? '#FFD43B' : '#737373'} />
                  <rect x="7" y="-4" width="3" height="8" rx="1" fill="#FFFFFF" />

                  {/* Floating Tag */}
                  <g transform="translate(0, -22)">
                    <rect
                      x="-48"
                      y="-12"
                      width="96"
                      height="20"
                      rx="4"
                      fill={isSelected ? '#171717' : '#FFFFFF'}
                      stroke="#171717"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isSelected ? '#FFD43B' : '#171717'}
                      fontSize="9"
                      fontWeight="700"
                    >
                      {veh.registrationNumber}
                    </text>
                  </g>

                  {/* Status Indicator Pill below */}
                  <g transform="translate(0, 24)">
                    <rect
                      x="-32"
                      y="-8"
                      width="64"
                      height="15"
                      rx="3"
                      fill="#171717"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={isOnTrip ? '#FFD43B' : isAvailable ? '#FFFFFF' : '#A3A3A3'}
                      fontSize="8"
                      fontWeight="700"
                      letterSpacing="0.5"
                    >
                      {veh.status.toUpperCase()}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};
