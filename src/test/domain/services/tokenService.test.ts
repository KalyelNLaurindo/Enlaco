import { describe, it, expect } from 'vitest';
import { encodeRevealToken, decodeRevealToken } from '../../../domain/services/tokenService';
import type { EventDetails } from '../../../domain/types';

describe('tokenService - URL-safe Stateless Token Serializer', () => {
  const eventDetails: EventDetails = {
    eventName: 'Churrasco de Fim de Ano 🎄',
    eventDate: '2026-12-20',
    suggestedValue: 'R$ 100,00',
    organizerMessage: 'Tragam bebidas e muita alegria!',
  };

  it('should encode and decode a valid token preserving UTF-8 special characters', () => {
    const giverName = 'João da Silva';
    const receiverName = 'Maria Conceição';

    const token = encodeRevealToken(giverName, receiverName, eventDetails);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    const decoded = decodeRevealToken(token);
    expect(decoded.giverName).toBe(giverName);
    expect(decoded.receiverName).toBe(receiverName);
    expect(decoded.eventDetails.eventName).toBe(eventDetails.eventName);
    expect(decoded.eventDetails.eventDate).toBe(eventDetails.eventDate);
    expect(decoded.eventDetails.suggestedValue).toBe(eventDetails.suggestedValue);
    expect(decoded.eventDetails.organizerMessage).toBe(eventDetails.organizerMessage);
  });

  it('should handle optional/missing fields in eventDetails gracefully', () => {
    const minimalEvent: EventDetails = {
      eventName: 'Café Simples',
    };
    
    const token = encodeRevealToken('Alice', 'Bob', minimalEvent);
    const decoded = decodeRevealToken(token);

    expect(decoded.giverName).toBe('Alice');
    expect(decoded.receiverName).toBe('Bob');
    expect(decoded.eventDetails.eventName).toBe('Café Simples');
    expect(decoded.eventDetails.eventDate).toBeUndefined();
    expect(decoded.eventDetails.suggestedValue).toBeUndefined();
    expect(decoded.eventDetails.organizerMessage).toBeUndefined();
  });

  it('should throw an error for malformed or corrupted tokens during decode', () => {
    expect(() => decodeRevealToken('malformed_token_12345')).toThrow();
    expect(() => decodeRevealToken('')).toThrow();
  });
});
