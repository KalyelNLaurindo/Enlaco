import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExclusionRulesStep } from '../../../../features/wizard/components/ExclusionRulesStep';
import { useWizardStore } from '../../../../features/wizard/store/wizardStore';

// Seed helpers.
const setupThreeParticipants = () => {
  const store = useWizardStore.getState();
  store.addParticipant('Carlos', [{ type: 'EMAIL', value: 'carlos@ex.com' }]);
  store.addParticipant('Ana', [{ type: 'EMAIL', value: 'ana@ex.com' }]);
  store.addParticipant('Beto', [{ type: 'EMAIL', value: 'beto@ex.com' }]);
};

beforeEach(() => {
  useWizardStore.getState().reset();
});

describe('ExclusionRulesStep', () => {
  it('should render the list of participants to select from', () => {
    setupThreeParticipants();
    render(<ExclusionRulesStep />);

    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Beto')).toBeInTheDocument();
  });

  it('should show an empty rules state when no exclusions are configured', () => {
    setupThreeParticipants();
    render(<ExclusionRulesStep />);

    expect(screen.getByTestId('empty-exclusions')).toBeInTheDocument();
  });

  it('should add an exclusion rule when two different participants are selected', () => {
    setupThreeParticipants();
    render(<ExclusionRulesStep />);

    const participants = useWizardStore.getState().participants;
    const carlosId = participants[0].id;
    const anaId = participants[1].id;

    // Select Carlos then Ana to create exclusion pair.
    fireEvent.click(screen.getByTestId(`participant-select-${carlosId}`));
    fireEvent.click(screen.getByTestId(`participant-select-${anaId}`));

    expect(useWizardStore.getState().exclusionRules).toHaveLength(1);
  });

  it('should display added exclusion rules as pairs', () => {
    setupThreeParticipants();
    const store = useWizardStore.getState();
    const [carlos, ana] = store.participants;
    store.addExclusionRule(carlos.id, ana.id);

    render(<ExclusionRulesStep />);

    // Both names should appear in the rule display area.
    expect(screen.getAllByText('Carlos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ana').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('exclusion-rule-0')).toBeInTheDocument();
  });

  it('should remove an exclusion rule when the remove button is clicked', () => {
    setupThreeParticipants();
    const store = useWizardStore.getState();
    const [carlos, ana] = store.participants;
    store.addExclusionRule(carlos.id, ana.id);

    render(<ExclusionRulesStep />);

    fireEvent.click(screen.getByRole('button', { name: /remover regra/i }));

    expect(useWizardStore.getState().exclusionRules).toHaveLength(0);
  });

  it('should clear the selection after a rule is added', () => {
    setupThreeParticipants();
    render(<ExclusionRulesStep />);

    const participants = useWizardStore.getState().participants;
    fireEvent.click(screen.getByTestId(`participant-select-${participants[0].id}`));
    fireEvent.click(screen.getByTestId(`participant-select-${participants[1].id}`));

    // After adding, no participant should remain selected.
    expect(screen.queryByTestId('participant-select-active')).not.toBeInTheDocument();
  });

  it('should navigate to next step when Next is clicked', () => {
    setupThreeParticipants();
    useWizardStore.setState({ currentStep: 2 });
    render(<ExclusionRulesStep />);

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(useWizardStore.getState().currentStep).toBe(3);
  });

  it('should navigate to previous step when Back is clicked', () => {
    setupThreeParticipants();
    useWizardStore.setState({ currentStep: 2 });
    render(<ExclusionRulesStep />);

    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(useWizardStore.getState().currentStep).toBe(1);
  });
});
