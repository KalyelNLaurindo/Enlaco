import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WizardPage } from '../../../features/wizard/WizardPage';

describe('WizardPage - History & Recovery Feature', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should display history list when past draws exist in localStorage', () => {
    const mockHistory = ['draw-1', 'draw-2'];
    localStorage.setItem('enlaco_draw_history', JSON.stringify(mockHistory));
    
    // Store mock draws
    localStorage.setItem('enlaco-draw-draw-1', JSON.stringify({
      drawId: 'draw-1',
      eventDetails: { eventName: 'Natal 2026' },
      participants: [],
      exclusionRules: [],
    }));
    localStorage.setItem('enlaco-draw-draw-2', JSON.stringify({
      drawId: 'draw-2',
      eventDetails: { eventName: 'Amigo Oculto Firma' },
      participants: [],
      exclusionRules: [],
    }));

    render(
      <MemoryRouter>
        <WizardPage />
      </MemoryRouter>
    );

    // Verify history section is rendered
    expect(screen.getByText('Sorteios Anteriores')).toBeInTheDocument();
    expect(screen.getByText('Natal 2026')).toBeInTheDocument();
    expect(screen.getByText('Amigo Oculto Firma')).toBeInTheDocument();
  });

  it('should allow importing an existing draw using its ID/link', () => {
    // A draw exists but is NOT in the history list
    localStorage.setItem('enlaco-draw-external-draw', JSON.stringify({
      drawId: 'external-draw',
      eventDetails: { eventName: 'Churrasco Audit' },
      participants: [],
      exclusionRules: [],
    }));

    render(
      <MemoryRouter>
        <WizardPage />
      </MemoryRouter>
    );

    const importInput = screen.getByPlaceholderText(/cole o link ou código/i);
    const importBtn = screen.getByRole('button', { name: /importar/i });

    // Type and submit the import code
    fireEvent.change(importInput, { target: { value: 'external-draw' } });
    fireEvent.click(importBtn);

    // Verify it was added to the history list in localStorage
    const savedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]');
    expect(savedHistory).toContain('external-draw');
  });

  it('should show an error if trying to import a non-existent draw', () => {
    render(
      <MemoryRouter>
        <WizardPage />
      </MemoryRouter>
    );

    const importInput = screen.getByPlaceholderText(/cole o link ou código/i);
    const importBtn = screen.getByRole('button', { name: /importar/i });

    fireEvent.change(importInput, { target: { value: 'non-existent-draw-id' } });
    fireEvent.click(importBtn);

    expect(screen.getByText(/código ou link inválido/i)).toBeInTheDocument();
  });
});
