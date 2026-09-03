/**
 * Mappls Client SDK Loader & API Service Helper
 * 
 * Provides client helpers for Mappls Web SDK, reverse geocoding, and routing.
 * Strictly adheres to real Mappls APIs without fake coordinate or address fallbacks.
 */

export interface MapplsConfig {
  hasToken: boolean;
  mapKey: string;
  isConfigured: boolean;
}

export interface MapplsGeocodeResult {
  success: boolean;
  formattedAddress?: string;
  details?: any;
  error?: string;
  message?: string;
}

export interface MapplsRouteResult {
  success: boolean;
  distanceKm?: number;
  durationMinutes?: number;
  geometry?: Array<[number, number]>;
  error?: string;
  message?: string;
}

class MapplsClient {
  private configCache: MapplsConfig | null = null;
  private sdkLoadingPromise: Promise<boolean> | null = null;

  public async getConfig(): Promise<MapplsConfig> {
    if (this.configCache) return this.configCache;
    try {
      const res = await fetch('/api/mappls/config');
      const data = await res.json();
      this.configCache = data;
      return data;
    } catch (e) {
      return {
        hasToken: false,
        mapKey: '',
        isConfigured: false,
      };
    }
  }

  /**
   * Dynamically loads the official Mappls Web Maps SDK v3.0 script into the DOM.
   */
  public async loadMapplsSdk(mapKey?: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if ((window as any).mappls && (window as any).mappls.Map) {
      return true;
    }

    if (this.sdkLoadingPromise) {
      return this.sdkLoadingPromise;
    }

    this.sdkLoadingPromise = (async () => {
      let keyToUse = mapKey;
      if (!keyToUse) {
        const config = await this.getConfig();
        keyToUse = config.mapKey;
      }

      if (!keyToUse) {
        console.warn('[Mappls SDK] MAPPLS_MAP_KEY not configured.');
        return false;
      }

      return new Promise<boolean>((resolve) => {
        // Check if script element already exists
        const existingScript = document.getElementById('mappls-web-sdk-script');
        if (existingScript) {
          if ((window as any).mappls) {
            resolve(true);
            return;
          }
          existingScript.addEventListener('load', () => resolve(true));
          existingScript.addEventListener('error', () => resolve(false));
          return;
        }

        const script = document.createElement('script');
        script.id = 'mappls-web-sdk-script';
        script.src = `https://apis.mappls.com/advancedmaps/api/${keyToUse}/map_sdk?v=3.0&layer=vector`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('[Mappls SDK] Official Web Maps SDK loaded successfully.');
          resolve(true);
        };

        script.onerror = (err) => {
          console.error('[Mappls SDK] Failed to load official Mappls SDK script:', err);
          resolve(false);
        };

        document.head.appendChild(script);
      });
    })();

    return this.sdkLoadingPromise;
  }

  public async reverseGeocode(lat: number, lng: number): Promise<MapplsGeocodeResult> {
    try {
      const res = await fetch(`/api/mappls/geocode/reverse?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (res.ok && data.success && data.formattedAddress) {
        return {
          success: true,
          formattedAddress: data.formattedAddress,
          details: data.details,
        };
      }
      return {
        success: false,
        error: data.error || 'MAPPLS_UNAVAILABLE',
        message: data.message || 'Address temporarily unavailable.',
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'MAPPLS_UNAVAILABLE',
        message: 'Address temporarily unavailable.',
      };
    }
  }

  public async getRoute(
    start: { lat: number; lng: number },
    dest: { lat: number; lng: number }
  ): Promise<MapplsRouteResult> {
    try {
      const startLat = start?.lat ?? 12.9716;
      const startLng = start?.lng ?? 77.5946;
      const destLat = dest?.lat ?? 12.9716;
      const destLng = dest?.lng ?? 77.5946;
      const url = `/api/mappls/routing?startLat=${startLat}&startLng=${startLng}&destLat=${destLat}&destLng=${destLng}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          distanceKm: data.distanceKm || 0,
          durationMinutes: data.durationMinutes || 0,
          geometry: data.geometry || [],
        };
      }
      return {
        success: false,
        error: data.error || 'MAPPLS_UNAVAILABLE',
        message: data.message || 'Unable to calculate route.',
      };
    } catch (e) {
      return {
        success: false,
        error: 'MAPPLS_UNAVAILABLE',
        message: 'Unable to calculate route.',
      };
    }
  }
}

export const mapplsClient = new MapplsClient();

