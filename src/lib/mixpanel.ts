// src/lib/mixpanel.ts
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";
const isDevelopment = process.env.NODE_ENV === 'development';

let isInitialized = false;

export const initMixpanel = (): void => {
  if (typeof window !== 'undefined' && !isInitialized && !isDevelopment) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: false,
      track_pageview: true,
      persistence: 'localStorage',
    });
    isInitialized = true;
  }
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>): void => {
  if (isDevelopment) return;
  if (typeof window !== 'undefined' && isInitialized) {
    mixpanel.track(eventName, properties);
  }
};

// Track page views
export const trackPageView = (pageName: string, properties?: Record<string, unknown>): void => {
  if (isDevelopment) return;
  if (typeof window !== 'undefined' && isInitialized) {
    mixpanel.track_pageview({ page: pageName, ...properties });
  }
};

// Identify user
export const identifyUser = (userId: string, userProperties?: Record<string, unknown>): void => {
  if (isDevelopment) return;
  if (typeof window !== 'undefined' && isInitialized) {
    mixpanel.identify(userId);
    if (userProperties) {
      mixpanel.people.set(userProperties);
    }
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, unknown>): void => {
  if (isDevelopment) return;
  if (typeof window !== 'undefined' && isInitialized) {
    mixpanel.people.set(properties);
  }
};

// Reset user (on logout)
export const resetMixpanel = (): void => {
  if (isDevelopment) return;
  if (typeof window !== 'undefined' && isInitialized) {
    mixpanel.reset();
  }
};

// Alias user (for transitioning anonymous to identified)
export const aliasUser = (newId: string): void => {
  if (isDevelopment) return;
  if (typeof window !== 'undefined' && isInitialized) {
    mixpanel.alias(newId);
  }
};

export default mixpanel;
