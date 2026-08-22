import { useContext } from 'react';
import { TrackingContext } from '../context/trackingContext.js';

export function useBehaviorTracking() {
  const trackerRef = useContext(TrackingContext);
  return {
    trackEvent: (type, options) => trackerRef?.current?.trackEvent(type, options),
    getVisitorId: () => trackerRef?.current?.visitorId ?? null,
    getSessionId: () => trackerRef?.current?.sessionId ?? null,
  };
}
