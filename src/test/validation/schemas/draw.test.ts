import { describe, it, expect } from 'vitest';
import {
  participantSchema,
  exclusionRuleSchema,
  drawWizardSchema,
} from '../../../validation/schemas/draw';

describe('Participant Schema Validation', () => {
  it('should accept a valid participant', () => {
    // Valid participant has a non-empty name and at least one channel.
    const valid = {
      displayName: 'Carlos',
      channels: [{ type: 'EMAIL', value: 'carlos@example.com' }],
    };
    const result = participantSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject empty or untrimmed display name', () => {
    // Names must contain characters, not just spaces.
    const invalidEmpty = {
      displayName: '   ',
      channels: [{ type: 'EMAIL', value: 'carlos@example.com' }],
    };
    const result = participantSchema.safeParse(invalidEmpty);
    expect(result.success).toBe(false);
  });

  it('should reject names longer than 50 characters', () => {
    // Limit name length to prevent layout breaking.
    const invalidLong = {
      displayName: 'A'.repeat(51),
      channels: [{ type: 'EMAIL', value: 'carlos@example.com' }],
    };
    const result = participantSchema.safeParse(invalidLong);
    expect(result.success).toBe(false);
  });

  it('should require at least one delivery channel', () => {
    // Participant needs at least one link target to receive their secret match.
    const invalidNoChannel = {
      displayName: 'Carlos',
      channels: [],
    };
    const result = participantSchema.safeParse(invalidNoChannel);
    expect(result.success).toBe(false);
  });

  it('should reject channel with empty value', () => {
    // Destination addresses cannot be blank.
    const invalidEmptyValue = {
      displayName: 'Carlos',
      channels: [{ type: 'EMAIL', value: '   ' }],
    };
    const result = participantSchema.safeParse(invalidEmptyValue);
    expect(result.success).toBe(false);
  });
});

describe('Exclusion Rule Schema Validation', () => {
  it('should accept valid exclusion rules between two different participants', () => {
    // Exclusions must be configured between two distinct people.
    const valid = {
      participantA: 'uuid-1',
      participantB: 'uuid-2',
    };
    const result = exclusionRuleSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject self-exclusion where A equals B', () => {
    // Algorithms already prevent drawing oneself, making self-exclusions redundant.
    const invalidSelf = {
      participantA: 'uuid-1',
      participantB: 'uuid-1',
    };
    const result = exclusionRuleSchema.safeParse(invalidSelf);
    expect(result.success).toBe(false);
  });
});

describe('Draw Wizard Schema Validation', () => {
  const getValidWizardData = () => ({
    participants: [
      { id: '1', displayName: 'Carlos', channels: [{ type: 'EMAIL', value: 'carlos@example.com' }] },
      { id: '2', displayName: 'Ana', channels: [{ type: 'WHATSAPP_LINK', value: '5511999999999' }] },
      { id: '3', displayName: 'Beto', channels: [{ type: 'QR', value: 'beto-token' }] },
    ],
    exclusionRules: [],
    eventDetails: {
      eventName: 'Office Secret Santa 2026',
    },
  });

  it('should accept valid full wizard data', () => {
    // General wizard setup with correct fields should be valid.
    const validData = getValidWizardData();
    const result = drawWizardSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject if less than 3 participants', () => {
    // A secret exchange requires at least 3 people to be viable.
    const data = getValidWizardData();
    data.participants.pop();
    const result = drawWizardSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject if more than 50 participants', () => {
    // Capped at 50 people to keep browser and server algorithm execution fast.
    const data = getValidWizardData();
    for (let i = 4; i <= 51; i++) {
      data.participants.push({
        id: String(i),
        displayName: `Participant ${i}`,
        channels: [{ type: 'EMAIL', value: `email${i}@example.com` }],
      });
    }
    const result = drawWizardSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject duplicate delivery channels across participants', () => {
    // Duplicate addresses are blocked to prevent link leaks.
    const data = getValidWizardData();
    data.participants[0].channels = [{ type: 'EMAIL', value: 'same@example.com' }];
    data.participants[1].channels = [{ type: 'EMAIL', value: 'same@example.com' }];
    const result = drawWizardSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should require eventName in eventDetails', () => {
    // A name is mandatory to give context to the participants.
    const data = getValidWizardData();
    (data.eventDetails as any).eventName = '';
    const result = drawWizardSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject eventName longer than 100 characters', () => {
    // Capped at 100 chars to avoid header overflow.
    const data = getValidWizardData();
    data.eventDetails.eventName = 'A'.repeat(101);
    const result = drawWizardSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
