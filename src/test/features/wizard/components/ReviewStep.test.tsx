import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewStep } from '../../../../features/wizard/components/ReviewStep';
import { useWizardStore } from '../../../../features/wizard/store/wizardStore';

const setupFullWizard = () => {
  const store = useWizardStore.getState();
  store.setEventDetails({ eventName: 'Amigo Secreto 2026', suggestedValue: 'R$ 50,00' });
  store.addParticipant('Carlos', [{ type: 'EMAIL', value: 'carlos@ex.com' }]);
  store.addParticipant('Ana', [{ type: 'EMAIL', value: 'ana@ex.com' }]);
  store.addParticipant('Beto', [{ type: 'EMAIL', value: 'beto@ex.com' }]);
  const [carlos, ana] = useWizardStore.getState().participants;
  store.addExclusionRule(carlos.id, ana.id);
};

beforeEach(() => {
  useWizardStore.getState().reset();
});

describe('ReviewStep', () => {
  it('should display the event name in the summary', () => {
    setupFullWizard();
    render(<ReviewStep onGenerate={vi.fn()} />);
    expect(screen.getByText('Amigo Secreto 2026')).toBeInTheDocument();
  });

  it('should display all participant names', () => {
    setupFullWizard();
    render(<ReviewStep onGenerate={vi.fn()} />);
    // Names appear in both the participant list and exclusion rules — use getAllByText.
    expect(screen.getAllByText('Carlos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ana').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Beto').length).toBeGreaterThanOrEqual(1);
  });

  it('should display exclusion rules in the summary', () => {
    setupFullWizard();
    render(<ReviewStep onGenerate={vi.fn()} />);
    // Both participant names should appear in the rules section.
    const rulesSection = screen.getByTestId('review-exclusions');
    expect(rulesSection).toHaveTextContent('Carlos');
    expect(rulesSection).toHaveTextContent('Ana');
  });

  it('should show "Nenhuma exclusão" when no exclusion rules exist', () => {
    useWizardStore.getState().setEventDetails({ eventName: 'Evento' });
    useWizardStore.getState().addParticipant('A', [{ type: 'EMAIL', value: 'a@ex.com' }]);
    useWizardStore.getState().addParticipant('B', [{ type: 'EMAIL', value: 'b@ex.com' }]);
    useWizardStore.getState().addParticipant('C', [{ type: 'EMAIL', value: 'c@ex.com' }]);
    render(<ReviewStep onGenerate={vi.fn()} />);
    expect(screen.getByText(/nenhuma exclusão/i)).toBeInTheDocument();
  });

  it('should render the irreversibility checkbox unchecked by default', () => {
    setupFullWizard();
    render(<ReviewStep onGenerate={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox', { name: /irreversível/i });
    expect(checkbox).not.toBeChecked();
  });

  it('should keep the Generate button disabled until irreversibility checkbox is checked', () => {
    setupFullWizard();
    render(<ReviewStep onGenerate={vi.fn()} />);
    expect(screen.getByRole('button', { name: /gerar sorteio/i })).toBeDisabled();
  });

  it('should enable the Generate button after checking the irreversibility checkbox', () => {
    setupFullWizard();
    render(<ReviewStep onGenerate={vi.fn()} />);

    fireEvent.click(screen.getByRole('checkbox', { name: /irreversível/i }));
    expect(screen.getByRole('button', { name: /gerar sorteio/i })).not.toBeDisabled();
  });

  it('should call onGenerate when the Generate button is clicked after confirming', () => {
    setupFullWizard();
    const onGenerate = vi.fn();
    render(<ReviewStep onGenerate={onGenerate} />);

    fireEvent.click(screen.getByRole('checkbox', { name: /irreversível/i }));
    fireEvent.click(screen.getByRole('button', { name: /gerar sorteio/i }));

    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it('should navigate back when Back is clicked', () => {
    setupFullWizard();
    useWizardStore.setState({ currentStep: 3 });
    render(<ReviewStep onGenerate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(useWizardStore.getState().currentStep).toBe(2);
  });

  it('should display organizer blind mode status', () => {
    setupFullWizard();
    render(<ReviewStep onGenerate={vi.fn()} />);
    // organizerBlind defaults to true — should reflect this.
    expect(screen.getByTestId('review-blind-mode')).toBeInTheDocument();
  });
});
