import { useEffect } from 'react';
import { useSettings } from '@/lib/settings';

export function useSleepReminder() {
  const { settings } = useSettings();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkReminder = () => {
      if (!settings.sleepReminder) return;

      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const currentHour = now.getHours();

      // Check if it's morning (e.g. 6:00 - 11:00)
      if (currentHour >= 6 && currentHour <= 11) {
        // Check if we already notified today
        const lastNotified = localStorage.getItem('aegis.lastSleepReminder');
        const today = now.toDateString();

        if (lastNotified !== today) {
           new Notification('Good Morning!', {
             body: "Log your sleep for last night.",
             icon: '/apple-icon.png',
             tag: 'sleep-reminder'
           });
           
           localStorage.setItem('aegis.lastSleepReminder', today);
        }
      }
    };

    // Check on mount (and when settings change)
    checkReminder();

    // Check every 15 minutes (if app is left open)
    const interval = setInterval(checkReminder, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.sleepReminder]);
}
