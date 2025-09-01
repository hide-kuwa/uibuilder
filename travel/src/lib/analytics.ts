import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (!analytics) return;
  try {
    logEvent(analytics, eventName, params);
  } catch (e) {
    console.error('Analytics error:', e);
  }
};
