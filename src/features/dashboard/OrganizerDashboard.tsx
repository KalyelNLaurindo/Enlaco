import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { decodeRevealToken } from '../../domain/services/tokenService';
import { useWizardStore } from '../wizard/store/wizardStore';
import { generateCSVContent, generateASCIICoupon } from './auditExportUtils';
import { useTranslation } from '../../domain/services/i18nService';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import type { Draw } from '../../domain/types';
import './OrganizerDashboard.css';

// Organizer Dashboard component.
// Allows coordinators to track reveal statuses, manage PIN locks, duplicate drafts, or cancel draws.
export function OrganizerDashboard() {
  const { t } = useTranslation();
  const { drawId } = useParams<{ drawId: string }>();
  const navigate = useNavigate();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [revealedStatus, setRevealedStatus] = useState<Record<string, string>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAsciiModal, setShowAsciiModal] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  // Triggers browser download of the audit data formatted in a CSV file.
  const handleExportCSV = () => {
    if (!draw) return;
    const csvContent = generateCSVContent(draw, revealedStatus, isPinUnlocked);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-draw-${drawId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copies the generated ASCII receipt coupon to the device clipboard.
  const handleCopyCoupon = async () => {
    if (!draw) return;
    const coupon = generateASCIICoupon(draw, revealedStatus, isPinUnlocked);
    try {
      await navigator.clipboard.writeText(coupon);
      setCouponCopied(true);
      setTimeout(() => setCouponCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy coupon', err);
    }
  };

  // Loads the draw details and claim timestamps from local storage.
  useEffect(() => {
    if (!drawId) return;

    const storedData = localStorage.getItem(`enlaco-draw-${drawId}`);
    if (storedData) {
      try {
        const parsedDraw = JSON.parse(storedData) as Draw;
        setDraw(parsedDraw);

        const statuses: Record<string, string> = {};
        parsedDraw.participants.forEach((p) => {
          const timestamp = localStorage.getItem(`enlaco_revealed_${drawId}_${p.id}`);
          if (timestamp) {
            statuses[p.id] = timestamp;
          }
        });
        setRevealedStatus(statuses);
      } catch (err) {
        console.error('Failed to parse draw details', err);
      }
    }
  }, [drawId]);

  // Listens to global storage events to sync claimed statuses in real-time.
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

  // Copies the unique reveal link for a participant.
  const handleCopyLink = async (url: string, index: number) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  // Generates a customized WhatsApp shareable link.
  const getWhatsAppLink = (phoneNumber: string, revealUrl: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${revealUrl}`;
    const message = `Olá! O sorteio do Amigo Secreto "${eventDetails.eventName}" foi realizado 🎉. Veja quem você tirou abrindo este link privado: ${fullUrl}`;
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  // Resolves the secret partner name if the PIN is unlocked.
  const getTargetName = (revealUrl?: string): string => {
    if (!revealUrl) return 'Unknown';
    try {
      const token = revealUrl.split('/').pop() || '';
      const decoded = decodeRevealToken(token);
      return decoded.receiverName;
    } catch {
      return 'Decode Error';
    }
  };

  // Extends the draw link validity to 90 days.
  const handleSaveDraw = () => {
    if (!drawId || !draw) return;
    
    const extendedDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const updatedDraw: Draw = {
      ...draw,
      tokenValidUntil: extendedDate,
    };
    
    localStorage.setItem(`enlaco-draw-${drawId}`, JSON.stringify(updatedDraw));
    setDraw(updatedDraw);
  };

  // Re-populates the wizard with the draw configuration to start a new draft.
  const handleDuplicate = () => {
    if (!draw) return;
    
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
        {/* Header section with event details and dashboard controls */}
        <header className="dashboard-card__header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p className="dashboard-card__subtitle" style={{ margin: 0 }}>{t('dashboardTitle')}</p>
            <LanguageSwitcher />
          </div>
          <h1 className="dashboard-card__title">{eventDetails.eventName}</h1>
          <div className="dashboard-card__meta">
            {eventDetails.eventDate && (
              <span className="dashboard-card__meta-item">
                📅 {new Date(eventDetails.eventDate).toLocaleDateString()}
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
              {t('drawCancelledBanner')}
            </div>
          ) : organizerBlind ? (
            <div className="dashboard-card__banner dashboard-card__banner--blind">
              {t('blindModeBanner')}
            </div>
          ) : (
            <div className="dashboard-card__banner dashboard-card__banner--non-blind">
              {t('unlockedModeDesc')}
            </div>
          )}

          {/* Draw Link Validity Controls */}
          <div className="dashboard-card__expiration" style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--color-bg-surface-raised, #212127)', border: '1px solid var(--color-border-default, #2C2C34)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              ⏳ <strong>{t('validityLabel')}:</strong> {draw.tokenValidUntil ? new Date(draw.tokenValidUntil).toLocaleString() : t('hours24')}
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
                      {t('saveDrawBtn')}
                    </button>
                  )}
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="dashboard-btn"
                    style={{ fontSize: '11px', padding: '0.35rem 0.7rem', margin: 0, backgroundColor: '#FF5C5C', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {t('cancelDrawBtn')}
                  </button>
                </>
              )}
              <button 
                onClick={handleDuplicate}
                className="dashboard-btn dashboard-btn--secondary"
                style={{ fontSize: '11px', padding: '0.35rem 0.7rem', margin: 0 }}
              >
                {t('duplicateBtn')}
              </button>
            </div>
          </div>
        </header>

        {/* Organizer Custom Event Message */}
        {eventDetails.organizerMessage && (
          <section className="dashboard-card__message-box">
            <h2 className="dashboard-card__section-title">{t('messageLabel')}</h2>
            <p className="dashboard-card__message">{eventDetails.organizerMessage}</p>
          </section>
        )}

        {/* Export & Audit options */}
        <section className="dashboard-card__message-box" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 className="dashboard-card__section-title" style={{ width: '100%', margin: 0 }}>{t('auditTitle')}</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleExportCSV}
              className="dashboard-btn dashboard-btn--secondary"
              style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '13px' }}
            >
              {t('exportCsvBtn')}
            </button>
            <button 
              onClick={() => setShowAsciiModal(true)}
              className="dashboard-btn dashboard-btn--secondary"
              style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '13px' }}
            >
              {t('viewAsciiBtn')}
            </button>
          </div>
        </section>

        {/* Participant Status Table */}
        <section className="dashboard-card__participants">
          <h2 className="dashboard-card__section-title">{t('participantsCount')} ({participants.length})</h2>
          
          {draw.auditPin && !isPinUnlocked && (
            <div className="dashboard-pin-unlock" style={{ margin: '1rem 0', padding: '1rem', backgroundColor: 'var(--color-bg-surface-raised, #212127)', border: '1px solid var(--color-border-default, #2C2C34)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <label htmlFor="dashboard-pin" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>🔒 {t('pinProtectedLabel')}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="dashboard-pin"
                  type="password"
                  placeholder={t('pinInputPlaceholder')}
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
                  {t('unlockBtn')}
                </button>
              </div>
              {pinError && <p style={{ color: '#FF5C5C', fontSize: '12px', margin: 0 }}>⚠️ {t('invalidPin')}</p>}
            </div>
          )}

          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>{t('tableNameHead')}</th>
                  {!organizerBlind && (
                    <th>
                      {!draw.auditPin || isPinUnlocked ? t('tableResultHead') : `${t('tableResultHead')} (🔒)`}
                    </th>
                  )}
                  <th>{t('tableStatusHead')}</th>
                  <th className="dashboard-table__actions-head">{t('tableActionsHead')}</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, idx) => {
                  const isRevealed = !!revealedStatus[p.id];
                  const revealTime = revealedStatus[p.id];
                  const revealUrl = p.revealUrl || '';
  
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
                            <span style={{ color: 'var(--text-secondary, #A3A3AE)', fontSize: '13px' }}>🔒 {t('pinInputPlaceholder').split('.')[0]}</span>
                          )}
                        </td>
                      )}
                      <td>
                        <span
                          className={`dashboard-badge ${
                            isRevealed ? 'dashboard-badge--revealed' : 'dashboard-badge--pending'
                          }`}
                          title={isRevealed && revealTime ? `${t('statusRevealed')}: ${new Date(revealTime).toLocaleString()}` : undefined}
                        >
                          {isRevealed ? t('statusRevealed') : t('statusPending')}
                        </span>
                      </td>
                      <td>
                        <div className="dashboard-actions">
                          <button
                            className="dashboard-btn dashboard-btn--secondary"
                            onClick={() => handleCopyLink(revealUrl, idx)}
                            aria-label={`Copy reveal URL for ${p.displayName}`}
                          >
                            {copiedIndex === idx ? t('linkCopiado') : t('copiarLinkBtn')}
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
                              aria-label={`Send via WhatsApp to ${p.displayName}`}
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
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '1rem' }}>⚠️ {t('cancelModalTitle')}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {t('cancelModalDesc')}
              <br />
              <strong style={{ color: 'var(--text-primary)' }}>
                ({Object.keys(revealedStatus).length} {t('participantsCounter')} {t('statusRevealed').toLowerCase()})
              </strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setShowCancelModal(false)} className="dashboard-btn dashboard-btn--secondary" style={{ margin: 0 }}>{t('backBtn')}</button>
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
                {t('cancelConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASCII Receipt Coupon Modal */}
      {showAsciiModal && (
        <div className="dashboard-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="dashboard-modal" style={{ backgroundColor: 'var(--color-bg-surface, #18181D)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--color-border-default, #2C2C34)', maxWidth: '650px', width: '95%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>🧾 {t('fiscalCouponTitle')}</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', borderRadius: '8px' }}>
              <pre style={{
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                backgroundColor: '#0F0F12',
                color: '#00FF66',
                padding: '1.5rem',
                borderRadius: '8px',
                overflowX: 'auto',
                textAlign: 'left',
                fontSize: '12px',
                lineHeight: '1.2',
                margin: 0
              }}>
                {generateASCIICoupon(draw, revealedStatus, isPinUnlocked)}
              </pre>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setShowAsciiModal(false)} className="dashboard-btn dashboard-btn--secondary" style={{ margin: 0 }}>{t('backBtn')}</button>
              <button 
                onClick={handleCopyCoupon}
                className="dashboard-btn" 
                style={{ backgroundColor: 'var(--color-accent-default, #FF2E93)', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {couponCopied ? t('couponCopiedFeedback') : t('copyCouponBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
