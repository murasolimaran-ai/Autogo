/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Role,
  User,
  Vehicle,
  Driver,
  Booking,
  Customer,
  FareSettings,
  AppNotification,
  ToastMessage,
  BookingStatus,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_SETTINGS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  DEMO_LOCATIONS,
} from '../data/initialData';

const STORAGE_KEY = 'autogo_platform_state_v2';

interface AppContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  customerView: string;
  setCustomerView: (view: string) => void;
  driverView: string;
  setDriverView: (view: string) => void;
  ownerView: string;
  setOwnerView: (view: string) => void;

  vehicles: Vehicle[];
  drivers: Driver[];
  bookings: Booking[];
  customers: Customer[];
  settings: FareSettings;
  notifications: AppNotification[];
  toasts: ToastMessage[];

  activeTrackingBookingId: string | null;
  setActiveTrackingBookingId: (id: string | null) => void;

  // Actions
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => string;
  acceptBooking: (bookingId: string, driverId?: string) => void;
  rejectBooking: (bookingId: string) => void;
  updateTripStatus: (bookingId: string, status: BookingStatus) => void;
  confirmPayment: (bookingId: string, method: 'cash' | 'upi') => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  rateBooking: (bookingId: string, rating: number, feedback?: string) => void;

  // Vehicle CRUD
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  assignVehicleDriver: (vehicleId: string, driverId: string | null) => void;

  // Driver CRUD
  addDriver: (driver: Omit<Driver, 'id' | 'totalTrips' | 'todayEarnings' | 'weeklyEarnings' | 'rating' | 'joinedDate'>) => void;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (id: string) => void;
  toggleDriverAvailability: (driverId: string) => void;

  // Customer Management & Auth
  addCustomer: (customer: Omit<Customer, 'id' | 'totalTrips' | 'totalSpent' | 'memberSince'>) => void;
  registerCustomer: (data: { name: string; phone: string; email?: string }) => Customer;
  loginCustomerWithPhone: (phone: string, defaultName?: string) => User;

  // Driver Auth & Registration
  loginDriverWithPassword: (phone: string, password?: string) => { success: boolean; driver?: Driver; error?: string };
  registerDriverAccount: (data: { fullName: string; phone: string; licenseNumber: string; password?: string }) => Driver;

  // Settings
  updateSettings: (newSettings: FareSettings) => void;
  resetDemoData: () => void;

  // Notifications & Toasts
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Helpers
  calculateFare: (distanceKm: number) => number;
  calculateDistance: (pickup: string, destination: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or default seeds
  const [activeRole, setActiveRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_role`);
    return (saved as Role) || 'public';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return DEMO_USERS.customer;
  });

  const [customerView, setCustomerView] = useState<string>('home');
  const [driverView, setDriverView] = useState<string>('dashboard');
  const [ownerView, setOwnerView] = useState<string>('overview');

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_drivers`);
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_bookings`);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [settings, setSettings] = useState<FareSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTrackingBookingId, setActiveTrackingBookingId] = useState<string | null>(() => {
    // Default to the first in_progress or requested booking if available
    const active = INITIAL_BOOKINGS.find(b => b.status === 'in_progress' || b.status === 'accepted');
    return active ? active.id : 'ATG-8041';
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_role`, activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_drivers`, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_bookings`, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // When active role changes, synchronize the current demo user
  const setActiveRole = useCallback((role: Role) => {
    setActiveRoleState(role);
    if (role === 'customer') {
      setCurrentUser(DEMO_USERS.customer);
    } else if (role === 'driver') {
      setCurrentUser(DEMO_USERS.driver);
    } else if (role === 'owner') {
      setCurrentUser(DEMO_USERS.owner);
    }
  }, []);

  const addToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const calculateDistance = useCallback((pickup: string, destination: string): number => {
    if (pickup === destination) return 1.0;

    const pairKey1 = `${pickup}|${destination}`;
    const pairKey2 = `${destination}|${pickup}`;
    const roadDistances: Record<string, number> = {
      'Thanipadi Bus Stand|Thandarampet Market': 11.5,
      'Thanipadi Bus Stand|Thiruvannamalai Town': 28.0,
      'Thanipadi Bus Stand|Sathanur Dam': 16.2,
      'Thanipadi Bus Stand|Chengam Town': 23.5,
      'Thanipadi Bus Stand|Radhapuram Junction': 5.2,
      'Thanipadi Bus Stand|Vanapuram Market': 12.8,
      'Thanipadi Bus Stand|Veraiyur Cross Road': 17.6,
      'Thandarampet Market|Thiruvannamalai Town': 18.5,
      'Thandarampet Market|Sathanur Dam': 16.2,
      'Thandarampet Market|Chengam Town': 24.0,
      'Thandarampet Market|Radhapuram Junction': 6.8,
      'Thandarampet Market|Vanapuram Market': 10.4,
      'Thandarampet Market|Veraiyur Cross Road': 7.4,
      'Sathanur Dam|Chengam Town': 19.5,
      'Sathanur Dam|Thiruvannamalai Town': 31.0,
      'Chengam Town|Thiruvannamalai Town': 34.0,
      'Radhapuram Junction|Vanapuram Market': 8.5,
      'Radhapuram Junction|Thiruvannamalai Town': 23.0,
      'Vanapuram Market|Thiruvannamalai Town': 24.5,
      'Veraiyur Cross Road|Thiruvannamalai Town': 14.0,
    };

    if (roadDistances[pairKey1]) return roadDistances[pairKey1];
    if (roadDistances[pairKey2]) return roadDistances[pairKey2];

    const p1 = DEMO_LOCATIONS[pickup];
    const p2 = DEMO_LOCATIONS[destination];
    if (p1 && p2) {
      // Euclidean distance with 1.25x road winding factor
      const dLat = (p1.lat - p2.lat) * 111;
      const dLng = (p1.lng - p2.lng) * 105;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 1.25;
      return Math.round(dist * 10) / 10;
    }
    return 7.5;
  }, []);

  const calculateFare = useCallback((distanceKm: number): number => {
    const calculated = settings.baseFare + distanceKm * settings.perKmRate;
    return Math.max(settings.minimumFare, Math.round(calculated));
  }, [settings.baseFare, settings.perKmRate, settings.minimumFare]);

  // Simulated GPS Progression for active trips
  useEffect(() => {
    const interval = setInterval(() => {
      setBookings(prevBookings => {
        let changed = false;
        const updated = prevBookings.map(b => {
          if (b.status === 'in_progress') {
            const current = b.currentProgress ?? 0;
            if (current < 98) {
              changed = true;
              const next = Math.min(98, current + 1.5);
              return { ...b, currentProgress: next };
            }
          } else if (b.status === 'accepted') {
            const current = b.currentProgress ?? 0;
            if (current < 90) {
              changed = true;
              return { ...b, currentProgress: Math.min(90, current + 2) };
            }
          }
          return b;
        });
        return changed ? updated : prevBookings;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Create booking
  const createBooking = useCallback((bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): string => {
    const newId = `ATG-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = 'Just now';

    // Check if an available driver and vehicle can be paired or left as requested
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'requested',
      paymentStatus: 'pending',
      paymentMethod: bookingData.paymentMethod || 'cash',
      createdAt: now,
      currentProgress: 0,
    };

    setBookings(prev => [newBooking, ...prev]);
    setActiveTrackingBookingId(newId);

    // Notify owner & driver
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Booking Request',
      message: `${bookingData.customerName} requested auto from ${bookingData.pickupLocation} to ${bookingData.destination} (₹${bookingData.fare}).`,
      time: 'Just now',
      role: 'all',
      read: false,
      type: 'booking',
    };
    setNotifications(prev => [notif, ...prev]);

    addToast('Booking Request Created', `Ride ID: ${newId} is searching for nearest auto.`, 'success');
    return newId;
  }, [addToast]);

  // Accept booking
  const acceptBooking = useCallback((bookingId: string, driverId = 'drv_01') => {
    const driver = drivers.find(d => d.id === driverId) || drivers[0];
    const vehicle = vehicles.find(v => v.id === driver?.assignedVehicleId) || vehicles[0];

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'accepted',
            driverId: driver.id,
            driverName: driver.fullName,
            driverPhone: driver.phone,
            vehicleId: vehicle.id,
            vehicleReg: vehicle.registrationNumber,
            currentProgress: 15,
          };
        }
        return b;
      })
    );

    // Update vehicle to on_trip
    setVehicles(prev =>
      prev.map(v => (v.id === vehicle.id ? { ...v, status: 'on_trip' } : v))
    );

    // Update driver availability
    setDrivers(prev =>
      prev.map(d => (d.id === driver.id ? { ...d, availability: 'online' } : d))
    );

    addToast('Booking Accepted', `${driver.fullName} assigned to ${bookingId}. Navigate to pickup!`, 'success');

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Ride Confirmed',
      message: `Driver ${driver.fullName} (${vehicle.registrationNumber}) accepted ride ${bookingId}.`,
      time: 'Just now',
      role: 'all',
      read: false,
      type: 'booking',
    };
    setNotifications(prev => [notif, ...prev]);
  }, [drivers, vehicles, addToast]);

  // Reject booking
  const rejectBooking = useCallback((bookingId: string) => {
    addToast('Request Declined', `Booking ${bookingId} was declined. It remains in queue.`, 'info');
  }, [addToast]);

  // Update trip status
  const updateTripStatus = useCallback((bookingId: string, status: BookingStatus) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const updated: Booking = { ...b, status };
          if (status === 'arrived') {
            updated.currentProgress = 30;
          } else if (status === 'in_progress') {
            updated.currentProgress = 35;
          } else if (status === 'completed') {
            updated.currentProgress = 100;
            updated.completedAt = 'Just now';
            updated.paymentStatus = 'completed';
          }
          return updated;
        }
        return b;
      })
    );

    const booking = bookings.find(b => b.id === bookingId);

    if (status === 'arrived') {
      addToast('Arrived at Pickup', 'Notified customer that auto is waiting.', 'info');
    } else if (status === 'in_progress') {
      addToast('Trip Started', 'Meter running. Driving towards destination.', 'success');
    } else if (status === 'completed') {
      // Free vehicle and driver, update driver earnings
      if (booking?.vehicleId) {
        setVehicles(prev =>
          prev.map(v => (v.id === booking.vehicleId ? { ...v, status: 'available' } : v))
        );
      }
      if (booking?.driverId) {
        setDrivers(prev =>
          prev.map(d =>
            d.id === booking.driverId
              ? {
                  ...d,
                  totalTrips: d.totalTrips + 1,
                  todayEarnings: d.todayEarnings + (booking.fare || 0),
                  weeklyEarnings: d.weeklyEarnings + (booking.fare || 0),
                }
              : d
          )
        );
      }
      addToast('Trip Completed', `Fare of ₹${booking?.fare || 0} collected. Thank you!`, 'success');
    }
  }, [bookings, addToast]);

  // Confirm payment
  const confirmPayment = useCallback((bookingId: string, method: 'cash' | 'upi') => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, paymentStatus: 'completed', paymentMethod: method } : b))
    );
    addToast('Payment Confirmed', `₹ collected via ${method.toUpperCase()}.`, 'success');
  }, [addToast]);

  // Cancel booking
  const cancelBooking = useCallback((bookingId: string, reason = 'Cancelled by user') => {
    const booking = bookings.find(b => b.id === bookingId);
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled', cancelReason: reason } : b))
    );
    if (booking?.vehicleId) {
      setVehicles(prev =>
        prev.map(v => (v.id === booking.vehicleId ? { ...v, status: 'available' } : v))
      );
    }
    addToast('Booking Cancelled', `Ride ${bookingId} has been cancelled.`, 'info');
  }, [bookings, addToast]);

  // Rate booking
  const rateBooking = useCallback((bookingId: string, rating: number, feedback?: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, rating, feedback } : b))
    );
    addToast('Feedback Submitted', `Thank you for rating ${rating} stars!`, 'success');
  }, [addToast]);

  // Vehicle CRUD
  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id'>) => {
    const newId = `veh_${Date.now()}`;
    const newVehicle: Vehicle = {
      ...vehicle,
      id: newId,
    };
    setVehicles(prev => [...prev, newVehicle]);
    addToast('Vehicle Added', `${newVehicle.registrationNumber} added to fleet.`, 'success');
  }, [addToast]);

  const updateVehicle = useCallback((vehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => (v.id === vehicle.id ? vehicle : v)));
    addToast('Vehicle Updated', `${vehicle.registrationNumber} updated successfully.`, 'success');
  }, [addToast]);

  const deleteVehicle = useCallback((id: string) => {
    const target = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    addToast('Vehicle Deleted', `${target?.registrationNumber || 'Vehicle'} removed from fleet.`, 'info');
  }, [vehicles, addToast]);

  const assignVehicleDriver = useCallback((vehicleId: string, driverId: string | null) => {
    const driver = drivers.find(d => d.id === driverId);
    setVehicles(prev =>
      prev.map(v =>
        v.id === vehicleId
          ? {
              ...v,
              assignedDriverId: driverId,
              assignedDriverName: driver ? driver.fullName : undefined,
              status: driverId ? (v.status === 'offline' ? 'available' : v.status) : 'available',
            }
          : v
      )
    );
    if (driverId) {
      const veh = vehicles.find(v => v.id === vehicleId);
      setDrivers(prev =>
        prev.map(d =>
          d.id === driverId
            ? { ...d, assignedVehicleId: vehicleId, assignedVehicleReg: veh?.registrationNumber }
            : d
        )
      );
    }
    addToast('Assignment Updated', 'Vehicle driver mapping saved.', 'success');
  }, [drivers, vehicles, addToast]);

  // Driver CRUD
  const addDriver = useCallback((driverData: Omit<Driver, 'id' | 'totalTrips' | 'todayEarnings' | 'weeklyEarnings' | 'rating' | 'joinedDate'>) => {
    const newId = `drv_${Date.now()}`;
    const newDriver: Driver = {
      ...driverData,
      id: newId,
      rating: 5.0,
      totalTrips: 0,
      todayEarnings: 0,
      weeklyEarnings: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setDrivers(prev => [...prev, newDriver]);
    addToast('Driver Added', `${newDriver.fullName} registered into system.`, 'success');
  }, [addToast]);

  const updateDriver = useCallback((driver: Driver) => {
    setDrivers(prev => prev.map(d => (d.id === driver.id ? driver : d)));
    addToast('Driver Updated', `${driver.fullName}'s profile updated.`, 'success');
  }, [addToast]);

  const deleteDriver = useCallback((id: string) => {
    const target = drivers.find(d => d.id === id);
    setDrivers(prev => prev.filter(d => d.id !== id));
    addToast('Driver Removed', `${target?.fullName || 'Driver'} deleted.`, 'info');
  }, [drivers, addToast]);

  const toggleDriverAvailability = useCallback((driverId: string) => {
    setDrivers(prev =>
      prev.map(d => {
        if (d.id === driverId) {
          const next = d.availability === 'online' ? 'offline' : 'online';
          addToast(
            next === 'online' ? 'You are Now Online' : 'You are Now Offline',
            next === 'online' ? 'Ready to accept incoming booking requests.' : 'New requests paused.',
            'info'
          );
          return { ...d, availability: next };
        }
        return d;
      })
    );
  }, [addToast]);

  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'totalTrips' | 'totalSpent' | 'memberSince'>) => {
    const newId = `cust_${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      totalTrips: 0,
      totalSpent: 0,
      memberSince: new Date().toISOString().split('T')[0],
    };
    setCustomers(prev => [...prev, newCustomer]);
    addToast('Customer Created', `${newCustomer.name} added.`, 'success');
  }, [addToast]);

  const registerCustomer = useCallback((data: { name: string; phone: string; email?: string }): Customer => {
    const existing = customers.find(c => c.phone === data.phone);
    if (existing) {
      const updated: Customer = {
        ...existing,
        name: data.name || existing.name,
        email: data.email || existing.email,
      };
      setCustomers(prev => prev.map(c => c.id === existing.id ? updated : c));
      setCurrentUser({
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        role: 'customer',
      });
      addToast('Customer Verified', `Welcome back, ${updated.name}!`, 'success');
      return updated;
    }

    const newId = `cust_${Date.now()}`;
    const newCustomer: Customer = {
      id: newId,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      totalTrips: 0,
      totalSpent: 0,
      memberSince: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setCurrentUser({
      id: newId,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      role: 'customer',
    });

    // Notify owner
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Customer Registered',
      message: `${newCustomer.name} (${newCustomer.phone}) signed up via OTP verification.`,
      time: 'Just now',
      role: 'owner',
      read: false,
      type: 'system',
    };
    setNotifications(prev => [notif, ...prev]);

    addToast('Account Created!', `Welcome to AUTOGO, ${newCustomer.name}!`, 'success');
    return newCustomer;
  }, [customers, addToast]);

  const loginCustomerWithPhone = useCallback((phone: string, defaultName = 'Customer'): User => {
    const existing = customers.find(c => c.phone === phone);
    if (existing) {
      const user: User = {
        id: existing.id,
        name: existing.name,
        phone: existing.phone,
        email: existing.email,
        role: 'customer',
      };
      setCurrentUser(user);
      addToast('Welcome Back', `Logged in as ${existing.name}.`, 'success');
      return user;
    }

    // New registration fallback if unrecorded
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      name: defaultName !== 'Customer' ? defaultName : 'Rider ' + phone.slice(-4),
      phone,
      email: `rider.${phone.slice(-4)}@gmail.com`,
      totalTrips: 0,
      totalSpent: 0,
      memberSince: 'Today',
    };
    setCustomers(prev => [newCustomer, ...prev]);
    const user: User = {
      id: newCustomer.id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      role: 'customer',
    };
    setCurrentUser(user);

    // Notify Owner
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Customer Joined',
      message: `${user.name} (${phone}) verified with OTP.`,
      time: 'Just now',
      role: 'owner',
      read: false,
      type: 'system',
    };
    setNotifications(prev => [notif, ...prev]);

    addToast('Signed In', `Welcome to AUTOGO, ${user.name}!`, 'success');
    return user;
  }, [customers, addToast]);

  const loginDriverWithPassword = useCallback((phone: string, password = 'autogo123'): { success: boolean; driver?: Driver; error?: string } => {
    const driver = drivers.find(d => d.phone.trim() === phone.trim());
    if (!driver) {
      return { success: false, error: 'No driver account found with this phone number.' };
    }
    const expectedPassword = driver.password || 'autogo123';
    if (password !== expectedPassword && password !== 'autogo123') {
      return { success: false, error: 'Incorrect password. Default demo password is autogo123' };
    }

    setCurrentUser({
      id: driver.id,
      name: driver.fullName,
      phone: driver.phone,
      role: 'driver',
    });
    addToast('Driver Logged In', `Welcome back, ${driver.fullName}!`, 'success');
    return { success: true, driver };
  }, [drivers, addToast]);

  const registerDriverAccount = useCallback((data: { fullName: string; phone: string; licenseNumber: string; password?: string }): Driver => {
    const newId = `drv_${Date.now()}`;
    const newDriver: Driver = {
      id: newId,
      fullName: data.fullName,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      password: data.password || 'autogo123',
      assignedVehicleId: null,
      availability: 'online',
      status: 'active',
      rating: 5.0,
      totalTrips: 0,
      todayEarnings: 0,
      weeklyEarnings: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setDrivers(prev => [...prev, newDriver]);
    setCurrentUser({
      id: newId,
      name: newDriver.fullName,
      phone: newDriver.phone,
      role: 'driver',
    });

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Driver Onboarded',
      message: `${newDriver.fullName} (${newDriver.phone}) registered. Auto assignment pending.`,
      time: 'Just now',
      role: 'owner',
      read: false,
      type: 'driver',
    };
    setNotifications(prev => [notif, ...prev]);

    addToast('Driver Registered', `Account created for ${newDriver.fullName}.`, 'success');
    return newDriver;
  }, [addToast]);

  // Settings
  const updateSettings = useCallback((newSettings: FareSettings) => {
    setSettings(newSettings);
    addToast('Settings Saved', 'Fare rules and business settings updated.', 'success');
  }, [addToast]);

  const resetDemoData = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_vehicles`);
    localStorage.removeItem(`${STORAGE_KEY}_drivers`);
    localStorage.removeItem(`${STORAGE_KEY}_bookings`);
    localStorage.removeItem(`${STORAGE_KEY}_customers`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_notifications`);
    localStorage.removeItem(`${STORAGE_KEY}_role`);

    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setBookings(INITIAL_BOOKINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTrackingBookingId('ATG-8041');
    addToast('Demo Data Reset', 'Platform restored to pristine demo state.', 'info');
  }, [addToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    addToast('Notifications Cleared', undefined, 'info');
  }, [addToast]);

  const value = useMemo(
    () => ({
      activeRole,
      setActiveRole,
      currentUser,
      setCurrentUser,
      customerView,
      setCustomerView,
      driverView,
      setDriverView,
      ownerView,
      setOwnerView,
      vehicles,
      drivers,
      bookings,
      customers,
      settings,
      notifications,
      toasts,
      activeTrackingBookingId,
      setActiveTrackingBookingId,
      createBooking,
      acceptBooking,
      rejectBooking,
      updateTripStatus,
      confirmPayment,
      cancelBooking,
      rateBooking,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      assignVehicleDriver,
      addDriver,
      updateDriver,
      deleteDriver,
      toggleDriverAvailability,
      addCustomer,
      registerCustomer,
      loginCustomerWithPhone,
      loginDriverWithPassword,
      registerDriverAccount,
      updateSettings,
      resetDemoData,
      markNotificationRead,
      clearAllNotifications,
      addToast,
      removeToast,
      calculateFare,
      calculateDistance,
    }),
    [
      activeRole,
      setActiveRole,
      currentUser,
      customerView,
      driverView,
      ownerView,
      vehicles,
      drivers,
      bookings,
      customers,
      settings,
      notifications,
      toasts,
      activeTrackingBookingId,
      createBooking,
      acceptBooking,
      rejectBooking,
      updateTripStatus,
      confirmPayment,
      cancelBooking,
      rateBooking,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      assignVehicleDriver,
      addDriver,
      updateDriver,
      deleteDriver,
      toggleDriverAvailability,
      addCustomer,
      registerCustomer,
      loginCustomerWithPhone,
      loginDriverWithPassword,
      registerDriverAccount,
      updateSettings,
      resetDemoData,
      markNotificationRead,
      clearAllNotifications,
      addToast,
      removeToast,
      calculateFare,
      calculateDistance,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
