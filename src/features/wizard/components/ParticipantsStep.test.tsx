import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParticipantsStep } from './ParticipantsStep';
import { useWizardStore } from '../store/wizardStore';

beforeEach(() => {
  useWizardStore.getState().reset();
});

describe('ParticipantsStep', () => {
  it('should render the name input and channel input fields', () => {
    render(<ParticipantsStep />);
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    // The channel input is linked via htmlFor='participant-channel'
    expect(screen.getByRole('textbox', { name: /canal/i })).toBeInTheDocument();
  });

  it('should show an empty state message when no participants exist', () => {
    render(<ParticipantsStep />);
    expect(screen.getByTestId('empty-participants')).toBeInTheDocument();
  });

  it('should add a participant to the store when the form is submitted', async () => {
    render(<ParticipantsStep />);

    await userEvent.type(screen.getByLabelText(/nome/i), 'Carlos');
    await userEvent.type(screen.getByPlaceholderText(/email@exemplo.com/i), 'carlos@example.com');
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(useWizardStore.getState().participants).toHaveLength(1);
    expect(useWizardStore.getState().participants[0].displayName).toBe('Carlos');
  });

  it('should display added participants as chips', async () => {
    render(<ParticipantsStep />);

    await userEvent.type(screen.getByLabelText(/nome/i), 'Ana');
    await userEvent.type(screen.getByPlaceholderText(/email@exemplo.com/i), 'ana@example.com');
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('should clear the form inputs after adding a participant', async () => {
    render(<ParticipantsStep />);

    await userEvent.type(screen.getByLabelText(/nome/i), 'Carlos');
    const channelInput = screen.getByPlaceholderText(/email@exemplo.com/i);
    await userEvent.type(channelInput, 'carlos@example.com');
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(screen.getByLabelText(/nome/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/email@exemplo.com/i)).toHaveValue('');
  });

  it('should show an error if name is empty on add', async () => {
    render(<ParticipantsStep />);
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument();
  });

  it('should show an error if channel value is empty on add', async () => {
    render(<ParticipantsStep />);
    await userEvent.type(screen.getByLabelText(/nome/i), 'Carlos');
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(await screen.findByText(/endereço do canal é obrigatório/i)).toBeInTheDocument();
  });

  it('should remove a participant when the chip remove button is clicked', async () => {
    useWizardStore.getState().addParticipant('Carlos', [{ type: 'EMAIL', value: 'carlos@example.com' }]);
    render(<ParticipantsStep />);

    const chip = screen.getByText('Carlos').closest('[data-testid="participant-chip"]')!;
    fireEvent.click(within(chip).getByRole('button', { name: /remover/i }));

    expect(useWizardStore.getState().participants).toHaveLength(0);
    expect(screen.queryByText('Carlos')).not.toBeInTheDocument();
  });

  it('should disable Next button when fewer than 3 participants exist', () => {
    useWizardStore.getState().addParticipant('A', [{ type: 'EMAIL', value: 'a@example.com' }]);
    useWizardStore.getState().addParticipant('B', [{ type: 'EMAIL', value: 'b@example.com' }]);
    render(<ParticipantsStep />);

    expect(screen.getByRole('button', { name: /próximo/i })).toBeDisabled();
  });

  it('should enable Next button when 3 or more participants exist', () => {
    useWizardStore.getState().addParticipant('A', [{ type: 'EMAIL', value: 'a@example.com' }]);
    useWizardStore.getState().addParticipant('B', [{ type: 'EMAIL', value: 'b@example.com' }]);
    useWizardStore.getState().addParticipant('C', [{ type: 'EMAIL', value: 'c@example.com' }]);
    render(<ParticipantsStep />);

    expect(screen.getByRole('button', { name: /próximo/i })).not.toBeDisabled();
  });

  it('should navigate to next step when Next is clicked with 3+ participants', () => {
    useWizardStore.getState().addParticipant('A', [{ type: 'EMAIL', value: 'a@example.com' }]);
    useWizardStore.getState().addParticipant('B', [{ type: 'EMAIL', value: 'b@example.com' }]);
    useWizardStore.getState().addParticipant('C', [{ type: 'EMAIL', value: 'c@example.com' }]);
    // Start from step 1 (the correct position for this step).
    useWizardStore.setState({ currentStep: 1 });
    render(<ParticipantsStep />);

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(useWizardStore.getState().currentStep).toBe(2);
  });

  it('should navigate to previous step when Back is clicked', () => {
    useWizardStore.setState({ currentStep: 1 });
    render(<ParticipantsStep />);
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(useWizardStore.getState().currentStep).toBe(0);
  });
});
