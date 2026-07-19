import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RevealPage } from '../../../features/reveal/RevealPage';
import { encodeRevealToken } from '../../../domain/services/tokenService';
import type { EventDetails } from '../../../domain/types';

describe('RevealPage Component', () => {
  const eventDetails: EventDetails = {
    eventName: 'Natal da Família 🎁',
    organizerMessage: 'Feliz Natal!',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  const setupRevealPage = (token: string) => {
    return render(
      <MemoryRouter initialEntries={[`/r/${token}`]}>
        <Routes>
          <Route path="/r/:resultToken" element={<RevealPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should decode the token and render the giver name and RevealCard', () => {
    const token = encodeRevealToken('Carlos', 'Ana', eventDetails, 'draw-1', 'p-carlos');
    setupRevealPage(token);

    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('Natal da Família 🎁')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revelar/i })).toBeInTheDocument();
  });

  it('should write to localStorage when the reveal button is clicked', () => {
    const token = encodeRevealToken('Carlos', 'Ana', eventDetails, 'draw-1', 'p-carlos');
    setupRevealPage(token);

    const revealBtn = screen.getByRole('button', { name: /revelar meu amigo secreto/i });
    fireEvent.click(revealBtn);

    // Verify localStorage entry was written
    const revealedTimestamp = localStorage.getItem('enlaco_revealed_draw-1_p-carlos');
    expect(revealedTimestamp).toBeDefined();
    expect(revealedTimestamp).not.toBeNull();
    expect(Date.parse(revealedTimestamp!)).not.toBeNaN();

    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('should display error screen for malformed token', () => {
    setupRevealPage('invalid-token-value');

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Este link de revelação é inválido ou está corrompido.')).toBeInTheDocument();
  });
});
