import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/lib/settings';

export function useSessionTimers() {
  const { scheduleNotification, requestPermission } = useNotifications();
  const { settings } = useSettings();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);
  const [timerSoundsEnabled, setTimerSoundsEnabled] = useState(true);
  const [restEnabled, setRestEnabled] = useState(true);
  const [isRestComplete, setIsRestComplete] = useState(false);

  // Refs for accurate timing (background throttling protection)
  const workoutStartTimeRef = useRef<number | null>(null);
  const workoutBaseTimeRef = useRef<number>(0);
  
  const restTargetTimeRef = useRef<number | null>(null);

  // Audio refs
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);

  // Load timer preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedSounds = window.localStorage.getItem('super.timerSoundsEnabled');
      if (storedSounds !== null) {
        setTimerSoundsEnabled(storedSounds === 'true');
      }
      const storedRest = window.localStorage.getItem('super.restEnabled');
      if (storedRest !== null) {
        setRestEnabled(storedRest === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const syncElapsedSeconds = (seconds: number) => {
    setElapsedSeconds(seconds);
    workoutBaseTimeRef.current = seconds;
    if (!isPaused) {
        // Reset start time so next tick calculates diff from now relative to new base
        workoutStartTimeRef.current = Date.now();
    } else {
        workoutStartTimeRef.current = null;
    }
  };

  // Initialize audio elements
  useEffect(() => {
    if (countdownAudioRef.current) countdownAudioRef.current.load();
    if (completeAudioRef.current) completeAudioRef.current.load();
    
    // Create silent audio element for background keep-alive
    if (!silentAudioRef.current && typeof Audio !== 'undefined') {
      silentAudioRef.current = new Audio(
        'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjE1LjEwMgAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAP9LaW5mbwAAAA8AAAAEAAABIAAAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA//////////////////////////////////////////////////////////////////8AAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAAABMYXZjNTYuMTMuMTAwAAAAAAAAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAAABMYXZjNTYuMTMuMTAwAAAAAAAAAAAAAAD/84QAAAAAAAAAAAAAAAAAAAAAAABMYXZjNTYuMTMuMTAwAAAAAAAAAAAAAA==');
      silentAudioRef.current.loop = true;
    }

    const unlockAudio = async () => {
      if (audioUnlockedRef.current) return;
      try {
        // Request notification permission on first interaction if setting enabled
        if (settings.trainingReminders) {
            requestPermission();
        }

        const promises = [];
        if (countdownAudioRef.current) {
          countdownAudioRef.current.currentTime = 0;
          promises.push(countdownAudioRef.current.play().then(() => countdownAudioRef.current?.pause()));
        }
        if (silentAudioRef.current) {
           promises.push(silentAudioRef.current.play().then(() => silentAudioRef.current?.pause()));
        }
        await Promise.all(promises);
        
        audioUnlockedRef.current = true;
      } catch {
        // ignore
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, [requestPermission, settings.trainingReminders]);

  // Workout Timer
  useEffect(() => {
    if (isPaused) {
      workoutStartTimeRef.current = null;
      workoutBaseTimeRef.current = elapsedSeconds;
      return;
    }

    // Starting or Resuming
    if (workoutStartTimeRef.current === null) {
      workoutStartTimeRef.current = Date.now();
      workoutBaseTimeRef.current = elapsedSeconds;
    }

    const interval = setInterval(() => {
      if (workoutStartTimeRef.current === null) return;
      
      const now = Date.now();
      const diff = Math.floor((now - workoutStartTimeRef.current) / 1000);
      setElapsedSeconds(workoutBaseTimeRef.current + diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]); // Removed elapsedSeconds from dependency to avoid resetting timer logic constantly

  // Rest Timer
  useEffect(() => {
    if (!isResting || isPaused) {
      restTargetTimeRef.current = null;
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current.currentTime = 0;
      }
      return;
    }

    // Play silent audio to keep app active in background
    if (silentAudioRef.current && silentAudioRef.current.paused) {
        silentAudioRef.current.play().catch(() => {});
    }

    // Calculate target time if not set
    if (restTargetTimeRef.current === null) {
      restTargetTimeRef.current = Date.now() + restSecondsRemaining * 1000;
      
      // Schedule notification for when rest ends
      if (restSecondsRemaining > 0 && settings.trainingReminders) {
        scheduleNotification('Rest Complete', {
          body: 'Get back to work.',
          icon: '/apple-icon.png',
          tag: 'rest-timer'
        }, restSecondsRemaining * 1000);
      }
    }

    const interval = setInterval(() => {
      if (restTargetTimeRef.current === null) return;

      const now = Date.now();
      // Use ceil so 0.1s shows as 1s, and we hit 0 at the end
      const diff = Math.ceil((restTargetTimeRef.current - now) / 1000);
      
      // Update state
      // Prevent negative values flashing before cleanup
      const displayValue = Math.max(0, diff);
      setRestSecondsRemaining(displayValue);

      // Play countdown sound (check original diff for exact timing)
      if (diff === 3 && timerSoundsEnabled && countdownAudioRef.current) {
        try {
          const audio = countdownAudioRef.current;
          if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
                  audioUnlockedRef.current = false;
                }
                console.debug('Countdown audio playback failed:', err);
              });
            }
          }
        } catch (err) {
          console.debug('Countdown audio error:', err);
        }
      }
      
      if (diff <= 0) {
        clearInterval(interval);
        setIsResting(false);
        setIsRestComplete(true);
        restTargetTimeRef.current = null;
      }
    }, 200); // Check more frequently

    return () => clearInterval(interval);
  }, [isResting, isPaused, timerSoundsEnabled, scheduleNotification, settings.trainingReminders]); // Removed restSecondsRemaining to use it only for init

  return {
    elapsedSeconds,
    setElapsedSeconds,
    isPaused,
    setIsPaused,
    isResting,
    setIsResting,
    restSecondsRemaining,
    setRestSecondsRemaining,
    timerSoundsEnabled,
    setTimerSoundsEnabled,
    restEnabled,
    setRestEnabled,
    countdownAudioRef,
    completeAudioRef,
    isRestComplete,
    setIsRestComplete,
    syncElapsedSeconds,
  };
}

