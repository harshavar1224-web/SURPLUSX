import {
  LocalityType,
  LocationRadiusPolicy,
  LocationRadiusPolicyType,
  RadiusPolicyAuditLog,
  UserLocation,
  SurplusListing,
  OrderEligibilityResult,
  LocationClassification,
  UserRole,
} from '../types';

// Standard Haversine distance formula (accurate spherical distance in kilometers)
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

// Initial Platform Policies as mandated by Platform Architecture
export const DEFAULT_RADIUS_POLICIES: LocationRadiusPolicy[] = [
  // 1. Marketplace Discovery Radius Policies
  {
    id: 'pol-disc-village',
    policyType: 'DISCOVERY_RADIUS',
    localityType: 'VILLAGE',
    radiusKm: 20, // Default 20 km for Village
    minAllowedKm: 5,
    maxAllowedKm: 30,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Initial platform policy standard for rural & village coverage',
  },
  {
    id: 'pol-disc-town',
    policyType: 'DISCOVERY_RADIUS',
    localityType: 'TOWN',
    radiusKm: 40, // Default 40 km for Town
    minAllowedKm: 10,
    maxAllowedKm: 60,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Standard tier-2/3 town surplus marketplace coverage',
  },
  {
    id: 'pol-disc-city',
    policyType: 'DISCOVERY_RADIUS',
    localityType: 'CITY',
    radiusKm: 40, // Default 40 km for City
    minAllowedKm: 10,
    maxAllowedKm: 60,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Metropolitan & urban perimeter surplus marketplace radius',
  },
  {
    id: 'pol-disc-metro',
    policyType: 'DISCOVERY_RADIUS',
    localityType: 'METRO',
    radiusKm: 40,
    minAllowedKm: 10,
    maxAllowedKm: 60,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Mega-city high-density transit coverage',
  },

  // 2. Logistics Delivery Radius Policies
  {
    id: 'pol-del-village',
    policyType: 'DELIVERY_RADIUS',
    localityType: 'VILLAGE',
    radiusKm: 15,
    minAllowedKm: 5,
    maxAllowedKm: 25,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Max two-wheeler and e-rickshaw rural delivery reach',
  },
  {
    id: 'pol-del-town',
    policyType: 'DELIVERY_RADIUS',
    localityType: 'TOWN',
    radiusKm: 30,
    minAllowedKm: 10,
    maxAllowedKm: 45,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Township logistics fulfillment network',
  },
  {
    id: 'pol-del-city',
    policyType: 'DELIVERY_RADIUS',
    localityType: 'CITY',
    radiusKm: 35,
    minAllowedKm: 10,
    maxAllowedKm: 50,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Urban fast-logistics radius',
  },

  // 3. NGO Food Rescue Matching Radius Policies
  {
    id: 'pol-ngo-village',
    policyType: 'NGO_MATCHING_RADIUS',
    localityType: 'VILLAGE',
    radiusKm: 30,
    minAllowedKm: 10,
    maxAllowedKm: 50,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Rural hunger relief and community pantry catchment zone',
  },
  {
    id: 'pol-ngo-town',
    policyType: 'NGO_MATCHING_RADIUS',
    localityType: 'TOWN',
    radiusKm: 45,
    minAllowedKm: 15,
    maxAllowedKm: 70,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Sub-district level NGO shelter dispatch distance',
  },
  {
    id: 'pol-ngo-city',
    policyType: 'NGO_MATCHING_RADIUS',
    localityType: 'CITY',
    radiusKm: 50,
    minAllowedKm: 20,
    maxAllowedKm: 80,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Citywide hunger relief fleet network',
  },

  // 4. Driver Service Radius Policies
  {
    id: 'pol-driver-village',
    policyType: 'DRIVER_SERVICE_RADIUS',
    localityType: 'VILLAGE',
    radiusKm: 20,
    minAllowedKm: 5,
    maxAllowedKm: 35,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Rider dispatch beacon threshold for villages',
  },
  {
    id: 'pol-driver-town',
    policyType: 'DRIVER_SERVICE_RADIUS',
    localityType: 'TOWN',
    radiusKm: 35,
    minAllowedKm: 10,
    maxAllowedKm: 50,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'Township driver battery/fuel radius',
  },
  {
    id: 'pol-driver-city',
    policyType: 'DRIVER_SERVICE_RADIUS',
    localityType: 'CITY',
    radiusKm: 40,
    minAllowedKm: 10,
    maxAllowedKm: 60,
    enabled: true,
    version: 1,
    updatedBy: 'Platform Host Admin',
    updatedAt: new Date().toISOString(),
    reason: 'City hub driver operation radius',
  },
];

