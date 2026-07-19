import { useParams } from 'react-router-dom';
import { decodeRevealToken } from '../../domain/services/tokenService';
import { RevealCard } from './components/RevealCard';
import { useTranslation } from '../../domain/services/i18nService';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import type { Draw } from '../../domain/types';
import './RevealPage.css';

// Participant Reveal page.
// Decodes URL token in the client browser and renders the Secret Santa card.
export function RevealPage() {
  const { t } = useTranslation();
  const { resultToken } = useParams<{ resultToken: string }>();

  if (!resultToken) {
    return <RevealError message={t('emptyTokenError')} />;
  }

  try {
    const { giverName, receiverName, eventDetails, drawId, participantId, tokenValidUntil } = decodeRevealToken(resultToken);

    // Checks if the draw link has expired based on its encoded expiration date.
    if (tokenValidUntil && new Date() > new Date(tokenValidUntil)) {
      return <RevealError message={t('expiredTokenError')} />;
    }

    // Syncs and checks draw cancellation/expiration state from local device memory if available.
    if (drawId) {
      const localDrawData = localStorage.getItem(`enlaco-draw-${drawId}`);
      if (localDrawData) {
        const localDraw = JSON.parse(localDrawData) as Draw;
        if (localDraw.status === 'CANCELLED') {
          return <RevealError message={t('cancelledDrawError')} />;
        }
        if (localDraw.tokenValidUntil && new Date() > new Date(localDraw.tokenValidUntil)) {
          return <RevealError message={t('expiredTokenError')} />;
        }
      }
    }

    // Records the reveal timestamp locally to update the organizer dashboard in real-time.
    const handleReveal = () => {
      if (drawId && participantId) {
        localStorage.setItem(`enlaco_revealed_${drawId}_${participantId}`, new Date().toISOString());
      }
    };

    return (
      <div className="reveal-page">
        {/* Floating language selector in the top-right corner */}
        <header style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
          <LanguageSwitcher />
        </header>

        <div className="reveal-page__greeting">
          {t('hello')}, <strong className="reveal-page__giver">{giverName}</strong>!
        </div>
        <RevealCard
          recipientName={receiverName}
          eventName={eventDetails.eventName}
          organizerMessage={eventDetails.organizerMessage}
          onReveal={handleReveal}
        />
      </div>
    );
  } catch {
    return <RevealError message={t('invalidTokenError')} />;
  }
}

interface RevealErrorProps {
  message: string;
}

// Error state helper card component when draw link is invalid, expired, or cancelled.
function RevealError({ message }: RevealErrorProps) {
  const { t } = useTranslation();
  return (
    <div className="reveal-error">
      {/* Floating language switcher even on error page */}
      <header style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
        <LanguageSwitcher />
      </header>

      <main className="reveal-error__card">
        <span className="reveal-error__icon">⚠️</span>
        <h1 className="reveal-error__title">{t('oopsError')}</h1>
        <p className="reveal-error__msg">{message}</p>
        <p className="reveal-error__suggestion">
          {t('requestResend')}
        </p>
      </main>
    </div>
  );
}
