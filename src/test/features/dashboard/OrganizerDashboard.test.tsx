import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrganizerDashboard } from '../../../features/dashboard/OrganizerDashboard';
import { encodeRevealToken } from '../../../domain/services/tokenService';
import type { Draw, EventDetails } from '../../../domain/types';

describe('OrganizerDashboard Component', () => {
  const eventDetails: EventDetails = {
    eventName: 'Churrasco Secreto',
    eventDate: '2026-12-25',
    suggestedValue: 'R$ 50',
    organizerMessage: 'Feliz Amigo Secreto!',
  };

  const mockDraw: Draw = {
    drawId: 'test-draw-123',
    status: 'GENERATED',
    createdAt: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    organizerBlind: true,
    eventDetails,
    participants: [
      {
        id: 'p1',
        displayName: 'Alice',
        channels: [{ type: 'EMAIL', value: 'alice@example.com' }],
      },
      {
        id: 'p2',
        displayName: 'Bob',
        channels: [{ type: 'WHATSAPP_LINK', value: '11999999999' }],
      },
      {
        id: 'p3',
        displayName: 'Charlie',
        channels: [{ type: 'QR', value: '' }],
      },
    ],
    exclusionRules: [],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const setupDashboard = (draw: Draw, drawId = 'test-draw-123') => {
    // Generate mock reveal links for each participant
    const drawWithLinks = {
      ...draw,
      participants: draw.participants.map((p) => {
        // Mock targets for reveal links: p1 -> p2 -> p3 -> p1
        let targetName = '';
        if (p.id === 'p1') targetName = 'Bob';
        if (p.id === 'p2') targetName = 'Charlie';
        if (p.id === 'p3') targetName = 'Alice';

        const token = encodeRevealToken(p.displayName, targetName, draw.eventDetails);
        return {
          ...p,
          revealUrl: `#/r/${token}`,
        };
      }),
    };

    localStorage.setItem(`enlaco-draw-${drawId}`, JSON.stringify(drawWithLinks));

    return render(
      <MemoryRouter initialEntries={[`/sorteio/${drawId}`]}>
        <Routes>
          <Route path="/sorteio/:drawId" element={<OrganizerDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render event details and participant names', () => {
    setupDashboard(mockDraw);

    expect(screen.getByText('Churrasco Secreto')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should hide match details when in Organizer Blind Mode', () => {
    setupDashboard({ ...mockDraw, organizerBlind: true });

    // Should NOT contain the target names in the document as plain text
    expect(screen.queryByText('Alice tirou')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob tirou')).not.toBeInTheDocument();
  });

  it('should show matches when NOT in Organizer Blind Mode', () => {
    setupDashboard({ ...mockDraw, organizerBlind: false });

    // Should decode and show targets in non-blind mode (appearing both as giver and receiver)
    expect(screen.getAllByText('Bob').length).toBe(2);
    expect(screen.getAllByText('Charlie').length).toBe(2);
    expect(screen.getAllByText('Alice').length).toBe(2);
    expect(screen.getAllByText('tirou').length).toBe(3);
  });

  it('should display "Pendente" initially, and update to "Revelado" when localStorage syncs', () => {
    setupDashboard(mockDraw);

    // Should show pending badges initially
    const pendingBadges = screen.getAllByText('Pendente');
    expect(pendingBadges.length).toBe(3);

    // Simulate participant revealing their match in another tab
    const revealKey = 'enlaco_revealed_test-draw-123_p1';
    localStorage.setItem(revealKey, new Date().toISOString());

    // Dispatch storage event to trigger component state update
    fireEvent(
      window,
      new StorageEvent('storage', {
        key: revealKey,
        newValue: localStorage.getItem(revealKey),
      })
    );

    // Alice should now be shown as revealed
    expect(screen.getByText('Revelado')).toBeInTheDocument();
    // Remaining 2 should be pending
    expect(screen.getAllByText('Pendente').length).toBe(2);
  });
});