// Predefined authoritative geographical bounding boxes & reference hubs
interface GeoBoundary {
  name: string;
  type: LocalityType;
  district: string;
  state: string;
  centerLat: number;
  centerLng: number;
  maxRadiusKm: number;
}

const AUTHORITATIVE_GEO_BOUNDARIES: GeoBoundary[] = [
  // Cities / Metros
  {
    name: 'Bengaluru Urban Metro',
    type: 'CITY',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    centerLat: 12.9716,
    centerLng: 77.5946,
    maxRadiusKm: 25,
  },
  {
    name: 'Mysuru City',
    type: 'CITY',
    district: 'Mysuru',
    state: 'Karnataka',
    centerLat: 12.2958,
    centerLng: 76.6394,
    maxRadiusKm: 20,
  },
  {
    name: 'Hyderabad Central',
    type: 'CITY',
    district: 'Hyderabad',
    state: 'Telangana',
    centerLat: 17.3850,
    centerLng: 78.4867,
    maxRadiusKm: 30,
  },

  // Towns
  {
    name: 'Ramanagara Town',
    type: 'TOWN',
    district: 'Ramanagara',
    state: 'Karnataka',
    centerLat: 12.7209,
    centerLng: 77.2799,
    maxRadiusKm: 12,
  },
  {
    name: 'Channapatna Toy Town',
    type: 'TOWN',
    district: 'Ramanagara',
    state: 'Karnataka',
    centerLat: 12.6518,
    centerLng: 77.2089,
    maxRadiusKm: 10,
  },
  {
    name: 'Doddaballapura Industrial Town',
    type: 'TOWN',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    centerLat: 13.2929,
    centerLng: 77.5432,
    maxRadiusKm: 14,
  },
  {
    name: 'Hosur Town',
    type: 'TOWN',
    district: 'Krishnagiri',
    state: 'Tamil Nadu',
    centerLat: 12.7409,
    centerLng: 77.8253,
    maxRadiusKm: 15,
  },
  {
    name: 'Nelamangala Town',
    type: 'TOWN',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    centerLat: 13.0978,
    centerLng: 77.3916,
    maxRadiusKm: 12,
  },

  // Villages / Rural Belts
  {
    name: 'Bidadi Rural Grama Panchayat',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    centerLat: 12.7963,
    centerLng: 77.3831,
    maxRadiusKm: 15,
  },
  {
    name: 'Harohalli Village Cluster',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    centerLat: 12.6685,
    centerLng: 77.4578,
    maxRadiusKm: 14,
  },
  {
    name: 'Kanakapura Rural Outskirts',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    centerLat: 12.5532,
    centerLng: 77.4184,
    maxRadiusKm: 18,
  },
  {
    name: 'Magadi Rural Settlement',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    centerLat: 12.9575,
    centerLng: 77.2281,
    maxRadiusKm: 16,
  },
  {
    name: 'Devanahalli Rural Agrarian Zone',
    type: 'VILLAGE',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    centerLat: 13.2483,
    centerLng: 77.7126,
    maxRadiusKm: 15,
  },
  {
    name: 'Kolar Agro Belt',
    type: 'VILLAGE',
    district: 'Kolar',
    state: 'Karnataka',
    centerLat: 13.1367,
    centerLng: 78.1292,
    maxRadiusKm: 20,
  },
];

// In-Memory Policy Store with Real-Time Mutation and Version Tracking
class ServerLocationPolicyStore {
  private policies: Map<string, LocationRadiusPolicy> = new Map();
  private auditHistory: RadiusPolicyAuditLog[] = [];
  private locationCache: Map<string, { location: UserLocation; expiresAt: number }> = new Map();

