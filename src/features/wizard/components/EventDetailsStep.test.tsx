import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventDetailsStep } from './EventDetailsStep';
import { useWizardStore } from '../store/wizardStore';

beforeEach(() => {
  useWizardStore.getState().reset();
});

describe('EventDetailsStep', () => {
  it('should render all expected form fields', () => {
    render(<EventDetailsStep />);

    expect(screen.getByLabelText(/nome do evento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data do evento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor sugerido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensagem do organizador/i)).toBeInTheDocument();
  });

  it('should pre-fill fields from existing wizard store state', () => {
    useWizardStore.getState().setEventDetails({
      eventName: 'Natal 2026',
      suggestedValue: 'R$ 50,00',
    });

    render(<EventDetailsStep />);

    expect(screen.getByDisplayValue('Natal 2026')).toBeInTheDocument();
    expect(screen.getByDisplayValue('R$ 50,00')).toBeInTheDocument();
  });

  it('should update the wizard store when eventName field changes', async () => {
    render(<EventDetailsStep />);

    const input = screen.getByLabelText(/nome do evento/i);
    await userEvent.type(input, 'Amigo Secreto');

    expect(useWizardStore.getState().eventDetails.eventName).toBe('Amigo Secreto');
  });

  it('should update the wizard store when suggestedValue changes', async () => {
    render(<EventDetailsStep />);

    const input = screen.getByLabelText(/valor sugerido/i);
    await userEvent.type(input, 'R$ 100,00');

    expect(useWizardStore.getState().eventDetails.suggestedValue).toBe('R$ 100,00');
  });

  it('should update the wizard store when organizerMessage changes', async () => {
    render(<EventDetailsStep />);

    const textarea = screen.getByLabelText(/mensagem do organizador/i);
    await userEvent.type(textarea, 'Feliz Natal!');

    expect(useWizardStore.getState().eventDetails.organizerMessage).toBe('Feliz Natal!');
  });

  it('should show an error when eventName is empty and Next is clicked', async () => {
    render(<EventDetailsStep />);

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    expect(await screen.findByText(/nome do evento é obrigatório/i)).toBeInTheDocument();
  });

  it('should call nextStep on the store when form is valid and Next is clicked', async () => {
    render(<EventDetailsStep />);

    const input = screen.getByLabelText(/nome do evento/i);
    await userEvent.type(input, 'Amigo Secreto 2026');

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    expect(useWizardStore.getState().currentStep).toBe(1);
  });
});
