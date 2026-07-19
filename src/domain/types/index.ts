// Channels for delivering secret links: Email, WhatsApp link, or QR code.
export type DeliveryChannelType = 'EMAIL' | 'WHATSAPP_LINK' | 'QR';

// Delivery channel type and its address value (e.g., email address or phone).
export interface DeliveryChannel {
  type: DeliveryChannelType;
  value: string;
}

// A single participant with a name and their configured delivery channels.
export interface Participant {
  id: string;
  displayName: string;
  channels: DeliveryChannel[];
}

// Prevents two participants from drawing each other. This is bidirectional.
export interface ExclusionRule {
  participantA: string;
  participantB: string;
}

// Lifecycle states of a draw from draft to deletion.
export type DrawStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'SAVED'
  | 'EXPIRED_SAVED'
  | 'EXPIRED_UNSAVED'
  | 'CANCELLED'
  | 'DELETED';

// Basic details about the gift exchange event.
export interface EventDetails {
  eventName: string;
  eventDate?: string;
  suggestedValue?: string;
  organizerMessage?: string;
}

// State model representing the entire gift exchange draw.
export interface Draw {
  drawId: string;
  status: DrawStatus;
  createdAt: string;
  generatedAt?: string;
  tokenValidUntil?: string;
  organizerBlind: boolean;
  eventDetails: EventDetails;
  participants: Participant[];
  exclusionRules: ExclusionRule[];
  auditPin?: string;
}
