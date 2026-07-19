import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWizardStore } from './store/wizardStore';
import { useWizardAutosave } from './hooks/useWizardAutosave';
import { WizardStepper } from './components/WizardStepper';
import { EventDetailsStep } from './components/EventDetailsStep';
import { ParticipantsStep } from './components/ParticipantsStep';
import { ExclusionRulesStep } from './components/ExclusionRulesStep';
import { ReviewStep } from './components/ReviewStep';
import { generateDraw, DrawInfeasibleError } from '../../domain/services/drawGenerator';
import { encodeRevealToken } from '../../domain/services/tokenService';
import type { Draw } from '../../domain/types';
import { useTranslation } from '../../domain/services/i18nService';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import './WizardPage.css';

interface HistoryItem {
  id: string;
  name: string;
}

/**
 * Main entry page for the Secret Santa creation wizard.
 * Guides the user through event details, participants, exclusions, and review.
 */
export function WizardPage() {
  const { t } = useTranslation();
  const { participants, exclusionRules, eventDetails, organizerBlind, currentStep, reset } = useWizardStore();
  const { isSaving } = useWizardAutosave();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const WIZARD_STEPS = [
    t('stepDetails'),
    t('stepParticipants'),
    t('stepExclusions'),
    t('stepReview'),
  ];

  // Loads previously created draws from local storage on mount.
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
      console.error('Falha ao carregar histórico do sorteio', err);
    }
  }, []);

  // Runs the backtracking draw generator and encodes reveal URLs for each participant.
  function handleGenerate(pin?: string) {
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

      reset();
      navigate(`/sorteio/${drawId}`);
    } catch (err) {
      if (err instanceof DrawInfeasibleError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao gerar o sorteio. Verifique os dados e tente novamente.');
      }
    }
  }

  // Imports an existing draw using its admin link or ID code.
  function handleImport(e: React.FormEvent) {
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
      setImportError('Código ou link inválido ou não encontrado localmente.');
      return;
    }

    const storedHistory = JSON.parse(localStorage.getItem('enlaco_draw_history') || '[]') as string[];
    if (!storedHistory.includes(cleanId)) {
      storedHistory.push(cleanId);
      localStorage.setItem('enlaco_draw_history', JSON.stringify(storedHistory));
    }

    navigate(`/sorteio/${cleanId}`);
  }

  function renderStep() {
    switch (currentStep) {
      case 0: return <EventDetailsStep />;
      case 1: return <ParticipantsStep />;
      case 2: return <ExclusionRulesStep />;
      case 3: return <ReviewStep onGenerate={handleGenerate} />;
      default: return <EventDetailsStep />;
    }
  }

  return (
    <div className="wizard-page">
      {/* Top bar containing the language switcher component */}
      <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem max(1rem, calc((100% - 600px)/2))', width: '100%', boxSizing: 'border-box' }}>
        <LanguageSwitcher />
      </header>

      {/* Stepper indicator showing the current step */}
      <WizardStepper currentStep={currentStep} steps={WIZARD_STEPS} />

      {/* Visual indicator for auto-saving form progress */}
      {isSaving && (
        <div className="wizard-page__saving" aria-live="polite" aria-label={t('saving')}>
          <span className="wizard-page__saving-dot" />
          {t('saving')}…
        </div>
      )}

      {error && (
        <div 
          className="wizard-page__error" 
          role="alert" 
          style={{
            maxWidth: '600px',
            margin: '1rem auto 0 auto',
            padding: '1rem',
            backgroundColor: 'rgba(255, 92, 92, 0.1)',
            border: '1px solid rgba(255, 92, 92, 0.3)',
            color: '#FF5C5C',
            borderRadius: '12px',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Active wizard step component */}
      <main className="wizard-page__content">
        {renderStep()}
      </main>

      {/* Sidebar/footer panel showing history and code import (only on step 0) */}
      {currentStep === 0 && (
        <section className="wizard-history-panel" style={{ maxWidth: '600px', margin: '2rem auto 0 auto', padding: '1.5rem', backgroundColor: 'var(--color-bg-surface, #18181D)', border: '1px solid var(--color-border-default, #2C2C34)', borderRadius: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '18px', marginBottom: '1rem' }}>{t('historyTitle')}</h3>
          
          {history.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-bg-surface-raised, #212127)', borderRadius: '12px', border: '1px solid var(--color-border-default, #2C2C34)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                  <Link to={`/sorteio/${item.id}`} style={{ color: 'var(--color-accent-default, #FF2E93)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>Acessar Painel →</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 1.5rem 0' }}>{t('noHistory')}</p>
          )}

          <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--color-border-default, #2C2C34)', paddingTop: '1rem' }}>
            <label htmlFor="import-code" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('importCode')}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="import-code"
                type="text"
                placeholder={t('importPlaceholder')}
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--color-bg-surface-raised, #212127)', border: '1px solid var(--color-border-default, #2C2C34)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}
              />
              <button type="submit" style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--color-accent-default, #FF2E93)', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>{t('importBtn')}</button>
            </div>
            {importError && <p style={{ color: '#FF5C5C', fontSize: '12px', margin: 0 }}>⚠️ {importError}</p>}
          </form>
        </section>
      )}
    </div>
  );
}
