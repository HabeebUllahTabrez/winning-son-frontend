// src/lib/mixpanel.ts
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";
const isDevelopment = process.env.NODE_ENV === 'development';

let isInitialized = false;

// Generate an anonymous user ID hash from email (one-way hash for privacy)
const generateAnonymousId = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16); // Use first 16 chars for shorter ID
};

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

// Identify user with anonymous ID
export const identifyUser = async (email: string): Promise<void> => {
  if (isDevelopment) return;
  if (typeof window !== 'undefined' && isInitialized) {
    const anonymousId = await generateAnonymousId(email);
    mixpanel.identify(anonymousId);
    // No email or PII stored, just mark as registered user
    mixpanel.people.set({
      user_type: 'registered',
      account_created: new Date().toISOString()
    });
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
