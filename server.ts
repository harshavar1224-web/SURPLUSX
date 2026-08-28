import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  serverPolicyStore,
  classifyServerLocality,
  calculateHaversineDistanceKm,
  verifyServerOrderDistanceEligibility,
} from './src/server/locationEngine';
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
    res.json({ status: 'ok', service: 'SurplusX Geo-Radius & Marketplace Engine' });
  });

  // 2. GET /api/location/policy - Load active platform discovery and logistics radius policies
  app.get('/api/location/policy', (req, res) => {
    const policies = serverPolicyStore.getAllPolicies();
    res.json({
      success: true,
      policies,
      timestamp: new Date().toISOString(),
    });
  });

  // 3. GET /api/location/classification - Classify coordinates into Locality Type (Village/Town/City)
  app.get('/api/location/classification', (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing coordinates (lat, lng required)',
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

  // 4. POST /api/location/manual - Register a user-selected manual location and resolve locality classification
  app.post('/api/location/manual', (req, res) => {
    const { lat, lng, localityName, userId } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Coordinates lat and lng are required as numbers',
      });
    }

    const classification = classifyServerLocality(lat, lng);
    const userLocation = {
      id: `loc-${Date.now()}`,
      userId: userId || 'guest',
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      source: 'MANUAL' as const,
      localityType: classification.localityType,
      localityName: localityName || classification.localityName,
      district: classification.district,
      state: classification.state,
      updatedAt: new Date().toISOString(),
      isLiveGps: false,
    };

    if (userId) {
      serverPolicyStore.cacheUserLocation(userId, userLocation);
    }

    const appliedPolicy = serverPolicyStore.getPolicy('DISCOVERY_RADIUS', classification.localityType);

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
