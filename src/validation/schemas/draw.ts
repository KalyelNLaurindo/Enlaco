import { z } from 'zod';

// Validates a single participant. Name must be 1-50 chars. Needs at least 1 delivery channel.
export const participantSchema = z.object({
  id: z.string().optional(),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name cannot be empty')
    .max(50, 'Name must be 50 characters or less'),
  channels: z
    .array(
      z.object({
        type: z.enum(['EMAIL', 'WHATSAPP_LINK', 'QR']),
        value: z.string().trim().min(1, 'Delivery channel address/number cannot be empty'),
      })
    )
    .min(1, 'At least one delivery channel is required'),
});

// Validates exclusions. Prevents a participant from being excluded from themselves.
export const exclusionRuleSchema = z
  .object({
    participantA: z.string().min(1, 'Participant A is required'),
    participantB: z.string().min(1, 'Participant B is required'),
  })
  .refine((data) => data.participantA !== data.participantB, {
    message: 'A participant cannot be excluded from drawing themselves.',
    path: ['participantB'],
  });

// Validates full wizard data. Checks participant bounds (3-50) and blocks duplicate channels.
export const drawWizardSchema = z
  .object({
    participants: z.array(participantSchema).min(3, 'A minimum of 3 participants is required').max(50, 'A maximum of 50 participants is allowed'),
    exclusionRules: z.array(exclusionRuleSchema),
    eventDetails: z.object({
      eventName: z.string().trim().min(1, 'Event name is required').max(100, 'Event name must be 100 characters or less'),
      eventDate: z.string().optional(),
      suggestedValue: z.string().optional(),
      organizerMessage: z.string().max(500, 'Message must be 500 characters or less').optional(),
    }),
  })
  .refine(
    (data) => {
      // Each participant must have a unique destination to prevent sending links to the wrong person.
      const contactValues = new Set<string>();
      for (const participant of data.participants) {
        for (const channel of participant.channels) {
          const normalizedValue = channel.value.toLowerCase().trim();
          if (contactValues.has(normalizedValue)) {
            return false;
          }
          contactValues.add(normalizedValue);
        }
      }
      return true;
    },
    {
      message: 'Duplicate delivery channels are not allowed. Each participant must have a unique destination.',
      path: ['participants'],
    }
  );
