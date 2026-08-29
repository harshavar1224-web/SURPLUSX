export type UserRole = 'CONSUMER' | 'BUSINESS' | 'NGO' | 'RETAILER' | 'RIDER' | 'ADMIN';

export type LocalityType = 'VILLAGE' | 'TOWN' | 'CITY' | 'METRO';

export type LocationSource = 'GPS' | 'MANUAL' | 'PROFILE' | 'SYSTEM';

export type LocationPermissionStatus = 'GRANTED' | 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN' | 'PROMPT';

export type LocationRadiusPolicyType =
  | 'DISCOVERY_RADIUS'
  | 'DELIVERY_RADIUS'
  | 'NGO_MATCHING_RADIUS'
  | 'DRIVER_SERVICE_RADIUS';

export interface UserLocation {
  id: string;
  userId?: string;
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  formattedAddress: string;
  houseNumber?: string;
  street?: string;
  area?: string;
  village?: string;
  town?: string;
  city?: string;
  district: string;
  state: string;
  stateCode?: string;
  postalCode?: string;
  country: string;
  countryCode: string;
  localityType: LocalityType;
  source: LocationSource; // 'GPS' | 'MANUAL' | 'PROFILE' | 'SYSTEM'
  isCurrent?: boolean;
  createdAt?: string;
  updatedAt: string;
  isLiveGps: boolean;
  // Backward compatibility convenience accessors
  localityName: string;
  pincode?: string;
}

export interface BusinessLocation {
  id: string;
  businessId: string;
  latitude: number;
  longitude: number;
  address: string;
  formatted_address?: string;
  area?: string;
  locality: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  postal_code?: string;
  country?: string;
  verified: boolean;
  localityType: LocalityType;
  createdAt: string;
  updatedAt: string;
}

export interface LocationRadiusPolicy {
  id: string;
  policyType: LocationRadiusPolicyType;
  localityType: LocalityType;
  radiusKm: number;
  minAllowedKm: number;
  maxAllowedKm: number;
  enabled: boolean;
  version: number;
  updatedBy: string;
  updatedAt: string;
  reason?: string;
}

export interface RadiusPolicyAuditLog {
  id: string;
  policyId: string;
  policyType: LocationRadiusPolicyType;
  localityType: LocalityType;
  previousRadiusKm: number;
  newRadiusKm: number;
  version: number;
  updatedBy: string;
  adminRole: UserRole;
  timestamp: string;
  reason: string;
}

export interface OrderEligibilityResult {
  allowed: boolean;
  userDistanceKm: number;
  maxAllowedRadiusKm: number;
  localityType: LocalityType;
  policyType: LocationRadiusPolicyType;
  listingId: string;
  message?: string;
}

export interface LocationClassification {
  latitude: number;
  longitude: number;
  localityType: LocalityType;
  localityName: string;
  district: string;
  state: string;
  confidence: number;
  source: 'GEOGRAPHIC_POSTGIS_CLASSIFIER' | 'ADMIN_VERIFIED';
  updatedAt: string;
}

export interface LocationHierarchy {
  state: string;
  district: string;
  city: string;
  town?: string;
  village?: string;
  locality: string;
  pincode: string;
  mapplsEloc?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface InventoryBatch {
  id: string;
  inventoryItemId: string;
  batchNumber: string;
  expiryDate: string; // ISO string
  totalQuantity: number;
  remainingQty: number;
  unitCostMinor: number;
  receivedDate: string;
}

export type InventoryMovementType =
  | 'PURCHASE'
  | 'DONATION'
  | 'RESERVATION'
  | 'RELEASE'
  | 'RESTOCK'
  | 'SPOILAGE'
  | 'DAMAGE'
  | 'RETURN'
  | 'MANUAL_ADJUSTMENT'
  | 'EXPIRY';

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  batchId?: string;
  type: InventoryMovementType;
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string;
  timestamp: string;
  performedBy: string;
}

export interface ServiceabilityEstimate {
  isOneHourEligible: boolean;
  preparationMinutes: number;
  riderAssignmentMinutes: number;
  roadTravelMinutes: number;
  safetyBufferMinutes: number;
  totalEtaMinutes: number;
  roadDistanceKm: number;
  sourceLocality: string;
  destinationLocality: string;
}

