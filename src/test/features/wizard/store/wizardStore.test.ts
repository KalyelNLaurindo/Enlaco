import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore } from '../../../../features/wizard/store/wizardStore';

describe('Wizard Zustand Store', () => {
  beforeEach(() => {
    // Reset store state before each test run.
    useWizardStore.getState().reset();
  });

  it('should initialize with default values', () => {
    const state = useWizardStore.getState();
    expect(state.currentStep).toBe(0);
    expect(state.participants).toEqual([]);
    expect(state.exclusionRules).toEqual([]);
    expect(state.organizerBlind).toBe(true);
    expect(state.recoveryEmail).toBe('');
    expect(state.eventDetails).toEqual({
      eventName: '',
      eventDate: '',
      suggestedValue: '',
      organizerMessage: '',
    });
  });

  it('should manage wizard step navigation', () => {
    const store = useWizardStore.getState();
    expect(store.currentStep).toBe(0);

    store.nextStep();
    expect(useWizardStore.getState().currentStep).toBe(1);

    useWizardStore.getState().prevStep();
    expect(useWizardStore.getState().currentStep).toBe(0);
  });

  it('should allow adding, updating and removing participants', () => {
    const store = useWizardStore.getState();

    // Add participant.
    store.addParticipant('Carlos', [{ type: 'EMAIL', value: 'carlos@example.com' }]);
    let participants = useWizardStore.getState().participants;
    expect(participants.length).toBe(1);
    expect(participants[0].displayName).toBe('Carlos');
    expect(participants[0].id).toBeDefined();

    const carlosId = participants[0].id;

    // Update participant.
    useWizardStore.getState().updateParticipant(carlosId, 'Carlos Alberto', [
      { type: 'EMAIL', value: 'carlos.alberto@example.com' },
    ]);
    participants = useWizardStore.getState().participants;
    expect(participants[0].displayName).toBe('Carlos Alberto');
    expect(participants[0].channels[0].value).toBe('carlos.alberto@example.com');

    // Remove participant.
    useWizardStore.getState().removeParticipant(carlosId);
    expect(useWizardStore.getState().participants.length).toBe(0);
  });

  it('should manage exclusion rules and clean them up when a participant is deleted', () => {
    const store = useWizardStore.getState();

    // Setup participants.
    store.addParticipant('Carlos', [{ type: 'EMAIL', value: 'carlos@example.com' }]);
    store.addParticipant('Ana', [{ type: 'EMAIL', value: 'ana@example.com' }]);

    const participants = useWizardStore.getState().participants;
    const idA = participants[0].id;
    const idB = participants[1].id;

    // Add exclusion rule.
    useWizardStore.getState().addExclusionRule(idA, idB);
    let rules = useWizardStore.getState().exclusionRules;
    expect(rules.length).toBe(1);
    expect(rules[0]).toEqual({ participantA: idA, participantB: idB });

    // Try adding duplicate rule (in reverse order too, since it is symmetric).
    useWizardStore.getState().addExclusionRule(idB, idA);
    rules = useWizardStore.getState().exclusionRules;
    expect(rules.length).toBe(1); // Should ignore duplicate

    // Remove participant A and verify rule is cleaned up automatically.
    useWizardStore.getState().removeParticipant(idA);
    rules = useWizardStore.getState().exclusionRules;
    expect(rules.length).toBe(0);
  });

  it('should update event details and settings', () => {
    const store = useWizardStore.getState();

    store.setEventDetails({
      eventName: 'Christmas 2026',
      suggestedValue: 'R$ 100,00',
    });
    expect(useWizardStore.getState().eventDetails.eventName).toBe('Christmas 2026');
    expect(useWizardStore.getState().eventDetails.suggestedValue).toBe('R$ 100,00');

    store.setOrganizerBlind(false);
    expect(useWizardStore.getState().organizerBlind).toBe(false);

    store.setRecoveryEmail('organizer@example.com');
    expect(useWizardStore.getState().recoveryEmail).toBe('organizer@example.com');
  });

  it('should persist state to localStorage', () => {
    const store = useWizardStore.getState();
    store.setRecoveryEmail('test@example.com');

    const localData = localStorage.getItem('enlaco-wizard-state');
    expect(localData).toBeDefined();
    expect(localData).toContain('test@example.com');
  });
});
