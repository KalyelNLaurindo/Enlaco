import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { decodeRevealToken } from '../../domain/services/tokenService';
import { useWizardStore } from '../wizard/store/wizardStore';
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
  const navigate = useNavigate();
  const { setEventDetails, setOrganizerBlind, reset } = useWizardStore();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [revealedStatus, setRevealedStatus] = useState<Record<string, string>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleDuplicate = () => {
    if (!draw) return;
    
    // Populate the store directly keeping the same IDs for exclusion rules integrity
    useWizardStore.setState({
      currentStep: 0,
      participants: draw.participants.map((p) => ({
        id: p.id,
        displayName: p.displayName,
        channels: p.channels,
      })),
      exclusionRules: draw.exclusionRules.map((rule) => ({
        participantA: rule.participantA,
        participantB: rule.participantB,
      })),
      organizerBlind: draw.organizerBlind,
      eventDetails: {
        eventName: draw.eventDetails.eventName,
        eventDate: draw.eventDetails.eventDate || '',
        suggestedValue: draw.eventDetails.suggestedValue || '',
        organizerMessage: draw.eventDetails.organizerMessage || '',
      },
    });
    
    navigate('/criar');
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

          {draw.status === 'CANCELLED' ? (
            <div 
              className="dashboard-card__banner" 
              style={{ 
                backgroundColor: 'rgba(255, 92, 92, 0.1)', 
                color: '#FF5C5C', 
                border: '1px solid rgba(255, 92, 92, 0.2)', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                marginTop: '1rem', 
                fontWeight: 600, 
                textAlign: 'center' 
              }}
            >
              🚫 SORTEIO CANCELADO: Os links de revelação foram invalidados.
            </div>
          ) : organizerBlind ? (
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {draw.status !== 'CANCELLED' && (
                <>
                  {(!draw.tokenValidUntil || (new Date(draw.tokenValidUntil).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000)) && (
                    <button 
                      onClick={handleSaveDraw}
                      className="dashboard-btn dashboard-btn--secondary"
                      style={{ fontSize: '11px', padding: '0.35rem 0.7rem', margin: 0 }}
                    >
                      Salvar Sorteio (90 dias)
                    </button>
                  )}
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="dashboard-btn"
                    style={{ fontSize: '11px', padding: '0.35rem 0.7rem', margin: 0, backgroundColor: '#FF5C5C', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancelar Sorteio
                  </button>
                </>
              )}
              <button 
                onClick={handleDuplicate}
                className="dashboard-btn dashboard-btn--secondary"
                style={{ fontSize: '11px', padding: '0.35rem 0.7rem', margin: 0 }}
              >
                Duplicar Rascunho
              </button>
            </div>
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
          
          {draw.auditPin && !isPinUnlocked && (
            <div className="dashboard-pin-unlock" style={{ margin: '1rem 0', padding: '1rem', backgroundColor: 'var(--color-bg-surface-raised, #212127)', border: '1px solid var(--color-border-default, #2C2C34)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <label htmlFor="dashboard-pin" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>🔒 Este sorteio está protegido por PIN</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="dashboard-pin"
                  type="password"
                  placeholder="Digite o PIN..."
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-surface, #18181D)', border: '1px solid var(--color-border-default, #2C2C34)', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'center', width: '120px' }}
                />
                <button 
                  onClick={() => {
                    if (pinInput === draw.auditPin) {
                      setIsPinUnlocked(true);
                    } else {
                      setPinError(true);
                    }
                  }}
                  className="dashboard-btn dashboard-btn--secondary"
                  style={{ margin: 0, padding: '0.5rem 1rem' }}
                >
                  Desbloquear
                </button>
              </div>
              {pinError && <p style={{ color: '#FF5C5C', fontSize: '12px', margin: 0 }}>⚠️ PIN incorreto.</p>}
            </div>
          )}

          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  {!organizerBlind && (
                    <th>
                      {!draw.auditPin || isPinUnlocked ? 'Resultado' : 'Resultado (🔒)'}
                    </th>
                  )}
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
                          {!draw.auditPin || isPinUnlocked ? (
                            <>
                              <span className="dashboard-table__match-arrow">tirou</span>{' '}
                              <strong>{getTargetName(revealUrl)}</strong>
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-secondary, #A3A3AE)', fontSize: '13px' }}>🔒 Protegido por PIN</span>
                          )}
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

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="dashboard-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="dashboard-modal" style={{ backgroundColor: 'var(--color-bg-surface, #18181D)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--color-border-default, #2C2C34)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '1rem' }}>⚠️ Cancelar Sorteio</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Deseja realmente cancelar este sorteio? Esta ação irá invalidar todos os links de revelação enviados aos participantes de forma definitiva.
              <br />
              <strong style={{ color: 'var(--text-primary)' }}>
                ({Object.keys(revealedStatus).length} participantes já revelaram seus resultados)
              </strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setShowCancelModal(false)} className="dashboard-btn dashboard-btn--secondary" style={{ margin: 0 }}>Voltar</button>
              <button 
                onClick={() => {
                  const updatedDraw: Draw = { ...draw, status: 'CANCELLED' };
                  localStorage.setItem(`enlaco-draw-${drawId}`, JSON.stringify(updatedDraw));
                  setDraw(updatedDraw);
                  setShowCancelModal(false);
                }}
                className="dashboard-btn" 
                style={{ backgroundColor: '#FF5C5C', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
