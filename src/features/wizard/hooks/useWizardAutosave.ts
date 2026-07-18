import { useEffect, useRef, useState } from 'react';
import { useWizardStore } from '../store/wizardStore';

// Debounce delay in milliseconds before the save is considered complete.
const DEBOUNCE_DELAY_MS = 800;

/**
 * Subscribes to wizard store changes and exposes an `isSaving` flag that turns
 * true immediately upon any state change and reverts to false after the debounce
 * window elapses. The actual state persistence is handled by zustand's own
 * `persist` middleware — this hook only manages the visual saving indicator.
 */
export function useWizardAutosave(): { isSaving: boolean } {
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Subscribe to any store change. The selector returning the whole state
    // object triggers on every mutation.
    const unsubscribe = useWizardStore.subscribe(() => {
      // Signal that a save is in progress immediately.
      setIsSaving(true);

      // Clear any pending debounce timer to reset the window.
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      // After the debounce window, mark saving as done.
      timerRef.current = setTimeout(() => {
        setIsSaving(false);
        timerRef.current = null;
      }, DEBOUNCE_DELAY_MS);
    });

    return () => {
      // Clean up subscription and any pending timer on unmount.
      unsubscribe();
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isSaving };
}