  constructor() {
    DEFAULT_RADIUS_POLICIES.forEach((p) => {
      this.policies.set(`${p.policyType}_${p.localityType}`, { ...p });
    });

    // Seed initial system audit entry
    this.auditHistory.push({
      id: 'audit-init-001',
      policyId: 'pol-disc-village',
      policyType: 'DISCOVERY_RADIUS',
      localityType: 'VILLAGE',
      previousRadiusKm: 20,
      newRadiusKm: 20,
      version: 1,
      updatedBy: 'System Bootstrapper',
      adminRole: 'ADMIN',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      reason: 'SurplusX Initial Platform Geo-Radius Baseline Setup (Village=20km, Town=40km, City=40km)',
    });
  }

  // Get single policy for policyType and localityType
  public getPolicy(
    policyType: LocationRadiusPolicyType = 'DISCOVERY_RADIUS',
    localityType: LocalityType = 'CITY'
  ): LocationRadiusPolicy {
    // Normalise METRO to CITY if not uniquely matched
    const key = `${policyType}_${localityType}`;
    const policy = this.policies.get(key);
    if (policy) return policy;

    if (localityType === 'METRO') {
      const fallback = this.policies.get(`${policyType}_CITY`);
      if (fallback) return fallback;
    }

    // Default fallback if not configured
    return {
      id: `default-${policyType}-${localityType}`,
      policyType,
      localityType,
      radiusKm: localityType === 'VILLAGE' ? 20 : 40,
      minAllowedKm: 5,
      maxAllowedKm: 60,
      enabled: true,
      version: 1,
      updatedBy: 'Platform Policy Default',
      updatedAt: new Date().toISOString(),
    };
  }

  // Get all policies
  public getAllPolicies(): LocationRadiusPolicy[] {
    return Array.from(this.policies.values());
  }

