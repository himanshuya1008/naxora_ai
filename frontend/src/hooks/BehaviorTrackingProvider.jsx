import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { BehaviorTracker } from '../services/tracking/behaviorTracker.js';
import { TrackingContext } from '../context/trackingContext.js';

/**
 * Mounted once at the marketing site root (see layouts/MarketingLayout.jsx).
 * Instantiates the existing, already-built BehaviorTracker (zero changes to
 * that class) using the public tracking API key, and exposes trackEvent/
 * visitorId through context (see hooks/useBehaviorTracking.js) so any page/
 * component can record a signal without each one re-instantiating its own
 * tracker.
 */
export function BehaviorTrackingProvider({ children }) {
  const trackerRef = useRef(null);
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TRACKING_API_KEY;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiKey || !apiBaseUrl) return undefined;

    const tracker = new BehaviorTracker({ apiKey, apiBaseUrl });
    trackerRef.current = tracker;
    // Tracking is best-effort — a failed init (e.g. backend unreachable)
    // must never break the marketing site itself.
    tracker.init().catch(() => {});

    return () => tracker.destroy();
  }, []);

  // BehaviorTracker.init() fires one PAGE_VIEW on mount; client-side route
  // changes in this SPA never re-run init(), so each subsequent navigation
  // needs its own explicit PAGE_VIEW.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackerRef.current?.trackEvent('PAGE_VIEW', { page: location.pathname });
  }, [location.pathname]);

  return <TrackingContext.Provider value={trackerRef}>{children}</TrackingContext.Provider>;
}
