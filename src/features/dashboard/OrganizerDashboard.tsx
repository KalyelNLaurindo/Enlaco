import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { decodeRevealToken } from '../../domain/services/tokenService';
import type { Draw } from '../../domain/types';
import './OrganizerDashboard.css';

/**
 * Organizer Dashboard Component.
 * Enables group coordinators to monitor draw delivery status,
 * copy individual reveal URLs for each participant, and view matches
 * (if blind mode is inactive). Uses localStorage storage events to sync
 * read/reveal statuses in real-time between tabs/devices.
 */
export function OrganizerDashboard() {
  const { drawId } = useParams<{ drawId: string }>();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [revealedStatus, setRevealedStatus] = useState<Record<string, string>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Load draw configuration from localStorage and read initial reveal statuses
  useEffect(() => {
    if (!drawId) return;

    const storedData = localStorage.getItem(`enlaco-draw-${drawId}`);
    if (storedData) {
      try {
        const parsedDraw = JSON.parse(storedData) as Draw;
        setDraw(parsedDraw);

        // Scan localStorage for any existing claim/reveal timestamps for this draw
        const statuses: Record<string, string> = {};
        parsedDraw.participants.forEach((p) => {
          const timestamp = localStorage.getItem(`enlaco_revealed_${drawId}_${p.id}`);
          if (timestamp) {
            statuses[p.id] = timestamp;
          }
        });
        setRevealedStatus(statuses);
      } catch (err) {
        console.error('Failed to parse stored draw details', err);
      }
    }
  }, [drawId]);

  // Listen for storage events in other tabs to update reveal statuses in real-time
  useEffect(() => {
    if (!drawId) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith(`enlaco_revealed_${drawId}_`)) {
        const participantId = e.key.split('_').pop();
        if (participantId) {
          setRevealedStatus((prev) => ({
            ...prev,
            [participantId]: e.newValue || '',
          }));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [drawId]);

  if (!draw) {
    return (
      <div className="dashboard-error">
        <h1 className="dashboard-error__title">Sorteio não encontrado</h1>
        <p className="dashboard-error__msg">
          Verifique o link informado ou crie um novo sorteio de amigo secreto.
        </p>
        <Link to="/criar" className="dashboard-error__cta">
          Criar Sorteio →
        </Link>
      </div>
    );
  }

  const { eventDetails, organizerBlind, participants } = draw;

  // Copies reveal link to clipboard
  const handleCopyLink = async (url: string, index: number) => {
    // Generate full URL (handling absolute paths dynamically)
    const fullUrl = `${window.location.origin}${window.location.pathname}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  // Helper to generate custom deep links for WhatsApp messages
  const getWhatsAppLink = (phoneNumber: string, revealUrl: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${revealUrl}`;
    const message = `Olá! O sorteio do Amigo Secreto "${eventDetails.eventName}" foi realizado 🎉. Veja quem você tirou abrindo este link privado: ${fullUrl}`;
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  // Helper to decode target name if organizer is not in blind mode
  const getTargetName = (revealUrl?: string): string => {
    if (!revealUrl) return 'Desconhecido';
    try {
      const token = revealUrl.split('/').pop() || '';
      const decoded = decodeRevealToken(token);
      return decoded.receiverName;
    } catch {
      return 'Erro ao decodificar';
    }
  };

  const handleSaveDraw = () => {
    if (!drawId || !draw) return;
    
    // Extend expiration to 90 days from now
    const extendedDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const updatedDraw: Draw = {
      ...draw,
      tokenValidUntil: extendedDate,
    };
    
    localStorage.setItem(`enlaco-draw-${drawId}`, JSON.stringify(updatedDraw));
    setDraw(updatedDraw);
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-card">
        {/* Header Section */}
        <header className="dashboard-card__header">
          <p className="dashboard-card__subtitle">Painel do Organizador</p>
          <h1 className="dashboard-card__title">{eventDetails.eventName}</h1>
          <div className="dashboard-card__meta">
            {eventDetails.eventDate && (
              <span className="dashboard-card__meta-item">
                📅 {new Date(eventDetails.eventDate).toLocaleDateString('pt-BR')}
              </span>
            )}
            {eventDetails.suggestedValue && (
              <span className="dashboard-card__meta-item">
                💰 {eventDetails.suggestedValue}
              </span>
            )}
          </div>
          {organizerBlind ? (
            <div className="dashboard-card__banner dashboard-card__banner--blind">
              👁️ <strong>Modo Cego Ativo:</strong> Você também está participando!
              Os resultados individuais estão ocultos para preservar o mistério.
            </div>
          ) : (
            <div className="dashboard-card__banner dashboard-card__banner--non-blind">
              🔓 <strong>Modo Aberto:</strong> Você pode visualizar os emparelhamentos abaixo.
            </div>
          )}

          {/* Expiration Banner */}
          <div className="dashboard-card__expiration" style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--color-bg-surface-raised, #212127)', border: '1px solid var(--color-border-default, #2C2C34)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              ⏳ <strong>Validade dos links:</strong> {draw.tokenValidUntil ? new Date(draw.tokenValidUntil).toLocaleString('pt-BR') : '24 horas'}
            </span>
            {(!draw.tokenValidUntil || (new Date(draw.tokenValidUntil).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000)) && (
              <button 
                onClick={handleSaveDraw}
                className="dashboard-btn dashboard-btn--secondary"
                style={{ fontSize: '11px', padding: '0.35rem 0.7rem', margin: 0 }}
              >
                Salvar Sorteio (90 dias)
              </button>
            )}
          </div>
        </header>

        {/* Organizer Message Section */}
        {eventDetails.organizerMessage && (
          <section className="dashboard-card__message-box">
            <h2 className="dashboard-card__section-title">Mensagem do Evento</h2>
            <p className="dashboard-card__message">{eventDetails.organizerMessage}</p>
          </section>
        )}

        {/* Participants Table */}
        <section className="dashboard-card__participants">
          <h2 className="dashboard-card__section-title">Participantes ({participants.length})</h2>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  {!organizerBlind && <th>Resultado</th>}
                  <th>Status</th>
                  <th className="dashboard-table__actions-head">Ações de Entrega</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, idx) => {
                  const isRevealed = !!revealedStatus[p.id];
                  const revealTime = revealedStatus[p.id];
                  const revealUrl = (p as any).revealUrl || '';

                  return (
                    <tr key={p.id} className="dashboard-table__row">
                      <td className="dashboard-table__name">{p.displayName}</td>
                      {!organizerBlind && (
                        <td className="dashboard-table__match">
                          <span className="dashboard-table__match-arrow">tirou</span>{' '}
                          <strong>{getTargetName(revealUrl)}</strong>
                        </td>
                      )}
                      <td>
                        <span
                          className={`dashboard-badge ${
                            isRevealed ? 'dashboard-badge--revealed' : 'dashboard-badge--pending'
                          }`}
                          title={isRevealed && revealTime ? `Visualizado em: ${new Date(revealTime).toLocaleString('pt-BR')}` : undefined}
                        >
                          {isRevealed ? 'Revelado' : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        <div className="dashboard-actions">
                          <button
                            className="dashboard-btn dashboard-btn--secondary"
                            onClick={() => handleCopyLink(revealUrl, idx)}
                            aria-label={`Copiar link de revelação de ${p.displayName}`}
                          >
                            {copiedIndex === idx ? 'Copiado!' : 'Copiar Link'}
                          </button>

                          {p.channels.some((c) => c.type === 'WHATSAPP_LINK') && (
                            <a
                              className="dashboard-btn dashboard-btn--wa"
                              href={getWhatsAppLink(
                                p.channels.find((c) => c.type === 'WHATSAPP_LINK')?.value || '',
                                revealUrl
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Enviar via WhatsApp para ${p.displayName}`}
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
