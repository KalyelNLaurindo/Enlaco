import { useState } from 'react';
import './RevealCard.css';

interface RevealCardProps {
  recipientName: string;
  eventName: string;
  organizerMessage?: string;
}

/**
 * Tap-to-Reveal card component. Displays a masked state with a CTA button
 * and transitions to showing the recipient's name and optional organizer
 * message on interaction. Fully accessible via ARIA attributes.
 */
export function RevealCard({ recipientName, eventName, organizerMessage }: RevealCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section
      className="reveal-card"
      aria-label={`Sorteio do ${eventName}`}
      role="region"
    >
      {/* Event context header — always visible */}
      <header className="reveal-card__header">
        <p className="reveal-card__label">Você está participando de</p>
        <h1 className="reveal-card__event-name">{eventName}</h1>
      </header>

      {/* Recipient reveal area */}
      <div className="reveal-card__body">
        {revealed ? (
          <div className="reveal-card__result" aria-live="polite">
            <p className="reveal-card__you-got">Você tirou</p>
            <p className="reveal-card__recipient">{recipientName}</p>
            {organizerMessage && (
              <blockquote
                className="reveal-card__message"
                data-testid="organizer-message"
              >
                {organizerMessage}
              </blockquote>
            )}
          </div>
        ) : (
          <div className="reveal-card__masked">
            <div className="reveal-card__mask" data-testid="reveal-mask">
              <span className="reveal-card__mask-glyph">?</span>
              <span className="reveal-card__mask-glyph">?</span>
              <span className="reveal-card__mask-glyph">?</span>
            </div>
            <button
              className="reveal-card__cta"
              onClick={() => setRevealed(true)}
              aria-label="Revelar meu amigo secreto"
            >
              Revelar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
