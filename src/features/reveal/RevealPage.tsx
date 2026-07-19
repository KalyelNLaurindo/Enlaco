import { useParams } from 'react-router-dom';
import { decodeRevealToken } from '../../domain/services/tokenService';
import { RevealCard } from './components/RevealCard';
import './RevealPage.css';

/**
 * /r/:resultToken — Participant Reveal Page.
 * Full-bleed centered layout with no navigation chrome.
 * Decodes the encrypted/encoded token client-side to show the participant their match.
 * Tracks reveal status dynamically in localStorage for organizer sync.
 */
export function RevealPage() {
  const { resultToken } = useParams<{ resultToken: string }>();

  if (!resultToken) {
    return <RevealError message="Nenhum link de revelação informado." />;
  }

  try {
    const { giverName, receiverName, eventDetails, drawId, participantId } = decodeRevealToken(resultToken);

    const handleReveal = () => {
      if (drawId && participantId) {
        // Record timestamp in localStorage to sync status back to organizer dashboard
        localStorage.setItem(`enlaco_revealed_${drawId}_${participantId}`, new Date().toISOString());
      }
    };

    return (
      <div className="reveal-page">
        <div className="reveal-page__greeting">
          Olá, <strong className="reveal-page__giver">{giverName}</strong>!
        </div>
        <RevealCard
          recipientName={receiverName}
          eventName={eventDetails.eventName}
          organizerMessage={eventDetails.organizerMessage}
          onReveal={handleReveal}
        />
      </div>
    );
  } catch (err) {
    return <RevealError message="Este link de revelação é inválido ou está corrompido." />;
  }
}

interface RevealErrorProps {
  message: string;
}

function RevealError({ message }: RevealErrorProps) {
  return (
    <div className="reveal-error">
      <main className="reveal-error__card">
        <span className="reveal-error__icon">⚠️</span>
        <h1 className="reveal-error__title">Oops! Algo deu errado</h1>
        <p className="reveal-error__msg">{message}</p>
        <p className="reveal-error__suggestion">
          Por favor, solicite ao organizador do evento para reenviar o seu link de amigo secreto.
        </p>
      </main>
    </div>
  );
}
