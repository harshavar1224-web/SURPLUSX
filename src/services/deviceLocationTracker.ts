/**
 * SurplusX Real Device Hardware Location Tracker
 * 
 * Interacts directly with HTML5 Geolocation API on the NGO/Volunteer device.
 * NO simulated data. NO random movements. NO fake coordinates.
 */

export interface DeviceGpsState {
  isTracking: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null; // meters
  speed: number | null; // km/h
  heading: number | null; // degrees
  timestamp: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isLowAccuracy: boolean; // >35m accuracy warning
  error: string | null;
  historyQueue: Array<{
    latitude: number;
    longitude: number;
    accuracy: number;
    speed?: number;
    heading?: number;
    timestamp: string;
  }>;
}

type LocationUpdateCallback = (state: DeviceGpsState) => void;

class DeviceLocationTracker {
  private watchId: number | null = null;
  private subscribers: Set<LocationUpdateCallback> = new Set();
  private activeDeliveryId: string | null = null;
  private ngoUserId: string | null = null;
  private lastSentTime: number = 0;
  private lastLat: number | null = null;
  private lastLng: number | null = null;

  // Minimum threshold to prevent spamming backend (5 meters or 3 seconds)
  private readonly MIN_MOVEMENT_METERS = 5;
  private readonly MIN_UPDATE_INTERVAL_MS = 3000;

  private state: DeviceGpsState = {
    isTracking: false,
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: null,
    permissionStatus: typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'prompt' : 'unsupported',
    isLowAccuracy: false,
    error: null,
    historyQueue: [],
  };

  constructor() {
    this.checkPermission();
  }

  private async checkPermission() {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        this.state.permissionStatus = status.state as any;
        status.onchange = () => {
          this.state.permissionStatus = status.state as any;
          this.notify();
        };
      } catch (e) {
        // Permissions API not fully supported on some mobile webviews
      }
    }
  }

  public getState(): DeviceGpsState {
    return { ...this.state };
  }

  public subscribe(callback: LocationUpdateCallback): () => void {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.subscribers.forEach((cb) => cb(currentState));
  }

  public async startTracking(deliveryId: string, ngoUserId?: string): Promise<{ success: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      this.state.permissionStatus = 'unsupported';
      this.state.error = 'Hardware GPS Geolocation is not supported on this device/browser.';
      this.notify();
      return { success: false, error: this.state.error };
    }

    this.activeDeliveryId = deliveryId;
    this.ngoUserId = ngoUserId || null;
    this.state.error = null;

    return new Promise((resolve) => {
      // High-accuracy hardware GPS watcher
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.handlePositionUpdate(position);
          if (!this.state.isTracking) {
            this.state.isTracking = true;
            this.state.permissionStatus = 'granted';
            this.notify();
            resolve({ success: true });
          }
        },
        (error) => {
          let errorMsg = 'Unknown GPS Error';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission is required for live delivery tracking.';
            this.state.permissionStatus = 'denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'GPS satellite position unavailable. Move to open area.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'GPS location request timed out.';
          }

          this.state.error = errorMsg;
          this.state.isTracking = false;
          this.notify();
          resolve({ success: false, error: errorMsg });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }

  public stopTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.state.isTracking = false;
    this.activeDeliveryId = null;
    this.notify();
  }

  private handlePositionUpdate(pos: GeolocationPosition) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;
    const speedKmh = pos.coords.speed !== null && pos.coords.speed !== undefined
      ? pos.coords.speed * 3.6
      : 0;
    const heading = pos.coords.heading !== null && pos.coords.heading !== undefined
      ? pos.coords.heading
      : 0;
    const timestamp = new Date(pos.timestamp).toISOString();

    const isLowAccuracy = accuracy > 35;

    this.state = {
      ...this.state,
      isTracking: true,
      latitude: lat,
      longitude: lng,
      accuracy,
      speed: speedKmh,
      heading,
      timestamp,
      isLowAccuracy,
      error: isLowAccuracy ? 'Low GPS Accuracy: device accuracy > 35m' : null,
      historyQueue: [
        ...this.state.historyQueue.slice(-50), // keep latest 50
        { latitude: lat, longitude: lng, accuracy, speed: speedKmh, heading, timestamp },
      ],
    };

    this.notify();

    // Check throttle before dispatching to backend
    const now = Date.now();
    const timeDelta = now - this.lastSentTime;

    let shouldSend = false;
    if (this.lastLat === null || this.lastLng === null) {
      shouldSend = true;
    } else {
      const distanceMovedMeters = this.calculateDistanceMeters(this.lastLat, this.lastLng, lat, lng);
      if (distanceMovedMeters >= this.MIN_MOVEMENT_METERS && timeDelta >= this.MIN_UPDATE_INTERVAL_MS) {
        shouldSend = true;
      } else if (timeDelta >= 10000) {
        // Keepalive every 10s even if stationary
        shouldSend = true;
      }
    }

    if (shouldSend && this.activeDeliveryId) {
      this.lastSentTime = now;
      this.lastLat = lat;
      this.lastLng = lng;
      this.sendLocationToBackend(this.activeDeliveryId, {
        latitude: lat,
        longitude: lng,
        accuracy,
        speed: speedKmh,
        heading,
        timestamp,
      });
    }
  }

  private async sendLocationToBackend(
    deliveryId: string,
    payload: {
      latitude: number;
      longitude: number;
      accuracy: number;
      speed?: number;
      heading?: number;
      timestamp: string;
    }
  ) {
    try {
      await fetch(`/api/deliveries/${deliveryId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          ngoUserId: this.ngoUserId,
        }),
      });
    } catch (e) {
      console.warn('Could not post location update to server (will retry on next fix):', e);
    }
  }

  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const deviceLocationTracker = new DeviceLocationTracker();
