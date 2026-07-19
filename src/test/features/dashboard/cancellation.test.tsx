import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrganizerDashboard } from '../../../features/dashboard/OrganizerDashboard';
import type { Draw } from '../../../domain/types';

describe('OrganizerDashboard - Cancellation & PIN Protection', () => {
  const mockDraw: Draw = {
    drawId: 'draw-abc',
    status: 'GENERATED',
    createdAt: new Date().toISOString(),
    organizerBlind: false,
    eventDetails: {
      eventName: 'Churrasco 2026',
    },
    participants: [
      { id: 'p1', displayName: 'Alice', channels: [{ type: 'EMAIL', value: 'a@a.com' }] },
      { id: 'p2', displayName: 'Bob', channels: [{ type: 'EMAIL', value: 'b@b.com' }] },
    ],
    exclusionRules: [],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  const setupDashboard = (draw: Draw) => {
    localStorage.setItem(`enlaco-draw-${draw.drawId}`, JSON.stringify(draw));
    return render(
      <MemoryRouter initialEntries={[`/sorteio/${draw.drawId}`]}>
        <Routes>
          <Route path="/sorteio/:drawId" element={<OrganizerDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should display the cancel draw button and update status to CANCELLED on confirmation', () => {
    setupDashboard(mockDraw);

    const cancelBtn = screen.getByRole('button', { name: /cancelar sorteio/i });
    expect(cancelBtn).toBeInTheDocument();

    // Click cancel button -> shows modal
    fireEvent.click(cancelBtn);
    expect(screen.getByText(/deseja realmente cancelar/i)).toBeInTheDocument();

    // Confirm cancellation
    const confirmBtn = screen.getByRole('button', { name: /confirmar cancelamento/i });
    fireEvent.click(confirmBtn);

    // Verify status updated in localStorage and screen
    const stored = JSON.parse(localStorage.getItem('enlaco-draw-draw-abc') || '{}');
    expect(stored.status).toBe('CANCELLED');
    expect(screen.getByText(/cancelado/i)).toBeInTheDocument();
  });

  it('should lock matches when auditPin is set and unlock when PIN is typed correctly', () => {
    const drawWithPin: Draw = {
      ...mockDraw,
      auditPin: '4321',
      // Include pre-generated links in participants list
      participants: [
        { 
          id: 'p1', 
          displayName: 'Alice', 
          channels: [{ type: 'EMAIL', value: 'a@a.com' }],
          revealUrl: '/r/eyJnIjoiQWxpY2UiLCJyIjoiQm9iIiwiZSI6IkNodXJyYXNjbyAyMDI2IiwiaWQiOiJkcmF3LWFiYyIsInAiOiJwMSJ9' // Alice drew Bob
        } as any,
        { 
          id: 'p2', 
          displayName: 'Bob', 
          channels: [{ type: 'EMAIL', value: 'b@b.com' }],
          revealUrl: '/r/eyJnIjoiQm9iIiwiciI6IkFsaWNlIiwiZSI6IkNodXJyYXNjbyAyMDI2IiwiaWQiOiJkcmF3LWFiYyIsInAiOiJwMiJ9' // Bob drew Alice
        } as any,
      ]
    };

    setupDashboard(drawWithPin);

    // Matches should be locked/masked
    expect(screen.queryByText('tirou')).not.toBeInTheDocument();
    expect(screen.getAllByText(/protegido por pin/i).length).toBeGreaterThan(0);

    // Enter correct PIN
    const pinInput = screen.getByPlaceholderText(/digite o pin/i);
    const unlockBtn = screen.getByRole('button', { name: /desbloquear/i });

    fireEvent.change(pinInput, { target: { value: '4321' } });
    fireEvent.click(unlockBtn);

    // Verify it is unlocked
    expect(screen.getAllByText('tirou').length).toBe(2);
  });
});
