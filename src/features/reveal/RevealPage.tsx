import { RevealCard } from './components/RevealCard';
import './RevealPage.css';

/**
 * /r/:resultToken — Participant Reveal Page.
 * Full-bleed, no nav chrome. Single card, generous whitespace.
 * Design Brief §03: "deliberately isolates the participant from surrounding UI".
 *
 * Phase 4 TODO: resolve resultToken from URL params via API call.
 * Currently renders with mock data for development.
 */
export function RevealPage() {
  // TODO Phase 4: extract token from useParams(), call GET /reveal/:token
  const mockData = {
    recipientName: 'Ana Lima',
    eventName: 'Amigo Secreto 2026',
    organizerMessage: 'Feliz Natal! Com carinho do seu amigo secreto. 🎄',
  };

  return (
    <div className="reveal-page">
      <RevealCard {...mockData} />
    </div>
  );
}
