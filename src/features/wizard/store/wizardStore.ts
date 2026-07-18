import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryChannel, ExclusionRule, EventDetails, Participant } from '../../../domain/types';

interface WizardState {
  currentStep: number;
  participants: Participant[];
  exclusionRules: ExclusionRule[];
  organizerBlind: boolean;
  recoveryEmail: string;
  eventDetails: Required<EventDetails>;
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  addParticipant: (displayName: string, channels: DeliveryChannel[]) => void;
  updateParticipant: (id: string, displayName: string, channels: DeliveryChannel[]) => void;
  removeParticipant: (id: string) => void;
  addExclusionRule: (participantA: string, participantB: string) => void;
  removeExclusionRule: (participantA: string, participantB: string) => void;
  setEventDetails: (details: Partial<Required<EventDetails>>) => void;
  setOrganizerBlind: (value: boolean) => void;
  setRecoveryEmail: (email: string) => void;
  reset: () => void;
}

const DEFAULT_EVENT_DETAILS: Required<EventDetails> = {
  eventName: '',
  eventDate: '',
  suggestedValue: '',
  organizerMessage: '',
};

const DEFAULT_STATE = {
  currentStep: 0,
  participants: [] as Participant[],
  exclusionRules: [] as ExclusionRule[],
  organizerBlind: true,
  recoveryEmail: '',
  eventDetails: DEFAULT_EVENT_DETAILS,
};

// Checks if an exclusion rule between two participants already exists (bidirectional).
const ruleExists = (rules: ExclusionRule[], a: string, b: string): boolean =>
  rules.some(
    (r) => (r.participantA === a && r.participantB === b) || (r.participantA === b && r.participantB === a)
  );

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      nextStep: () =>
        set((s) => ({ currentStep: Math.min(s.currentStep + 1, 3) })),

      prevStep: () =>
        set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      addParticipant: (displayName, channels) => {
        // Each participant gets a unique ID derived from timestamp + random suffix.
        const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({ participants: [...s.participants, { id, displayName, channels }] }));
      },

      updateParticipant: (id, displayName, channels) =>
        set((s) => ({
          participants: s.participants.map((p) =>
            p.id === id ? { ...p, displayName, channels } : p
          ),
        })),

      removeParticipant: (id) =>
        set((s) => ({
          participants: s.participants.filter((p) => p.id !== id),
          // Automatically remove any exclusion rules that referenced this participant.
          exclusionRules: s.exclusionRules.filter(
            (r) => r.participantA !== id && r.participantB !== id
          ),
        })),

      addExclusionRule: (participantA, participantB) => {
        const rules = get().exclusionRules;
        if (ruleExists(rules, participantA, participantB)) return;
        set((s) => ({ exclusionRules: [...s.exclusionRules, { participantA, participantB }] }));
      },

      removeExclusionRule: (participantA, participantB) =>
        set((s) => ({
          exclusionRules: s.exclusionRules.filter(
            (r) =>
              !(
                (r.participantA === participantA && r.participantB === participantB) ||
                (r.participantA === participantB && r.participantB === participantA)
              )
          ),
        })),

      setEventDetails: (details) =>
        set((s) => ({ eventDetails: { ...s.eventDetails, ...details } })),

      setOrganizerBlind: (value) => set({ organizerBlind: value }),

      setRecoveryEmail: (email) => set({ recoveryEmail: email }),

      reset: () => set({ ...DEFAULT_STATE, eventDetails: { ...DEFAULT_EVENT_DETAILS } }),
    }),
    {
      name: 'enlaco-wizard-state', // localStorage key
    }
  )
);