export interface WholesaleListing extends SurplusListing {
  minimumOrderQuantity: number;
  bulkTierPrices: {
    minQty: number;
    pricePerUnit: number;
  }[];
  lotNumber: string;
  gradeQuality: 'A' | 'B' | 'Export Surplus';
  fssaiBatchId: string;
}

export interface PurchaseOrder {
  id: string;
  retailerId: string;
  retailerName: string;
  businessId: string;
  businessName: string;
  listingId: string;
  itemTitle: string;
  quantityOrdered: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'SETTLED' | 'CANCELLED';
  paymentTerms: 'NET_15' | 'NET_30' | 'INSTANT_ESCROW';
  orderDate: string;
  expectedDeliveryDate: string;
  deliveryAddress: string;
  batchDetails: string;
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'E-Bike' | 'Motorcycle' | 'Mini-Van' | 'Bicycle';
  vehicleNumber: string;
  licenseNumber: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  rating: number;
  totalDeliveries: number;
  todayEarnings: number;
  weeklyEarnings: number;
  currentCoordinates: {
    lat: number;
    lng: number;
  };
}

export interface FraudSignal {
  id: string;
  userId: string;
  userRole: UserRole;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signalType:
    | 'MULTIPLE_FAILED_PAYMENTS'
    | 'EXCESSIVE_CHECKOUT_VELOCITY'
    | 'OTP_BRUTE_FORCE_ATTEMPT'
    | 'SUSPICIOUS_REFUND_FREQUENCY'
    | 'GEOLOCATION_SPOOFING_DETECTED'
    | 'AMOUNT_TAMPERING_DETECTED';
  details: string;
  timestamp: string;
  ipAddress: string;
  resolved: boolean;
}

export interface Dispute {
  id: string;
  orderId: string;
  claimantId: string;
  claimantRole: UserRole;
  respondentId: string;
  respondentRole: UserRole;
  reason: 'DAMAGED_ITEMS' | 'WRONG_ITEM' | 'PICKUP_DELAY' | 'QUALITY_MISMATCH' | 'DELIVERY_DISPUTE';
  status: 'OPEN' | 'UNDER_REVIEW' | 'REFUNDED' | 'DISMISSED';
  amount: number;
  description: string;
  createdAt: string;
}

export type AccountStatus =
  | 'PENDING_PHONE_VERIFICATION'
  | 'PENDING_EMAIL_VERIFICATION'
  | 'PENDING_BUSINESS_VERIFICATION'
  | 'PENDING_NGO_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BLOCKED';

export type EmailVerificationStatus =
  | 'INVALID_FORMAT'
  | 'DOMAIN_INVALID'
  | 'DOMAIN_VALID'
  | 'NOT_REGISTERED'
  | 'VERIFICATION_REQUIRED'
  | 'VERIFICATION_PENDING'
  | 'VERIFICATION_SENT'
  | 'DELIVERED'
  | 'BOUNCED'
  | 'FAILED'
  | 'VERIFIED'
  | 'REGISTERED';

export type PhoneVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'INVALID'
  | 'UNREACHABLE'
  | 'HIGH_RISK'
  | 'BLOCKED';

export type PhoneLineStatus = 'ACTIVE' | 'REACHABLE' | 'UNREACHABLE' | 'INACTIVE' | 'UNKNOWN';

export type PhoneStatusType =
  | 'EMPTY'
  | 'INVALID_FORMAT'
  | 'VALID_FORMAT'
  | 'LOOKUP_CHECKING'
  | 'INVALID'
  | 'INACTIVE'
  | 'UNREACHABLE'
  | 'UNKNOWN'
  | 'LANDLINE'
  | 'VOIP'
  | 'MOBILE'
  | 'OTP_REQUIRED'
  | 'OTP_SENT'
  | 'OTP_FAILED'
  | 'VERIFIED'
  | 'REGISTERED'
  | 'AVAILABLE'
  | 'HIGH_RISK'
  | 'BLOCKED';

