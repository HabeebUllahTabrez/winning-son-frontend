// src/components/MixpanelProvider.tsx
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initMixpanel, trackPageView } from '@/lib/mixpanel';

export default function MixpanelProvider() {
  const pathname = usePathname();

  // Initialize Mixpanel on mount
  useEffect(() => {
    initMixpanel();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
