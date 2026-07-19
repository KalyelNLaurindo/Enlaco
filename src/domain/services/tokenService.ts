import type { EventDetails } from '../types';

interface EncodedPayload {
  g: string; // giver name
  r: string; // receiver name
  e: string; // event name
  d?: string; // event date
  v?: string; // suggested value
  m?: string; // organizer message
  id?: string; // draw ID
  p?: string;  // giver participant ID
}

/**
 * Encodes participant assignment and event details into a URL-safe Base64 token.
 * Uses percent-encoding to safely handle UTF-8 characters across both Node.js and browser contexts.
 */
export function encodeRevealToken(
  giverName: string,
  receiverName: string,
  eventDetails: EventDetails,
  drawId?: string,
  participantId?: string
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

  const jsonStr = JSON.stringify(payload);
  
  // Safely convert the string to a percent-encoded representation to support UTF-8 characters,
  // then convert to base64 via btoa.
  const rawBase64 = btoa(unescape(encodeURIComponent(jsonStr)));
  
  // Transform base64 to base64url format: replace '+' with '-', '/' with '_', and strip '=' padding
  return rawBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a URL-safe Base64 token back into giver/receiver name and event details.
 * Throws an error if the token is malformed, corrupted, or contains invalid JSON.
 */
export function decodeRevealToken(token: string): {
  giverName: string;
  receiverName: string;
  eventDetails: EventDetails;
  drawId?: string;
  participantId?: string;
} {
  if (!token) {
    throw new Error('Empty token provided.');
  }

  try {
    // Reconstruct base64url padding and convert '-' and '_' back to '+' and '/'
    let rawBase64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (rawBase64.length % 4) {
      rawBase64 += '=';
    }

    // Decode base64 to percent-encoded string, then decode percent encoding to UTF-8 JSON
    const jsonStr = decodeURIComponent(escape(atob(rawBase64)));
    const payload = JSON.parse(jsonStr) as EncodedPayload;

    if (!payload.g || !payload.r || !payload.e) {
      throw new Error('Token payload is missing required fields.');
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
    };
  } catch (error) {
    throw new Error(`Failed to decode reveal token: ${(error as Error).message}`);
  }
}