export type PhoneRiskLevel = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'BLOCKED';

export type PhoneLineType = 'MOBILE' | 'VOIP' | 'LANDLINE' | 'DISPOSABLE' | 'TOLL_FREE' | 'PREMIUM' | 'UNKNOWN';

export type OTPPurpose = 'SIGNUP' | 'LOGIN' | 'PHONE_CHANGE' | 'ACCOUNT_RECOVERY';

export type BlockedPhoneReason = 'FRAUD' | 'ABUSE' | 'SPAM' | 'SECURITY' | 'LEGAL_REQUEST';

export interface EmailVerificationSession {
  id: string;
  email: string;
  normalizedEmail: string;
  tokenHash: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  resendAvailableAt: string;
  verifiedAt?: string;
  verificationToken?: string;
  createdAt: string;
  status: EmailVerificationStatus;
  isDemoMode?: boolean;
  demoVerificationCode?: string;
}

export interface EmailVerification {
  id: string;
  email: string;
  userId?: string;
  provider: 'RESEND' | 'SENDGRID' | 'AMAZON_SES' | 'POSTMARK' | 'SURPLUSX_TRANSACTIONAL';
  domainStatus: 'VALID' | 'INVALID' | 'DNS_CHECK_FAILED';
  deliveryStatus: 'DELIVERED' | 'BOUNCED' | 'FAILED' | 'PENDING';
  verificationStatus: EmailVerificationStatus;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneIntelligence {
  valid: boolean;
  reachable: boolean;
  lineStatus: PhoneLineStatus;
  carrier?: string;
  country: string;
  countryCode: string;
  lineType: PhoneLineType;
  prepaidOrPostpaid?: 'PREPAID' | 'POSTPAID' | 'UNKNOWN';
  isDisposable: boolean;
  isVoip: boolean;
  riskLevel: PhoneRiskLevel;
  riskScore: number; // 0 (safest) to 100 (highest risk)
  normalizedPhone: string;
  formattedDisplay: string;
  maskedPhone: string;
  reputationSignals?: string[];
  safeErrorMessage?: string;
}

export interface PhoneVerification {
  id: string;
  userId?: string;
  phone: string;
  normalizedPhone: string;
  provider: 'TWILIO_VERIFY' | 'TELECOM_DIRECT' | 'SURPLUSX_SECURE_GATEWAY';
  verificationStatus: PhoneVerificationStatus;
  riskLevel: PhoneRiskLevel;
  carrier?: string;
  lineType: PhoneLineType;
  lineStatus: PhoneLineStatus;
  country: string;
  attemptCount: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OTPVerificationSession {
  id: string;
  phone: string;
  normalizedPhone: string;
  purpose: OTPPurpose;
  expiresAt: string;
  attemptCount: number;
  maxAttempts: number;
  resendAvailableAt: string;
  verifiedAt?: string;
  verificationToken?: string;
  createdAt: string;
  // Dev mode indicator if simulated OTP mode is active
  isDemoMode?: boolean;
  demoOtpCode?: string;
}

export interface BlockedPhone {
  id: string;
  normalizedPhone: string;
  reasonCode: BlockedPhoneReason;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  notes?: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  city: string;
  organizationName?: string;
  isVerified: boolean;
  deviceBindingId?: string;
  joinedDate: string;
  // Strict Identity & Role Lock System
  accountStatus?: AccountStatus;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  emailVerificationStatus?: EmailVerificationStatus;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  phoneVerificationStatus?: PhoneVerificationStatus;
  roleLocked?: boolean;
  maskedPhone?: string;
  phoneCarrier?: string;
  phoneLineType?: PhoneLineType;
  phoneLineStatus?: PhoneLineStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IdentityAvailabilityResult {
  // Final availability (ONLY true after both format, domain, network lookup, uniqueness, and verification checks pass)
  emailAvailable: boolean;
  phoneAvailable: boolean;
  normalizedEmail?: string;
  normalizedPhone?: string;
  existingEmailRole?: UserRole;
  existingPhoneRole?: UserRole;
  isConflict: boolean;
  conflictType?: 'NONE' | 'SAME_IDENTITY_DIFFERENT_ROLE' | 'EMAIL_TAKEN' | 'PHONE_TAKEN' | 'CROSS_IDENTITY_MISMATCH';
  errorMessage?: string;
  canSignIn?: boolean;
  emailStatus?: EmailVerificationStatus;
  emailRegistered?: boolean;
  phoneRegistered?: boolean;
  emailDomainValid?: boolean;
  emailDeliveryStatus?: 'DELIVERED' | 'BOUNCED' | 'FAILED' | 'PENDING';
  phoneIntelligence?: PhoneIntelligence;
}

export interface AdminRoleChangeLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  previousRole: UserRole;
  newRole: UserRole;
  adminId: string;
  adminEmail: string;
  reason: string;
  timestamp: string;
  integrityHash: string;
}

export type IntentActionType =
  | 'RESERVE_LISTING'
  | 'ADD_TO_CART'
  | 'BUY_NOW'
  | 'CHECKOUT'
  | 'VIEW_CART'
  | 'VIEW_ORDERS'
  | 'VIEW_RECEIPT'
  | 'TRACK_ORDER'
  | 'FAVORITE'
  | 'OPEN_DASHBOARD'
  | 'VIEW_IMPACT'
  | 'DONATE'
  | 'NAVIGATE';

export interface PendingActionIntent {
  type: IntentActionType;
  listingId?: string;
  quantity?: number;
  orderId?: string;
  targetView?: string;
  title?: string;
  description?: string;
  timestamp?: number;
}

export type CategoryType = 'Food' | 'Bakery' | 'Fruits & Vegetables' | 'Dairy' | 'Beverages' | 'Cooked Meals' | 'Others';

export interface SurplusListing {
  id: string;
  title: string;
  storeName: string;
  storeId: string;
  category: CategoryType;
  image: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  quantityAvailable: number;
  unit: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  pickupWindow: string;
  pickupAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  dietaryTags: ('Veg' | 'Non-Veg' | 'Vegan' | 'Halal' | 'Gluten-Free' | 'Dairy-Free')[];
  expiresInHours: number;
  stockAlertThreshold: number;
  storePositiveRating: number;
  storeHappyCustomers: number;
  storeYearsActive: number;
  isFavorite?: boolean;
}

export type OrderStatus =
  | 'RESERVED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  listingId: string;
  title: string;
  storeName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  id: string;
  receiptNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  platformFee: number;
  taxes: number;
  totalAmount: number;
  status: OrderStatus;
  paymentId?: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  pickupCodeOtp: string;
  createdAt: string;
  pickupWindow: string;
  storeName: string;
  storeAddress: string;
  assignedNgoId?: string;
  assignedNgoName?: string;
  deliveryId?: string;
  impact: {
    co2SavedKg: number;
    foodSavedKg: number;
    moneySaved: number;
  };
}

export interface NGO {
  id: string;
  name: string;
  registrationNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isVerified: boolean;
  activeVolunteers: number;
  mealsDistributed: number;
  capacityDailyMeals: number;
  verificationDocs: {
    name: string;
    type: string;
    verified: boolean;
    url: string;
  }[];
}

export type DonationStatus = 'AVAILABLE' | 'MATCHED' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'DISTRIBUTED';

export interface Donation {
  id: string;
  businessId: string;
  businessName: string;
  foodType: string;
  category: CategoryType;
  quantityMeals: number;
  weightKg: number;
  dietary: string;
  pickupDeadline: string;
  pickupAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: DonationStatus;
  matchedNgoId?: string;
  matchedNgoName?: string;
  driverName?: string;
  driverPhone?: string;
  createdAt: string;
  notes?: string;
  temperatureRequirement?: 'Room' | 'Refrigerated' | 'Hot';
}

export type DeliveryState =
  | 'ASSIGNED'
  | 'TRIP_STARTED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKUP_VERIFIED'
  | 'COLLECTED'
  | 'EN_ROUTE_TO_DROP'
  | 'ARRIVED_AT_DROP'
  | 'DELIVERY_VERIFIED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REASSIGNED';

export type DeliveryEventType =
  | 'ASSIGNED'
  | 'TRIP_STARTED'
  | 'LOCATION_TRACKING_STARTED'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKUP_VERIFIED'
  | 'FOOD_COLLECTED'
  | 'DELIVERY_STARTED'
  | 'ARRIVED_AT_DROP'
  | 'DELIVERY_VERIFIED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REASSIGNED'
  | 'GEOFENCE_ENTERED_PICKUP'
  | 'GEOFENCE_ENTERED_DROP'
  | 'LOCATION_ANOMALY';

export interface DeliveryEvent {
  id: string;
  deliveryId: string;
  eventType: DeliveryEventType;
  actorId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DeliveryLocation {
  id: string;
  deliveryId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  recordedAt: string;
  receivedAt: string;
}

export interface DeliveryTracking {
  id: string;
  orderOrDonationId: string;
  type: 'CONSUMER_ORDER' | 'NGO_DONATION';
  driverId?: string;
  driverName: string;
  driverPhone: string;
  vehicleType?: 'E-Bike' | 'Motorcycle' | 'Mini-Van' | 'Bicycle';
  currentLocation: {
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    lastUpdated: string;
  };
  origin: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  etaMinutes: number;
  distanceKm: number;
  status: DeliveryState;
  pickupOtp: string;
  dropOtp: string;
  proofImageUrl?: string;
  batteryLevel?: number;
  isRealGpsActive: boolean;
  pickupGeofenceRadiusMeters: number;
  dropGeofenceRadiusMeters: number;
  isWithinPickupGeofence: boolean;
  isWithinDropGeofence: boolean;
  distanceToPickupMeters: number;
  distanceToDropMeters: number;
  queuedOfflineLocationsCount: number;
  locationHistory: DeliveryLocation[];
  events: DeliveryEvent[];
  anomalyDetected?: boolean;
  anomalyDetails?: string;
  lastLocationAt?: string;
  networkStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  driverStatus: 'MOVING' | 'STATIONARY' | 'OFFLINE' | 'AT_PICKUP' | 'AT_DROP';
}

export interface DistributionRecord {
  id: string;
  ngoId: string;
  ngoName: string;
  donationId: string;
  beneficiaryType: 'Slum Community' | 'Shelter Home' | 'Orphanage' | 'Elderly Care' | 'Night Shelter' | 'Daily Wage Workers';
  beneficiariesCount: number;
  mealsDistributed: number;
  location: string;
  timestamp: string;
  photoUrl?: string;
  notes: string;
}

export interface BusinessInventoryItem {
  id: string;
  name: string;
  category: CategoryType;
  currentStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  surplusThreshold: number;
  expiryHoursLeft: number;
  isSurplusActive: boolean;
  reservedStock: number;
}

export interface LedgerEntry {
  id: string;
  orderId: string;
  businessId: string;
  businessName: string;
  grossAmount: number;
  platformCommission: number;
  taxAmount: number;
  netPayableToMerchant: number;
  settlementStatus: 'PENDING' | 'PROCESSING' | 'SETTLED';
  settlementDate?: string;
  paymentGatewayRef: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string;
  category: 'AUTH' | 'FINANCIAL' | 'INVENTORY' | 'DELIVERY' | 'VERIFICATION' | 'SYSTEM';
  details: string;
  ipAddress: string;
  deviceId: string;
  integrityHash: string;
}

export interface DeviceBinding {
  deviceId: string;
  deviceName: string;
  os: string;
  browser: string;
  ip: string;
  status: 'TRUSTED' | 'PENDING' | 'REVOKED';
  boundAt: string;
  lastActive: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
  isSystem?: boolean;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  organizationName?: string;
}

export interface ConversationThread {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  contextType: 'ORDER' | 'DONATION' | 'PICKUP' | 'SUPPORT' | 'GENERAL';
  contextId?: string;
  contextTitle: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
  isAuthorized: boolean;
  authRelationReason: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  category: 'ORDER_ISSUE' | 'DONATION_COORDINATION' | 'PAYMENT_ESCROW' | 'KYC_VERIFICATION' | 'TECHNICAL_BUG' | 'GENERAL';
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

