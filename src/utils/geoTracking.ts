import { DeliveryState, DeliveryLocation, DeliveryEvent, DeliveryEventType } from '../types';

/**
 * Calculates Great-Circle distance between two coordinates using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { distanceKm: number; distanceMeters: number } {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMeters = Math.round(distanceKm * 1000);
  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    distanceMeters,
  };
}

/**
 * Evaluates whether driver coordinates fall within the geofence radius (default 200m)
 */
export function checkGeofence(
  driverLat: number,
  driverLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number = 200
): { isInside: boolean; distanceMeters: number } {
  const { distanceMeters } = calculateHaversineDistance(driverLat, driverLng, targetLat, targetLng);
  return {
    isInside: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}

/**
 * Anomaly detector for sudden impossible GPS jumps (e.g. >130 km/h or instant teleportation)
 */
export function validateGpsAnomaly(
  prevLocation: { lat: number; lng: number; recordedAt: string } | null,
  newLat: number,
  newLng: number,
  newRecordedAt: string,
  maxSpeedKmH: number = 130
): { isAnomaly: boolean; calculatedSpeedKmH: number; details?: string } {
  if (!prevLocation || typeof prevLocation.lat !== 'number' || typeof prevLocation.lng !== 'number') {
    return { isAnomaly: false, calculatedSpeedKmH: 0 };
  }

  const timeDiffSeconds = Math.max(
    1,
    (new Date(newRecordedAt).getTime() - new Date(prevLocation.recordedAt).getTime()) / 1000
  );

  const { distanceKm } = calculateHaversineDistance(
    prevLocation.lat,
    prevLocation.lng,
    newLat,
    newLng
  );

  const calculatedSpeedKmH = Math.round((distanceKm / (timeDiffSeconds / 3600)) * 10) / 10;

  if (calculatedSpeedKmH > maxSpeedKmH && distanceKm > 0.5) {
    return {
      isAnomaly: true,
      calculatedSpeedKmH,
      details: `Suspicious displacement: ${distanceKm}km moved in ${Math.round(timeDiffSeconds)}s (${calculatedSpeedKmH} km/h exceeds threshold ${maxSpeedKmH} km/h)`,
    };
  }

  return { isAnomaly: false, calculatedSpeedKmH };
}

/**
 * Valid delivery state transition graph
 */
const VALID_TRANSITIONS: Record<DeliveryState, DeliveryState[]> = {
  ASSIGNED: ['TRIP_STARTED', 'CANCELLED', 'REASSIGNED'],
  TRIP_STARTED: ['EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'CANCELLED', 'REASSIGNED'],
  EN_ROUTE_TO_PICKUP: ['ARRIVED_AT_PICKUP', 'CANCELLED', 'REASSIGNED'],
  ARRIVED_AT_PICKUP: ['PICKUP_VERIFIED', 'CANCELLED', 'REASSIGNED'],
  PICKUP_VERIFIED: ['COLLECTED', 'CANCELLED'],
  COLLECTED: ['EN_ROUTE_TO_DROP', 'ARRIVED_AT_DROP', 'CANCELLED'],
  EN_ROUTE_TO_DROP: ['ARRIVED_AT_DROP', 'CANCELLED'],
  ARRIVED_AT_DROP: ['DELIVERY_VERIFIED', 'CANCELLED'],
  DELIVERY_VERIFIED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  REASSIGNED: ['ASSIGNED', 'TRIP_STARTED'],
};

/**
 * Validates delivery state change
 */
export function isValidDeliveryTransition(current: DeliveryState, target: DeliveryState): boolean {
  const allowed = VALID_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Calculates dynamic ETA in minutes with city traffic coefficient
 */
export function calculateEtaMinutes(
  distanceKm: number,
  averageSpeedKmH: number = 24,
  trafficMultiplier: number = 1.25
): number {
  if (distanceKm <= 0.05) return 1;
  const rawHours = (distanceKm / Math.max(averageSpeedKmH, 10)) * trafficMultiplier;
  return Math.max(1, Math.round(rawHours * 60));
}

/**
 * Formats relative time elapsed
 */
export function formatTimeAgo(timestamp: string | number): string {
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const elapsedSec = Math.max(0, Math.floor((Date.now() - time) / 1000));

  if (elapsedSec < 5) return 'Just now (Live)';
  if (elapsedSec < 60) return `${elapsedSec}s ago`;
  const mins = Math.floor(elapsedSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}
