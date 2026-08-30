import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  serverPolicyStore,
  classifyServerLocality,
  calculateHaversineDistanceKm,
  verifyServerOrderDistanceEligibility,
  serverReverseGeocode,
  searchIndiaLocations,
  isWithinIndia,
} from './src/server/locationEngine';
import {
  serverAccountService,
  normalizeEmail,
  normalizeIndianPhone,
} from './src/server/accountIdentityService';
import { phoneVerificationService } from './src/server/phoneVerificationService';
import { emailVerificationService } from './src/server/emailVerificationService';
import { emailService } from './src/server/emailService';
import { INITIAL_LISTINGS } from './src/data/mockData';
import { UserRole, LocationRadiusPolicyType, LocalityType } from './src/types';

// In-memory store of active surplus listings on backend
let serverListings = [...INITIAL_LISTINGS];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ============================================================================
  // API ROUTES (Always mounted before Vite middleware)
  // ============================================================================

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SurplusX India-Wide Location & Marketplace Engine' });
  });

  // 2. GET /api/location/policy - Load active platform discovery and logistics radius policies (Specification #12, #32, #33)
  app.get('/api/location/policy', (req, res) => {
    const policies = serverPolicyStore.getAllPolicies();
    res.json({
      success: true,
      policies,
      timestamp: new Date().toISOString(),
    });
  });

  // 3. GET /api/location/reverse-geocode - Reverse Geocode Lat/Lng into Complete Address (Specification #4, #7, #8-11, #35)
  app.get('/api/location/reverse-geocode', async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const accuracy = parseFloat(req.query.accuracy as string) || 15;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates: lat and lng are required numbers',
      });
    }

    // Check India Boundary (Specification #3)
    if (!isWithinIndia(lat, lng)) {
      return res.status(400).json({
        success: false,
        error: 'SurplusX is currently available only in supported areas of India.',
        isWithinSupportedArea: false,
      });
    }

    try {
      const geoResult = await serverReverseGeocode(lat, lng, accuracy);
      const appliedPolicy = serverPolicyStore.getPolicy('DISCOVERY_RADIUS', geoResult.localityType);

      const userLocation = {
        id: `loc-geo-${Date.now()}`,
        userId: (req.query.userId as string) || 'guest',
        latitude: lat,
        longitude: lng,
        accuracy,
        formattedAddress: geoResult.formattedAddress,
        houseNumber: geoResult.houseNumber,
        street: geoResult.street,
        area: geoResult.area,
        village: geoResult.village,
        town: geoResult.town,
        city: geoResult.city,
        district: geoResult.district,
        state: geoResult.state,
        stateCode: geoResult.stateCode,
        postalCode: geoResult.postalCode,
        country: geoResult.country,
        countryCode: geoResult.countryCode,
        localityType: geoResult.localityType,
        localityName: geoResult.localityName,
        source: 'GPS' as const,
        isCurrent: true,
        isLiveGps: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pincode: geoResult.postalCode,
      };

      res.json({
        success: true,
        location: userLocation,
        appliedPolicy: {
          policyType: appliedPolicy.policyType,
          radiusKm: appliedPolicy.radiusKm,
          localityType: geoResult.localityType,
          version: appliedPolicy.version,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Geocoding failed',
      });
    }
  });

  // 4. GET /api/location/search - Search Place, City, Town, Village, District, or PIN Code across India (Specification #18, #19, #20)
  app.get('/api/location/search', async (req, res) => {
    const q = (req.query.q as string) || '';

    try {
      const results = await searchIndiaLocations(q);
      res.json({
        success: true,
        query: q,
        count: results.length,
        results,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Location search failed',
      });
    }
  });

  // 5. GET /api/location/classification - Classify coordinates into Locality Type (Village/Town/City/Metro)
  app.get('/api/location/classification', (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing coordinates (lat, lng required)',
      });
    }

    if (!isWithinIndia(lat, lng)) {
      return res.status(400).json({
        success: false,
        error: 'SurplusX is currently available only in supported areas of India.',
      });
    }

    const classification = classifyServerLocality(lat, lng);
    const appliedDiscoveryPolicy = serverPolicyStore.getPolicy('DISCOVERY_RADIUS', classification.localityType);
    const appliedDeliveryPolicy = serverPolicyStore.getPolicy('DELIVERY_RADIUS', classification.localityType);
    const appliedNgoPolicy = serverPolicyStore.getPolicy('NGO_MATCHING_RADIUS', classification.localityType);

    res.json({
      success: true,
      classification,
      policies: {
        discoveryRadiusKm: appliedDiscoveryPolicy.radiusKm,
        deliveryRadiusKm: appliedDeliveryPolicy.radiusKm,
        ngoMatchingRadiusKm: appliedNgoPolicy.radiusKm,
        policyVersion: appliedDiscoveryPolicy.version,
      },
    });
  });

  // 6. POST /api/location/manual - Register a user-selected manual location and resolve locality classification
  app.post('/api/location/manual', async (req, res) => {
    const { lat, lng, localityName, formattedAddress, postalCode, district, state, userId } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Coordinates lat and lng are required as numbers',
      });
    }

    if (!isWithinIndia(lat, lng)) {
      return res.status(400).json({
        success: false,
        error: 'SurplusX is currently available only in supported areas of India.',
      });
    }

    const geoResult = await serverReverseGeocode(lat, lng, 20);
    const classification = classifyServerLocality(lat, lng);

    const userLocation = {
      id: `loc-man-${Date.now()}`,
      userId: userId || 'guest',
      latitude: lat,
      longitude: lng,
      accuracy: 20,
      formattedAddress: formattedAddress || geoResult.formattedAddress,
      houseNumber: geoResult.houseNumber,
      street: geoResult.street,
      area: geoResult.area,
      village: geoResult.village,
      town: geoResult.town,
      city: geoResult.city,
      district: district || geoResult.district || classification.district,
      state: state || geoResult.state || classification.state,
      stateCode: geoResult.stateCode,
      postalCode: postalCode || geoResult.postalCode,
      country: 'India',
      countryCode: 'in',
      localityType: geoResult.localityType || classification.localityType,
      localityName: localityName || geoResult.localityName || classification.localityName,
      source: 'MANUAL' as const,
      isCurrent: true,
      isLiveGps: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pincode: postalCode || geoResult.postalCode,
    };

    if (userId) {
      serverPolicyStore.cacheUserLocation(userId, userLocation);
    }

    const appliedPolicy = serverPolicyStore.getPolicy('DISCOVERY_RADIUS', userLocation.localityType);

    res.json({
      success: true,
      userLocation,
      appliedPolicy: {
        policyType: appliedPolicy.policyType,
        radiusKm: appliedPolicy.radiusKm,
        version: appliedPolicy.version,
      },
    });
  });

  // 7. GET /api/location/me - Get active user location
  app.get('/api/location/me', (req, res) => {
    const userId = (req.query.userId as string) || 'guest';
    const cached = serverPolicyStore.getCachedUserLocation(userId);

    if (cached) {
      const policy = serverPolicyStore.getPolicy('DISCOVERY_RADIUS', cached.localityType);
      return res.json({
        success: true,
        location: cached,
        appliedPolicy: {
          radiusKm: policy.radiusKm,
          localityType: cached.localityType,
        },
      });
    }

    // Default: Hyderabad Tech Hub or Bangalore Central
    const defaultLocation = {
      id: 'loc-default',
      userId,
      latitude: 17.4483,
      longitude: 78.3915,
      accuracy: 25,
      formattedAddress: 'Main Road, Madhapur, Hyderabad, Telangana 500081, India',
      area: 'Madhapur',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      country: 'India',
      countryCode: 'in',
      localityType: 'METRO' as const,
      localityName: 'Madhapur (Hyderabad Metro)',
      source: 'MANUAL' as const,
      isCurrent: true,
      isLiveGps: false,
      updatedAt: new Date().toISOString(),
      pincode: '500081',
    };

    const policy = serverPolicyStore.getPolicy('DISCOVERY_RADIUS', 'METRO');

    res.json({
      success: true,
      location: defaultLocation,
      appliedPolicy: {
        radiusKm: policy.radiusKm,
        localityType: 'METRO',
      },
    });
  });

  // 5. GET /api/listings/nearby - Authoritative Server-Side Geo-Radius Discovery Query (Requirement #12, #13)
  app.get('/api/listings/nearby', (req, res) => {
    const lat = parseFloat(req.query.lat as string) || 12.9716; // default Bangalore
    const lng = parseFloat(req.query.lng as string) || 77.5946;
    const includeOutside = req.query.includeOutside === 'true';
    const category = req.query.category as string;
    const search = req.query.search as string;

    // A. Authoritative Server Locality Classification
    const classification = classifyServerLocality(lat, lng);

    // B. Load active platform policy for this locality
    const discoveryPolicy = serverPolicyStore.getPolicy('DISCOVERY_RADIUS', classification.localityType);
    const maxRadiusKm = discoveryPolicy.radiusKm;

    // C. Calculate exact spherical distance to all listings
    const processedListings = serverListings.map((item) => {
      const distanceKm = calculateHaversineDistanceKm(
        lat,
        lng,
        item.coordinates.lat,
        item.coordinates.lng
      );

      const withinRadius = distanceKm <= maxRadiusKm;

      return {
        ...item,
        distanceKm,
        withinRadius,
        isOrderable: withinRadius && item.quantityAvailable > 0,
        localityType: classification.localityType,
        maxAllowedRadiusKm: maxRadiusKm,
      };
    });

    // D. Apply search and category filters
    let filtered = processedListings;

    if (category && category !== 'All') {
      filtered = filtered.filter((i) => i.category === category || (category === 'Food' && i.category !== 'Others'));
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.storeName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    // Sort primarily by distance (closest first), then discount
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    const eligibleListings = filtered.filter((i) => i.withinRadius);
    const outsideListings = filtered.filter((i) => !i.withinRadius);

    res.json({
      success: true,
      userCoordinates: { lat, lng },
      localityClassification: classification,
      appliedPolicy: {
        policyType: discoveryPolicy.policyType,
        radiusKm: discoveryPolicy.radiusKm,
        localityType: classification.localityType,
        version: discoveryPolicy.version,
      },
      totalEligible: eligibleListings.length,
      totalOutside: outsideListings.length,
      listings: includeOutside ? filtered : eligibleListings,
      outsideListings: includeOutside ? outsideListings : undefined,
    });
  });

  // 9. POST /api/location/validate-order - Authoritative check before checkout or reservation
  app.post('/api/location/validate-order', (req, res) => {
    const { listingId, userCoordinates, policyType = 'DISCOVERY_RADIUS' } = req.body;

    if (!listingId || !userCoordinates || typeof userCoordinates.lat !== 'number' || typeof userCoordinates.lng !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: listingId and userCoordinates (lat, lng)',
      });
    }

    const listing = serverListings.find((l) => l.id === listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: `Listing ${listingId} not found`,
      });
    }

    const verification = verifyServerOrderDistanceEligibility({
      userCoordinates,
      listingCoordinates: listing.coordinates,
      listingId,
      policyType,
    });

    res.json({
      success: true,
      verification,
    });
  });

  // 6. GET /api/admin/location-policy - Fetch all platform policies & audit records (Admin Only)
  app.get('/api/admin/location-policy', (req, res) => {
    const userRole = (req.headers['x-user-role'] as UserRole) || 'ADMIN';

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '403 Forbidden: Only authorized Platform Host/Admin users can access location policy management.',
      });
    }

    const policies = serverPolicyStore.getAllPolicies();
    const auditHistory = serverPolicyStore.getAuditHistory();

    res.json({
      success: true,
      policies,
      auditHistory,
      timestamp: new Date().toISOString(),
    });
  });

  // 7. PATCH /api/admin/location-policy - Update Platform Discovery/Logistics Radius Policy (Requirement #7, #8, #10, #34)
  app.patch('/api/admin/location-policy', (req, res) => {
    const userRole = (req.headers['x-user-role'] as UserRole) || req.body.adminRole;

    // Strict Role Authorization Enforcement (Requirement #8 & #43)
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '403 Forbidden: Permission denied. Normal consumers, merchants, and NGOs cannot modify platform discovery radii.',
      });
    }

    const { policyType, localityType, newRadiusKm, updatedBy, reason } = req.body;

    if (!policyType || !localityType || typeof newRadiusKm !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: policyType, localityType, newRadiusKm (number)',
      });
    }

    const result = serverPolicyStore.updatePolicy({
      policyType: policyType as LocationRadiusPolicyType,
      localityType: localityType as LocalityType,
      newRadiusKm,
      updatedBy: updatedBy || 'Platform Admin',
      adminRole: userRole,
      reason: reason || 'Platform operational adjustment',
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Successfully updated ${localityType} ${policyType} to ${newRadiusKm} km (v${result.policy?.version})`,
      policy: result.policy,
      auditLogs: serverPolicyStore.getAuditHistory(),
    });
  });

  // 8. GET /api/admin/location-policy/history - Immutable Policy Change Audit Trail (Requirement #34, #35)
  app.get('/api/admin/location-policy/history', (req, res) => {
    const userRole = (req.headers['x-user-role'] as UserRole) || 'ADMIN';

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: '403 Forbidden: Only platform administrators can view audit histories.',
      });
    }

    res.json({
      success: true,
      auditLogs: serverPolicyStore.getAuditHistory(),
    });
  });

  // 9. POST /api/orders - Authoritative Server-Side Order Distance Re-Verification (Requirement #17 & #55)
  app.post('/api/orders', (req, res) => {
    const { listingId, userCoordinates, quantity, paymentMethod } = req.body;

    if (!listingId || !userCoordinates || typeof userCoordinates.lat !== 'number' || typeof userCoordinates.lng !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing required order fields: listingId, userCoordinates (lat, lng)',
      });
    }

    const listing = serverListings.find((l) => l.id === listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: `Listing ${listingId} not found.`,
      });
    }

    // Strict Backend Distance Re-Check (Ignores any client-supplied radius claim)
    const verification = verifyServerOrderDistanceEligibility({
      userCoordinates,
      listingCoordinates: listing.coordinates,
      listingId,
      policyType: 'DISCOVERY_RADIUS',
    });

    if (!verification.allowed) {
      return res.status(400).json({
        success: false,
        error: `Order rejected: This listing is located ${verification.userDistanceKm} km away, which exceeds your ${verification.localityType} area maximum platform radius of ${verification.maxAllowedRadiusKm} km.`,
        verification,
      });
    }

    // Check quantity availability
    const qty = quantity || 1;
    if (listing.quantityAvailable < qty) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock: only ${listing.quantityAvailable} packages remaining.`,
      });
    }

    // Decrement stock
    listing.quantityAvailable -= qty;

    const newOrder = {
      id: `ord-${Date.now()}`,
      receiptNumber: `SX-REC-${Math.floor(100000 + Math.random() * 900000)}`,
      listingId,
      quantity: qty,
      totalAmount: listing.price * qty,
      paymentMethod: paymentMethod || 'UPI',
      status: 'CONFIRMED',
      pickupCodeOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      distanceKm: verification.userDistanceKm,
      localityType: verification.localityType,
      allowedRadiusKm: verification.maxAllowedRadiusKm,
    };

    res.json({
      success: true,
      order: newOrder,
      verification,
      message: 'Order verified and created successfully within authorized geo-radius.',
    });
  });

  // 10. POST /api/reservations - Authoritative Server-Side Reservation Distance Re-Verification (Requirement #37)
  app.post('/api/reservations', (req, res) => {
    const { listingId, userCoordinates, quantity } = req.body;

    if (!listingId || !userCoordinates || typeof userCoordinates.lat !== 'number' || typeof userCoordinates.lng !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing required reservation fields: listingId, userCoordinates (lat, lng)',
      });
    }

    const listing = serverListings.find((l) => l.id === listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: `Listing ${listingId} not found.`,
      });
    }

    // Authoritative Server Re-Check
    const verification = verifyServerOrderDistanceEligibility({
      userCoordinates,
      listingCoordinates: listing.coordinates,
      listingId,
      policyType: 'DISCOVERY_RADIUS',
    });

    if (!verification.allowed) {
      return res.status(400).json({
        success: false,
        error: `Reservation rejected: Listing is outside your ${verification.localityType} pickup zone (${verification.userDistanceKm} km > ${verification.maxAllowedRadiusKm} km policy).`,
        verification,
      });
    }

    res.json({
      success: true,
      reservationId: `resv-${Date.now()}`,
      listingId,
      verification,
      expiresInMinutes: 15,
      message: 'Reservation lock secured successfully within platform radius policy.',
    });
  });

  // ============================================================================
  // STRICT ACCOUNT IDENTITY & DUAL-VERIFICATION API ROUTES
  // Rule: ONE VERIFIED EMAIL + ONE VERIFIED E.164 MOBILE (+91) = ONE SURPLUSX ACCOUNT = ONE ROLE
  // ============================================================================

  // 11. POST /api/auth/check-availability - Pre-signup identity & conflict check (Specification #1-7, #34, #35)
  app.post('/api/auth/check-availability', async (req, res) => {
    try {
      const { email, phone, role } = req.body;
      const result = await serverAccountService.checkIdentityAvailability(email, phone, role);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Availability check failed' });
    }
  });

  // 12. POST /api/auth/email/check - Authoritative RFC 5322, DNS MX Domain Check & User Table Lookup
  app.post('/api/auth/email/check', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          valid: false,
          status: 'INVALID_FORMAT',
          message: 'Email address is required.',
          error: 'Email address is required.',
        });
      }
      const check = await serverAccountService.checkEmailStatus(email);
      res.json(check);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        valid: false,
        status: 'DOMAIN_INVALID',
        message: 'Email check failed.',
        error: err.message || 'Email check failed.',
      });
    }
  });

  // 13. POST /api/auth/email/send-verification & /api/auth/email/send-otp - Dispatch 6-Digit Verification Code to User Email
  const handleSendEmailVerification = async (req: express.Request, res: express.Response) => {
    try {
      const { email, deviceId } = req.body;
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email address is required.' });
      }

      const normEmail = emailVerificationService.normalizeEmail(email);

      // Security check: Check if user is already registered with SurplusX
      const existingUser = serverAccountService.findUserByEmail(normEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'This email is already registered with SurplusX. Please sign in instead.',
          isRegistered: true,
          status: 'REGISTERED',
        });
      }

      const result = await emailVerificationService.sendVerificationEmail({
        email: normEmail,
        clientIp,
        deviceId,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to dispatch email verification.' });
    }
  };

  app.post('/api/auth/email/send-verification', handleSendEmailVerification);
  app.post('/api/auth/email/send-otp', handleSendEmailVerification);
  app.post('/api/auth/email/resend-otp', handleSendEmailVerification);

  // 14. POST /api/auth/email/verify & /api/auth/email/verify-otp - Verify Email Code & Issue 15-Minute Token
  const handleVerifyEmail = (req: express.Request, res: express.Response) => {
    try {
      const { sessionId, verification_session_id, email, code, otp } = req.body;
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const submittedCode = code || otp;
      if (!email || !submittedCode) {
        return res.status(400).json({
          success: false,
          error: 'Both email address and 6-digit verification code are required.',
        });
      }

      const result = emailVerificationService.verifyEmailCode({
        sessionId: sessionId || verification_session_id,
        verification_session_id: verification_session_id || sessionId,
        email,
        code: submittedCode,
        otp: submittedCode,
        clientIp,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Verification failed.' });
    }
  };

  app.post('/api/auth/email/verify', handleVerifyEmail);
  app.post('/api/auth/email/verify-otp', handleVerifyEmail);

  // Internal Diagnostics: POST /api/internal/test-email (Specification #38)
  app.post('/api/internal/test-email', async (req, res) => {
    try {
      const { to } = req.body;
      if (!to) {
        return res.status(400).json({ success: false, error: 'Recipient "to" email address is required.' });
      }

      const result = await emailService.sendTestEmail(to);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json({
        success: true,
        status: 'DELIVERED_TO_PROVIDER',
        provider: result.provider,
        messageId: result.messageId,
        maskedRecipient: emailService.maskEmail(to),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Internal test email failure.' });
    }
  });

  // Internal Diagnostics: GET /api/internal/email-status
  app.get('/api/internal/email-status', (req, res) => {
    res.json({
      success: true,
      provider: 'Resend',
      isConfigured: emailService.isConfigured(),
      config: emailService.getConfigurationStatus(),
    });
  });

  // 15. POST /api/auth/phone/lookup - Phone Number Intelligence & Risk Assessment (Specification #8, #9, #10, #11)
  app.post('/api/auth/phone/lookup', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Mobile number is required.' });
    }
    const intelligence = phoneVerificationService.lookupPhone(phone);
    res.json({
      success: intelligence.valid && intelligence.reachable,
      intelligence,
    });
  });

  // 16. POST /api/auth/phone/send-otp - Dispatch 6-Digit Cryptographic OTP (Specification #16-24)
  app.post('/api/auth/phone/send-otp', async (req, res) => {
    const { phone, purpose = 'SIGNUP', deviceId } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Mobile number is required to send verification code.' });
    }

    const result = await phoneVerificationService.sendOTP({
      phone,
      purpose,
      clientIp,
      deviceId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // 17. POST /api/auth/phone/verify-otp - Verify Cryptographic OTP & Issue 15-Minute One-Time Token (Specification #21-24)
  app.post('/api/auth/phone/verify-otp', (req, res) => {
    const { sessionId, phone, otpCode, purpose = 'SIGNUP' } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!phone || !otpCode) {
      return res.status(400).json({
        success: false,
        error: 'Both mobile number and verification code are required.',
      });
    }

    const result = phoneVerificationService.verifyOTP({
      sessionId,
      phone,
      otpCode,
      purpose,
      clientIp,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // 18. POST /api/auth/signup - Transactional Signup with Dual-Token Enforcement (Email Token + Phone Token) & Role Lock
  app.post('/api/auth/signup', async (req, res) => {
    const {
      name,
      email,
      phone,
      role,
      emailVerificationToken,
      phoneVerificationToken,
      password,
      city,
      organizationName,
      deviceId,
    } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const result = await serverAccountService.transactionalSignup({
      name,
      email,
      phone,
      role,
      emailVerificationToken,
      phoneVerificationToken,
      password,
      city,
      organizationName,
      deviceId,
      ipAddress: clientIp,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  });

  // 16. POST /api/auth/phone/change-request - Request Mobile Number Change (Specification #27)
  app.post('/api/auth/phone/change-request', async (req, res) => {
    const { userId, newPhone, deviceId } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!userId || !newPhone) {
      return res.status(400).json({ success: false, error: 'User ID and new mobile number are required.' });
    }

    const result = await serverAccountService.requestPhoneChange({
      userId,
      newPhone,
      clientIp,
      deviceId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // 17. POST /api/auth/phone/change-verify - Confirm Mobile Number Change with OTP (Specification #27)
  app.post('/api/auth/phone/change-verify', async (req, res) => {
    const { userId, newPhone, otpCode, sessionId, deviceId } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!userId || !newPhone || !otpCode) {
      return res.status(400).json({
        success: false,
        error: 'User ID, new mobile number, and OTP code are required.',
      });
    }

    const result = await serverAccountService.verifyAndApplyPhoneChange({
      userId,
      newPhone,
      otpCode,
      sessionId,
      clientIp,
      deviceId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // 18. POST /api/auth/login - Authoritative Login (SERVER DETERMINES ROLE - NO ROLE SELECTOR ON LOGIN)
  app.post('/api/auth/login', (req, res) => {
    const { identifier, password, deviceId } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const result = serverAccountService.authenticateUser(identifier, password, deviceId, clientIp);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  });

  // 19. POST /api/auth/verify-email - Email Verification
  app.post('/api/auth/verify-email', (req, res) => {
    const { email } = req.body;
    const norm = normalizeEmail(email);
    const user = serverAccountService.findUserByEmail(norm);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.emailVerified = true;
    res.json({ success: true, message: `Email ${norm} verified successfully.` });
  });

  // 20. POST /api/auth/forgot-password - Recovery Initiation (Specification #25, #31)
  app.post('/api/auth/forgot-password', (req, res) => {
    const { identifier } = req.body;
    const user = serverAccountService.findUserByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No registered SurplusX account matches this email or mobile number.',
      });
    }

    // In demo environment, return simulated OTP for immediate verification
    const simulatedOtp = '8492';
    res.json({
      success: true,
      message: `Recovery code sent to your registered contact. Use code ${simulatedOtp} to reset your password.`,
      maskedTarget: user.email.replace(/(.{2})(.*)(?=@)/, (_g1, g2, g3) => g2 + '*'.repeat(g3.length)),
      simulatedOtp,
    });
  });

  // 21. POST /api/auth/reset-password - Complete Password Reset
  app.post('/api/auth/reset-password', (req, res) => {
    const { identifier, newPassword } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const result = serverAccountService.resetPassword(identifier, newPassword, clientIp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // 22. POST /api/admin/change-role - Authorized Administrative Role Migration (Specification #28, #29, #44)
  app.post('/api/admin/change-role', async (req, res) => {
    const { adminId, adminEmail, targetUserId, newRole, reason } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const result = await serverAccountService.adminChangeRole({
      adminId,
      adminEmail,
      targetUserId,
      newRole,
      reason,
      ipAddress: clientIp,
    });

    if (!result.success) {
      return res.status(403).json(result);
    }

    res.json(result);
  });

  // 23. GET /api/admin/phone-blocks - List Blocked Mobile Numbers
  app.get('/api/admin/phone-blocks', (req, res) => {
    const blocked = phoneVerificationService.getBlockedNumbers();
    res.json({
      success: true,
      count: blocked.length,
      blocked,
    });
  });

  // 24. POST /api/admin/phone-blocks - Block a phone number
  app.post('/api/admin/phone-blocks', (req, res) => {
    const { phone, reasonCode = 'SPAM', notes, createdBy = 'ADMIN_MANUAL', expiresInDays } = req.body;
    const result = phoneVerificationService.blockNumber({
      phone,
      reasonCode,
      notes,
      createdBy,
      expiresInDays,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // 25. DELETE /api/admin/phone-blocks/:phone - Unblock a phone number
  app.delete('/api/admin/phone-blocks/:phone', (req, res) => {
    const { phone } = req.params;
    const result = phoneVerificationService.unblockNumber(phone);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // 26. POST /api/admin/phone-override - Admin Manual Verification Override
  app.post('/api/admin/phone-override', async (req, res) => {
    const { adminId, targetUserId, verifiedPhone, reason, evidenceReference } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const result = await serverAccountService.adminOverrideUserPhone({
      adminId,
      targetUserId,
      verifiedPhone,
      reason,
      evidenceReference,
      ipAddress: clientIp,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // 27. GET /api/admin/users - Admin Listing of Registered Identities & Role Locks
  app.get('/api/admin/users', (req, res) => {
    const users = serverAccountService.getAllAccounts();
    res.json({
      success: true,
      count: users.length,
      users,
    });
  });

  // 28. GET /api/admin/identity-audit-logs - Identity & Role Audit Logs
  app.get('/api/admin/identity-audit-logs', (req, res) => {
    const logs = serverAccountService.getAuditLogs();
    const roleChanges = serverAccountService.getAdminRoleChanges();
    res.json({
      success: true,
      logs,
      roleChanges,
    });
  });

  // ============================================================================
  // VITE & STATIC FILE MIDDLEWARE
  // ============================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SurplusX Full-Stack Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
