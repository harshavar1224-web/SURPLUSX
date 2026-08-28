import {
  LocalityType,
  UserLocation,
  SurplusListing,
  LocationRadiusPolicy,
  OrderEligibilityResult,
} from '../types';
import { LocationSearchResult } from '../server/locationEngine';

// ============================================================================
// LOCATION SERVICE CLIENT ABSTRACTION (Specification #42 & #43)
// ============================================================================

export class LocationService {
  /**
   * Request live device coordinates using navigator.geolocation
   * (Specification #1, #17)
   */
  public static async detectCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  }> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }

  /**
   * Reverse geocodes coordinates into complete structured Indian address
   * (Specification #4, #7, #8-11, #35)
   */
  public static async reverseGeocode(
    lat: number,
    lng: number,
    accuracy = 15
  ): Promise<UserLocation> {
    const response = await fetch(
      `/api/location/reverse-geocode?lat=${lat}&lng=${lng}&accuracy=${accuracy}`
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reverse geocode coordinates');
    }

    const data = await response.json();
    return data.location;
  }

  /**
   * Search village, town, city, district or 6-digit PIN code across India
   * (Specification #18, #19, #20)
   */
  public static async searchLocation(query: string): Promise<LocationSearchResult[]> {
    const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search locations');
    }
    const data = await response.json();
    return data.results || [];
  }

  /**
   * Fetch active platform radius policy
   * (Specification #12, #32)
   */
  public static async getPolicies(): Promise<LocationRadiusPolicy[]> {
    const response = await fetch('/api/location/policy');
    if (!response.ok) {
      throw new Error('Failed to fetch platform location policies');
    }
    const data = await response.json();
    return data.policies || [];
  }

  /**
   * Validate coordinates are within India service area
   * (Specification #3)
   */
  public static validateLocation(
    lat: number,
    lng: number
  ): { isValid: boolean; reason?: string } {
    const minLat = 6.5;
    const maxLat = 37.5;
    const minLng = 68.0;
    const maxLng = 97.5;

    if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
      return {
        isValid: false,
        reason: 'SurplusX is currently available only in supported areas of India.',
      };
    }

    return { isValid: true };
  }

  /**
   * Compute geographic Haversine distance in kilometers
   */
  public static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
}
