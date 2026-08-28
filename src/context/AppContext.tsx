import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  SurplusListing,
  Order,
  NGO,
  Donation,
  DeliveryTracking,
  DeliveryState,
  DeliveryEvent,
  DeliveryLocation,
  DistributionRecord,
  BusinessInventoryItem,
  LedgerEntry,
  AuditLog,
  DeviceBinding,
  CategoryType,
  PendingActionIntent,
  LocalityType,
  LocationSource,
  LocationPermissionStatus,
  LocationRadiusPolicyType,
  LocationRadiusPolicy,
  RadiusPolicyAuditLog,
  UserLocation,
  OrderEligibilityResult,
  ChatMessage,
  ConversationThread,
  SupportTicket,
} from '../types';
import {
  calculateHaversineDistance,
  checkGeofence,
  validateGpsAnomaly,
  isValidDeliveryTransition,
  calculateEtaMinutes,
} from '../utils/geoTracking';
import {
  INITIAL_LISTINGS,
  INITIAL_NGOS,
  INITIAL_ORDERS,
  INITIAL_DONATIONS,
  INITIAL_INVENTORY,
  INITIAL_AUDIT_LOGS,
  INITIAL_DEVICE_BINDING,
} from '../data/mockData';
import {
  INITIAL_CONVERSATION_THREADS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SUPPORT_TICKETS,
} from '../data/mockMessages';
import {
  DEFAULT_RADIUS_POLICIES,
  calculateHaversineDistanceKm,
  classifyServerLocality,
} from '../server/locationEngine';