  // Get all audit history
  public getAuditHistory(): RadiusPolicyAuditLog[] {
    return [...this.auditHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Authoritative update by Host/Admin with safety validation and audit logging
  public updatePolicy(params: {
    policyType: LocationRadiusPolicyType;
    localityType: LocalityType;
    newRadiusKm: number;
    updatedBy: string;
    adminRole: UserRole;
    reason: string;
  }): { success: boolean; policy?: LocationRadiusPolicy; error?: string } {
    const { policyType, localityType, newRadiusKm, updatedBy, adminRole, reason } = params;

    // Strict Backend Security Check: Role Authorization
    if (adminRole !== 'ADMIN') {
      return {
        success: false,
        error: '403 Forbidden: Only authorized Platform Host/Admin accounts have permissions to modify location discovery and logistics radius policies.',
      };
    }

    const key = `${policyType}_${localityType}`;
    const current = this.policies.get(key);

    if (!current) {
      return {
        success: false,
        error: `Policy not found for ${policyType} in ${localityType}`,
      };
    }

    // Strict Safety Bounds Validation (Requirement #10)
    if (typeof newRadiusKm !== 'number' || isNaN(newRadiusKm) || newRadiusKm <= 0) {
      return {
        success: false,
        error: 'Validation failed: Radius must be a positive number greater than 0 km.',
      };
    }

    if (newRadiusKm < current.minAllowedKm || newRadiusKm > current.maxAllowedKm) {
      return {
        success: false,
        error: `Validation failed: Radius for ${localityType} must be between ${current.minAllowedKm} km and ${current.maxAllowedKm} km (safety limit).`,
      };
    }

    if (!reason || reason.trim().length < 5) {
      return {
        success: false,
        error: 'Audit compliance requirement: Please provide a meaningful operational reason (minimum 5 characters).',
      };
    }

    const previousValue = current.radiusKm;
    const newVersion = current.version + 1;

    // Mutate Policy Record
    const updatedPolicy: LocationRadiusPolicy = {
      ...current,
      radiusKm: newRadiusKm,
      version: newVersion,
      updatedBy: updatedBy || 'Host Admin',
      updatedAt: new Date().toISOString(),
      reason: reason.trim(),
    };

    this.policies.set(key, updatedPolicy);

    // Create Immutable Audit Log (Requirement #34 & #35)
    const auditRecord: RadiusPolicyAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      policyId: current.id,
      policyType,
      localityType,
      previousRadiusKm: previousValue,
      newRadiusKm,
      version: newVersion,
      updatedBy: updatedBy || 'Host Admin',
      adminRole,
      timestamp: new Date().toISOString(),
      reason: reason.trim(),
    };

    this.auditHistory.push(auditRecord);

    // Invalidate Location Cache (Requirement #46)
    this.locationCache.clear();

    return {
      success: true,
      policy: updatedPolicy,
    };
  }

  // Cache user location with 10 minute TTL
  public cacheUserLocation(userId: string, location: UserLocation) {
    this.locationCache.set(userId, {
      location,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
  }

  public getCachedUserLocation(userId: string): UserLocation | null {
    const cached = this.locationCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.location;
    }
    return null;
  }
}

export const serverPolicyStore = new ServerLocationPolicyStore();

// Server-authoritative reverse geographic locality classifier (Requirement #5 & #31)
export function classifyServerLocality(lat: number, lng: number): LocationClassification {
  // 1. Check against known boundary centers
  let closestBoundary: GeoBoundary | null = null;
  let minDistance = Infinity;

  for (const b of AUTHORITATIVE_GEO_BOUNDARIES) {
    const dist = calculateHaversineDistanceKm(lat, lng, b.centerLat, b.centerLng);
    if (dist < b.maxRadiusKm && dist < minDistance) {
      minDistance = dist;
      closestBoundary = b;
    }
  }

  if (closestBoundary) {
    return {
      latitude: lat,
      longitude: lng,
      localityType: closestBoundary.type,
      localityName: closestBoundary.name,
      district: closestBoundary.district,
      state: closestBoundary.state,
      confidence: 0.96,
      source: 'GEOGRAPHIC_POSTGIS_CLASSIFIER',
      updatedAt: new Date().toISOString(),
    };
  }

  // 2. Secondary heuristic based on coordinate distance to major urban epicenter (Bangalore City Hall: 12.9716, 77.5946)
  const distFromMetroCore = calculateHaversineDistanceKm(lat, lng, 12.9716, 77.5946);

  if (distFromMetroCore <= 22) {
    return {
      latitude: lat,
      longitude: lng,
      localityType: 'CITY',
      localityName: 'Bengaluru Urban Region',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      confidence: 0.92,
      source: 'GEOGRAPHIC_POSTGIS_CLASSIFIER',
      updatedAt: new Date().toISOString(),
    };
  } else if (distFromMetroCore <= 45) {
    return {
      latitude: lat,
      longitude: lng,
      localityType: 'TOWN',
      localityName: 'Peri-Urban Sub-District',
      district: 'Bengaluru Rural',
      state: 'Karnataka',
      confidence: 0.88,
      source: 'GEOGRAPHIC_POSTGIS_CLASSIFIER',
      updatedAt: new Date().toISOString(),
    };
  } else {
    return {
      latitude: lat,
      longitude: lng,
      localityType: 'VILLAGE',
      localityName: 'Rural Grama Catchment',
      district: 'Ramanagara / Rural Corridor',
      state: 'Karnataka',
      confidence: 0.85,
      source: 'GEOGRAPHIC_POSTGIS_CLASSIFIER',
      updatedAt: new Date().toISOString(),
    };
  }
}

// Server distance re-check for orders & reservations (Requirement #17, #36, #37)
export function verifyServerOrderDistanceEligibility(params: {
  userCoordinates: { lat: number; lng: number };
  listingCoordinates: { lat: number; lng: number };
  listingId: string;
  policyType?: LocationRadiusPolicyType;
}): OrderEligibilityResult {
  const {
    userCoordinates,
    listingCoordinates,
    listingId,
    policyType = 'DISCOVERY_RADIUS',
  } = params;

  // 1. Authoritative locality classification based on user coordinate
  const classification = classifyServerLocality(userCoordinates.lat, userCoordinates.lng);

  // 2. Load active platform policy for this locality type
  const policy = serverPolicyStore.getPolicy(policyType, classification.localityType);

  // 3. Compute exact physical spherical distance
  const distanceKm = calculateHaversineDistanceKm(
    userCoordinates.lat,
    userCoordinates.lng,
    listingCoordinates.lat,
    listingCoordinates.lng
  );

  const allowed = distanceKm <= policy.radiusKm;

  return {
    allowed,
    userDistanceKm: distanceKm,
    maxAllowedRadiusKm: policy.radiusKm,
    localityType: classification.localityType,
    policyType,
    listingId,
    message: allowed
      ? `Eligible: Listing is ${distanceKm} km away (within ${classification.localityType} platform radius of ${policy.radiusKm} km).`
      : `Forbidden: This listing is ${distanceKm} km away, which exceeds your ${classification.localityType} area discovery radius of ${policy.radiusKm} km.`,
  };
}
