import { describe, it, expect } from 'vitest';
import type { Draw } from '../../../domain/types';

import { generateCSVContent, generateASCIICoupon } from '../../../features/dashboard/auditExportUtils';
import { encodeRevealToken } from '../../../domain/services/tokenService';

describe('Audit Export Utilities', () => {
  const mockDraw: Draw = {
    drawId: 'draw-abc',
    status: 'GENERATED',
    createdAt: '2026-07-19T15:00:00.000Z',
    organizerBlind: false,
    eventDetails: {
      eventName: 'Natal Família 2026',
    },
    participants: [
      { 
        id: 'p1', 
        displayName: 'Alice', 
        channels: [{ type: 'EMAIL', value: 'alice@test.com' }], 
        revealUrl: '/r/' + encodeRevealToken('Alice', 'Bob', { eventName: 'Natal Família 2026' })
      } as any,
      { 
        id: 'p2', 
        displayName: 'Bob', 
        channels: [{ type: 'WHATSAPP_LINK', value: '11999999999' }], 
        revealUrl: '/r/' + encodeRevealToken('Bob', 'Alice', { eventName: 'Natal Família 2026' })
      } as any,
    ],
    exclusionRules: [],
  };

  const revealedStatus = {
    p1: '2026-07-19T15:05:00.000Z',
  };

  it('should generate CSV content properly', () => {
    // Unlocked / No PIN
    const csvContent = generateCSVContent(mockDraw, revealedStatus, true);
    
    expect(csvContent).toContain('Nome,Canal,Valor Canal,Status,Parceiro Secreto');
    expect(csvContent).toContain('Alice,EMAIL,alice@test.com,Revelado,Bob');
    expect(csvContent).toContain('Bob,WHATSAPP_LINK,11999999999,Pendente,Alice');
  });

  it('should mask partners in CSV if locked', () => {
    const csvContent = generateCSVContent({ ...mockDraw, auditPin: '1234' }, revealedStatus, false);
    
    expect(csvContent).toContain('Alice,EMAIL,alice@test.com,Revelado,🔒 PROTEGIDO POR PIN');
  });

  it('should generate ASCII Coupon containing the ENLAÇO logo and border alignment', () => {
    const coupon = generateASCIICoupon(mockDraw, revealedStatus, true);

    // Verify ASCII Logo block exists
    expect(coupon).toContain('███████╗');
    expect(coupon).toContain('ENLAÇO - AUDIT');
    expect(coupon).toContain('EVENTO: Natal Família 2026');
    expect(coupon).toContain('Alice');
    expect(coupon).toContain('Bob');
    expect(coupon).toContain('======>');
  });

  it('should mask matches in ASCII Coupon if locked', () => {
    const coupon = generateASCIICoupon({ ...mockDraw, auditPin: '1234' }, revealedStatus, false);

    expect(coupon).toContain('🔒 BLOQUEADO: DIGITE O PIN DE AUDITORIA');
    expect(coupon).not.toContain('Alice     ======>');
  });
});
