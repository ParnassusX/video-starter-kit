'use client';

import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Set up background sync for offline edits
          if ('sync' in registration) {
            // Request background sync permission if needed
            const status = await navigator.permissions.query({
              name: 'periodic-background-sync',
            });
            
            if (status.state === 'granted') {
              await registration.periodicSync.register('sync-video-edits', {
                minInterval: 60 * 60 * 1000, // 1 hour
              });
            }
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerServiceWorker();
    }
  }, []);

  return null;
}