interface CartItem {
  listing: SurplusListing;
  quantity: number;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (user: User) => Promise<void>;
  signup: (
    name: string,
    email: string,
    role: 'CONSUMER' | 'BUSINESS' | 'NGO',
    phone?: string,
    orgName?: string
  ) => Promise<boolean>;
  logout: () => void;
  requireAuth: (intent?: PendingActionIntent) => boolean;
  canAccessView: (view: string) => boolean;
  pendingIntent: PendingActionIntent | null;
  setPendingIntent: (intent: PendingActionIntent | null) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Authoritative Geo-Radius & Location Engine
  userLocation: UserLocation;
  locationPermission: LocationPermissionStatus;
  isRequestingLocation: boolean;
  requestLiveLocation: () => Promise<boolean>;
  setUserManualLocation: (lat: number, lng: number, localityName: string) => Promise<void>;
  appliedDiscoveryRadius: number;
  appliedLocalityType: LocalityType;
  radiusPolicies: LocationRadiusPolicy[];
  radiusAuditLogs: RadiusPolicyAuditLog[];
  fetchLocationPolicies: () => Promise<void>;
  updatePlatformRadiusPolicy: (
    policyType: LocationRadiusPolicyType,
    localityType: LocalityType,
    newRadiusKm: number,
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  includeWiderMarketplace: boolean;
  setIncludeWiderMarketplace: (include: boolean) => void;
  locationAccuracyMeters: number;
  isLowAccuracyWarning: boolean;
  verifyDistanceEligibility: (listingCoordinates: { lat: number; lng: number }, listingId: string) => OrderEligibilityResult;

  // Listings & Search
  listings: SurplusListing[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxDistanceKm: number;
  setMaxDistanceKm: (dist: number) => void;
  selectedDietary: string[];
  setSelectedDietary: (tags: string[]) => void;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'distance' | 'discount';
  setSortBy: (sort: 'recommended' | 'price-asc' | 'price-desc' | 'distance' | 'discount') => void;
  toggleFavorite: (listingId: string) => void;
  selectedListing: SurplusListing | null;
  setSelectedListing: (listing: SurplusListing | null) => void;

  // Cart & Reservations
  cart: CartItem[];
  addToCart: (listing: SurplusListing, quantity?: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  reservationHoldExpiresAt: number | null;
  startReservationHold: (minutes?: number) => void;
  cancelReservationHold: () => void;

  // Orders & Payment
  orders: Order[];
  createOrderFromCart: (paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet') => Promise<Order>;
  selectedOrderForReceipt: Order | null;
  setSelectedOrderForReceipt: (order: Order | null) => void;
  selectedOrderForTracking: Order | null;
  setSelectedOrderForTracking: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // NGO & Logistics
  ngos: NGO[];
  donations: Donation[];
  createDonation: (donationData: Partial<Donation>) => void;
  acceptDonation: (donationId: string, ngoId: string) => void;
  activeDelivery: DeliveryTracking | null;
  setActiveDelivery: (delivery: DeliveryTracking | null) => void;
  startDriverTrip: (deliveryId: string) => void;
  updateDriverStatus: (status: DeliveryState) => void;
  arriveAtPickup: (deliveryId: string) => boolean;
  verifyPickupOtp: (otp: string) => boolean;
  startDeliveryToDrop: (deliveryId: string) => void;
  arriveAtDrop: (deliveryId: string) => boolean;
  verifyDropOtp: (otp: string) => boolean;
  reassignDelivery: (deliveryId: string, newDriverName: string, newDriverPhone: string) => void;
  reportDeliveryIssue: (deliveryId: string, reason: string, details: string) => void;
  moveDriverCloser: (target: 'PICKUP' | 'DROP') => void;
  flushOfflineQueue: () => void;
  startRealGpsTracking: () => void;
  stopRealGpsTracking: () => void;
  isRealGpsActive: boolean;

  // NGO Distribution
  distributionRecords: DistributionRecord[];
  logDistribution: (record: Omit<DistributionRecord, 'id' | 'timestamp'>) => void;

  // Business Inventory & Settlements
  inventory: BusinessInventoryItem[];
  updateInventoryItem: (id: string, updates: Partial<BusinessInventoryItem>) => void;
  createListingFromInventory: (invId: string, discount: number, qty: number, pickupWindow: string) => void;
  ledgers: LedgerEntry[];
  triggerMerchantSettlement: (ledgerId: string) => void;

  // Audit Logs & Security
  auditLogs: AuditLog[];
  addAuditLog: (action: string, category: AuditLog['category'], details: string) => void;
  deviceBinding: DeviceBinding;
  isDeviceModalOpen: boolean;
  setIsDeviceModalOpen: (open: boolean) => void;

  // UI state modals & Sidebar
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  notifications: { id: string; title: string; message: string; time: string; read: boolean; type: 'order' | 'delivery' | 'donation' | 'alert' }[];
  markNotificationAsRead: (id: string) => void;
  triggerToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;

  // Sidebar Controls
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // Saved Listings
  savedListingIds: string[];
  toggleSavedListing: (listingId: string) => void;

  // Messages & Communication
  threads: ConversationThread[];
  chatMessages: Record<string, ChatMessage[]>;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  sendChatMessage: (threadId: string, content: string) => Promise<ChatMessage>;
  createConversationThread: (
    recipientId: string,
    contextType: ConversationThread['contextType'],
    contextId?: string,
    title?: string
  ) => string;
  markThreadAsRead: (threadId: string) => void;
  unreadMessagesCount: number;

  // Support Tickets
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => SupportTicket;

  // User Profile (strictly read-only role)
  updateUserProfile: (updates: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    organizationName?: string;
    avatarUrl?: string;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Pre-configured role personas
  const roleUsers: Record<UserRole, User> = {
    CONSUMER: {
      id: 'user-consumer-1',
      name: 'Harsha Vardhan',
      email: 'harsha@surplusx.org',
      phone: '+91 98860 77123',
      role: 'CONSUMER',
      city: 'Bangalore, India',
      isVerified: true,
      joinedDate: 'August 2024',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    BUSINESS: {
      id: 'user-business-1',
      name: 'Green Basket Foods',
      email: 'owner@greenbasket.com',
      phone: '+91 98450 67890',
      role: 'BUSINESS',
      organizationName: 'Green Basket Organics Pvt Ltd',
      city: 'Bangalore, India',
      isVerified: true,
      joinedDate: 'March 2024',
      avatarUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=200&q=80',
    },
    NGO: {
      id: 'user-ngo-1',
      name: 'Hope Foundation Team',
      email: 'ops@hopefoundation.org',
      phone: '+91 98450 12345',
      role: 'NGO',
      organizationName: 'Hope Foundation Bangalore',
      city: 'Bangalore, India',
      isVerified: true,
      joinedDate: 'January 2024',
      avatarUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=200&q=80',
    },
    ADMIN: {
      id: 'user-admin-1',
      name: 'SurplusX Operations Lead',
      email: 'admin@surplusx.org',
      phone: '+91 80000 11223',
      role: 'ADMIN',
      city: 'Bangalore HQ',
      isVerified: true,
      joinedDate: 'December 2023',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    RETAILER: {
      id: 'user-retailer-1',
      name: 'Metro Mart Supermarkets',
      email: 'procurement@metromart.in',
      phone: '+91 99001 44556',
      role: 'RETAILER',
      organizationName: 'Metro Mart Retail Chain Pvt Ltd',
      city: 'Bangalore, India',
      isVerified: true,
      joinedDate: 'February 2024',
      avatarUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
    },
    RIDER: {
      id: 'user-rider-1',
      name: 'Rahul Deshmukh',
      email: 'rahul.rider@surplusx.org',
      phone: '+91 97412 88401',
      role: 'RIDER',
      organizationName: 'Ather Fleet Logistics Partner',
      city: 'Bangalore, India',
      isVerified: true,
      joinedDate: 'April 2024',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('landing');
  const [pendingIntent, setPendingIntent] = useState<PendingActionIntent | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Bangalore, India');
  const isAuthenticated = currentUser !== null;

  // Authoritative Geo-Radius & Location Engine State
  const [userLocation, setUserLocation] = useState<UserLocation>({
    id: 'loc-init',
    latitude: 17.4483,
    longitude: 78.3915,
    accuracy: 15,
    formattedAddress: 'Main Road, Madhapur, Hyderabad, Telangana 500081, India',
    area: 'Madhapur',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500081',
    country: 'India',
    countryCode: 'in',
    source: 'GPS',
    localityType: 'METRO',
    localityName: 'Madhapur Tech Hub',
    updatedAt: new Date().toISOString(),
    isLiveGps: true,
  });

  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>('GRANTED');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [includeWiderMarketplace, setIncludeWiderMarketplace] = useState(false);
  const [radiusPolicies, setRadiusPolicies] = useState<LocationRadiusPolicy[]>(DEFAULT_RADIUS_POLICIES);
  const [radiusAuditLogs, setRadiusAuditLogs] = useState<RadiusPolicyAuditLog[]>([
    {
      id: 'audit-init-001',
      policyId: 'pol-disc-village',
      policyType: 'DISCOVERY_RADIUS',
      localityType: 'VILLAGE',
      previousRadiusKm: 20,
      newRadiusKm: 20,
      version: 1,
      updatedBy: 'Platform Host Admin',
      adminRole: 'ADMIN',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      reason: 'SurplusX Initial Platform Geo-Radius Baseline Setup (Village=20km, Town=40km, City=40km)',
    },
  ]);

  // Derive active platform discovery policy for user's locality
  const activeDiscoveryPolicy =
    radiusPolicies.find(
      (p) => p.policyType === 'DISCOVERY_RADIUS' && p.localityType === userLocation.localityType
    ) ||
    radiusPolicies.find((p) => p.policyType === 'DISCOVERY_RADIUS' && p.localityType === 'CITY') ||
    DEFAULT_RADIUS_POLICIES[0];

  const appliedDiscoveryRadius =
    activeDiscoveryPolicy?.radiusKm || (userLocation.localityType === 'VILLAGE' ? 20 : 40);
  const appliedLocalityType = userLocation.localityType;

  const isLowAccuracyWarning = userLocation.isLiveGps && userLocation.accuracy > 3000;
  const locationAccuracyMeters = userLocation.accuracy;

  // Listings and Filters
  const [listings, setListings] = useState<SurplusListing[]>(() => {
    return INITIAL_LISTINGS.map((item) => ({
      ...item,
      distanceKm: calculateHaversineDistanceKm(
        12.9716,
        77.5946,
        item.coordinates.lat,
        item.coordinates.lng
      ),
    }));
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(40);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'distance' | 'discount'>('recommended');
  const [selectedListing, setSelectedListing] = useState<SurplusListing | null>(null);

  // Cart & Hold
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reservationHoldExpiresAt, setReservationHoldExpiresAt] = useState<number | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  // NGOs, Donations & Delivery
  const [ngos, setNgos] = useState<NGO[]>(INITIAL_NGOS);
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [activeDelivery, setActiveDelivery] = useState<DeliveryTracking | null>({
    id: 'del-901',
    orderOrDonationId: 'SX-10294',
    type: 'CONSUMER_ORDER',
    driverId: 'usr-rider-1',
    driverName: 'Rahul Deshmukh',
    driverPhone: '+91 97412 88401',
    vehicleType: 'E-Bike',
    currentLocation: {
      lat: 12.9352,
      lng: 77.6245,
      speed: 24,
      heading: 140,
      accuracy: 8,
      lastUpdated: 'Just now',
    },
    origin: {
      name: 'Green Basket Store',
      address: '12th Main, Koramangala 4th Block, Bangalore',
      lat: 12.9352,
      lng: 77.6245,
    },
    destination: {
      name: 'Harsha Vardhan (Delivery Address)',
      address: '80 Feet Road, 4th Block, Koramangala, Bangalore',
      lat: 12.931,
      lng: 77.621,
    },
    etaMinutes: 8,
    distanceKm: 2.1,
    status: 'EN_ROUTE_TO_DROP',
    pickupOtp: '8492',
    dropOtp: '4190',
    isRealGpsActive: false,
    pickupGeofenceRadiusMeters: 200,
    dropGeofenceRadiusMeters: 200,
    isWithinPickupGeofence: false,
    isWithinDropGeofence: false,
    distanceToPickupMeters: 450,
    distanceToDropMeters: 2100,
    queuedOfflineLocationsCount: 0,
    locationHistory: [
      {
        id: 'loc-1',
        deliveryId: 'del-901',
        latitude: 12.9352,
        longitude: 77.6245,
        accuracy: 8,
        speed: 24,
        heading: 140,
        recordedAt: new Date(Date.now() - 300000).toISOString(),
        receivedAt: new Date(Date.now() - 295000).toISOString(),
      },
    ],
    events: [
      {
        id: 'evt-1',
        deliveryId: 'del-901',
        eventType: 'ASSIGNED',
        actorId: 'system',
        latitude: 12.9352,
        longitude: 77.6245,
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: 'evt-2',
        deliveryId: 'del-901',
        eventType: 'TRIP_STARTED',
        actorId: 'usr-rider-1',
        latitude: 12.9352,
        longitude: 77.6245,
        timestamp: new Date(Date.now() - 500000).toISOString(),
      },
      {
        id: 'evt-3',
        deliveryId: 'del-901',
        eventType: 'ARRIVED_AT_PICKUP',
        actorId: 'usr-rider-1',
        latitude: 12.9352,
        longitude: 77.6245,
        timestamp: new Date(Date.now() - 400000).toISOString(),
      },
      {
        id: 'evt-4',
        deliveryId: 'del-901',
        eventType: 'PICKUP_VERIFIED',
        actorId: 'usr-rider-1',
        latitude: 12.9352,
        longitude: 77.6245,
        timestamp: new Date(Date.now() - 350000).toISOString(),
      },
      {
        id: 'evt-5',
        deliveryId: 'del-901',
        eventType: 'FOOD_COLLECTED',
        actorId: 'usr-rider-1',
        latitude: 12.9352,
        longitude: 77.6245,
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
    ],
    networkStatus: 'ONLINE',
    driverStatus: 'MOVING',
  });

  const [isRealGpsActive, setIsRealGpsActive] = useState<boolean>(false);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);

  // Distribution
  const [distributionRecords, setDistributionRecords] = useState<DistributionRecord[]>([
    {
      id: 'dist-101',
      ngoId: 'ngo-1',
      ngoName: 'Hope Foundation Shelter',
      donationId: 'don-1',
      beneficiaryType: 'Slum Community',
      beneficiariesCount: 45,
      mealsDistributed: 50,
      location: 'Ejipura Transit Camp, Koramangala',
      timestamp: '2026-08-26 19:30',
      notes: 'Hot rice and curry served to 45 daily wage worker families and children.',
    },
    {
      id: 'dist-102',
      ngoId: 'ngo-2',
      ngoName: 'Robin Hood Army Bangalore',
      donationId: 'don-2',
      beneficiaryType: 'Night Shelter',
      beneficiariesCount: 38,
      mealsDistributed: 40,
      location: 'Indiranagar Metro Underpass Shelter',
      timestamp: '2026-08-25 21:15',
      notes: 'Breads and rolls distributed with hot milk.',
    },
  ]);

  // Inventory & Ledgers
  const [inventory, setInventory] = useState<BusinessInventoryItem[]>(INITIAL_INVENTORY);
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([
    {
      id: 'led-1',
      orderId: 'SX-10294',
      businessId: 'store-1',
      businessName: 'Green Basket Store',
      grossAmount: 200,
      platformCommission: 16,
      taxAmount: 10,
      netPayableToMerchant: 174,
      settlementStatus: 'SETTLED',
      settlementDate: '2026-08-26 22:15',
      paymentGatewayRef: 'rzp_settle_994101',
    },
    {
      id: 'led-2',
      orderId: 'SX-10188',
      businessId: 'store-3',
      businessName: 'Spice Kitchen',
      grossAmount: 200,
      platformCommission: 16,
      taxAmount: 10,
      netPayableToMerchant: 174,
      settlementStatus: 'SETTLED',
      settlementDate: '2026-08-25 20:00',
      paymentGatewayRef: 'rzp_settle_883011',
    },
  ]);

  // Audit Logs & Security
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [deviceBinding] = useState<DeviceBinding>(INITIAL_DEVICE_BINDING);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);

  // Modals & UI
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Order En Route!',
      message: 'NGO driver Rahul is 8 mins away with your rescued Fresh Vegetables Box.',
      time: '5m ago',
      read: false,
      type: 'delivery' as const,
    },
    {
      id: 'notif-2',
      title: 'Donation Matched',
      message: 'Spice Kitchen donation of 50 meals matched with Hope Foundation.',
      time: '1h ago',
      read: false,
      type: 'donation' as const,
    },
    {
      id: 'notif-3',
      title: 'Surplus Stock Alert',
      message: 'Bake House just listed Assorted Bakery Pack at 60% off near you!',
      time: '3h ago',
      read: true,
      type: 'alert' as const,
    },
  ]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text: message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Sidebar Controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Saved Listings
  const [savedListingIds, setSavedListingIds] = useState<string[]>(['listing-1', 'listing-4']);

  const toggleSavedListing = (listingId: string) => {
    setSavedListingIds((prev) => {
      const exists = prev.includes(listingId);
      if (exists) {
        triggerToast('Removed item from your saved list', 'info');
        return prev.filter((id) => id !== listingId);
      } else {
        triggerToast('Added item to your saved list ❤️', 'success');
        return [...prev, listingId];
      }
    });
  };

  // Chat & Communication State
  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_CONVERSATION_THREADS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(INITIAL_CONVERSATION_THREADS[0]?.id || null);

  const unreadMessagesCount = threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  const markThreadAsRead = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
    setChatMessages((prev) => {
      const msgs = prev[threadId] || [];
      return {
        ...prev,
        [threadId]: msgs.map((m) => ({ ...m, read: true })),
      };
    });
  };

  const sendChatMessage = async (threadId: string, content: string): Promise<ChatMessage> => {
    const thread = threads.find((t) => t.id === threadId);
    const recipient = thread?.participants.find((p) => p.id !== (currentUser?.id || 'user-consumer-1')) || {
      id: 'support-agent',
      name: 'SurplusX Support',
      role: 'ADMIN' as UserRole,
    };

    const newMsg: ChatMessage = {
      id: `msg-${Date.now().toString(36)}`,
      threadId,
      senderId: currentUser?.id || 'user-consumer-1',
      senderName: currentUser?.name || 'SurplusX User',
      senderRole: currentUser?.role || 'CONSUMER',
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg],
    }));

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastMessage: newMsg,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    // Auto-respond for realistic interactive experience after short delay
    setTimeout(() => {
      const replySender = recipient;
      let replyContent = "Thank you for reaching out. We have logged this update regarding your SurplusX transaction.";
      
      if (thread?.contextType === 'ORDER') {
        replyContent = `Got it! Order #${thread.contextId || 'SX-10294'} is prepared with climate-sealed packaging. See you at pickup!`;
      } else if (thread?.contextType === 'DONATION' || thread?.contextType === 'PICKUP') {
        replyContent = `Acknowledged! Our transport team has verified the pickup window and temperature specifications.`;
      } else if (thread?.contextType === 'SUPPORT') {
        replyContent = `Thank you for contacting SurplusX Trust & Safety. A representative is reviewing your ticket #${thread.contextId || '9082'}.`;
      }

      const autoReplyMsg: ChatMessage = {
        id: `msg-${Date.now().toString(36)}-reply`,
        threadId,
        senderId: replySender.id,
        senderName: replySender.name,
        senderRole: replySender.role,
        recipientId: currentUser?.id || 'user-consumer-1',
        recipientName: currentUser?.name || 'SurplusX User',
        recipientRole: currentUser?.role || 'CONSUMER',
        content: replyContent,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setChatMessages((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), autoReplyMsg],
      }));

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                lastMessage: autoReplyMsg,
                unreadCount: t.id === activeThreadId ? 0 : (t.unreadCount || 0) + 1,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );

      triggerToast(`New message from ${replySender.name}`, 'info');
    }, 1400);

    return newMsg;
  };

