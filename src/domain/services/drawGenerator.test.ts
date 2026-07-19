import { describe, it, expect } from 'vitest';
import { generateDraw, DrawInfeasibleError } from './drawGenerator';
import type { Participant, ExclusionRule } from '../types';

describe('generateDraw - Backtracking MRV Algorithm', () => {
  const createParticipant = (id: string, name: string): Participant => ({
    id,
    displayName: name,
    channels: [{ type: 'EMAIL', value: `${id}@example.com` }],
  });

  it('should prevent self-draw (giver !== receiver)', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
      createParticipant('3', 'Charlie'),
    ];

    const result = generateDraw(participants, []);
    
    participants.forEach((p) => {
      const match = result.get(p.id);
      expect(match).toBeDefined();
      expect(match).not.toBe(p.id);
    });
  });

  it('should prevent 2-cycles (if A -> B, then B -> A is forbidden)', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
      createParticipant('3', 'Charlie'),
      createParticipant('4', 'David'),
    ];

    // Run multiple times to assert no random runs produce a 2-cycle
    for (let i = 0; i < 50; i++) {
      const result = generateDraw(participants, []);
      participants.forEach((p) => {
        const target = result.get(p.id)!;
        const targetMatch = result.get(target)!;
        expect(targetMatch).not.toBe(p.id);
      });
    }
  });

  it('should respect bidirectional exclusion rules', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
      createParticipant('3', 'Charlie'),
      createParticipant('4', 'David'),
    ];

    // Rule: Alice and Bob cannot draw each other (1 <-> 2)
    const exclusions: ExclusionRule[] = [
      { participantA: '1', participantB: '2' },
    ];

    for (let i = 0; i < 50; i++) {
      const result = generateDraw(participants, exclusions);
      
      // 1 cannot draw 2, and 2 cannot draw 1
      expect(result.get('1')).not.toBe('2');
      expect(result.get('2')).not.toBe('1');
    }
  });

  it('should only return valid 3-cycles for 3 participants and 0 exclusions', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
      createParticipant('3', 'Charlie'),
    ];

    for (let i = 0; i < 20; i++) {
      const result = generateDraw(participants, []);
      // The only valid cycles without self-draw and 2-cycles:
      // 1->2->3->1 OR 1->3->2->1
      const match1 = result.get('1')!;
      const match2 = result.get('2')!;
      const match3 = result.get('3')!;

      if (match1 === '2') {
        expect(match2).toBe('3');
        expect(match3).toBe('1');
      } else {
        expect(match1).toBe('3');
        expect(match3).toBe('2');
        expect(match2).toBe('1');
      }
    }
  });

  it('should throw DrawInfeasibleError when draw is mathematically impossible (2 participants)', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
    ];

    expect(() => generateDraw(participants, [])).toThrow(DrawInfeasibleError);
  });

  it('should throw DrawInfeasibleError when rules make it impossible', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
      createParticipant('3', 'Charlie'),
      createParticipant('4', 'David'),
    ];

    // Exclusion rule makes Charlie (3) impossible to assign/draw
    const exclusions: ExclusionRule[] = [
      { participantA: '3', participantB: '1' },
      { participantA: '3', participantB: '2' },
      { participantA: '3', participantB: '4' },
    ];

    expect(() => generateDraw(participants, exclusions)).toThrow(DrawInfeasibleError);
  });
});
