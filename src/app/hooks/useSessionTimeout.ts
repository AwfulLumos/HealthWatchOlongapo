import { useEffect, useCallback, useRef, useState } from 'react';
import { updateLastActivity, getLastActivity, clearSessionActivity } from '../utils/security';

interface UseSessionTimeoutOptions {
  timeoutMs?: number;          // Session timeout duration (default: 30 minutes)
  warningMs?: number;          // Warning before timeout (default: 5 minutes)
  onTimeout: () => void;       // Callback when session times out
  onWarning?: () => void;      // Callback when warning threshold reached
  enabled?: boolean;           // Whether timeout is enabled
}

interface SessionTimeoutState {
  isWarning: boolean;
  remainingTime: number;
  lastActivity: Date;
}

/**
 * Hook to manage session timeout and user activity tracking
 * Automatically logs out user after period of inactivity
 */
export function useSessionTimeout({
  timeoutMs = 30 * 60 * 1000,  // 30 minutes default
  warningMs = 5 * 60 * 1000,   // 5 minutes warning
  onTimeout,
  onWarning,
  enabled = true,
}: UseSessionTimeoutOptions) {
  const [state, setState] = useState<SessionTimeoutState>({
    isWarning: false,
    remainingTime: timeoutMs,
    lastActivity: new Date(getLastActivity()),
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  const onWarningRef = useRef(onWarning);

  // Keep refs updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    onWarningRef.current = onWarning;
  }, [onTimeout, onWarning]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Reset session timer
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    clearTimers();
    updateLastActivity();

    const now = Date.now();
    setState({
      isWarning: false,
      remainingTime: timeoutMs,
      lastActivity: new Date(now),
    });

    // Set warning timer
    if (onWarningRef.current && warningMs < timeoutMs) {
      warningRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, isWarning: true }));
        onWarningRef.current?.();
      }, timeoutMs - warningMs);
    }

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      clearSessionActivity();
      onTimeoutRef.current();
    }, timeoutMs);

    // Update remaining time every second during warning period
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - now;
      const remaining = Math.max(0, timeoutMs - elapsed);
      setState(prev => ({ ...prev, remainingTime: remaining }));

      if (remaining <= 0) {
        clearTimers();
      }
    }, 1000);
  }, [enabled, timeoutMs, warningMs, clearTimers]);

  // Extend session (reset the timer)
  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (!enabled) return;
    
    // Only reset if not in warning state (to avoid interrupting warning)
    // If in warning, user should explicitly click to extend
    if (!state.isWarning) {
      updateLastActivity();
    }
  }, [enabled, state.isWarning]);

  // Set up activity listeners
  useEffect(() => {
    if (!enabled) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, handleActivity]);

  // Initialize timer only once
  useEffect(() => {
    if (!enabled) return;

    // Check for existing timeout on mount
    const lastActivity = getLastActivity();
    const elapsed = Date.now() - lastActivity;

    if (elapsed >= timeoutMs) {
      // Already timed out
      onTimeoutRef.current();
      return;
    } else if (elapsed >= timeoutMs - warningMs) {
      // In warning period
      setState({ 
        isWarning: true,
        remainingTime: timeoutMs - elapsed,
        lastActivity: new Date(lastActivity),
      });
      if (onWarningRef.current) onWarningRef.current();
    }

    // Initialize timer
    resetTimer();

    return () => {
      clearTimers();
    };
  }, []); // Only run once on mount

  return {
    isWarning: state.isWarning,
    remainingTime: state.remainingTime,
    remainingSeconds: Math.ceil(state.remainingTime / 1000),
    remainingMinutes: Math.ceil(state.remainingTime / 60000),
    lastActivity: state.lastActivity,
    extendSession,
    resetTimer,
  };
}
