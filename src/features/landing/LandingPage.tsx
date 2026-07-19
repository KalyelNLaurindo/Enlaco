import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { useTranslation } from '../../domain/services/i18nService';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import type { Draw } from '../../domain/types';

import { useWizardStore } from '../wizard/store/wizardStore';
import { useWizardAutosave } from '../wizard/hooks/useWizardAutosave';
import { WizardStepper } from '../wizard/components/WizardStepper';
import { EventDetailsStep } from '../wizard/components/EventDetailsStep';
import { ParticipantsStep } from '../wizard/components/ParticipantsStep';
import { ExclusionRulesStep } from '../wizard/components/ExclusionRulesStep';
import { ReviewStep } from '../wizard/components/ReviewStep';
import { generateDraw, DrawInfeasibleError } from '../../domain/services/drawGenerator';
import { encodeRevealToken } from '../../domain/services/tokenService';

import './LandingPage.css';

interface HistoryItem {
  id: string;
  name: string;
}

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreating = location.pathname === '/criar';

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Wizard state and hooks
  const { 
    participants, 
    exclusionRules, 
    eventDetails, 
    organizerBlind, 
    currentStep, 
    reset,
    prevStep
  } = useWizardStore();
  const { isSaving } = useWizardAutosave();
  const [error, setError] = useState<string | null>(null);
  const [generatingStep, setGeneratingStep] = useState<number | null>(null);

  const WIZARD_STEPS = [
    t('stepDetails'),
    t('stepParticipants'),
    t('stepExclusions'),
    t('stepReview'),
  ];

  // Load history from local storage
  useEffect(() => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]') as string[];
      const historyItems: HistoryItem[] = [];
      
      storedHistory.forEach((id) => {
        const drawData = localStorage.getItem(`enlaco-draw-${id}`);
        if (drawData) {
          const parsed = JSON.parse(drawData) as Draw;
          historyItems.push({ id, name: parsed.eventDetails.eventName });
        }
      });
      setHistory(historyItems);
    } catch (err) {
      console.error('Falha ao carregar histórico', err);
    }
  }, []);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    
    let cleanId = importCode.trim();
    if (cleanId.includes('/sorteio/')) {
      cleanId = cleanId.split('/sorteio/').pop()?.split('?')[0] || '';
    }

    if (!cleanId) {
      setImportError('Código inválido ou em branco.');
      return;
    }

    const drawData = localStorage.getItem(`enlaco-draw-${cleanId}`);
    if (!drawData) {
      setImportError('Código ou link não encontrado neste dispositivo.');
      return;
    }

    const storedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]') as string[];
    if (!storedHistory.includes(cleanId)) {
      storedHistory.push(cleanId);
      localStorage.setItem('enlaco_draw_history', JSON.stringify(storedHistory));
    }

    navigate(`/sorteio/${cleanId}`);
  };

  const handleGenerate = (pin?: string) => {
    setError(null);
    try {
      const assignmentMap = generateDraw(participants, exclusionRules);

      const drawId = `d_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const participantsWithLinks = participants.map((p) => {
        const receiverId = assignmentMap.get(p.id)!;
        const receiver = participants.find((r) => r.id === receiverId)!;
        
        const token = encodeRevealToken(p.displayName, receiver.displayName, eventDetails, drawId, p.id, expirationDate);
        const revealUrl = `/r/${token}`;

        return {
          ...p,
          revealUrl,
        };
      });

      const completedDraw: Draw = {
        drawId,
        status: 'GENERATED',
        createdAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        organizerBlind,
        eventDetails,
        participants: participantsWithLinks,
        exclusionRules,
        tokenValidUntil: expirationDate,
        auditPin: pin,
      };

      localStorage.setItem(`enlaco-draw-${drawId}`, JSON.stringify(completedDraw));

      const storedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]') as string[];
      if (!storedHistory.includes(drawId)) {
        storedHistory.push(drawId);
        localStorage.setItem('enlaco_draw_history', JSON.stringify(storedHistory));
      }

      // Start animation sequence
      setGeneratingStep(0);
      let currentAnimateStep = 0;
      const interval = setInterval(() => {
        currentAnimateStep += 1;
        if (currentAnimateStep < 5) {
          setGeneratingStep(currentAnimateStep);
        } else {
          clearInterval(interval);
          setGeneratingStep(null);
          reset();
          navigate(`/sorteio/${drawId}/concluido`);
        }
      }, 600);
    } catch (err) {
      if (err instanceof DrawInfeasibleError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao gerar o sorteio. Verifique os dados e tente novamente.');
      }
    }
  };

  const handleBackToLanding = () => {
    reset();
    navigate('/');
  };

  function renderWizardStep() {
    switch (currentStep) {
      case 0: 
        return <EventDetailsStep />;
      case 1: 
        return <ParticipantsStep />;
      case 2: 
        return <ExclusionRulesStep />;
      case 3: 
        return <ReviewStep onGenerate={handleGenerate} />;
      default: 
        return <EventDetailsStep />;
    }
  }

  return (
    <div className={`landing-container ${isCreating ? 'is-creating' : ''}`}>
      {/* Top Header */}
      <header className="landing-header">
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="landing-main">
        {/* Left Side: Brand & Slogan */}
        <section className="landing-brand-section">
          <div className="brand-logo-container">
            <img src={logoImg} alt="Enlaço Logo" className="brand-logo-img" />
            <h1 className="brand-title">Enlaço</h1>
          </div>
          <p className="brand-slogan">LAÇOS QUE CONECTAM HISTÓRIAS E SURPRESAS.</p>

          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <div>
                <h3 className="feature-title">NÃO TRANSPARENTE</h3>
                <p className="feature-desc">Sorteio 100% secreto.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h3 className="feature-title">RÁPIDO E LEVE</h3>
                <p className="feature-desc">Funciona online e offline.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✈️</span>
              <div>
                <h3 className="feature-title">ENVIO DIRETO</h3>
                <p className="feature-desc">Email, WhatsApp, QR Code e mais.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div>
                <h3 className="feature-title">FEITO PARA GRUPOS</h3>
                <p className="feature-desc">Eventos de empresa, família e amigos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Virtual Mobile Phone Mockup */}
        <section className="landing-mockup-section">
          <div className="phone-mockup glass-card">
            {/* Phone Header */}
            <div className="phone-header">
              <div className="phone-logo" onClick={handleBackToLanding} style={{ cursor: 'pointer' }}>
                <img src={logoImg} alt="Icon" className="phone-logo-icon" />
                <span>Enlaço</span>
              </div>
              
              {isCreating && (
                <button 
                  onClick={currentStep === 0 ? handleBackToLanding : prevStep} 
                  className="phone-back-arrow"
                  aria-label="Voltar"
                >
                  ←
                </button>
              )}
            </div>

            {/* Phone Body */}
            <div className="phone-body">
              {!isCreating ? (
                <>
                  <h2 className="phone-welcome">{t('welcomeTitle')}</h2>

                  {/* Glass Jar CSS Asset */}
                  <div className="jar-container">
                    <div className="jar-glass">
                      <div className="jar-mouth"></div>
                      <div className="jar-neck">
                        <div className="jar-ribbon"></div>
                      </div>
                      <div className="jar-body">
                        {/* Floating Paper Slips */}
                        <div className="paper-slip p1"></div>
                        <div className="paper-slip p2"></div>
                        <div className="paper-slip p3"></div>
                        <div className="paper-slip p4"></div>
                        <div className="paper-slip p5"></div>
                      </div>
                    </div>
                  </div>

                  <p className="phone-instructions">{t('landingInstructions')}</p>

                  <div className="phone-actions">
                    <button className="btn-primary full-width" onClick={() => navigate('/criar')}>
                      {t('createDrawBtn')}
                    </button>
                    <button className="btn-secondary full-width" onClick={() => setShowHistoryModal(true)}>
                      {t('enterDrawBtn')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="phone-wizard-container">
                  <WizardStepper currentStep={currentStep} steps={WIZARD_STEPS} />
                  
                  {isSaving && (
                    <div className="phone-saving-indicator">
                      <span className="saving-indicator-dot"></span>
                      {t('saving')}...
                    </div>
                  )}

                  {error && (
                    <div className="phone-error-indicator" role="alert">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="phone-wizard-step">
                    {renderWizardStep()}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Footer */}
            {!isCreating && (
              <div className="phone-footer">
                <span className="footer-status-icon">🛡️</span>
                <span>{t('offlineLabel')}</span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* History and Import Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>{t('enterDrawBtn')}</h3>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
            </header>

            <div className="modal-body">
              {/* Import Form */}
              <form onSubmit={handleImport} className="import-form">
                <label htmlFor="import-code-landing" className="field-label">
                  {t('importCode')}
                </label>
                <div className="import-input-group">
                  <input
                    id="import-code-landing"
                    type="text"
                    placeholder={t('importPlaceholder')}
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    className="field-input"
                  />
                  <button type="submit" className="btn-primary">{t('importBtn')}</button>
                </div>
                {importError && <p className="field-error">⚠️ {importError}</p>}
              </form>

              {/* History list */}
              <div className="history-section">
                <h4 className="history-section-title">{t('historyTitle')}</h4>
                {history.length > 0 ? (
                  <ul className="history-list">
                    {history.map((item) => (
                      <li key={item.id} className="history-list-item">
                        <span className="history-item-name">{item.name}</span>
                        <button
                          className="btn-link-action"
                          onClick={() => {
                            setShowHistoryModal(false);
                            navigate(`/sorteio/${item.id}`);
                          }}
                        >
                          Acessar →
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-history-text">{t('noHistory')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shuffling Overlay */}
      {generatingStep !== null && (
        <div className="animation-overlay">
          <div className="animation-card glass-card">
            <div className="animation-spinner">
              <div className="double-bounce1"></div>
              <div className="double-bounce2"></div>
            </div>
            <p className="animation-text">
              {generatingStep === 0 && 'Carregando...'}
              {generatingStep === 1 && 'Embaralhando...'}
              {generatingStep === 2 && 'Sorteando...'}
              {generatingStep === 3 && 'Enviando...'}
              {generatingStep === 4 && 'Concluído!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
