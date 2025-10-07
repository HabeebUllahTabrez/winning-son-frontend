// src/lib/mixpanel.ts
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";

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
  if (typeof window !== 'undefined' && !isInitialized && MIXPANEL_TOKEN) {
    try {
      console.log('[Mixpanel] Initializing...');
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: true,
        track_pageview: false,
        persistence: 'localStorage',
      });
      isInitialized = true;
      console.log('[Mixpanel] Initialized successfully');
    } catch (error) {
      console.error('[Mixpanel] Failed to initialize:', error);
    }
  } else if (!MIXPANEL_TOKEN) {
    console.log('[Mixpanel] No token - skipping initialization');
  }
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>): Promise<void> => {
  return new Promise((resolve) => {
    if (!MIXPANEL_TOKEN) {
      resolve();
      return;
    }

    if (typeof window !== 'undefined' && isInitialized) {
      try {
        console.log('[Mixpanel] Tracking event:', eventName, properties);
        mixpanel.track(eventName, properties, {}, () => {
          console.log('[Mixpanel] Event tracked successfully');
          resolve();
        });
        // Also resolve after timeout as fallback
        setTimeout(resolve, 1000);
      } catch (error) {
        console.error('[Mixpanel] Track error:', error);
        resolve();
      }
    } else {
      console.warn('[Mixpanel] Cannot track - not initialized:', { isInitialized, eventName });
      resolve();
    }
  });
};

// Track page views
export const trackPageView = (pageName: string, properties?: Record<string, unknown>): void => {
  if (!MIXPANEL_TOKEN) return;

  if (typeof window !== 'undefined' && isInitialized) {
    try {
      console.log('[Mixpanel] Tracking page view:', pageName);
      mixpanel.track('Page Viewed', { page: pageName, ...properties });
    } catch (error) {
      console.error('[Mixpanel] Track page view error:', error);
    }
  }
};

// Identify user with anonymous ID
export const identifyUser = async (email: string): Promise<void> => {
  if (!MIXPANEL_TOKEN) return;

  if (typeof window !== 'undefined' && isInitialized) {
    try {
      const anonymousId = await generateAnonymousId(email);
      console.log('[Mixpanel] Identifying user:', anonymousId);
      mixpanel.identify(anonymousId);
      mixpanel.people.set({
        user_type: 'registered',
        account_created: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Mixpanel] Identify error:', error);
    }
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, unknown>): void => {
  if (!MIXPANEL_TOKEN) return;

  if (typeof window !== 'undefined' && isInitialized) {
    try {
      mixpanel.people.set(properties);
    } catch (error) {
      console.error('[Mixpanel] Set properties error:', error);
    }
  }
};

// Reset user (on logout)
export const resetMixpanel = (): void => {
  if (!MIXPANEL_TOKEN) return;

  if (typeof window !== 'undefined' && isInitialized) {
    try {
      console.log('[Mixpanel] Resetting user');
      mixpanel.reset();
    } catch (error) {
      console.error('[Mixpanel] Reset error:', error);
    }
  }
};

// Alias user (for transitioning anonymous to identified)
export const aliasUser = (newId: string): void => {
  if (!MIXPANEL_TOKEN) return;

  if (typeof window !== 'undefined' && isInitialized) {
    try {
      mixpanel.alias(newId);
    } catch (error) {
      console.error('[Mixpanel] Alias error:', error);
    }
  }
};

// Helper function to ensure events are tracked before navigation
export const trackEventBeforeNavigation = async (
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> => {
  await trackEvent(eventName, properties);
  // Small additional delay to ensure the request is sent
  await new Promise(resolve => setTimeout(resolve, 100));
};

export default mixpanel;
