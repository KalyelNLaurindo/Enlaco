import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RevealPage } from '../../../features/reveal/RevealPage';
import { encodeRevealToken } from '../../../domain/services/tokenService';
import type { EventDetails } from '../../../domain/types';

describe('RevealPage - Expiration and Life Cycle (TTL)', () => {
  const eventDetails: EventDetails = {
    eventName: 'Churrasco da Firma',
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

  it('should show error page if the token is expired (based on encoded expiration date)', () => {
    // Generate token with an expiration date in the past
    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago
    
    // Inject expired state into the token
    // We modify encodeRevealToken to support passing expiration directly
    const expiredToken = encodeRevealToken('Bob', 'Charlie', eventDetails, 'draw-1', 'p-bob', pastDate);
    
    setupRevealPage(expiredToken);

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Este link de revelação expirou.')).toBeInTheDocument();
  });

  it('should allow reveal if the token is not expired', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour in the future
    const validToken = encodeRevealToken('Bob', 'Charlie', eventDetails, 'draw-1', 'p-bob', futureDate);

    setupRevealPage(validToken);

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revelar/i })).toBeInTheDocument();
  });
});
