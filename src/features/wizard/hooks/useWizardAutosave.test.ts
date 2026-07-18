import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizardStore } from '../store/wizardStore';
import { useWizardAutosave } from './useWizardAutosave';

// Each test gets a clean store and fake timers to control debounce timing precisely.
beforeEach(() => {
  useWizardStore.getState().reset();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe('useWizardAutosave', () => {
  it('should expose isSaving as false on initial mount', () => {
    const { result } = renderHook(() => useWizardAutosave());
    expect(result.current.isSaving).toBe(false);
  });

  it('should set isSaving to true immediately when store changes', async () => {
    const { result } = renderHook(() => useWizardAutosave());

    act(() => {
      useWizardStore.getState().setRecoveryEmail('test@example.com');
    });

    // Before debounce fires, saving flag should be true.
    expect(result.current.isSaving).toBe(true);
  });

  it('should set isSaving back to false after debounce delay', async () => {
    const { result } = renderHook(() => useWizardAutosave());

    act(() => {
      useWizardStore.getState().setRecoveryEmail('test@example.com');
    });

    expect(result.current.isSaving).toBe(true);

    // Advance time past the debounce window (800ms).
    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(result.current.isSaving).toBe(false);
  });

  it('should reset the debounce timer if the store changes again within the window', async () => {
    const { result } = renderHook(() => useWizardAutosave());

    // First change.
    act(() => {
      useWizardStore.getState().setRecoveryEmail('first@example.com');
    });

    // Advance only halfway into the debounce window.
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Second change resets the timer.
    act(() => {
      useWizardStore.getState().setRecoveryEmail('second@example.com');
    });

    // Advance another 400ms — total 800ms since first change but only 400ms since second.
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Should still be saving because the debounce was reset.
    expect(result.current.isSaving).toBe(true);

    // Advance past the debounce after the second change.
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isSaving).toBe(false);
  });

  it('should persist the latest store snapshot to localStorage after debounce fires', async () => {
    renderHook(() => useWizardAutosave());

    act(() => {
      useWizardStore.getState().setRecoveryEmail('persist@example.com');
    });

    act(() => {
      vi.advanceTimersByTime(900);
    });

    // The wizard store itself uses zustand/persist under the key 'enlaco-wizard-state'.
    // Our hook should not create a separate key — it relies on the store's own persist middleware.
    const stored = localStorage.getItem('enlaco-wizard-state');
    expect(stored).toBeTruthy();
    expect(stored).toContain('persist@example.com');
  });

  it('should clean up the debounce timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = renderHook(() => useWizardAutosave());

    act(() => {
      useWizardStore.getState().setRecoveryEmail('cleanup@example.com');
    });

    unmount();

    // clearTimeout must be called during cleanup to avoid memory leaks.
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