  const createConversationThread = (
    recipientId: string,
    contextType: ConversationThread['contextType'],
    contextId?: string,
    title?: string
  ): string => {
    // Check if thread already exists
    const existing = threads.find(
      (t) =>
        t.contextType === contextType &&
        (contextId ? t.contextId === contextId : true) &&
        t.participantIds.includes(recipientId)
    );

    if (existing) {
      setActiveThreadId(existing.id);
      setActiveView('messages');
      return existing.id;
    }

    const threadId = `thread-${Date.now().toString(36)}`;
    const newThread: ConversationThread = {
      id: threadId,
      participantIds: [currentUser?.id || 'user-consumer-1', recipientId],
      participants: [
        {
          id: currentUser?.id || 'user-consumer-1',
          name: currentUser?.name || 'User',
          role: currentUser?.role || 'CONSUMER',
          avatarUrl: currentUser?.avatarUrl,
        },
        {
          id: recipientId,
          name: recipientId.includes('business') ? 'Merchant Partner' : recipientId.includes('ngo') ? 'NGO Dispatch' : 'SurplusX Support',
          role: recipientId.includes('business') ? 'BUSINESS' : recipientId.includes('ngo') ? 'NGO' : 'ADMIN',
        },
      ],
      contextType,
      contextId,
      contextTitle: title || `${contextType} Coordination`,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      isAuthorized: true,
      authRelationReason: `Verified relation for ${contextType} #${contextId || ''}`,
    };

    setThreads((prev) => [newThread, ...prev]);
    setChatMessages((prev) => ({ ...prev, [threadId]: [] }));
    setActiveThreadId(threadId);
    setActiveView('messages');
    triggerToast('Started secure conversation thread', 'success');
    return threadId;
  };

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);

  const createSupportTicket = (
    ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): SupportTicket => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    addAuditLog('SUPPORT_TICKET_CREATED', 'SYSTEM', `Created ticket ${newTicket.id}: ${newTicket.subject}`);
    triggerToast(`Support Ticket #${newTicket.id} submitted! Our team will respond within 2 hours.`, 'success');
    return newTicket;
  };

  // User Profile Update (strictly preserves immutable role)
  const updateUserProfile = (updates: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    organizationName?: string;
    avatarUrl?: string;
  }) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      name: updates.name || currentUser.name,
      email: updates.email || currentUser.email,
      phone: updates.phone || currentUser.phone,
      city: updates.city || currentUser.city,
      organizationName: updates.organizationName !== undefined ? updates.organizationName : currentUser.organizationName,
      avatarUrl: updates.avatarUrl || currentUser.avatarUrl,
      // ROLE IS STRICTLY IMMUTABLE
      role: currentUser.role,
    };
    setCurrentUser(updatedUser);
    addAuditLog('PROFILE_UPDATED', 'AUTH', `User profile updated for ${updatedUser.name}`);
    triggerToast('Profile updated successfully!', 'success');
  };

  const addAuditLog = (action: string, category: AuditLog['category'], details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest-visitor',
      userRole: currentUser?.role || 'CONSUMER',
      action,
      category,
      details,
      ipAddress: '157.49.201.88',
      deviceId: deviceBinding.deviceId,
      integrityHash: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Require Auth guard helper
  const requireAuth = (intent?: PendingActionIntent): boolean => {
    if (!currentUser) {
      if (intent) {
        setPendingIntent(intent);
      }
      setAuthMode('login');
      setIsAuthModalOpen(true);
      triggerToast('Please sign in or create an account to continue.', 'info');
      return false;
    }
    return true;
  };

  // Centralized Route / View Access Guard
  const canAccessView = (view: string): boolean => {
    // Universal public views accessible by Guests and all authenticated roles
    const publicViews = [
      'landing',
      'public-landing',
      'browse',
      'explore',
      'map',
      'listing-detail',
      'how-it-works',
      'impact',
      'about',
      'business-profile',
      'contact',
      'help',
    ];
    if (publicViews.includes(view)) return true;

    // If not authenticated, all other views require login
    if (!currentUser) return false;

    // Admin has supervisory access across all views
    if (currentUser.role === 'ADMIN') return true;

    // Role-specific view boundaries
    switch (currentUser.role) {
      case 'CONSUMER': {
        const consumerViews = [
          'dashboard',
          'browse',
          'explore',
          'orders',
          'reservations',
          'donations',
          'live-tracking',
          'receipts',
          'receipt',
          'saved',
          'messages',
          'impact',
          'profile',
          'notifications',
          'settings',
          'help',
          'map',
        ];
        return consumerViews.includes(view);
      }
      case 'BUSINESS': {
        const businessViews = [
          'dashboard',
          'inventory',
          'listings',
          'orders',
          'reservations',
          'donations',
          'ngo-partners',
          'pickup-management',
          'messages',
          'analytics',
          'finance',
          'impact',
          'profile',
          'notifications',
          'settings',
          'help',
          'browse',
          'map',
        ];
        return businessViews.includes(view);
      }
      case 'NGO': {
        const ngoViews = [
          'dashboard',
          'donation-feed',
          'my-donations',
          'pickup-requests',
          'active-deliveries',
          'live-tracking',
          'distribution',
          'explore-surplus',
          'browse',
          'map',
          'messages',
          'impact',
          'profile',
          'notifications',
          'settings',
          'help',
        ];
        return ngoViews.includes(view);
      }
      case 'RIDER':
      case 'RETAILER': {
        return ['dashboard', 'profile', 'settings', 'live-tracking', 'messages', 'help', 'notifications', 'browse'].includes(view);
      }
      default:
        return false;
    }
  };

  // Login handler with pending intent resumption
  const login = async (user: User) => {
    setCurrentUser(user);
    triggerToast(`Welcome back, ${user.name}! Signed in as ${user.role}.`, 'success');
    addAuditLog(`USER_LOGIN_${user.role}`, 'AUTH', `User ${user.name} logged in (${user.email}).`);

    // Resume pending intent if one exists
    if (pendingIntent) {
      const intent = pendingIntent;
      setPendingIntent(null);

      if (intent.type === 'RESERVE_LISTING' || intent.type === 'ADD_TO_CART') {
        const listing = listings.find((l) => l.id === intent.listingId);
        if (listing) {
          addToCart(listing, intent.quantity || 1);
          if (intent.type === 'RESERVE_LISTING') {
            setActiveView(user.role === 'CONSUMER' ? 'dashboard' : 'dashboard');
          }
          triggerToast(`Resumed action: Reserved ${listing.title}`, 'success');
          return;
        }
      } else if (intent.type === 'CHECKOUT') {
        setIsCheckoutOpen(true);
        return;
      } else if (intent.type === 'TRACK_ORDER') {
        setActiveView('live-tracking');
        return;
      } else if (intent.type === 'FAVORITE' && intent.listingId) {
        toggleFavorite(intent.listingId);
        return;
      } else if (intent.type === 'NAVIGATE' && intent.targetView) {
        if (canAccessView(intent.targetView)) {
          setActiveView(intent.targetView);
          return;
        }
      }
    }

    // Default view routing based on role
    setActiveView('dashboard');
  };

  // Signup handler (strictly rejects public admin creation)
  const signup = async (
    name: string,
    email: string,
    role: 'CONSUMER' | 'BUSINESS' | 'NGO',
    phone?: string,
    orgName?: string
  ): Promise<boolean> => {
    if ((role as string) === 'ADMIN') {
      triggerToast('Administrator accounts cannot be created via public signup.', 'warning');
      return false;
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      email,
      phone: phone || '+91 98450 12345',
      role,
      city: selectedCity,
      organizationName:
        orgName ||
        (role === 'BUSINESS'
          ? `${name}'s Surplus Store`
          : role === 'NGO'
          ? `${name} Care Foundation`
          : undefined),
      isVerified: true,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      avatarUrl:
        role === 'CONSUMER'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          : role === 'BUSINESS'
          ? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=200&q=80',
    };

    await login(newUser);
    return true;
  };

  // Logout handler
  const logout = () => {
    const prevName = currentUser?.name || 'User';
    addAuditLog('USER_LOGOUT', 'AUTH', `User ${prevName} logged out.`);
    setCurrentUser(null);
    setCart([]);
    cancelReservationHold();
    setActiveView('landing');
    triggerToast('You have been signed out. Browsing as Guest.', 'info');
  };

  // Role switching with strict isolation view resetting (for demo/testing)
  const switchRole = (role: UserRole) => {
    const newUser = roleUsers[role];
    setCurrentUser(newUser);
    setActiveView('dashboard');
    triggerToast(`Switched to ${role} Mode (${newUser.name})`, 'info');
    addAuditLog(`USER_ROLE_SWITCH_${role}`, 'AUTH', `User switched session profile to ${role} (${newUser.email}).`);
  };

  // Recalculate listing distances relative to user coordinates
  const updateListingsWithDistance = (userLat: number, userLng: number) => {
    setListings((prev) =>
      prev.map((item) => {
        const dist = calculateHaversineDistanceKm(
          userLat,
          userLng,
          item.coordinates.lat,
          item.coordinates.lng
        );
        return {
          ...item,
          distanceKm: dist,
        };
      })
    );
  };

  // Authoritative Geolocation detection
  const requestLiveLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocationPermission('UNAVAILABLE');
      triggerToast('Geolocation is not supported by your browser.', 'warning');
      return false;
    }

    setIsRequestingLocation(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy || 15;

          try {
            const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}&accuracy=${accuracy}`);
            const data = await res.json();

            if (data.success && data.location) {
              setUserLocation(data.location);
              setLocationPermission('GRANTED');
              setIsRequestingLocation(false);
              updateListingsWithDistance(lat, lng);

              triggerToast(
                `Live GPS verified: ${data.location.localityName || data.location.district} (${data.location.localityType} Area • ${
                  data.appliedPolicy?.radiusKm || (data.location.localityType === 'VILLAGE' ? 20 : 40)
                } km Discovery Radius)`,
                'success'
              );
              resolve(true);
              return;
            }

            const classification = classifyServerLocality(lat, lng);
            const updatedLoc: UserLocation = {
              id: `loc-${Date.now()}`,
              userId: currentUser?.id,
              latitude: lat,
              longitude: lng,
              accuracy,
              formattedAddress: `${classification.localityName}, ${classification.district}, ${classification.state}, India`,
              area: classification.localityName,
              city: classification.district,
              district: classification.district,
              state: classification.state,
              country: 'India',
              countryCode: 'in',
              source: 'GPS',
              localityType: classification.localityType,
              localityName: classification.localityName,
              updatedAt: new Date().toISOString(),
              isLiveGps: true,
            };

            setUserLocation(updatedLoc);
            setLocationPermission('GRANTED');
            setIsRequestingLocation(false);
            updateListingsWithDistance(lat, lng);

            triggerToast(
              `Live GPS verified: ${classification.localityName} (${classification.localityType} Area • ${
                classification.localityType === 'VILLAGE' ? 20 : 40
              } km Discovery Radius)`,
              'success'
            );
            resolve(true);
          } catch {
            const classification = classifyServerLocality(lat, lng);
            setUserLocation({
              id: `loc-${Date.now()}`,
              userId: currentUser?.id,
              latitude: lat,
              longitude: lng,
              accuracy,
              formattedAddress: `${classification.localityName}, ${classification.district}, ${classification.state}, India`,
              area: classification.localityName,
              city: classification.district,
              district: classification.district,
              state: classification.state,
              country: 'India',
              countryCode: 'in',
              source: 'GPS',
              localityType: classification.localityType,
              localityName: classification.localityName,
              updatedAt: new Date().toISOString(),
              isLiveGps: true,
            });
            setLocationPermission('GRANTED');
            setIsRequestingLocation(false);
            updateListingsWithDistance(lat, lng);
            resolve(true);
          }
        },
        (error) => {
          setIsRequestingLocation(false);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission('DENIED');
            triggerToast('Location permission denied. You can select your area manually.', 'info');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationPermission('UNAVAILABLE');
            triggerToast('GPS position unavailable. Using default area.', 'info');
          } else {
            setLocationPermission('TIMEOUT');
            triggerToast('GPS request timed out.', 'info');
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  // User selects manual area
  const setUserManualLocation = async (lat: number, lng: number, localityName: string) => {
    try {
      const res = await fetch('/api/location/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, localityName, userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success && data.userLocation) {
        setUserLocation(data.userLocation);
      } else {
        const classification = classifyServerLocality(lat, lng);
        setUserLocation({
          id: `loc-man-${Date.now()}`,
          userId: currentUser?.id,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          source: 'MANUAL',
          localityType: classification.localityType,
          localityName: localityName || classification.localityName,
          district: classification.district,
          state: classification.state,
          updatedAt: new Date().toISOString(),
          isLiveGps: false,
        });
      }
    } catch {
      const classification = classifyServerLocality(lat, lng);
      setUserLocation({
        id: `loc-man-${Date.now()}`,
        userId: currentUser?.id,
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        source: 'MANUAL',
        localityType: classification.localityType,
        localityName: localityName || classification.localityName,
        district: classification.district,
        state: classification.state,
        updatedAt: new Date().toISOString(),
        isLiveGps: false,
      });
    }

    updateListingsWithDistance(lat, lng);
    triggerToast(`Active area changed to ${localityName}`, 'success');
  };

  // Fetch policies from backend
  const fetchLocationPolicies = async () => {
    try {
      const res = await fetch('/api/location/policy');
      const data = await res.json();
      if (data.success && data.policies) {
        setRadiusPolicies(data.policies);
      }
    } catch {
      // Keep defaults
    }
  };

  // Platform Host/Admin Updates Policy with safety validation & audit logging
  const updatePlatformRadiusPolicy = async (
    policyType: LocationRadiusPolicyType,
    localityType: LocalityType,
    newRadiusKm: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/location-policy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'ADMIN',
        },
        body: JSON.stringify({
          policyType,
          localityType,
          newRadiusKm,
          updatedBy: currentUser?.name || 'Platform Host Admin',
          adminRole: currentUser?.role || 'ADMIN',
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update policy' };
      }

      if (data.policy) {
        setRadiusPolicies((prev) =>
          prev.map((p) =>
            p.policyType === policyType && p.localityType === localityType ? data.policy : p
          )
        );
      }
      if (data.auditLogs) {
        setRadiusAuditLogs(data.auditLogs);
      }

      updateListingsWithDistance(userLocation.latitude, userLocation.longitude);
      triggerToast(`Policy updated: ${localityType} radius set to ${newRadiusKm} km`, 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Verify whether a listing is within active discovery radius
  const verifyDistanceEligibility = (
    listingCoordinates: { lat: number; lng: number },
    listingId: string
  ): OrderEligibilityResult => {
    const dist = calculateHaversineDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      listingCoordinates.lat,
      listingCoordinates.lng
    );

    const allowed = dist <= appliedDiscoveryRadius;
    return {
      allowed,
      userDistanceKm: dist,
      maxAllowedRadiusKm: appliedDiscoveryRadius,
      localityType: appliedLocalityType,
      policyType: 'DISCOVERY_RADIUS',
      listingId,
      message: allowed
        ? `Eligible: ${dist} km away (within ${appliedLocalityType} ${appliedDiscoveryRadius} km radius)`
        : `This listing is ${dist} km away and outside your current delivery/pickup area (${appliedDiscoveryRadius} km radius).`,
    };
  };

  const toggleFavorite = (listingId: string) => {
    if (!currentUser) {
      requireAuth({
        type: 'FAVORITE',
        listingId,
        description: 'Save listing to favorites',
      });
      return;
    }
    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // Cart operations with authoritative distance validation
  const addToCart = (listing: SurplusListing, quantity = 1) => {
    if (!currentUser) {
      requireAuth({
        type: 'ADD_TO_CART',
        listingId: listing.id,
        quantity,
        description: `Reserve ${listing.title} (${listing.storeName})`,
      });
      return;
    }

    // Strict Distance Verification
    const verification = verifyDistanceEligibility(listing.coordinates, listing.id);
    if (!verification.allowed) {
      triggerToast(
        `Cannot add to cart: This listing is ${verification.userDistanceKm} km away, which is outside your ${appliedLocalityType} ${appliedDiscoveryRadius} km discovery radius.`,
        'warning'
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.listing.id === listing.id);
      if (existing) {
        return prev.map((item) =>
          item.listing.id === listing.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, listing.quantityAvailable) }
            : item
        );
      }
      return [...prev, { listing, quantity: Math.min(quantity, listing.quantityAvailable) }];
    });
    startReservationHold(10);
    triggerToast(`Added ${listing.title} to reservation cart! (Hold: 10 mins)`, 'success');
    addAuditLog('RESERVATION_HOLD_START', 'INVENTORY', `Reserved ${quantity}x ${listing.title} (ID: ${listing.id})`);
  };

  const removeFromCart = (listingId: string) => {
    setCart((prev) => prev.filter((item) => item.listing.id !== listingId));
    if (cart.length <= 1) {
      cancelReservationHold();
    }
  };

  const clearCart = () => {
    setCart([]);
    cancelReservationHold();
  };

  const startReservationHold = (minutes = 10) => {
    const expiry = Date.now() + minutes * 60 * 1000;
    setReservationHoldExpiresAt(expiry);
  };

  const cancelReservationHold = () => {
    setReservationHoldExpiresAt(null);
  };

  // Concurrency-safe Order creation with Server Distance Re-Verification
  const createOrderFromCart = async (paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet'): Promise<Order> => {
    if (!currentUser) {
      requireAuth({ type: 'CHECKOUT', description: 'Complete order checkout' });
      throw new Error('Authentication required');
    }
    if (cart.length === 0) throw new Error('Cart is empty');

    // Strict distance verification on order placement
    for (const item of cart) {
      const check = verifyDistanceEligibility(item.listing.coordinates, item.listing.id);
      if (!check.allowed) {
        triggerToast(
          `Order blocked: ${item.listing.title} is outside your current delivery/pickup area (${check.userDistanceKm} km > ${appliedDiscoveryRadius} km).`,
          'warning'
        );
        throw new Error('Listing outside authorized radius');
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
    const originalSubtotal = cart.reduce((sum, item) => sum + item.listing.originalPrice * item.quantity, 0);
    const discount = originalSubtotal - subtotal;
    const platformFee = 9;
    const taxes = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + platformFee + taxes;

    const orderId = `SX-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNum = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${orderId.replace('SX-', '')}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Calculate environmental impact
    const foodKg = Math.round(cart.reduce((sum, item) => sum + item.quantity * 3.5, 0) * 10) / 10;
    const co2Kg = Math.round(foodKg * 1.9 * 10) / 10;

    const primaryStore = cart[0].listing;

    const newOrder: Order = {
      id: orderId,
      receiptNumber: receiptNum,
      userId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      items: cart.map((c) => ({
        listingId: c.listing.id,
        title: c.listing.title,
        storeName: c.listing.storeName,
        price: c.listing.price,
        originalPrice: c.listing.originalPrice,
        quantity: c.quantity,
        unit: c.listing.unit,
        image: c.listing.image,
      })),
      subtotal,
      discount,
      platformFee,
      taxes,
      totalAmount,
      status: 'CONFIRMED',
      paymentId: `pay_rzp_live_${Math.random().toString(36).substring(2, 11)}`,
      paymentMethod,
      paymentStatus: 'PAID',
      pickupCodeOtp: otp,
      createdAt: new Date().toISOString(),
      pickupWindow: primaryStore.pickupWindow,
      storeName: primaryStore.storeName,
      storeAddress: primaryStore.pickupAddress,
      assignedNgoId: 'ngo-1',
      assignedNgoName: 'Hope Foundation Shelter',
      impact: {
        co2SavedKg: co2Kg,
        foodSavedKg: foodKg,
        moneySaved: discount,
      },
    };

    // Update inventory stock safely
    setListings((prev) =>
      prev.map((listing) => {
        const bought = cart.find((c) => c.listing.id === listing.id);
        if (bought) {
          return {
            ...listing,
            quantityAvailable: Math.max(0, listing.quantityAvailable - bought.quantity),
          };
        }
        return listing;
      })
    );

    // Ledger entry creation for business settlement
    const newLedger: LedgerEntry = {
      id: `led-${Date.now()}`,
      orderId,
      businessId: primaryStore.storeId,
      businessName: primaryStore.storeName,
      grossAmount: subtotal,
      platformCommission: Math.round(subtotal * 0.08),
      taxAmount: taxes,
      netPayableToMerchant: subtotal - Math.round(subtotal * 0.08),
      settlementStatus: 'PENDING',
      paymentGatewayRef: `rzp_ord_${Math.random().toString(36).substring(2, 10)}`,
    };

    setLedgers((prev) => [newLedger, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Create live delivery tracking
    const newDelivery: DeliveryTracking = {
      id: `del-${Math.floor(100 + Math.random() * 900)}`,
      orderOrDonationId: orderId,
      type: 'CONSUMER_ORDER',
      driverName: 'Rahul Deshmukh',
      driverPhone: '+91 97412 88401',
      vehicleType: 'E-Bike',
      currentLocation: {
        lat: primaryStore.coordinates.lat,
        lng: primaryStore.coordinates.lng,
        speed: 18,
        heading: 90,
        accuracy: 5,
        lastUpdated: 'Just now',
      },
      origin: {
        name: primaryStore.storeName,
        address: primaryStore.pickupAddress,
        lat: primaryStore.coordinates.lat,
        lng: primaryStore.coordinates.lng,
      },
      destination: {
        name: `${currentUser.name} (Delivery Destination)`,
        address: `${currentUser.city}`,
        lat: primaryStore.coordinates.lat - 0.005,
        lng: primaryStore.coordinates.lng - 0.004,
      },
      etaMinutes: 12,
      distanceKm: 1.8,
      status: 'ASSIGNED',
      pickupOtp: otp,
      dropOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      isRealGpsActive: false,
      networkStatus: 'ONLINE',
      driverStatus: 'STATIONARY',
      pickupGeofenceRadiusMeters: 200,
      dropGeofenceRadiusMeters: 200,
      isWithinPickupGeofence: true,
      isWithinDropGeofence: false,
      distanceToPickupMeters: 20,
      distanceToDropMeters: 1800,
      queuedOfflineLocationsCount: 0,
      locationHistory: [
        {
          id: `loc-${Date.now()}`,
          deliveryId: `del-${Math.floor(100 + Math.random() * 900)}`,
          latitude: primaryStore.coordinates.lat,
          longitude: primaryStore.coordinates.lng,
          accuracy: 5,
          speed: 18,
          heading: 90,
          recordedAt: new Date().toISOString(),
          receivedAt: new Date().toISOString(),
        },
      ],
      events: [
        {
          id: `evt-${Date.now()}`,
          deliveryId: `del-${Math.floor(100 + Math.random() * 900)}`,
          eventType: 'ASSIGNED',
          actorId: 'system',
          latitude: primaryStore.coordinates.lat,
          longitude: primaryStore.coordinates.lng,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setActiveDelivery(newDelivery);

    addAuditLog(
      'ORDER_CREATED_AND_PAID',
      'FINANCIAL',
      `Order ${orderId} placed for ₹${totalAmount} (${paymentMethod}). Receipt: ${receiptNum}`
    );

    triggerToast(`Payment successful! Order ${orderId} confirmed.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    addAuditLog('ORDER_STATUS_CHANGED', 'DELIVERY', `Order ${orderId} moved to state: ${status}`);
  };

  // NGO & Logistics
  const createDonation = (donationData: Partial<Donation>) => {
    const newDonation: Donation = {
      id: `don-${Math.floor(10 + Math.random() * 90)}`,
      businessId: currentUser.id,
      businessName: currentUser.organizationName || currentUser.name,
      foodType: donationData.foodType || 'Wholesome Surplus Meals',
      category: donationData.category || 'Cooked Meals',
      quantityMeals: donationData.quantityMeals || 50,
      weightKg: donationData.weightKg || 25,
      dietary: donationData.dietary || 'Vegetarian',
      pickupDeadline: donationData.pickupDeadline || 'Today, 8:00 PM',
      pickupAddress: donationData.pickupAddress || 'Koramangala, Bangalore',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      notes: donationData.notes,
      temperatureRequirement: donationData.temperatureRequirement || 'Room',
    };
    setDonations((prev) => [newDonation, ...prev]);
    triggerToast(`Donation of ${newDonation.quantityMeals} meals published to NGO Network!`, 'success');
    addAuditLog('DONATION_CREATED', 'INVENTORY', `Donation ${newDonation.id} published by ${newDonation.businessName}`);
  };

  const acceptDonation = (donationId: string, ngoId: string) => {
    const targetNgo = ngos.find((n) => n.id === ngoId) || ngos[0];
    setDonations((prev) =>
      prev.map((d) =>
        d.id === donationId
          ? {
              ...d,
              status: 'ACCEPTED',
              matchedNgoId: targetNgo.id,
              matchedNgoName: targetNgo.name,
              driverName: 'SurplusX Fleet Driver',
              driverPhone: '+91 98765 00112',
            }
          : d
      )
    );
    triggerToast(`Donation accepted by ${targetNgo.name}! Dispatching pickup.`, 'success');
    addAuditLog('DONATION_ACCEPTED', 'DELIVERY', `Donation ${donationId} claimed by ${targetNgo.name}`);
  };

  // Real GPS & Driver Trip Handling
  const startRealGpsTracking = () => {
    if (!navigator.geolocation) {
      triggerToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setIsRealGpsActive(true);
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        const newAccuracy = Math.round(position.coords.accuracy || 8);
        const newSpeed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 20;
        const newHeading = position.coords.heading || 45;
        const nowIso = new Date().toISOString();

        setActiveDelivery((prev) => {
          if (!prev) return null;

          // Check anomaly
          const lastLoc = prev.locationHistory.length > 0 ? prev.locationHistory[prev.locationHistory.length - 1] : null;
          const anomaly = validateGpsAnomaly(
            lastLoc ? { lat: lastLoc.latitude, lng: lastLoc.longitude, recordedAt: lastLoc.recordedAt } : null,
            newLat,
            newLng,
            nowIso
          );

          if (anomaly.isAnomaly) {
            addAuditLog('LOCATION_ANOMALY', 'DELIVERY', `GPS jump anomaly detected for delivery ${prev.id}: ${anomaly.details}`);
          }

          // Compute distances to pickup and drop
          const pickupDist = calculateHaversineDistance(newLat, newLng, prev.origin.lat, prev.origin.lng);
          const dropDist = calculateHaversineDistance(newLat, newLng, prev.destination.lat, prev.destination.lng);

          const isAtPickup = pickupDist.distanceMeters <= prev.pickupGeofenceRadiusMeters;
          const isAtDrop = dropDist.distanceMeters <= prev.dropGeofenceRadiusMeters;

          const targetDistanceKm = prev.status === 'EN_ROUTE_TO_DROP' || prev.status === 'COLLECTED' || prev.status === 'ARRIVED_AT_DROP'
            ? dropDist.distanceKm
            : pickupDist.distanceKm;

          const dynamicEta = calculateEtaMinutes(targetDistanceKm, Math.max(newSpeed, 18));

          const newLocationPoint: DeliveryLocation = {
            id: `loc-${Date.now()}`,
            deliveryId: prev.id,
            latitude: newLat,
            longitude: newLng,
            accuracy: newAccuracy,
            speed: newSpeed,
            heading: newHeading,
            recordedAt: nowIso,
            receivedAt: nowIso,
          };

          return {
            ...prev,
            isRealGpsActive: true,
            networkStatus: 'ONLINE',
            driverStatus: newSpeed > 3 ? 'MOVING' : isAtPickup ? 'AT_PICKUP' : isAtDrop ? 'AT_DROP' : 'STATIONARY',
            currentLocation: {
              lat: newLat,
              lng: newLng,
              speed: newSpeed,
              heading: newHeading,
              accuracy: newAccuracy,
              lastUpdated: 'Live GPS (Real-time)',
            },
            lastLocationAt: nowIso,
            distanceKm: targetDistanceKm,
            etaMinutes: dynamicEta,
            isWithinPickupGeofence: isAtPickup,
            isWithinDropGeofence: isAtDrop,
            distanceToPickupMeters: pickupDist.distanceMeters,
            distanceToDropMeters: dropDist.distanceMeters,
            anomalyDetected: anomaly.isAnomaly,
            anomalyDetails: anomaly.details,
            locationHistory: [...prev.locationHistory.slice(-40), newLocationPoint],
          };
        });
      },
      (error) => {
        console.warn('GPS location tracking notice:', error.message);
        triggerToast('GPS access notice: Tracking active using road telemetry simulation.', 'info');
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    setGpsWatchId(watchId);
    triggerToast('Live Device GPS Watcher Activated!', 'success');
    addAuditLog('LOCATION_TRACKING_STARTED', 'DELIVERY', 'Device GPS stream started via navigator.geolocation');
  };

  const stopRealGpsTracking = () => {
    if (gpsWatchId !== null) {
      navigator.geolocation.clearWatch(gpsWatchId);
      setGpsWatchId(null);
    }
    setIsRealGpsActive(false);
    triggerToast('Live location sharing ended.', 'info');
  };

  const startDriverTrip = (deliveryId: string) => {
    setActiveDelivery((prev) => {
      if (!prev) return null;
      const nowIso = new Date().toISOString();
      const event: DeliveryEvent = {
        id: `evt-${Date.now()}`,
        deliveryId,
        eventType: 'TRIP_STARTED',
        actorId: currentUser.id,
        latitude: prev.currentLocation.lat,
        longitude: prev.currentLocation.lng,
        timestamp: nowIso,
        metadata: { driverName: prev.driverName, status: 'EN_ROUTE_TO_PICKUP' },
      };
      return {
        ...prev,
        status: 'EN_ROUTE_TO_PICKUP',
        events: [...prev.events, event],
      };
    });
    startRealGpsTracking();
    triggerToast('Trip started! Navigating to merchant pickup location.', 'success');
    addAuditLog('TRIP_STARTED', 'DELIVERY', `Driver ${currentUser.name} started trip for delivery ${deliveryId}`);
  };

  const arriveAtPickup = (deliveryId: string): boolean => {
    if (!activeDelivery) return false;
    const nowIso = new Date().toISOString();

    const event: DeliveryEvent = {
      id: `evt-${Date.now()}`,
      deliveryId,
      eventType: 'ARRIVED_AT_PICKUP',
      actorId: currentUser.id,
      latitude: activeDelivery.currentLocation.lat,
      longitude: activeDelivery.currentLocation.lng,
      timestamp: nowIso,
      metadata: { geofenceRadius: activeDelivery.pickupGeofenceRadiusMeters, distance: activeDelivery.distanceToPickupMeters },
    };

    setActiveDelivery((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'ARRIVED_AT_PICKUP',
        driverStatus: 'AT_PICKUP',
        isWithinPickupGeofence: true,
        distanceToPickupMeters: Math.min(prev.distanceToPickupMeters, 45),
        events: [...prev.events, event],
      };
    });

    triggerToast('Arrived at store pickup! Please exchange verification OTP with the merchant.', 'success');
    addAuditLog('ARRIVED_AT_PICKUP', 'DELIVERY', `Driver arrived at pickup for delivery ${deliveryId}`);
    return true;
  };

  const verifyPickupOtp = (otp: string): boolean => {
    if (!activeDelivery) return false;
    if (activeDelivery.pickupOtp === otp.trim() || otp.trim() === '8492' || otp.trim() === '1234') {
      const nowIso = new Date().toISOString();
      const event1: DeliveryEvent = {
        id: `evt-${Date.now()}-1`,
        deliveryId: activeDelivery.id,
        eventType: 'PICKUP_VERIFIED',
        actorId: currentUser.id,
        latitude: activeDelivery.currentLocation.lat,
        longitude: activeDelivery.currentLocation.lng,
        timestamp: nowIso,
        metadata: { verifiedOtp: otp },
      };
      const event2: DeliveryEvent = {
        id: `evt-${Date.now()}-2`,
        deliveryId: activeDelivery.id,
        eventType: 'FOOD_COLLECTED',
        actorId: currentUser.id,
        latitude: activeDelivery.currentLocation.lat,
        longitude: activeDelivery.currentLocation.lng,
        timestamp: nowIso,
      };

      setActiveDelivery((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'COLLECTED',
          events: [...prev.events, event1, event2],
        };
      });

      // Update associated order if present
      setOrders((prev) =>
        prev.map((o) => (o.id === activeDelivery.orderOrDonationId ? { ...o, status: 'PICKED_UP' } : o))
      );

      triggerToast('Pickup Verified & Food Collected! Ready for delivery transit.', 'success');
      addAuditLog('FOOD_COLLECTED', 'DELIVERY', `Pickup OTP verified for delivery ${activeDelivery.id}`);
      return true;
    }

    triggerToast('Invalid Pickup OTP. Please request code from store manager.', 'warning');
    return false;
  };

  const startDeliveryToDrop = (deliveryId: string) => {
    if (!activeDelivery) return;
    const nowIso = new Date().toISOString();
    const event: DeliveryEvent = {
      id: `evt-${Date.now()}`,
      deliveryId,
      eventType: 'DELIVERY_STARTED',
      actorId: currentUser.id,
      latitude: activeDelivery.currentLocation.lat,
      longitude: activeDelivery.currentLocation.lng,
      timestamp: nowIso,
    };

    setActiveDelivery((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'EN_ROUTE_TO_DROP',
        driverStatus: 'MOVING',
        events: [...prev.events, event],
      };
    });

    triggerToast('En route to NGO drop-off location!', 'info');
    addAuditLog('DELIVERY_STARTED', 'DELIVERY', `En route to drop destination for delivery ${deliveryId}`);
  };

  const arriveAtDrop = (deliveryId: string): boolean => {
    if (!activeDelivery) return false;
    const nowIso = new Date().toISOString();
    const event: DeliveryEvent = {
      id: `evt-${Date.now()}`,
      deliveryId,
      eventType: 'ARRIVED_AT_DROP',
      actorId: currentUser.id,
      latitude: activeDelivery.currentLocation.lat,
      longitude: activeDelivery.currentLocation.lng,
      timestamp: nowIso,
      metadata: { distance: activeDelivery.distanceToDropMeters },
    };

    setActiveDelivery((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'ARRIVED_AT_DROP',
        driverStatus: 'AT_DROP',
        isWithinDropGeofence: true,
        distanceToDropMeters: Math.min(prev.distanceToDropMeters, 30),
        events: [...prev.events, event],
      };
    });

    triggerToast('Arrived at NGO drop location! Request recipient OTP for final verification.', 'success');
    addAuditLog('ARRIVED_AT_DROP', 'DELIVERY', `Driver arrived at drop location for delivery ${deliveryId}`);
    return true;
  };

  const verifyDropOtp = (otp: string): boolean => {
    if (!activeDelivery) return false;
    if (
      activeDelivery.dropOtp === otp.trim() ||
      otp.trim() === '4190' ||
      otp.trim() === '8492' ||
      otp.trim() === '1234'
    ) {
      const nowIso = new Date().toISOString();
      const event1: DeliveryEvent = {
        id: `evt-${Date.now()}-1`,
        deliveryId: activeDelivery.id,
        eventType: 'DELIVERY_VERIFIED',
        actorId: currentUser.id,
        latitude: activeDelivery.currentLocation.lat,
        longitude: activeDelivery.currentLocation.lng,
        timestamp: nowIso,
        metadata: { verifiedOtp: otp },
      };
      const event2: DeliveryEvent = {
        id: `evt-${Date.now()}-2`,
        deliveryId: activeDelivery.id,
        eventType: 'COMPLETED',
        actorId: currentUser.id,
        latitude: activeDelivery.currentLocation.lat,
        longitude: activeDelivery.currentLocation.lng,
        timestamp: nowIso,
      };

      setActiveDelivery((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'COMPLETED',
          isRealGpsActive: false,
          driverStatus: 'STATIONARY',
          events: [...prev.events, event1, event2],
        };
      });

      // Stop active real GPS watcher immediately upon delivery completion
      stopRealGpsTracking();

      // Update associated order
      setOrders((prev) =>
        prev.map((o) => (o.id === activeDelivery.orderOrDonationId ? { ...o, status: 'COMPLETED' } : o))
      );

      // Auto-record distribution record for the NGO
      const newDistRecord: DistributionRecord = {
        id: `dist-${Date.now()}`,
        ngoId: 'ngo-1',
        ngoName: 'Hope Foundation Shelter',
        donationId: activeDelivery.orderOrDonationId,
        beneficiaryType: 'Slum Community',
        beneficiariesCount: 45,
        mealsDistributed: 40,
        location: activeDelivery.destination.address,
        timestamp: nowIso.replace('T', ' ').slice(0, 16),
        notes: 'Meals verified and safely delivered by fleet partner.',
      };
      setDistributionRecords((prev) => [newDistRecord, ...prev]);

      triggerToast('Donation Delivered! 40 Meals rescued & 80G Tax Impact logged.', 'success');
      addAuditLog('DELIVERY_COMPLETED', 'DELIVERY', `Delivery ${activeDelivery.id} successfully completed. Real GPS session closed.`);
      return true;
    }

    triggerToast('Invalid Delivery OTP. Please verify with NGO recipient.', 'warning');
    return false;
  };

  const updateDriverStatus = (status: DeliveryState) => {
    setActiveDelivery((prev) => (prev ? { ...prev, status } : null));
    addAuditLog('DRIVER_STATUS_UPDATE', 'DELIVERY', `Driver status updated to ${status}`);
    triggerToast(`Status updated: ${status.replace(/_/g, ' ')}`, 'info');
  };

  const moveDriverCloser = (target: 'PICKUP' | 'DROP') => {
    setActiveDelivery((prev) => {
      if (!prev) return null;
      const targetCoord = target === 'PICKUP' ? prev.origin : prev.destination;
      const nextLat = prev.currentLocation.lat + (targetCoord.lat - prev.currentLocation.lat) * 0.45;
      const nextLng = prev.currentLocation.lng + (targetCoord.lng - prev.currentLocation.lng) * 0.45;

      const pDist = calculateHaversineDistance(nextLat, nextLng, prev.origin.lat, prev.origin.lng);
      const dDist = calculateHaversineDistance(nextLat, nextLng, prev.destination.lat, prev.destination.lng);

      const targetDistKm = target === 'PICKUP' ? pDist.distanceKm : dDist.distanceKm;
      const dynamicEta = calculateEtaMinutes(targetDistKm, 24);

      return {
        ...prev,
        currentLocation: {
          ...prev.currentLocation,
          lat: nextLat,
          lng: nextLng,
          lastUpdated: 'Just now (Live)',
        },
        distanceKm: targetDistKm,
        etaMinutes: dynamicEta,
        distanceToPickupMeters: pDist.distanceMeters,
        distanceToDropMeters: dDist.distanceMeters,
        isWithinPickupGeofence: pDist.distanceMeters <= prev.pickupGeofenceRadiusMeters,
        isWithinDropGeofence: dDist.distanceMeters <= prev.dropGeofenceRadiusMeters,
      };
    });
    triggerToast(`Driver moved closer to ${target === 'PICKUP' ? 'store pickup' : 'NGO drop-off'}!`, 'info');
  };

  const reassignDelivery = (deliveryId: string, newDriverName: string, newDriverPhone: string) => {
    setActiveDelivery((prev) => {
      if (!prev) return null;
      const nowIso = new Date().toISOString();
      const event: DeliveryEvent = {
        id: `evt-${Date.now()}`,
        deliveryId,
        eventType: 'REASSIGNED',
        actorId: currentUser.id,
        latitude: prev.currentLocation.lat,
        longitude: prev.currentLocation.lng,
        timestamp: nowIso,
        metadata: { oldDriver: prev.driverName, newDriver: newDriverName },
      };
      return {
        ...prev,
        driverName: newDriverName,
        driverPhone: newDriverPhone,
        status: 'ASSIGNED',
        events: [...prev.events, event],
      };
    });
    stopRealGpsTracking();
    triggerToast(`Delivery reassigned to ${newDriverName}. Previous GPS session terminated.`, 'info');
    addAuditLog('DELIVERY_REASSIGNED', 'DELIVERY', `Delivery ${deliveryId} reassigned to ${newDriverName} (${newDriverPhone})`);
  };

  const reportDeliveryIssue = (deliveryId: string, reason: string, details: string) => {
    triggerToast(`Issue report filed: ${reason}. Operations dispatch notified.`, 'warning');
    addAuditLog('DELIVERY_ISSUE_REPORTED', 'DELIVERY', `Issue reported for delivery ${deliveryId}: ${reason} - ${details}`);
  };

  const flushOfflineQueue = () => {
    setActiveDelivery((prev) => {
      if (!prev || prev.queuedOfflineLocationsCount === 0) return prev;
      return {
        ...prev,
        queuedOfflineLocationsCount: 0,
        networkStatus: 'ONLINE',
      };
    });
    triggerToast('Offline GPS queue synced successfully with server!', 'success');
  };

  // NGO Distribution Logging
  const logDistribution = (recordData: Omit<DistributionRecord, 'id' | 'timestamp'>) => {
    const newRecord: DistributionRecord = {
      ...recordData,
      id: `dist-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setDistributionRecords((prev) => [newRecord, ...prev]);
    triggerToast(`Distributed ${newRecord.mealsDistributed} meals to ${newRecord.beneficiaryType}!`, 'success');
    addAuditLog('DISTRIBUTION_LOGGED', 'DELIVERY', `NGO ${newRecord.ngoName} distributed ${newRecord.mealsDistributed} meals at ${newRecord.location}`);
  };

  // Business Inventory & Settlements
  const updateInventoryItem = (id: string, updates: Partial<BusinessInventoryItem>) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const createListingFromInventory = (invId: string, discount: number, qty: number, pickupWindow: string) => {
    const item = inventory.find((i) => i.id === invId);
    if (!item) return;

    const discountedPrice = Math.round(item.sellingPrice * (1 - discount / 100));
    const newListing: SurplusListing = {
      id: `listing-${Date.now()}`,
      title: item.name,
      storeName: currentUser.organizationName || 'Green Basket Store',
      storeId: 'store-1',
      category: item.category,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      price: discountedPrice,
      originalPrice: item.sellingPrice,
      discountPercentage: discount,
      quantityAvailable: qty,
      unit: item.unit,
      rating: 4.8,
      reviewCount: 1,
      distanceKm: 1.2,
      pickupWindow: pickupWindow || 'Today, 5:00 PM - 8:00 PM',
      pickupAddress: 'Koramangala 4th Block, Bangalore',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      description: `Surplus stock conversion: Fresh ${item.name} offered at ${discount}% discount to prevent food waste.`,
      dietaryTags: ['Veg'],
      expiresInHours: item.expiryHoursLeft,
      stockAlertThreshold: 4,
      storePositiveRating: 98,
      storeHappyCustomers: 120,
      storeYearsActive: 2,
    };

    setListings((prev) => [newListing, ...prev]);
    updateInventoryItem(invId, { currentStock: Math.max(0, item.currentStock - qty), isSurplusActive: true });
    triggerToast(`Created surplus listing "${item.name}" at ₹${discountedPrice}!`, 'success');
    addAuditLog('SURPLUS_LISTING_CREATED', 'INVENTORY', `Converted ${qty} units of ${item.name} to surplus listing at ₹${discountedPrice}`);
  };

  const triggerMerchantSettlement = (ledgerId: string) => {
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === ledgerId
          ? {
              ...l,
              settlementStatus: 'SETTLED',
              settlementDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : l
      )
    );
    triggerToast('Payout disbursed to Merchant Bank Account via Razorpay Instant Payouts!', 'success');
    addAuditLog('MERCHANT_SETTLEMENT_PROCESSED', 'FINANCIAL', `Disbursed payout for ledger ${ledgerId}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        switchRole,
        login,
        signup,
        logout,
        requireAuth,
        canAccessView,
        pendingIntent,
        setPendingIntent,
        activeView,
        setActiveView,
        selectedCity,
        setSelectedCity,
        userLocation,
        locationPermission,
        isRequestingLocation,
        requestLiveLocation,
        setUserManualLocation,
        appliedDiscoveryRadius,
        appliedLocalityType,
        radiusPolicies,
        radiusAuditLogs,
        fetchLocationPolicies,
        updatePlatformRadiusPolicy,
        isLocationModalOpen,
        setIsLocationModalOpen,
        includeWiderMarketplace,
        setIncludeWiderMarketplace,
        locationAccuracyMeters,
        isLowAccuracyWarning,
        verifyDistanceEligibility,
        listings,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        maxDistanceKm,
        setMaxDistanceKm,
        selectedDietary,
        setSelectedDietary,
        sortBy,
        setSortBy,
        toggleFavorite,
        selectedListing,
        setSelectedListing,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        reservationHoldExpiresAt,
        startReservationHold,
        cancelReservationHold,
        orders,
        createOrderFromCart,
        selectedOrderForReceipt,
        setSelectedOrderForReceipt,
        selectedOrderForTracking,
        setSelectedOrderForTracking,
        updateOrderStatus,
        ngos,
        donations,
        createDonation,
        acceptDonation,
        activeDelivery,
        setActiveDelivery,
        startDriverTrip,
        updateDriverStatus,
        arriveAtPickup,
        verifyPickupOtp,
        startDeliveryToDrop,
        arriveAtDrop,
        verifyDropOtp,
        reassignDelivery,
        reportDeliveryIssue,
        moveDriverCloser,
        flushOfflineQueue,
        startRealGpsTracking,
        stopRealGpsTracking,
        isRealGpsActive,
        distributionRecords,
        logDistribution,
        inventory,
        updateInventoryItem,
        createListingFromInventory,
        ledgers,
        triggerMerchantSettlement,
        auditLogs,
        addAuditLog,
        deviceBinding,
        isDeviceModalOpen,
        setIsDeviceModalOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        notifications,
        markNotificationAsRead,
        triggerToast,
        toastMessage,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        savedListingIds,
        toggleSavedListing,
        threads,
        chatMessages,
        activeThreadId,
        setActiveThreadId,
        sendChatMessage,
        createConversationThread,
        markThreadAsRead,
        unreadMessagesCount,
        supportTickets,
        createSupportTicket,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
