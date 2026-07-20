import { useState } from 'react';
import { useTranslation } from '../../../domain/services/i18nService';
import './RevealCard.css';

interface RevealCardProps {
  recipientName: string;
  eventName: string;
  organizerMessage?: string;
  onReveal?: () => void;
}

// Tap-to-Reveal card component.
// Masks the matched partner name until clicked by the participant.
export function RevealCard({ recipientName, eventName, organizerMessage, onReveal }: RevealCardProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  return (
    <section
      className="reveal-card"
      aria-label={t('drawFor').replace('{name}', eventName)}
      role="region"
    >
      {/* Event context header - always visible */}
      <header className="reveal-card__header">
        <p className="reveal-card__label">{t('participatingIn')}</p>
        <h1 className="reveal-card__event-name">{eventName}</h1>
      </header>

      {/* Recipient reveal viewport */}
      <div className="reveal-card__body">
        {revealed ? (
          <div className="reveal-card__result" aria-live="polite">
            <p className="reveal-card__you-got">{t('youDrew')}</p>
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
              onClick={() => {
                setRevealed(true);
                if (onReveal) onReveal();
              }}
              aria-label={t('revealButton')}
            >
              {t('revealButton').split(' ')[0]} {/* Grab "Reveal" or full text */}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
