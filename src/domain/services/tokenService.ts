import type { EventDetails } from '../types';

// Payload structure compressed to minimize final URL size.
interface EncodedPayload {
  g: string;    // Giver name
  r: string;    // Receiver name
  e: string;    // Event name
  d?: string;   // Event date
  v?: string;   // Suggested value
  m?: string;   // Organizer message
  id?: string;  // Draw ID
  p?: string;   // Participant ID
  exp?: string; // Token expiration date
}

// Service class to encode and decode URL-safe tokens containing draw details.
export class TokenService {
  // Encodes draw match data and event details into a URL-safe Base64 token.
  public static encode(
    giverName: string,
    receiverName: string,
    eventDetails: EventDetails,
    drawId?: string,
    participantId?: string,
    tokenValidUntil?: string
  ): string {
    const payload: EncodedPayload = {
      g: giverName,
      r: receiverName,
      e: eventDetails.eventName,
    };

    if (eventDetails.eventDate) payload.d = eventDetails.eventDate;
    if (eventDetails.suggestedValue) payload.v = eventDetails.suggestedValue;
    if (eventDetails.organizerMessage) payload.m = eventDetails.organizerMessage;
    if (drawId) payload.id = drawId;
    if (participantId) payload.p = participantId;
    if (tokenValidUntil) payload.exp = tokenValidUntil;

    const jsonStr = JSON.stringify(payload);
    
    // Encodes UTF-8 string safely to Base64
    const rawBase64 = btoa(unescape(encodeURIComponent(jsonStr)));
    
    // Makes Base64 safe for URLs by replacing special characters and stripping padding
    return rawBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Decodes a URL token back into giver/receiver name and event details.
  public static decode(token: string): {
    giverName: string;
    receiverName: string;
    eventDetails: EventDetails;
    drawId?: string;
    participantId?: string;
    tokenValidUntil?: string;
  } {
    if (!token) {
      throw new Error('Empty token provided.');
    }

    try {
      // Restores original Base64 padding and characters
      let rawBase64 = token.replace(/-/g, '+').replace(/_/g, '/');
      while (rawBase64.length % 4) {
        rawBase64 += '=';
      }

      // Decodes Base64 back to UTF-8 JSON string
      const jsonStr = decodeURIComponent(escape(atob(rawBase64)));
      const payload = JSON.parse(jsonStr) as EncodedPayload;

      if (!payload.g || !payload.r || !payload.e) {
        throw new Error('Incomplete token payload.');
      }

      const eventDetails: EventDetails = {
        eventName: payload.e,
      };

      if (payload.d) eventDetails.eventDate = payload.d;
      if (payload.v) eventDetails.suggestedValue = payload.v;
      if (payload.m) eventDetails.organizerMessage = payload.m;

      return {
        giverName: payload.g,
        receiverName: payload.r,
        eventDetails,
        drawId: payload.id,
        participantId: payload.p,
        tokenValidUntil: payload.exp,
      };
    } catch (error) {
      throw new Error(`Failed to decode token: ${(error as Error).message}`);
    }
  }
}

// Functional exports for backward compatibility.
export function encodeRevealToken(
  giverName: string,
  receiverName: string,
  eventDetails: EventDetails,
  drawId?: string,
  participantId?: string,
  tokenValidUntil?: string
): string {
  return TokenService.encode(giverName, receiverName, eventDetails, drawId, participantId, tokenValidUntil);
}

export function decodeRevealToken(token: string) {
  return TokenService.decode(token);
}
