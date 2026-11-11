/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'public' | 'customer' | 'driver' | 'owner';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  avatar?: string;
}

export type VehicleStatus = 'available' | 'on_trip' | 'offline' | 'assigned';
export type MaintenanceStatus = 'good' | 'due_soon' | 'under_service';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // e.g. "TN 21 AB 1234"
  model: string;              // e.g. "Bajaj RE Compact 4S"
  assignedDriverId: string | null;
  assignedDriverName?: string;
  status: VehicleStatus;
  insuranceExpiry: string;    // YYYY-MM-DD
  maintenanceStatus: MaintenanceStatus;
  mileageKm: number;
  fuelType: 'CNG' | 'Petrol' | 'Electric';
  location: LocationPoint;
  lastUpdate: string;         // e.g. "2 mins ago"
  speedKmH?: number;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  assignedVehicleId: string | null;
  assignedVehicleReg?: string;
  availability: 'online' | 'offline';
  status: 'active' | 'inactive';
  rating: number;
  totalTrips: number;
  todayEarnings: number;
  weeklyEarnings: number;
  joinedDate: string;
  licenseNumber: string;
  password?: string;
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface Booking {
  id: string; // e.g. "ATG-8041"
  customerId: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  destination: string;
  distanceKm: number;
  estimatedDurationMin: number;
  fare: number;
  passengerCount: number;
  pickupTime: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleId?: string;
  vehicleReg?: string;
  status: BookingStatus;
  paymentStatus: 'pending' | 'completed';
  paymentMethod?: 'cash' | 'upi';
  rating?: number;
  feedback?: string;
  cancelReason?: string;
  createdAt: string;
  completedAt?: string;
  currentProgress?: number; // 0 to 100% for simulated GPS
  currentLat?: number;
  currentLng?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalTrips: number;
  totalSpent: number;
  memberSince: string;
}

export interface FareSettings {
  businessName: string;
  contactNumber: string;
  serviceAreas: string[];
  baseFare: number;           // e.g. ₹30
  perKmRate: number;          // e.g. ₹15
  minimumFare: number;        // e.g. ₹40
  waitingChargePerMin: number; // e.g. ₹2
  operatingHours: string;     // e.g. "06:00 AM - 11:00 PM"
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  role: 'all' | 'customer' | 'driver' | 'owner';
  read: boolean;
  type?: 'booking' | 'driver' | 'vehicle' | 'system';
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}
